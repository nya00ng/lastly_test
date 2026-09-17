# Rule Parser PoC - 2026-09-17

## Decision

**RULE PARSER NOT VIABLE** for replacing the current Product parser with this
implementation. This is not a claim that all deterministic Korean parsing is
impossible. The small runtime is promising; semantic safety is not established.
No production provider, API, voice, Store, history, matching rule or fixture was
replaced. `AI_PROVIDER=mock` remains unchanged. No commit/deployment performed.

Critical evidence: `신발 빨려고 했어` becomes COMPLETED and a positive candidate
diagnostic although it reports an intention, not a completed wash. There is no
save path in the lab, so actual mutations are zero. Confirmation alone is not a
justification for accepting this false-completion risk into Product.

## Non-duplicate scope

Read `LOCAL_AI_POC.md`; no MiniLM, Qwen, Gemma, generic WebGPU or STT experiment
was rerun. New work is morphology + deterministic rules, open verbs, extraction,
matching compatibility, independent evaluation and browser performance/offline.
No LLM or remote inference was used.

## Current dependency research

Registry and release metadata queried during this run, not search-snippet versions:

| Candidate | Latest npm | Published/updated UTC | License | Unpacked package |
| --- | --- | --- | --- | --- |
| garu-ko | 0.9.17 | 2026-09-02 04:04:59 | MIT | 1,703,631 bytes |
| kiwi-nlp | 0.24.0 | 2026-09-13 13:56:59 (registry modified) | Apache-2.0 | 5,609,222 bytes, excluding model |

Kiwi official v0.24.0 release: 2026-09-13 14:01:35 UTC. Its tagged LICENSE and
npm package both use Apache-2.0; older indexed LGPL descriptions are stale.
`@bab2min/kiwi-wasm` returned registry 404; the actual package is `kiwi-nlp`.
Both expose TypeScript definitions and browser WASM APIs. Neither requires GPU.
No claim of physical iOS/Android support is inferred from these APIs alone.

Sources:
- https://registry.npmjs.org/garu-ko
- https://github.com/ongjin/garu
- https://registry.npmjs.org/kiwi-nlp
- https://github.com/bab2min/Kiwi/releases/tag/v0.24.0
- https://raw.githubusercontent.com/bab2min/Kiwi/v0.24.0/LICENSE
- https://nodejs.org/dist/index.json

Installed: Node 24.12.0, Next 16.3.4, React 19.1.1, TypeScript 5.9.2.
Latest checked: Node current 26.8.2 (not LTS), Next 16.3.5, React 19.3.0,
TypeScript 7.0.2. No unrelated framework upgrades made.

Garu is pinned as the lab runtime: small same-origin assets and fast startup.
Kiwi was downloaded/extracted under output only for a same-rule comparison, not
added to Product dependencies. Kiwi is not adopted: ~109MB extracted model,
~1GB observed Node process RSS, plus negative disambiguation errors with this
engine. This is not an unbiased claim about either library's general accuracy:
the engine was initially written against Garu token conventions.

## Architecture and boundaries

`rawInput -> NFC/trim/space/punctuation normalization -> Garu tokens -> intent
rules -> target/action -> minimal canonical surface -> existing matcher with
lab-only compatibility filter -> read-only inspection`.

- `lib/rule-parser/engine.ts`: no action whitelist; extracts arbitrary VV/XSV
  predicates and noun spans. Past EP, endings, temporal question, negation,
  obligation and uncertainty signals combine to classify intent.
- Original input and normalized surface are both retained. Tokens retain POS and
  library-provided offsets (Garu offsets can cover whole eojeols, not exact morphs).
- `target`, `action`, confidence and reasons are diagnostic sidecars, not breaking
  additions to ParserOutput. Existing enums/schema validate all 168 outputs.
- MEDIUM/LOW are heuristic labels, not calibrated probabilities. Scope IN_SCOPE
  is a lab hypothesis for extracted actions, not proven semantic domain validation.
