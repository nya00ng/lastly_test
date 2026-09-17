# Rule Parser V2.2 - Utterance Normalization and Core Clause Extraction

Date: 2026-09-17

Verdict: **V2.2 READY** for the local Product pilot. No Vercel deployment or Production provider change in this task.

Follow-up: the independent 54-case gate in `RULE_PARSER_V2_2_ADVERSARIAL_QA.md` found two unsafe confirmation candidates and one wrong-date candidate. Release/promotion is now **BLOCKED** pending correction. The earlier limited test evidence below is retained unchanged.

## Root Cause

V2.1 analyzes the entire utterance directly. NP/IC/JKS tokens before the predicate lower target confidence; its give-phrase reconstruction rejects NP/IC and topic particles. Thus `나 오늘 화분 물줬어!` can lose a usable action despite `화분 물줬어` working. Leading discourse words can also be interpreted as actions/nouns. This was a preprocessing gap, not a missing item alias or a SpeechRecognition error.

## Architecture

`raw input -> bounded prefix metadata + punctuation/whitespace normalization -> core clause -> existing morphology/V2.1 safety/reconstruction -> restored source text and dates -> existing contextual matching -> server validation -> Product UI`

- SELF expressions: 나/내가/나는/난/저/제가/저는 are consumed only as bounded leading expressions, including after another recognized prefix. Speaker is recorded as SELF.
- Time expressions: leading relative/absolute dates are separated into dateExpressions, not discarded. Today/yesterday/day-before-yesterday offsets and absolute dates use the existing date helper. 방금/아까/조금 전에 refer to the current context date and are EXPLICIT. 지난주 stays approximate and requires DATE clarification.
- Fillers: bounded leading 아/어/음/참/아 맞다/그러고 보니/생각해보니 are recorded separately. No full utterance lookup table.
- Punctuation: full-width question/exclamation marks, periods, ellipsis, tilde and comma are normalized. Whitespace is collapsed with source offsets. Decorative trailing exclamation/period/tilde is removed; question marks and grammatical endings remain.
- Particles: 오늘은 is temporal metadata; 나는 is SELF metadata; noun + 은/는 keeps its noun and filters only the topic particle from morphology input. JKS and third-person nouns are not removed. `아이가 약 먹었어`, `남편이 필터 갈았어`, `아빠가 화분 물줬어` keep their subjects and remain conservative.
- Example: `음... 나 오늘 화분 물줬어!` -> SELF, 오늘, filler 음, coreClause `화분 물줬어`. Product output retains the entire exact original_text.
- Diagnostics retain raw input, coreClause, metadata and source offsets. Morpheme offsets are explicitly labeled tokenSource=coreClause.
- Date priority remains absolute -> relative -> implicit today. A subsequent clause's own explicit date overrides inherited leading date context; otherwise the leading date applies to coordinated actions. Future metadata cannot disappear when prefixes are stripped: it remains a non-recordable planned signal. Invalid and future absolute completed dates remain blocked.
- No confidence-based automatic save or parser-selected item identity was added. Confirmation, Query no mutation and max-five atomic behavior remain unchanged.

## Product Pilot: Actual Local Browser

Fresh production build, Chromium, `AI_PROVIDER=rule-v21`, `VERCEL_ENV=preview`, port 3104. This existing provider flag now calls V2.2 preprocessing, while the old V2.1 engine remains directly testable. Physical speech was not simulated or claimed as verified.

| Input | API / actual UI |
| --- | --- |
| 나 오늘 화분 물줬어! | COMPLETED, 화분 물 주다, EXPLICIT today; 화분 물 주기 Confirmation |
| 오늘 내가 신발 빨았어 | COMPLETED, 신발 빨다, EXPLICIT today; Confirmation with 신발 세탁 candidate |
| 아 나 정수기 필터 갈았어 | COMPLETED; Confirmation with 정수기 필터 candidate |
| 음... 신발 언제 빨았지? | QUERY; 신발 세탁 history result, save CTA 0 |
| 나 오늘 신발 안 빨았어 | NOT_COMPLETED; blocked UI, save CTA 0 |
| 나 내일 렌즈 갈 거야 | PLANNED; blocked UI, save CTA 0 |

