# Rule Parser V2 - Conservative Safety Gate

Date: 2026-09-17. Verdict: **RULE PARSER V2 VIABLE WITH LIMITATIONS** as an
isolated candidate for manual evaluation, NOT approval to replace Product.
All zero-error claims below are bounded by the disclosed test set. Physical
phones, independent user utterances and broad language safety remain unverified.
Product stays `AI_PROVIDER=mock`. No API, voice hook, Store or fixture changed.

## V1 problems and architecture

V1 made intentions such as `신발 빨려고 했어` COMPLETED, trusted a wrong `물다`
lemma, and failed to connect `렌즈교체 언제 했어` to the existing lens item.
V1 files, results and `RULE_PARSER_POC.md` remain available. Neither Kiwi nor
Gemma was rerun. Garu 0.9.17 and its existing assets/dependencies are unchanged.

V2 composes the original segmentation/date helpers with a separate safety layer:

`raw input -> V1 surface/morphology -> V2 grammar signals -> conservative intent
-> three confidence axes -> canonical OR raw surface -> dual-axis matching
-> read-only clarification/confirmation diagnostics`.

Files: `lib/rule-parser/safety-v2.ts`, `engine-v2.ts`, `matching-v2.ts`.
The lab Worker now uses these. The server Parser and candidate calculation do not
change. Existing `calculateRecordCandidate` is reused as a diagnostic only.
No result auto-selects an Item ID, creates Activity or calls a save endpoint.

## Intent and confidence policy

Temporal QUERY is an outer non-mutating branch, including questions containing
negation. Memory uncertainty is checked before interpreting the internal `안`
of `기억 안 나` as a negated performed action. Then near-miss -> NOT_COMPLETED,
negation -> NOT_COMPLETED, intention/plan/future -> PLANNED, non-assertion/explicit
subject -> UNCERTAIN. COMPLETED is last and needs an asserted past predicate or
the restricted coordinated-past case. This intentionally is not a blind
NOT_COMPLETED-first substring ladder.

Grammar families cover -려고/-려다, prospective 생각/예정/참/계획, -뻔,
-ㄹ까 하다, obligations/desires, memory uncertainty, future, reported/conditional/
interrupted clauses and subject-bearing assertions. No action whitelist and no
exact whole-input exception was added.

Diagnostics retain `raw_action_surface`, `lemma_candidate`, `canonical_action`,
`intent_confidence`, `target_confidence`, `action_confidence`, aggregate confidence
and reasons. These are heuristic labels, NOT calibrated probabilities or new
fields in the production Parser schema. HIGH on all axes permits canonicalization;
MEDIUM/LOW retains normalized raw surface and requires clarification. Raw input
is also preserved separately. Existing Clarification enums only; no TARGET enum.

VV/VX chains are not reduced to their first verb. Residual IC/NP/VA/VCP/JKS/XSN/
XPN tokens or ambiguous multi-noun JKB relations lower target confidence. Thus:

| Input | Intent | Action/canonical | Candidate |
| --- | --- | --- | --- |
| 신발 빨려고 했어 | PLANNED | raw, LOW, canonical null | false |
| 화분 물줬어 | COMPLETED | lemma proposal 물다 retained for audit; canonical null | false |
| 화분에 물 줬어 | COMPLETED | raw + clarification | false |
| 렌즈교체 언제 했어 | QUERY | 렌즈 교체; existing candidate | false |
| 신발 빨았어 | COMPLETED | 신발 빨다; matching equivalence 세탁 | true, confirmation only |
| 신발 언제 교체했어 | QUERY | no compatible existing item | false |

The water sentence is not claimed as correctly understood: intent is completed,
but action understanding is unresolved. Safe fallback is the improvement.

## Matching and compound nouns

Generic noun + 하다 is reconstructed from noun tokens, not a lens-specific rule.
NFC/whitespace-insensitive comparison handles 렌즈교체/렌즈 교체, 정수기필터/
정수기 필터, 에어컨필터/에어컨 필터, 신발세탁/신발 세탁.

