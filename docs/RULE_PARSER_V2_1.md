# Rule Parser V2.1 - Contextual Matching and Usability Gate

Date: 2026-09-17. **V2.1 READY FOR DEVICE QA** for the isolated lab only.
This is not Product adoption approval, universal language correctness, or a
physical-phone PASS. Product remains Mock AI. No API key, remote inference,
Product parser, voice, Store, History or fixture changes were made.

## 1. V2 limitations

V2 protected candidate creation but its matching-only equivalence still globally
mapped 갈다 to replacement, 씻다 to laundry and 닦다 to cleaning. The analyzer
also tagged 물 as VV and 주 as VX, so water phrases remained LOW. V2 core usable
new-item names were 7/12. Its original files and evidence remain unchanged.

## 2. Contextual equivalence architecture

`V2 intent/date/safety -> V2.1 phrase reconstruction -> confidence gate ->
target + raw lemma -> matching context -> compatible candidates -> manual review`.

Implementation: `lib/rule-parser/engine-v21.ts`, `context-v21.ts`,
`matching-v21.ts`. No context list is consulted by the Parser. The lab Worker
alone switches to V2.1. Existing `calculateRecordCandidate` and schema validation
remain diagnostic gates; the lab has no save action.

## 3. Global mappings removed from the active lab path

- 갈다/바꾸다/교체하다/교환하다 equivalence: replaceable components only.
- 빨다/씻다/세탁하다 equivalence: fabric/laundry objects only.
- 닦다/청소하다 equivalence: the explicit cleanable-object group only.
- All other lemmas stay literal, including 확인하다 versus 점검하다 outside a
  separately justified context. No general equivalence import remains in V2.1.

Historical V1/V2 tables and Product mock behavior were deliberately not rewritten.
Product matching is reused only after V2.1 compatibility filtering, so its broad
legacy fuzzy synonyms cannot reintroduce an incompatible candidate.

## 4. Target context

Five small groups match an exact target head token:
REPLACEABLE_COMPONENT (필터/렌즈/칫솔/배터리/브러시/부품), FABRIC_LAUNDRY
(신발/수건/이불/옷/침구), CLEANABLE_OBJECT (그릇/창문/책상/바닥),
SHARPENABLE (칼/가위), PLANT (화분/식물/화초).
The last two identify context without inventing new synonyms. Unknown targets
continue to parse, receive raw actions and may become new-item candidates.
Compound head segmentation is analyzer-dependent; failed grouping loses recall
rather than forcing an unsafe match.

## 5. Raw action and matching tiers

Original input, tokens, raw action surface and lemma are retained. Matching
normalization never overwrites the Parser action or the proposed name.
Compatible items are filtered before ranking; then exact compact name, existing
alias, tag, note and context-semantic candidates are considered. Broad fuzzy
results cannot bypass target/action compatibility. A separate permissive fuzzy
fallback is intentionally not enabled when semantics cannot be proven.
`selectedItemId=null`, `autoMatch=false` always. Multiple compatible exact items
remain AMBIGUOUS. Synthetic fixtures never modify Product metadata.

Known boundary: strict target equality limits alias/tag recall when their target
wording differs from the canonical item's wording. This is not a complete
production alias/tag resolver; none is claimed by this lab gate.

## 6. Predicate chains

Reconstruction handles noun-object + 주다, bare verb-like token + 주 without a
connective, and VV + 아/어/여 + auxiliary 주. For the mistagged bare token, a
separate object-particle analysis must supply noun evidence. This is a grammar
test, not a 물 whitelist. Other predicates, subjects and unresolved particles
remain conservative. Safe negative adverbs are excluded from phrase assembly,
but retained in V2 intent signals. Complex planned chains are not forced HIGH.

`약 먹여 줬어`, `문 열어 줬어`, `사진 찍어 줬어` preserve their phrases as
먹여 주다 / 열어 주다 / 찍어 주다, rather than collapsing them to 주다.

## 7-13. Required semantic results

All three water forms (`화분 물줬어`, `화분에 물 줬어`, `화분에 물을 줬어`)
produce COMPLETED, target 화분, action 물 주다, HIGH and new-item candidate
`화분 물 주기`. Confirmation-only diagnostic; no actual save.