All original_text values preserve the submitted prefixes/punctuation. No save button was clicked. Lab Worker separately returned version V2.2 and the expected metadata/coreClause. Console errors/warnings: 0. Confirmation screenshots at 360/390/430: no horizontal overflow.

Evidence: `output/rule-parser-v22/product-browser.log`, `lab-browser.log`, `mobile.log`, `confirmation-*.png`.

## Evaluation and Regression

- Requested examples: 21 intent/candidate assertions PASS, including self/time/filler/topic/negative/planned/uncertain/third-person examples.
- New combinatorial 100 cases: 100/100 final PASS. Ten groups of nine (speaker, temporal, filler, punctuation, topic, honorific, Query, negative, planned, uncertain), plus ten multi-action cases. All strings are disjoint from the existing 369 corpus and absent from implementation source.
- Evaluation is constructed, not a claim of arbitrary real-world Korean accuracy. Initial run found one future-context UNKNOWN classification and a test-harness typo (`lenses` instead of actual item ID `lens`). The expectations were retained; future metadata handling and that ID typo were corrected. First-run evidence remains `holdout-first-run.json`; final results are `holdout.json`. This is not represented as an untouched blind holdout after the corrective iteration.
- Critical counts on the new 100: False Completion 0, Query-to-Record 0, Negative-to-Completed 0, Planned-to-Completed 0, Uncertain-to-Completed 0, Wrong Item Match 0, Wrong Date 0.
- Existing 369 corpus rerun both on original V2.1 and on V2.2: 247/251 legacy intent, 18/18 targeted, 100/100 previous holdout; unchanged 365/369 total intent accuracy. Critical false completion/wrong high-confidence target/action/match and incompatible-action candidates all 0. Four pre-existing intent misses remain; no claim of perfect accuracy.
- Product integrity A-H PASS: explicit/invalid/future dates, history maximum/cycle, duplicate IDs, tag/action compatibility, confirmation rematching, stale-save and atomic rejection.
- Existing Product pilot smoke PASS. The old `나 화장실 청소했어` expectation is explicitly updated from clarification to candidate=true because SELF-prefix support is the authorized V2.2 requirement; no safety assertion was removed.
- Additional date/source tests PASS: different dates in coordinated clauses, inherited absolute date, repeated whitespace, vague past date, invalid date, future date, >5 overflow with empty segment output.
- Cycle and Month smoke PASS.
- Fresh mock server port 3105: six Product routes, 24 fixture routes and four Mock API probes PASS.
- typecheck PASS; lint PASS with 0 warnings after removing an unused test variable; build PASS.
- Existing Garu initialization deprecation and Node module-type warnings remain in CLI tests; they are not browser runtime errors.

## Files Changed in This Task

- `lib/rule-parser/utterance.ts`: new bounded normalization and metadata/source mapping.
- `lib/rule-parser/engine-v22.ts`: reuse V2.1, handle topic tokens, restore original text/date context.
- `lib/rule-parser/engine.ts`: export existing date helper without changing V2.1 behavior.
- `lib/rule-parser/product-pipeline.ts`: invoke V2.2 under the existing rule-v21 provider.
- `lib/rule-parser/worker.ts`: use V2.2 in Lab.
- `components/rule-parser/RuleParserLab.tsx`: version labels only.
- `scripts/rule-parser-v22-smoke.mjs`: new examples, 100-case evaluation, safety/date/source tests.
- `scripts/rule-parser-v21-eval.mjs`: optional V2.2 engine selection against unchanged corpus; separate output directory.
- `scripts/rule-pilot-smoke.mjs`: the explicitly authorized SELF-prefix expectation.
- This report and generated evaluation/browser evidence.

No new dependency, schema, Store, Matching, API route, SpeechRecognition, Product layout or fixture edit. Pre-existing dirty changes were preserved. No commit/push/deploy.

## Limits and Next Step

This is bounded leading-utterance normalization, not unrestricted discourse/coreference parsing. Uncertain analyses still ask for clarification; third-person statements are not silently treated as self records. The parser is not an LLM. V2.2 has not been deployed to the public Preview in this task, and no new physical microphone test is claimed.

Local test: http://127.0.0.1:3104/ . Existing public Preview remains its prior V2.1 deployment; original Production remains mock. Next step is a separately authorized Preview update and focused device test of the new natural-utterance examples, not a Production switch.