The unchanged Product matcher supplies Exact Name -> Alias -> Tag -> Note -> Fuzzy
candidates. A lab-only filter then requires HIGH confidence and compatible target
AND action evidence from item name/history. Incompatible candidates are removed,
not silently replaced with another item. V1's eleven matching-equivalence entries
are exported/reused, not expanded or used as allowed parser actions.

Output confidence: EXACT/HIGH/AMBIGUOUS/NONE. A synthetic two-candidate fixture
returns AMBIGUOUS and requires selection. `selectedItemId` is always null and
`autoMatch` always false. These structural zeros alone are not evidence of good
matching: the independent candidate-level conflict and positive-match tests below
are also checked. Product fixtures were not modified for synthetic cases.

New-item candidate diagnostics require COMPLETED, the existing candidate gate,
aggregate HIGH and no compatible existing candidate. MEDIUM/LOW supplies raw
input and clarification, not a silently generated item name.

## Evaluation integrity

251 cases: original 168 + required adversarial 15 + positive controls 8 + new
safety holdout 54 + explicit query matching 6. Full inputs/tokens/results live in
`output/rule-parser-v2/results.json`. The original 168 are rerun through both V1
and V2, including the old holdout and 100 combinatorial cases.

The 54 new cases were authored after the initial V2 implementation. An initial
run is preserved in `initial-results.json`. A subsequent generic residual-POS/JKB
gate addressed the already-known V1 noun-loss/location errors; the holdout labels
were not changed. Final reruns are consequently regression evaluation, not an
independently blinded experiment. No sentence is embedded in engine/rule source;
an assertion verifies this. Confidence changes must not be mistaken for new
semantic ground truth.

Final rule hash (engine + signals):
`8251e85449ca2313574d4297068dff63a69388db909e257b8809dd292dba1aa9`.

## Critical metrics

| Metric, observed corpus | V2 |
| --- | --- |
| Non-completed truth -> COMPLETED or positive candidate | 0 |
| QUERY -> record/completed | 0 |
| NOT_COMPLETED -> COMPLETED | 0 |
| PLANNED -> COMPLETED | 0 |
| UNCERTAIN -> COMPLETED | 0 |
| Action-conflict candidate errors | 0/4 |
| Action-conflict auto-match | 0 |
| Wrong/missing expected existing candidates | 0/6 query probes |
| Wrong existing-item auto-match / selected IDs | 0 / 0 |
| LOW/MEDIUM canonicalization or positive candidate | 0 |
| Actual mutations / inference API calls | 0 / 0 |

Same 251 inputs evaluated by V1 contain 24 unsafe COMPLETED classifications;
V2 contains 0. On the required adversarial 15 alone, V1 8 -> V2 0.
No universal guarantee is inferred from these finite examples.

## Precision, recall and regressions

| Metric | V1 | V2 |
| --- | --- | --- |
| Original 168 exact intent | 167/168 | 165/168 |
| Original COMPLETED intent | 51/52 | 51/52 |
| Original completed candidate coverage | 51/52 | 46/52 |
| Required positive intent | not previously separate | 8/8 |
| Required positive candidate coverage | not previously separate | 6/8 |
| Core intent | 32/32 | 32/32 |
| Old holdout intent | 29/30 | 29/30 |
| Combinatorial intent | 100/100 | 100/100 |
| Original target extraction | 28/32 | 28/32 |
| Original action extraction | 30/32 | 30/32 |
| Core new-item usable-name + candidate | 8/12 | 7/12 |
| Lens query candidate | missing | correct |

V2 all-query intent = 47/47. Existing candidate positive controls = 4/4; two
negative/targetless controls correctly produce none. New holdout intent = 53/54;
critical errors = 0/54. All 251 intent expectations = 247/251. Clarification
91/251 = 36.25%. The all-corpus extraction totals include a repeated positive
control: target 29/33, action 30/33; use the original-32 denominators for V1 parity.