| Input family | Intent | Matching surface / outcome |
| --- | --- | --- |
| 칼 갈았어 / 칼 언제 갈았어 | COMPLETED / QUERY | 칼 갈다; never 칼 교체 |
| 칼 갈려고 했어 | PLANNED | clarification, no record |
| 정수기 필터 갈았어 / 언제 갈았어 | COMPLETED / QUERY | 정수기 필터 교체; 정수기 필터 candidate |
| 렌즈 갈았어 / 렌즈 언제 갈았어 | COMPLETED / QUERY | 렌즈 교체 candidate |
| 렌즈 다음주에 갈 거야 | PLANNED | 가다 analysis retained LOW; clarification |
| 커피 갈았어 / 커피 언제 갈았어 | COMPLETED / QUERY | 커피 갈다; never replacement |
| 그릇 씻었어 | COMPLETED | 그릇 씻다; proposed 그릇 씻기 |
| 그릇 닦았어 | COMPLETED | 그릇 청소 matching; raw 닦다 retained |
| 신발 빨았어 / 신발 씻었어 | COMPLETED | 신발 세탁 candidate |
| 화분 물 주려고 했어 | PLANNED | unresolved planned chain; no record |

Coffee grinding versus knife sharpening is preserved through target + raw 갈다;
the lab does not claim to label every sense as a new 분쇄/연마 semantic class.
Lens prospective 가/갈 polysemy is not guessed into replacement or completion.

## 14-15. Query and safety

V2's temporal QUERY branch is unchanged. Lens/filter/shoe queries provide only
candidates; targetless or incompatible queries do not become records.
`칼 안 갈았어`, `렌즈 갈려고 했어`, `정수기 필터 갈았나`, and the water
plan family remain non-mutating. No new item ID selection or write path exists.

## 16-17. New-item naming

Names use target + literal lemma with nominal 기, not matching synonyms.
Examples: 화분 물 주기, 자동차 워셔액 넣기, 가습기 말리기, 칼 갈기, 그릇 씻기.
Core denominator unchanged: **usable 9/12, clarification 3/12, wrong-name 0/12**.
V2 was 7/12. Remaining core fallbacks: 아이 약 먹였어, 냉장고 성에 제거했어,
침구 햇볕에 널었어. Analyzer compound spacing such as 보조 배터리 remains;
no unsupported spelling/nominalization perfection is claimed.

Wrong-name counts require independent target/action rubric agreement, not merely
that the generated string is nonempty. No wrong generated names were found in
the labeled tested cases; this does not cover arbitrary Korean.

## 18-22. Evaluation

Run: `node scripts/rule-parser-v21-eval.mjs`.
Evidence: `output/rule-parser-v21/results.json` (full inputs, tokens and outputs).

| Corpus | Intent correct | Critical errors | Clarification |
| --- | --- | --- | --- |
| V2 regression, unchanged 251 | 247/251 | 0 | 87/251 |
| Targeted controls | 18/18 | 0 | 3/18 |
| New context corpus | 100/100 | 0 | 36/100 |
| All | 365/369 | 0 | 126/369 (34.15%) |

Critical False Completion, Query->Record, Negative->Completed, Planned->Completed,
Uncertain->Completed, conflict candidates, conflict auto-match and wrong existing
auto-match: **0** in tested cases. Six explicit synthetic action-conflict probes
return none. Duplicate exact candidates remain ambiguous. Multi 2/5 preserved;
6 actions still returns TOO_MANY_ACTIONS and zero segments. All schemas valid.

HIGH_CONFIDENCE_WRONG_ACTION = 0; HIGH_CONFIDENCE_WRONG_TARGET = 0;
HIGH_CONFIDENCE_WRONG_MATCH = 0. Coverage is **151 target/action-labeled rows,
124 matching-labeled rows plus six synthetic conflicts**, not all conceivable
inputs. Absence of labels is not silently counted as semantic correctness.

The new 100 were authored after the initial V2.1 implementation and checked to
exclude all V2 input strings. Categories: 16 target/action families x 5 intent
forms, 12 chains, eight spacing/compound examples. Engine source is checked not
to contain their sentences. First run is preserved in `initial-results.json`:
one HIGH target/action segmentation error (`식물 물 안 줬어`) and excessive
repeated label analysis. Generic negative-adverb filtering and bounded caching
were then applied; no ground-truth label was changed. Matching expectations for
the 100 were subsequently added to strengthen coverage. Thus final results are
**post-fix regressions, not an independently blinded final holdout**.

Rule hash: `bd717a2a6bca307622035dc5cda60c2e87816a502ee52b32de3b5629c7808a29`.