- `matching.ts`: existing Exact Name -> Alias -> Tag -> Note -> Fuzzy order is
  reused; no new priority inserted. Synonyms assist matching only, not parsing.
  Unknown/incompatible action semantics do not pass fuzzy matching in the lab.
  Product matcher is unchanged. No candidate is selected automatically.
- `calculateRecordCandidate` is reused only for diagnostics. No browser result
  authorizes a write; server candidate ownership remains unchanged.
- Worker performs WASM work off the UI thread; input limit 500, timeout 30s,
  unmount cleanup, error/retry and empty guard implemented. No microphone hook.
- `/rule-parser-lab` is dev-only unless `RULE_PARSER_LAB_ENABLED=1`. Default 0.
  No Product navigation link. No API route or production adapter added.
- Speech transcript could later enter this text boundary, but voice integration
  is deliberately NOT performed because the quality gate failed.

## Method and results

Rules were written before the separate holdout fixture. No exact test sentence
is embedded in engine code; the harness asserts this. After seeing results no
intent/extraction rules were tuned to the holdout. The later engine change only
preserved rawInput. Hashes are in the JSON reports. These are authored tests, not
an independently blinded population study. Repeated combinations are not 100
independent linguistic constructions.

168 cases = core 32 + holdout 30 + realistic combinations 100 + non-action 6.
Combinations use 10 targets, 10 distinct actions and 5 intents across 20 plausible
target/action pairs, not a semantically meaningless Cartesian product.

| Metric | Garu + frozen rules | Kiwi + same rules |
| --- | --- | --- |
| Intent accuracy | 167/168 = 99.40% | 159/168 = 94.64% |
| COMPLETED | 51/52 | 52/52 |
| QUERY intent | 30/30 | 30/30 |
| NOT_COMPLETED recall | 28/28 | 21/28 |
| PLANNED | 27/27 | 25/27 |
| UNCERTAIN | 26/26 | 26/26 |
| Core intent | 32/32 | 30/32 |
| Holdout intent | 29/30 | 29/30 |
| Holdout intent + annotated extraction | 29/30 | 28/30 |
| Target extraction, annotated subset | 28/32 = 87.50% | 30/32 = 93.75% |
| Action extraction, annotated subset | 30/32 = 93.75% | 31/32 = 96.88% |
| Core novel-item candidate + correct extraction | 8/12 | 10/12 |
| Wrong action conflict candidates | 0/2 | 0/2 |
| Non-action expected intent | 6/6 | 6/6 |
| Wrong positive candidates in base 168 | 0 | 7 (6 unique sentences) |

QUERY intent accuracy is NOT query-resolution accuracy. Separate probes matched
shoe washing and water-filter replacement, but `렌즈교체 언제 했어` became
`렌즈 교체 하다` and was rejected by conservative matching. Targetless query
remains QUERY/no-match, but an appropriate Product clarification is not wired.

Additional post-freeze safety probes expose the planned-completion failure above.
Quoted completion (`약 먹었다고 말했어`) is UNCERTAIN; desire is PLANNED;
`화분에 물 주지 않았어` is NOT_COMPLETED; mixed negative/positive coordination
separates correctly in the tested example. These probes do not retroactively
inflate the 168-case scores. Overall qualityGate remains FAIL.

### Errors, not hidden by intent scores

| Sentence | Error class | Evidence |
| --- | --- | --- |
| 화분 물줬어 | Morphology/action | 물 is VV, action becomes 물다 rather than 물 주다 |
| 아이 약 먹였어 | Morphology/target | 아이 omitted; only 약 retained |
| 냉장고 성에 제거했어 | Morphology/target | 성에 omitted |
| 침구 햇볕에 널었어 | Target structure | 햇볕 incorrectly retained as target rather than location |
| 반죽 치댔어 | Morphology/intent | Missing usable predicate -> UNKNOWN |
| 렌즈교체 언제 했어 | Canonical/matching | Generic 하다 is not safely collapsed into nominal action |
| 신발 빨려고 했어 | Intent/safety | Intended action incorrectly treated as completed |
| 서랍 안 비웠어 (Kiwi) | Ambiguity/negation | 안 tagged NNG (inside), not negative MAG |

