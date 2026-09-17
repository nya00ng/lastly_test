# Rule Parser V2.1 Product Blocker Fix Gate

Date: 2026-09-17

Final verdict: **PASS for the six-fix local Product gate**.
Production remains mock. No deployment, production switch, dependency, DB schema, microphone implementation or visual redesign was performed.
This report supersedes the six open findings from the local code review, not the separate Preview/device deployment requirements.

## Root Causes and Corrections

| Finding | Cause | Correction |
| --- | --- | --- |
| Explicit/future date | Rule date extraction recognized relative dates only, so absolute dates fell through to today | Korean absolute dates and ISO dates take precedence; invalid/future completion requires date clarification |
| History/latest/cycle | Derivation used the newly appended date rather than the maximum History date | Pure History derivation sorts all entries, takes the latest date, then computes lifecycle/nextDue; same-date ties use stable entry IDs |
| Duplicate names | Save and Query selected the first item with a matching display name | Matching candidates carry itemId; Confirmation and Query retain that identity; save never resolves identity by name |
| Tag Query | Target equality removed tagged items before matching tiers | Exact tag target is admitted only with compatible action semantics; existing tier ordering retained |
| Invalid calendar date | Regex checked shape only | Shared date-only calendar validation reused by candidate calculation, edited date guard and Store transaction |
| Edited action/stale match | Editing action retained old candidates/selection | Edit rematches, clears selection/tags, removes incompatible candidates; Store independently checks latest selected item's compatibility before committing |

## Changed Files

- `lib/ai/date.ts`: reuse calendar validation from `cycle.ts`.
- `lib/rule-parser/engine.ts`: explicit date resolution and invalid-date clarification. No intent/verb synonym expansion.
- `lib/ai/types.ts`: optional itemId on matching enrichment, not ParserSegment.
- `lib/ai/demo-matching.ts`: IDs on candidates and preservation of duplicate exact-name candidates.
- `lib/rule-parser/matching-v21.ts`: tag-aware target eligibility, action guard retained, IDs on candidates.
- `lib/rule-parser/product-pipeline.ts`: IDs on exact nominal-name fallback candidates.
- `lib/demo-query.ts`: ID-based resolution, ambiguity whenever multiple candidates exist, rejection of unknown selected IDs.
- `lib/confirmation-matching.ts`: matching/compatibility for edited confirmation labels using existing contextual groups; no client intent classifier.
- `lib/demo-activity.ts`: pure atomic write validation, ID lookup, History-based lifecycle derivation.
- `components/app/DemoActivityProvider.tsx`: delegates transaction to the tested helper and commits against the latest session snapshot.
- `components/app/UnifiedComposer.tsx`: ID-backed selection, duplicate-name labels, edit rematching, date-source update, visible save rejection.
- `scripts/product-integrity-smoke.mjs`: additional A-H tests, without modifying previous ground truth.
- This report and runtime evidence under `output/rule-pilot/gate-*`.

Pre-existing uncommitted Pilot/Lab/package changes were preserved. This task did not add dependencies or modify the package files.

## Date and History

- `2026년 8월 1일 신발 빨았어`: EXACT / EXPLICIT / 2026-08-01; no implicit-today hint.
- `2099년 1월 1일 신발 빨았어`: no candidate; date clarification.
- `2026-02-30 신발 빨았어`: no candidate; date clarification.
- Calendar matrix: 2026-02-28 valid; 2026-02-29 invalid; 2028-02-29 valid; 2026-02-30 invalid; 2026-04-31 invalid.
- Edited dates are checked again in UI and the Store transaction; edits set the draft source to EXPLICIT, preserving the original parse segment.
- Out-of-order A/B/C/D tests pass. Latest 08-20 stays 08-20 when 08-01 is added; adding 08-20 to 08-01 advances latest; same-day entries remain allowed/deterministic; unsorted History uses its maximum date.
- Thirty-day cycle anchored to 08-20 produces 09-19 / UPCOMING on 09-17, including after older entries are appended.

## Identity and Matching

