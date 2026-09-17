# Rule Parser V2.3 - Adversarial Generalization Gate

Date: 2026-09-17. Verdict: **PARTIAL**.

## Scope and implementation

Local pilot only; `AI_PROVIDER=rule-v21` selects the updated pilot pipeline.
Default mock, Production settings, public Preview deployments, SpeechRecognition,
database and persistence were not changed. No new dependency was added.

Five reproduced V2.2 failures had these causes:

1. Leading speculation did not override past-tense completion evidence.
2. Modal possibility with past morphology could become a completion candidate.
3. Native relative-day expressions were not resolved before target extraction.
4. Joined negative adverbs could remain inside an unknown morphology token.
5. Coordinated clauses without a final EF ending could lose the first action.

`grammar-v23.ts` adds grammatical uncertainty signals, morphology-supported
negative boundary recovery, and coordinated clause segmentation. It does not
store verbs as aliases or add exact-sentence switch cases. Ambiguous noun
boundaries stay uncertain. Auxiliary constructions are not split blindly.

`date-v23.ts` resolves relative durations against the supplied local date,
reuses date-only/calendar-month helpers, and removes date phrases before target
extraction. Vague dates remain APPROXIMATE with DATE clarification. Calendar
month subtraction clamps month ends; invalid/future completion dates stay blocked.

`engine-v23.ts` composes these passes with V2.2. Query remains non-writing;
epistemic signals override past assertions. Negation, future dates and independent
clause intent are preserved. Shared speculation/third-person subject guards and
per-parse analyzer caching are included. More than five actions yields zero
segments. Original clause text is retained; transformed token coordinates are
not falsely advertised as original-source offsets.

## Changed files in this task

- `lib/rule-parser/date-v23.ts`: date extraction and resolution.
- `lib/rule-parser/grammar-v23.ts`: uncertainty, negation and clause grammar.
- `lib/rule-parser/engine-v23.ts`: pipeline composition and safety precedence.
- `lib/rule-parser/product-pipeline.ts`: pilot engine selection.
- `lib/rule-parser/worker.ts`: Lab engine selection.
- `components/rule-parser/RuleParserLab.tsx`: V2.3 label.
- `components/app/UnifiedComposer.tsx`: accurate mixed-intent blocking copy only.
- `scripts/rule-parser-v23-eval.mjs`: new 144-case corpus and safety assertions.
- `scripts/rule-parser-v21-eval.mjs`: optional V2.3 regression execution.
- `scripts/rule-parser-v22-adversarial.mjs`: optional V2.3 execution.
- `scripts/rule-pilot-smoke.mjs`: attached-negative expectation updated to the
  explicitly requested NOT_COMPLETED behavior, retaining candidate=false.
- This report and generated `output/rule-parser-v23/` evidence.

The repository also contains pre-existing uncommitted changes. They were not
discarded and must not all be attributed to this task.

## Tests

| Suite | Result |
|---|---|
| Original 369 corpus | 365/369 intent correct; critical failures 0; four existing misses remain |
| Original 54 adversarial cases | 54/54; all five previously failing cases corrected |
| New 144 cases, twelve categories | 143/144; evaluation exits nonzero for remaining failure |
| Product integrity A-H | PASS: date, history, ID, tags, stale confirmation, atomicity |
| Product pilot contract | PASS |
| Cycle / Month | PASS / PASS |
| Mock API | 4/4 PASS on separate mock server |
| Product routes / fixture routes | 6/6 and 24/24 HTTP 200 |
| Typecheck / lint / build | PASS / PASS / PASS |
| git diff --check | PASS; existing LF/CRLF notices only |

The new corpus is disjoint from the previous 369/100/54 sentence sets. It was
used during iterative correction, so its final score is not an untouched blind
holdout estimate. The first-run result is retained. Ground truth was not changed
to hide the remaining error.

Remaining failure: `음... 문안열었어` expects NOT_COMPLETED but returns UNCERTAIN.
Garu recognizes a plausible noun boundary at `문안`; the parser refuses to force
an internal noun split. record_candidate=false, so this is a recall/usability
failure, not a false completion. It is intentionally reported rather than patched
with an exact sentence exception.

## Metrics on the new corpus

All eight critical counters are zero: speculative/negative/planned/uncertain to
completed, query to record, wrong date, wrong existing item, action-conflict
automatic match. These are dataset-scoped observations, not universal guarantees.

- Completed usable candidates: 81/81.
- Clarification: 48/168 segments (28.6%).
- Segment recall: 168/168.
- Relative-date expectations: 12/12, including intentionally vague dates.
- Attached-negation recall: 11/12.
- Mixed-intent cases: 12/12.

## Actual Product runtime

Fresh optimized build: rule pilot at `http://127.0.0.1:3106/record`, mock at 3107.
Real Chromium UI input was submitted and final states awaited, not just loading
headings. No Save button was clicked. Browser console: 0 errors, 0 warnings.

| Input | Parser result | Final Product UI |
|---|---|---|
| 나 아마 화분에 물 줬어 | UNCERTAIN | Completion clarification, no Save |
| 정수기 필터 갈았을 수도 있어 | UNCERTAIN | Completion clarification, no Save |
| 나는 이틀 전에 화분에 물 줬어 | COMPLETED, 2026-09-15 | Confirmation with that exact date |
| 오늘 화분물안줬어 | NOT_COMPLETED | Not performed message, no Save |
| 화분에 물 줬고 신발은 안 빨았어 | COMPLETED / NOT_COMPLETED | Mixed-intent block, no partial Save |
| 나 오늘 화분 물줬어! | COMPLETED, 2026-09-17 | Confirmation |
| 필터 갈았고 렌즈는 다음주에 갈 거야 | COMPLETED / PLANNED | Mixed-intent block, no partial Save |

The other required mixed cases also pass parser assertions: medication completed
plus exercise not completed; intended laundry plus completed watering. Product
mixed-intent blocking is preserved, not replaced with partial-save functionality.

## Performance and limitations

Desktop Garu harness: initialization 117.9 ms; first parse 33.4 ms; median parse
1.49 ms; maximum 33.65 ms; 100-case batch 270.1 ms; mean multi-action 3.75 ms.
These are desktop measurements, not verified mobile latency. The dependency emits
an existing initialization deprecation warning in the Node test harness.

Physical microphone and mobile device QA were not performed in this task.
There was no deployment or Production switch. The older public Preview must not
be described as V2.3. The earlier V2.2 blocked report remains historical evidence;
its five failures now pass, but this stricter V2.3 gate remains PARTIAL because of
the outstanding attached-negation recall case and pending device verification.
