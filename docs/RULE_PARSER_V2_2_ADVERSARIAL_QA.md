# V2.2 Independent Acceptance Tests

Date: 2026-09-17

Verdict: **BLOCKED for release/provider promotion**. This follow-up supersedes the earlier V2.2 READY recommendation, not its recorded test results. No parser, Product, environment or deployment changes were made here.

## Criteria Defined Before Execution

1. A clear first-person completed assertion may produce a confirmation candidate, never automatic save.
2. Questions, negative statements, plans, guesses and reported third-party actions must not become self-record candidates.
3. If an explicit relative date cannot be resolved, ask for clarification rather than silently using today.
4. Actions with incompatible semantics must not be matched to existing items merely by noun similarity.
5. Mixed completed/negative clauses retain independent meanings; an explicitly completed first clause must not be lost.
6. Original text is preserved and more than five actions cannot produce partial results.

54 new cases across nine groups (six each): clear completion, negative, uncertain, planned/nonassertion, dates, third-person/reported, multi-action, action compatibility, Query. Expectations are hand-authored and the parser receives none of the expected answers.

## Actual Results

- 49 passed / 54 total; 5 failures. This is a targeted sample pass rate, not general language accuracy.
- Unsafe confirmation candidates: 2 cases.
- Incorrect candidate dates: 1 case; also target/name contamination in that case.
- Forbidden item matches: 0 in six explicit action-compatibility probes.
- Demo fixture data unchanged. No save CTA was clicked during browser reproduction.

| Priority | Input | Actual | Expected |
| --- | --- | --- | --- |
| P1 / release blocker | 나 아마 화분에 물 줬어 | COMPLETED, candidate=true; Confirmation | Uncertainty/clarification, no candidate |
| P1 / release blocker | 정수기 필터 갈았을 수도 있어 | COMPLETED, candidate=true; Confirmation | Possibility is not asserted completion; no candidate |
| P1 / release blocker | 나는 이틀 전에 화분에 물 줬어 | Today 2026-09-17; item name 이틀 화분 물 주기; candidate=true | 2026-09-15 and 화분 target, or date clarification |
| P2 | 오늘 화분물안줬어 | UNKNOWN, no candidate | NOT_COMPLETED; safety retained but interpretation fails |
| P2 | 나 화분에 물 줬고 신발은 안 빨았어 | First UNKNOWN, second NOT_COMPLETED; both non-candidates | First COMPLETED, second NOT_COMPLETED |

All five reproduced in actual Chromium Product UI at http://127.0.0.1:3104/record using the real Worker and POST validation path. The mixed case additionally shows an inaccurate existing message saying record and query are mixed even though no QUERY exists.

These are false-completion **candidate** failures, not observed automatic writes. Confirmation-first remains present, but does not excuse the interpretation failure.

## Code Evidence

- `lib/rule-parser/safety-v2.ts:14`: uncertainty signals do not cover 아마 or -(으)ㄹ 수도 있다. Past tense plus an asserted ending can then reach the completed branch in `engine-v2.ts:42`.
- `lib/rule-parser/engine.ts:17`: relative day offset recognizes numeric N일 전 but not 이틀 전에; the fallback offset is zero. `utterance.ts` also lacks this prefix family, so the noun may enter the target.
- The unspaced negative fails morphology and is conservatively UNKNOWN; unlike the first three cases, no confirmation candidate is emitted.
- `engine-v2.ts:42-43`: the first coordinated clause lacks a final EF assertion and cannot inherit completed status from a negative final clause, despite its own past tense.
- `components/app/UnifiedComposer.tsx:142`: any mixed intent set uses the record/query message. Not changed in this test-only task.

## Reproduction and Scope

- Run `node scripts/rule-parser-v22-adversarial.mjs`: deliberately exits 1 while defects remain.
- Full output: `output/rule-parser-v22/adversarial.json`.
- Browser evidence: `output/rule-parser-v22/adversarial-browser.log`.
- Added only the independent test runner and this report, plus a follow-up note in the previous report. Ground truth was not weakened and the parser was not patched to these sentences.
- `npm run typecheck`, `npm run lint`, `git diff --check`: PASS. They do not override the failing behavioral gate. Build was not rerun because this task changed only tests and reports.
- No physical microphone test, save, commit, push, Vercel deployment or Production switch in this task.

Recommended next correction: general uncertainty signals and unresolved-relative-date protection first, followed by unspaced negative and mixed-clause recall. Keep these failing tests unchanged while implementing grammar-family corrections; do not patch only these exact sentences.