Parser output still does not select/return Item IDs. Matching enrichment attaches candidate IDs; the user's Confirmation choice controls the destination. History is nested under the selected item's ID in the existing Demo model.

New-item selection is explicit null identity and creates a separate item, not an implicit name-based merge. Existing-item writes require a live ID and compatible current action. Duplicate names are displayed with ordinal suffixes; both Query and Confirmation retain distinct values.

`아빠 이불 언제 빨았어` returns QUERY / EXACT_TAG / bedding; mutation remains zero.
`아빠 이불 교체 언제 했어` does not select the laundry item.
Exact name/alias precede tags, then Note, contextual semantic matching and existing fuzzy fallback where applicable. No new target/action synonym groups were added.

Editing `신발 세탁` to `신발 교체` removes the laundry candidate. Existing candidate selection must be reconfirmed after an edit; no match can be saved as an explicit new item. The Store rechecks action compatibility itself, including calls that bypass the UI draft state. Stale/deleted IDs, invalid/future dates and invalid batch members reject the whole transaction.

## Browser Reproduction

Real local Chromium with a fresh production build, `AI_PROVIDER=rule-v21`, port 3103. These are real Product UI interactions, not mocked parse responses.

| Scenario | Result / evidence |
| --- | --- |
| 1. Explicit past date | PASS; date 08-01, implicit hint count 0 (`gate-past-history.log`) |
| 2. Explicit future completed | PASS; blocked, save CTA count 0 (`gate-date-tag.log`) |
| 3. Invalid calendar date | PASS; blocked, save CTA count 0 (`gate-date-tag.log`) |
| 4. Add 08-01 to item with 08-20 | PASS; History includes both, last remains 08-20; cycle remains 09-19 / D-2 (`gate-cycle-after.log`) |
| 5. Same name, choose second item | PASS; B History increases to 2, A remains 3; Query first asks which item and choosing B returns B's date (`gate-duplicate-query.log`, `gate-duplicate-save.log`) |
| 6. Father bedding query | PASS; existing bedding record found, save CTA count 0 (`gate-date-tag.log`) |
| 7. Edit laundry to replacement | PASS; laundry option removed, separate replacement item created after explicit save (`gate-edit.log`) |

Date editing: future/empty disabled, valid past enabled, implicit hint removed after edit.
Confirmation at 360/390/430: horizontal overflow false; screenshots recorded. Console errors/warnings: 0 in this session.
No physical microphone/device verification is claimed in this task.

## Tests and Regression

- `node scripts/product-integrity-smoke.mjs`: PASS, A-H plus atomic rejection/deleted ID/date source shape.
- `node scripts/rule-pilot-smoke.mjs`: PASS, existing Pilot/new-item/contextual/query/2-5-6 action tests.
- `node scripts/rule-parser-v21-eval.mjs`: PASS; 369 entries; critical false completion, Query-to-Record, Negative-to-Completed, Planned-to-Completed, Uncertain-to-Completed all 0; contextual knife/coffee/dishes conflicts 0.
- Legacy intent accuracy remains 247/251, targeted 18/18, unseen 100/100. This is not a claim of perfect overall parser accuracy.
- `node scripts/cycle-smoke.mjs`: PASS.
- `node scripts/month-view-smoke.mjs`: PASS.
- `node scripts/rule-parser-product-smoke.mjs`: PASS; six Product routes, 24 fixtures, four Mock API probes.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; rebuilt servers restarted before UI QA.
- `git diff --check`: PASS; existing CRLF notices only.

The V2.1 hash changed due to the approved matching correction; ground truth and intent/contextual synonym rules were not changed. Evaluator logs retain the existing Garu initialization and Node module-type warnings.

## Remaining Limits

- Demo data remains session-only; no persistence/auth/backend added.
- V2.1's other conservative clarification limitations remain out of scope.
- Preview authorization and actual iPhone/Android Product voice QA remain separate pending work.
- Production default is still mock; this PASS does not authorize a production parser switch.

Test URLs on this computer: rule-v21 `http://127.0.0.1:3103/`, mock `http://127.0.0.1:3102/`.