Safe fallback is not understanding: only 64/100 new inputs have both independently
correct target/action and aggregate HIGH. 36/100 still need clarification.
Three completed-chain fallbacks: 친구에게 선물 줬어, 장난감 고쳐 줬어,
아이에게 간식 줬어. The old four intent misses remain: 반죽 치댔어 -> UNKNOWN;
two adjectival non-actions -> UNCERTAIN; double negation 약 먹지 않은 건 아니야
-> NOT_COMPLETED instead of UNCERTAIN. No new critical regression was hidden.

## 23-25. Performance and assets

No new dependency/model; Garu remains 0.9.17. No Gemma/Kiwi experiment rerun.

| Desktop measurement | V2 | V2.1 |
| --- | --- | --- |
| Browser observed initialization | 179.1ms | 198.0ms |
| Browser 100-case mean / max | 1.769 / 13.3ms | 2.941 / 11.3ms |
| Browser processing sum | 176.9ms | 294.1ms |
| Node initialization | 120.1ms | 104.68ms |
| Node mean | 0.995ms parse-only | 1.204ms including matching |
| Node 100-case sum | 68.55ms parse-only | 85.61ms including matching |
| Model + WASM | 1,657,734 bytes | unchanged |
| Aggregate .next/static | 30,121,826 bytes | 30,125,016 bytes |

Static delta +3,190 bytes is aggregate, not a route JS transfer measurement.
Model is 1,246,193 bytes; WASM 411,541 bytes. The whole application also retains
older transformer PoC assets and is not a 1.66MB application download claim.
Browser cohorts differ, so these are observed samples, not a controlled speedup/
slowdown claim. First uncached V2.1 implementation averaged 26.3ms full pipeline;
256-entry analyzer-local label caching removed repeated analyses. No phone
latency/thermal/memory claim is made. Cache invalidates by label text and analyzer.

## 26-30. Runtime, Product and build checks

Real desktop Chromium UI: 15 focused controls plus the new 100 typed through the
textarea, rendered JSON inspected and expectations asserted. Browser init,
results and timings: browser-controls.log, browser-100.log. 360/390/430 widths
have scrollWidth equal to innerWidth; screenshots under output/playwright.
Loaded-session offline parsing succeeds; offline reload/install is not promised.
Observed browser console: errors 0, warnings 0.

Product regression: six Product routes HTTP200, fixtures 24/24 HTTP200,
four existing mock API probes preserve completion/query/negative/new-item
behavior and MOCK mode. New HOME browser context requests no lab/model assets.
Cycle and Month contract smoke PASS. These are bounded regression checks, not
a new physical replay of all Product voice and interaction tests.

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; fresh server on port 3102, PID 36228 at verification.
- `npm audit --json`: 0 reported vulnerabilities.
- Upstream Garu Node init deprecation and existing cycle module-type warning
  remain visible; they are not browser errors or reported as fixed.

## 31. Changed files

Added:
- lib/rule-parser/context-v21.ts
- lib/rule-parser/engine-v21.ts
- lib/rule-parser/matching-v21.ts
- lib/rule-parser/evaluation-v21.ts
- scripts/rule-parser-v21-eval.mjs
- scripts/rule-parser-product-smoke.mjs
- docs/RULE_PARSER_V2_1.md
- output/rule-parser-v21 evidence and output/playwright/rule-v21 screenshots

Modified: lib/rule-parser/worker.ts (V2.1 + stable analyzer function),
components/rule-parser/RuleParserLab.tsx (version label only).
Pre-existing dirty files retained. No dependency/env/Product edits in this task;
no commit, push or deployment performed. No new document-contract conflict:
user's explicit lab-only authorization leaves production contracts untouched.

## 32. Final decision and device gate

**V2.1 READY FOR DEVICE QA**. Automated safety gate passes; usability is improved,
not complete. Do not replace Product from this result.

Next manual targets, all still unverified:
- iPhone 16 Pro Safari and Chrome.
- Galaxy Z Flip3 Chrome and Samsung Internet.

Record browser/OS, cold/repeat load, input edit/reparse, polysemy cases, water
phrases, plans/negatives/uncertainty, query candidates, unknown-target raw output,
100-case latency/heat/memory stability, loaded-session offline behavior and
reload/retry. Any critical failure reopens the lab gate. For voice, use the
preserved Product voice flow to obtain a transcript and paste it into the lab;
automatic Product voice-to-V2.1 integration is deliberately absent.

Local desktop URL: http://127.0.0.1:3102/rule-parser-lab . This localhost URL is
not a publicly shared phone URL. A reachable test origin is needed for phones;
no deployment or external exposure was requested or performed here.