The extraction rubric allows documented object-inclusive targets; it does not
count non-empty strings as correct. Counts are on 32 annotated rows, not all 168.
The ambiguous semantic scope, compositional negation, noun boundaries, generic
하다 and coordinated clause/date scope remain adoption blockers.

### Holdout disclosure

COMPLETED: 텐트 접었어; 수건 삶았어; 커튼 걸었어; 서랍 비웠어; 자전거 잠갔어;
화병 헹궜어; 상자 묶었어; 이불 개었어; 시계 맞췄어; 화초 옮겼어; 커피콩 볶았어;
채소 다듬었어; 칼 갈았어; 단추 달았어; 양말 꿰맸어; 냄비 불렸어; 매트 깔았어;
장작 쌓았어; 반죽 치댔어; 소포 부쳤어.

QUERY: 텐트 언제 접었어; 화병 언제 헹궜어; 단추 마지막으로 언제 달았어.
NOT_COMPLETED: 서랍 안 비웠어; 자전거 못 잠갔어; 양말 안 꿰맸어.
PLANNED: 커튼 걸어야 해; 채소 다듬어야겠다.
UNCERTAIN: 시계 맞췄나; 화초 옮겼는지 모르겠어.

## Dates and multi-action

Context 2026-09-17: today/ yesterday/ day-before-yesterday/ 3 days ago resolved
to 17/16/15/14 with EXPLICIT. No date -> IMPLICIT_TODAY. Last week -> APPROXIMATE
with no exact date; future completion blocked. Asia/Seoul today uses existing
helper; arithmetic uses UTC date-only. These narrow tests pass, not a claim of
full Product date-language parity (absolute dates/complex scopes remain gaps).
Simple -고 coordination tested 2 and 5 actions; 6 returns TOO_MANY_ACTIONS and
zero segments. Other connective forms and complex scope are not established.
No partial save exists because this lab has no save operation at all.

## Performance, assets and offline

Desktop Windows, Node 24.12.0; browser automated Chrome, not a phone.

| Measurement | Garu | Kiwi |
| --- | --- | --- |
| Node initialization, final run | 104.7ms | 3258.9ms |
| Node mean parse (168) | 0.91ms | 0.95ms |
| Node 100-case parse sum | 57.1ms | 62.5ms |
| Node observed process RSS | 134,938,624 bytes | 1,036,345,344 bytes |
| Model uncompressed | 1,246,193 bytes | 109,229,245 bytes |
| WASM | 411,541 bytes | 5,467,886 bytes |

RSS includes Node/harness and is not isolated model peak RAM. Mobile RAM/heat/
battery stability are unmeasured. Kiwi archive is 87,967,233 bytes; not shipped.

Browser initial load observed 134.1ms; later reload init 88.7ms (HTTP cache can
participate; not a proven cold wireless download). Final actual UI 100-case mean
2.615ms, maximum 43.1ms including first parse; matching/validation included.
All 100 intent outputs matched expected order. Worker/model load network trace
contained only localhost assets/prefetch; remote inference requests = 0.
After initialization, browser network disabled: editable input -> COMPLETED
analysis succeeded. Full offline page reload/install/cache persistence is NOT
implemented; no PWA/service worker was added.

Build static bytes before: 28,406,625; after: 30,117,064; delta: 1,710,439.
Of this, model+WASM = 1,657,734 bytes; remaining aggregate delta = 52,705 bytes
(JS/worker/other build artifacts, not a pure minified-JS-only measurement).
No per-route baseline JS transfer capture was saved, so exact HOME JS byte delta
is unverified. Garu is isolated behind lab Worker imports, not Product imports.
Fresh browser HOME smoke also observed zero Garu/model/lab asset requests.
Both before/after include the earlier Gemma lab assets; these were preserved.