Known noncritical regressions/limits:
- `화분이 예뻐`, `정수기 필터가 비싸`: UNKNOWN -> UNCERTAIN, still no record.
- `약 먹지 않은 건 아니야`: NOT_COMPLETED instead of uncertain double negation;
  no candidate. This holdout failure was not patched away.
- `반죽 치댔어`: still UNKNOWN; original morphology coverage loss remains.
- Target/action extraction did not become more accurate; unsafe output is gated.
  Raw confirmation/fallback increases manual work and lowers usable-name coverage.
- Scope is not a full semantic domain classifier. HIGH is heuristic. Complex
  date language, nominal compounds and clause attribution need independent tests.
- Existing matching helper can truncate candidates; this PoC does not establish
  exhaustive alias/tag/duplicate-item matching or approve runtime integration.

## New safety holdout disclosure (54)

Intention (6): 커튼 달려고 했다; 텐트 접으려고 했는데; 냄비 씻을 생각이었어;
수건 삶을 예정이야; 창문 닫을 참이었어; 장갑 꿰매려고 한다.

Attempt (6): 책장 옮기려다가 못 옮겼어; 양말 빨려다가 그만뒀어;
전구 바꾸려고 했는데 실패했어; 매트 털려다 말았어; 화병 닦다가 중단했어;
자전거 고치려다 포기했어.

Near miss (5): 보일러 켤 뻔했어; 약 두 번 먹을 뻔했어; 냉장고 전원 끌 뻔했다;
서랍 비울 뻔했어; 커튼 뗄 뻔했어.

Memory (5): 가방 닦았나 모르겠어; 문 잠갔는지 기억 안 나; 화병 헹궜던가;
식탁 닦았는지 모르겠어; 시계 맞췄나.

Negation (5): 커튼 아직 못 달았어; 장갑 안 꿰맸어; 화병 헹구지 않았어;
텐트 접지 못했어; 커피콩 안 볶았어.

Future (5): 내일 가방 닦을 거야; 모레 매트 털어야 해; 다음 주에 소파 옮길 거야;
나중에 전구 바꾸겠어; 내일 수건 삶았어.

Query (5): 가방 언제 닦았지; 커튼 마지막으로 언제 달았어; 매트 언제 털었더라;
텐트 접은 게 언제야; 시계 언제 맞췄어.

Completed (7): 가방 닦았어; 어제 매트 털었어; 책장 옮겼어; 수건 다 삶았어;
커튼 달았어; 전구 바꿨어; 소포 부쳤어.

Ambiguity (4): 문 열었다고 들었어; 친구가 식탁 닦았어; 가방 닦은 줄 알았어;
약 먹지 않은 건 아니야.

Compound/spacing (6): 에어컨필터 청소 언제 했어; 에어컨 필터 청소 언제 했어;
신발세탁 언제 했어; 신발 세탁 언제 했어; 정수기필터 교체 언제 했어;
정수기 필터 교체 언제 했어.

## Date and multi-action

Context 2026-09-17: 오늘/어제/그저께/3일 전 retain 17/16/15/14, exact explicit
dates. 지난주 remains approximate + DATE clarification. 내일 완료형 is now
PLANNED/no candidate instead of a completed future assertion. Exact context uses
existing Asia/Seoul helper. Tested 2/5 actions preserved, 6 returns overflow and
zero segments. Complex conjunction/date scopes are not claimed fully solved.
No save or partial-save operation exists in the lab.

## Performance and complexity

Same desktop host, not mobile benchmarks:

| Measurement | V1 | V2 |
| --- | --- | --- |
| Browser observed first init | 134.1ms | 179.1ms |
| Browser 100-case mean / max | 2.615 / 43.1ms | 1.769 / 13.3ms |
| Browser 100-case processing sum | 261.5ms | 176.9ms |
| Node observed init | 104.7ms | 120.1ms |
| Node mean parse | 0.91ms | 0.995ms |
| Node combinatorial parse sum | 57.1ms | 68.55ms |
| Model + WASM | 1,657,734 bytes | unchanged |
| Aggregate .next/static | 30,117,064 bytes | 30,121,826 bytes |