## Gemma comparison (no rerun)

| Dimension | Prior Gemma PoC | Rule/Garu PoC |
| --- | --- | --- |
| Model bytes read / shipped model | ~880MB read | 1.25MB model + 0.41MB WASM |
| First load observed | 34.6s | 134.1ms browser |
| Parse | mean 28.36s | browser mean 2.615ms |
| Accuracy | strict output 0/28 | intent 167/168; semantic/safety FAIL |
| Determinism | fixed greedy decoding | deterministic morphology/rules |
| Offline | unverified/cache failure | loaded-session offline parse verified |
| Mobile risk | large GPU/memory/cache | smaller, but four devices untested |
| Paid inference calls | 0 | 0 |

These datasets and measurements are different: accuracy percentages are not a
head-to-head model benchmark. Hosting, bandwidth, mobile data and power are not
guaranteed free merely because paid inference API usage is zero.

## QA and manual checklist

typecheck/lint/build PASS; npm audit reports 0 vulnerabilities. Evaluation harness
contracts PASS; parser quality gate FAIL, explicitly separate. Cycle/month/local
AI harness smoke PASS. Product routes /, /record, /items, /items/bedding,
/notification, /settings = HTTP200; all 24 fixture routes = HTTP200. Mock API
completion/query/negative/new-item probes retain MOCK and correct candidate flags.
No broad physical-interaction regression claim: Product source is unchanged and
these are bounded route/API/domain smoke checks, not a replay of every R1-R8 UX.

Actual lab rendering 360/390/430: horizontal overflow 0; screenshot at 360 inspected.
Browser console in inspected session: 0 errors/warnings. Node Garu prints upstream
WASM init deprecation warning; Kiwi prints non-quantized fallback warning. Existing
cycle smoke prints its pre-existing Node module-type warning. Not hidden as zero.

All four environments below: **MANUAL DEVICE REQUIRED**:
- iPhone 16 Pro Safari
- iPhone 16 Pro Chrome (test separately, do not infer from Safari/WebKit similarity)
- Galaxy Z Flip3 Chrome
- Galaxy Z Flip3 Samsung Internet

For each: record OS/browser version, load over HTTPS, measure fresh and repeat
init, arbitrary Korean action/query/negation/plan/uncertainty, edit and reparse,
run mismatch probes, disable network after load, test 100 repeated inputs,
observe responsiveness/keyboard/rotation/heat/reload/cache behavior. No mic test
is needed in this phase. No mobile PASS, WebGPU requirement or Product switch.

## Files and reproduction

Added: app/rule-parser-lab/page.tsx; components/rule-parser/RuleParserLab.tsx;
lib/rule-parser/{engine,matching,evaluation,worker}.ts;
scripts/rule-parser-eval.mjs; this report; output/rule-parser evidence.
Modified: package.json/package-lock.json (garu-ko 0.9.17 only), .env.example (flag).
Earlier Gemma changes and all previous output remain intact.

Run `node scripts/rule-parser-eval.mjs`; quality failure is recorded in JSON,
while process success indicates harness execution, not a Product gate PASS.
Comparator: `node scripts/rule-parser-eval.mjs --kiwi` uses downloaded 0.24.0
package at output/rule-parser/node_modules/kiwi-nlp and official model extracted
at output/rule-parser/kiwi/models/cong/base. Its files are not Product dependencies.

Evidence: output/rule-parser/garu-results.json, kiwi-results.json, browser-qa.log,
offline-layout.log and lab-360/390/430.png. All source sentences and tokens are
preserved in evaluation JSON. Physical-device cells remain manual, not PASS.

Final: **RULE PARSER NOT VIABLE** for Product replacement in its current form.