Static delta +4,762 bytes (aggregate, not a rigorous route-specific JS transfer
diff). Cache/scheduling differ between runs: do not claim V2 is intrinsically
faster from one browser sample. No observed seconds-long regression. No new npm
dependency or model. No WebGPU needed. Loaded-session offline parsing and LOW
fallback verified; offline reload/install remains unimplemented.
The cited Node timing sample is preserved in `output/rule-parser-v2/measured-results.json`;
subsequent identical-rule assertion reruns can have different timings.

Rule accounting counts named families, not regex alternatives: 13 signal checks
total, six newly explicit families (intention, prospective nominal, near-miss,
deliberation, subject, asserted ending), seven retained/expanded checks. One
generic noun+하다 normalization and one whitespace comparison policy. Zero new
synonym entries. Seven safety boundaries: stronger intent signals, three-axis
HIGH requirement, predicate-chain conflict, residual target conflict, date gate,
dual-axis candidate compatibility, no automatic ID/write. New production-independent
rule/matching implementation is 125 lines across three files. Complexity is still
small but grammar interactions and confidence calibration are maintenance risks.

## Runtime/build QA

Actual browser entered plan, water fallback, lens query, washing completion,
replacement query conflict, filter-cleaning conflict and targetless query. Results
are in browser-controls.log. Browser 100-case batch, network-disabled parse and
360/390/430 overflow checks passed. Browser console observed 0 errors/warnings.
No remote AI requests; initialization only loads same-origin WASM/model/chunks.

`npm run typecheck`, `npm run lint`, `npm run build`: PASS.
`npm audit`: 0 reported vulnerabilities. V2 harness invariants: PASS; critical
gate returns MANUAL_DEVICE_REQUIRED, not physical-device PASS. Evaluation writes
the report and exits nonzero if critical/matching gate fails. Existing cycle,
month and local-AI harness smoke: PASS. Node Garu init deprecation and existing
cycle module-type warning remain visible, not reported as eliminated.

Product six routes and all 24 fixtures return HTTP200. Mock completion/query/
negative/new-action API probes retain expected mode and candidate behavior.
This is bounded route/API/domain regression evidence, not a full physical replay
of R1-R8. No Product source changed. No commit, push or deployment performed.
Fresh HOME browser context rendered successfully and requested no Garu/model/lab assets.

## Manual gate (created after automated safety pass)

All statuses: **MANUAL DEVICE REQUIRED**.
- iPhone 16 Pro Safari
- iPhone 16 Pro Chrome
- Galaxy Z Flip3 Chrome
- Galaxy Z Flip3 Samsung Internet

For each, record OS/browser and HTTPS origin; fresh/repeat load; typing/edit/reparse;
plan/near-miss/negative/query/positive utterances; raw fallback; correct lens
candidate; conflict no-match; 100 repeats; memory/tab stability, heat and latency;
network disabled after load; back/reload behavior. For voice, obtain a transcript
using the existing separately preserved voice flow and manually enter it in the
lab. There is no automatic Product voice-to-V2 connection yet. Neither browser
simulation nor user verification of earlier Product versions satisfies this gate.

Do not enable Product integration from these tests alone. First obtain real-device
evidence and independent safety utterances; any new critical failure blocks adoption.

## Changed files

Added: lib/rule-parser/{engine-v2,safety-v2,matching-v2,evaluation-v2}.ts;
scripts/rule-parser-v2-eval.mjs; docs/RULE_PARSER_V2.md; output/rule-parser-v2/*.
Modified: lib/rule-parser/matching.ts (export existing equivalence only),
lib/rule-parser/worker.ts (lab V2 composition),
components/rule-parser/RuleParserLab.tsx (V2 label).
V1 engine/evaluation/results and all previous work retained.

Final: **RULE PARSER V2 VIABLE WITH LIMITATIONS** for continued isolated validation.
