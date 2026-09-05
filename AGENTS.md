# AGENTS.md — LASTLY Codex Implementation Rules

이 파일은 Codex 및 기타 Coding Agent가 LASTLY Repository에서 작업할 때 따라야 하는 최상위 구현 지침이다.

## 1. Project Identity

- Service: LASTLY
- Project/Team: 언제했조
- Product: AI 생활주기 기억 웹앱
- Current Gate: G1 PASS
- Current Track: DEMO TRACK
- D1: PASS
- D1.2: PASS — Minimal Mint Line UI Final Revision
- Current Task: D3 — Real Voice Input Demo
- Current State: Specification Freeze 완료 / PHASE 1 UI Prototype 완료 / D1.2 Minimal Mint Line UI 완료 / D2 Foundation PASS / D2 Mock Demo PASS / Real AI Live Verification BLOCKED / D3 PARTIAL / PHASE 2 구현 전

핵심 문장:

> 캘린더는 앞으로 할 일을 기억합니다. LASTLY는 마지막으로 한 일을 기억합니다.

Core Loop:

```text
기록 → 기억 → 관리 → 알림 → 재기록
```

## 2. Source of Truth

Codex는 구현 전에 `/docs` 문서를 확인해야 한다.

우선순위:

```text
00 G0 Freeze / Cross-document Audit
↓
01 PRD
↓
02 Business Rules
↓
05 AI Parser / 06 DB / 07 API
↓
03 User Flow / 04 UI UX
↓
08 Validation / 09 QA
↓
10 Execution / 11 Deployment
↓
12 Registration / Description
```

문서 충돌이 보이면 임의 해석하지 않는다.

1. 작업을 중단한다.
2. 충돌 지점을 명확히 기록한다.
3. 사용자 Review를 요청한다.
4. 승인 없이 Requirement를 변경하지 않는다.

## 3. Absolute Rules

다음 규칙은 임의 변경 금지다.

1. Core MUST 25를 임의 축소하지 않는다.
2. SHOULD를 Core MUST로 확대하지 않는다.
3. AI 결과를 자동 저장하지 않는다.
4. False Completion 방지 규칙을 우회하지 않는다.
5. Parser가 기존 Management Item ID를 직접 선택하게 만들지 않는다.
6. Activity History를 Last Date 하나로 대체하지 않는다.
7. Browser direct DB write로 Server Business Rule을 우회하지 않는다.
8. Cross-user 접근을 허용하지 않는다.
9. 미래 completed Activity를 저장하지 않는다.
10. Multi-record 저장은 Atomic이어야 한다.
11. 6개 이상 Semantic Action을 부분 처리하지 않는다.
12. Test 실패를 숨기기 위해 Test를 삭제하지 않는다.
13. Validation Ground Truth를 Test 통과 목적으로 바꾸지 않는다.
14. Security/RLS를 편의를 위해 비활성화하지 않는다.
15. 예상하지 않은 Dependency 추가는 Review 대상이다.
16. 예상하지 않은 Schema/Migration 변경은 Review 대상이다.
17. Secret을 Client Bundle에 노출하지 않는다.
18. Mock 기능을 실제 구현된 기능처럼 표시하지 않는다.
19. 한 번에 전체 앱을 구현하지 않는다.
20. Phase와 Task 단위로 구현한다.

## 4. MVP Core MUST 25

1. 자연어 Text Input
2. Voice Input
3. Voice → Text
4. Intent Classification
5. Action Extraction
6. Date Extraction
7. AI Result Confirmation
8. AI Result Editing
9. Persistent Record Save
10. Existing Item Matching
11. New Item Creation
12. Last Performed Display
13. All Management Page
14. Per-item History
15. Record Edit/Delete
16. User-set Cycle
17. Next Due Calculation
18. Status Calculation
19. Dashboard
20. Due Notification
21. 오늘 했어요 Re-record
22. Auth
23. Per-user Separation
24. Real Persistent DB
25. External Deployment

## 5. SHOULD / Non-blocking

다음은 Core Release Blocker가 아니다.

- Deleted Activity Restore
- Management Item Archive
- Archived Item Restore
- Duplicate Item Merge
- Detailed Item Notification Settings

사용자가 명시적으로 Promote하지 않은 SHOULD 기능을 Core Task에 끼워 넣지 않는다.

## 6. AI Parser Contract

Intent:

```text
COMPLETED
PLANNED
NOT_COMPLETED
UNCERTAIN
QUERY
UNKNOWN
```

Scope:

```text
IN_SCOPE
OUT_OF_SCOPE
UNCERTAIN
```

Date Precision:

```text
EXACT
APPROXIMATE
UNKNOWN
NOT_APPLICABLE
```

Date Resolution Source:

```text
EXPLICIT
IMPLICIT_TODAY
NONE
```

Clarification:

```text
COMPLETION
ACTION
DATE
SCOPE
```

`TARGET`은 Parser clarification enum이 아니다.

Parser는 기존 DB item_id를 반환하거나 선택하지 않는다.

## 7. Record Candidate Rule

Server가 Record Candidate를 계산한다.

기본 조건:

```text
intent == COMPLETED
AND scope == IN_SCOPE
AND normalized_action != null
AND date_precision == EXACT
AND resolved_date != null
AND resolved_date <= current_local_date
AND needs_clarification == false
```

AI가 임의로 Candidate 여부를 확정하는 구조를 만들지 않는다.

## 8. False Completion

다음은 Activity로 자동 저장 금지:

```text
PLANNED
NOT_COMPLETED
UNCERTAIN
QUERY
UNKNOWN
OUT_OF_SCOPE
scope UNCERTAIN
unresolved clarification
future date
```

False Completion은 Critical Release Blocker다.

## 9. Confirmation First

초기 Prototype:

```text
Parse
→ User Confirmation / Edit
→ Save
```

AI Parse만 성공했다고 Activity를 저장하지 않는다.

## 10. Parser vs Item Matching

Parser:

```text
Intent
Scope
Action
Date
Clarification
```

Item Matching:

```text
Exact Item Name
→ Exact Alias
→ Optional Fuzzy Candidate
→ None
```

복수 후보는 사용자가 선택한다.

## 11. Manual Record Flow

AI 실패 또는 사용자 거절 시 Manual Flow로 전환한다.

PLANNED / NOT_COMPLETED / QUERY / UNKNOWN / OUT_OF_SCOPE를 기존 Parse Segment에서 조용히 COMPLETED로 mutate하지 않는다.

Manual Flow에서도:

- Action
- Exact Date
- Scope
- Ownership
- Future Date
- Duplicate
- Idempotency

검증을 적용한다.

## 12. Multi-action

최대 5개 Semantic Action.

```text
1~5 → 분리 가능
>5 → TOO_MANY_ACTIONS
```

6개 이상은 partial parse/save 금지.

복수 저장:

```text
All Validate
→ DB Transaction
→ All Commit or All Rollback
```

## 13. Domain Model

### Management Item
반복 관리 대상.

### Activity Record
실제 수행 사실.

한 Item에 여러 Activity가 누적된다.

Activity History는 Source of Truth다.

`last_performed_date` 하나만 유지하는 설계를 만들지 않는다.

## 14. Snapshot Integrity

일반 Record Edit Target:

- performed_date
- 동일 User 소유 Management Item 이동

일반 Edit로 변경하지 않는 값:

- original_text
- normalized_action_snapshot
- original AI parse snapshot

## 15. Lifecycle

상태:

```text
ARCHIVED
NO_HISTORY
NO_CYCLE
NORMAL
UPCOMING
DUE
```

Priority:

```text
ARCHIVED
→ NO_HISTORY
→ NO_CYCLE
→ DUE
→ UPCOMING
→ NORMAL
```

Dashboard 포함:

```text
DUE
UPCOMING
NORMAL
```

Dashboard 제외:

```text
NO_HISTORY
NO_CYCLE
ARCHIVED
```

## 16. Cycle

Cycle은 User-defined.

```text
next_due_date = last_performed_date + cycle_days
```

AI가 건강/안전 Cycle을 권위적으로 확정하지 않는다.

Upcoming:

```text
min(5, ceil(cycle_days * 0.2))
minimum 1
```

## 17. Notification

대상:

```text
Cycle 있음
+ valid Activity 있음
+ DUE
```

Actions:

```text
오늘 했어요
다른 날 했어요
나중에 알려줘
```

Snooze:

```text
1 / 3 / 7 days
```

Snooze는 Activity를 만들지 않는다.

## 18. Device Notification Model

Notification permission/subscription은 Device/Browser 단위다.

UI 의미:

```text
이 기기에서 알림 받기
```

가짜 global service boolean을 만들지 않는다.

## 19. Stale Notification

Push Payload를 Source of Truth로 사용하지 않는다.

Notification click:

```text
fetch current item state
→ recompute/check lifecycle
→ determine available action
```

## 20. Data Architecture

Canonical Tables:

```text
profiles
management_items
activity_records
item_aliases
notification_settings
ai_parse_logs
ai_parse_segments
push_subscriptions
notification_deliveries
```

Supabase/PostgreSQL + Auth + RLS 기준.

## 21. Canonical Write Path

Core write는 Application API/BFF가 담당한다.

Production browser authenticated client가 직접 Core Table write를 하지 못해야 한다.

`DB-HARDEN-001`을 유지한다.

Service Role은 Server-only다.

## 22. Per-user Isolation

모든 Personal Resource는 하나의 User에 귀속된다.

반드시 2-user test를 한다.

User A는 User B의 다음 Resource를 읽거나 수정할 수 없어야 한다.

- Management Item
- Activity
- Cycle
- Alias
- AI Log
- Push Subscription
- Notification Delivery

## 23. Date / Timezone

초기 User Timezone은 Asia/Seoul 기준.

완료 Activity의 미래 performed_date 금지.

Protection Layer:

```text
UI
API
DB
```

상대 날짜 계산은 서버가 전달한 current local date/timezone을 기준으로 한다.

## 24. Duplicate / Idempotency

Same Item + Same Date는 hard unique 금지.

사용자 경고 후 의도적 중복 Activity 추가 가능.

Retry 중복 방지:

- Idempotency-Key
- source_parse_segment_id
- delivery idempotency

## 25. API Scope

Canonical:

```text
MUST 21
SHOULD 6
TOTAL 27
```

Release Gate는 MUST 21/21.

SHOULD 6을 Release Blocker로 만들지 않는다.

## 26. Error Principles

- DB success 전 Success UI 금지
- Network failure 시 사용자 입력 가능한 범위에서 보존
- AI failure 시 Manual fallback
- STT failure 시 Text fallback
- Session expiry 시 private write 차단
- Raw DB/Stack/Secret 사용자 노출 금지

## 27. Security

금지:

- Service Role client exposure
- AI/STT provider secret client exposure
- Web Push private key client exposure
- RLS off as workaround
- browser direct core write
- raw SQL/DB error exposure

## 28. Development Phases

```text
PHASE 0 Documents Freeze
PHASE 1 UI Prototype
PHASE 2 Auth + Database
PHASE 3 Natural-language AI
PHASE 4 Voice / STT
PHASE 5 Management / History / Edit
PHASE 6 Lifecycle / Cycle / Dashboard
PHASE 7 Notification / Re-record
PHASE 8 QA / User Test
PHASE 9 Deployment / Final Verification
```

현재는 G1 PASS 이후 사용자 요구에 따라 **DEMO TRACK**을 먼저 진행하고, DEMO TRACK 완료 후 기존 PHASE 2로 복귀한다.

## 29. Phase Discipline

현재 Phase 밖 기능을 선행 구현하지 않는다.

특히 PHASE 1에서는:

허용:
- App Scaffold
- Mobile-first UI
- Navigation
- Components
- Fixture/Dummy state
- Screen transitions

금지:
- 실제 Supabase production write
- 실제 AI Provider 구현
- 실제 STT Provider 구현
- 실제 Push Production 구현
- Phase 2+ 구조를 임의 확정

## 30. Task Discipline

각 Task는 다음 흐름을 따른다.

```text
1. Relevant docs read
2. Scope summarize
3. Files expected to change
4. Implement
5. Run tests
6. Run typecheck
7. Run lint
8. Review diff
9. Report changed files
10. Report unresolved issues
```

가능하면 하나의 Task는 하나의 명확한 목적만 갖는다.

## 31. Before Coding

각 Task 시작 전에 Codex는 다음을 확인한다.

- 현재 Phase
- 관련 MUST
- 관련 Business Rules
- 관련 Screen/Flow
- 관련 API/DB Contract
- Non-goal
- SHOULD 여부
- Security Impact
- Test Requirement

## 32. After Coding

완료 보고에는 최소 다음을 포함한다.

```text
Task:
Status:
Files changed:
What implemented:
Tests run:
Typecheck:
Lint:
Known issues:
Docs conflict:
Next recommended task:
```

PASS하지 않은 Test를 PASS라고 쓰지 않는다.

## 33. Test Rules

Test가 실패하면:

1. 원인을 분석한다.
2. Product Rule을 임의로 변경하지 않는다.
3. Test를 삭제하지 않는다.
4. Assertion을 약화해 숨기지 않는다.
5. Fixture를 실제 요구사항과 다르게 바꾸지 않는다.

AI Validation Dataset Ground Truth는 특히 임의 수정 금지.

## 34. Runtime Claims

다음은 Evidence 없이는 사용 금지:

- Production Ready
- AI Validation PASS
- AI100 PASS
- QA230 PASS
- RLS Verified
- Push Verified
- External Golden Path PASS
- G9 PASS

현재는 G0 Specification Freeze와 G1 UI Prototype Acceptance만 PASS다.

## 35. Repository Layout

권장:

```text
/docs
/app
/components
/lib
/server
/supabase/migrations
/tests
AGENTS.md
README.md
.env.example
```

Framework 생성 후 구조가 조금 달라질 수 있지만 책임 분리는 유지한다.

## 36. Dependency Policy

새 Dependency 추가 전:

- 왜 필요한지
- 기존 기능으로 대체 가능한지
- Bundle/Runtime 영향
- Security/Maintenance 영향

을 확인한다.

불필요한 UI/State/AI Library를 추가하지 않는다.

## 37. Code Quality

- TypeScript strict-friendly
- 명확한 타입
- business rule을 UI component 내부에 흩뿌리지 않음
- lifecycle/date/item matching은 테스트 가능한 순수 로직 우선
- server/client boundary 명확히
- secret server-only
- magic number 최소화
- status/intent/scope 문자열 하드코딩 중복 최소화

## 38. UI Principles

- Mobile-first
- 360 / 390 / 430px 우선 확인
- 주요 touch target 약 44px 이상
- status를 색만으로 전달하지 않음
- loading/error/empty/disabled state 명시
- Success는 실제 server success 후 표시
- Fixture UI는 mock임을 개발 단계에서 명확히 구분

## 39. No-Go Conditions

다음이 발견되면 Release 금지:

- False Completion
- Cross-user Read/Write
- Activity History Loss
- Future Completed Record 저장
- Partial Multi-save
- Success-before-DB
- Browser Direct Core Write
- Client Secret Exposure
- Wrong-user Notification
- External Golden Path Failure
- S0 defect
- S1 open defect

## 40. Current Next Task

현재 진행 상태:

```text
PHASE 1
TASK 1 = PASS
TASK 2 = PASS
TASK 3 = PASS
TASK 3.1 = PASS
TASK 3.2 = PASS
TASK 3.3 = PASS
TASK 4 = PASS
G1 = PASS
PHASE 1 = COMPLETE
Current Track = DEMO TRACK
D1 = PASS
D1.2 = PASS — Minimal Mint Line UI Final Revision
Current UI = Minimal Mint Line UI
Current Task = D3 — Real Voice Input Demo
After Demo Track = PHASE 2 / TASK 1 — Supabase Foundation & Auth Setup
PHASE 2 implementation = NOT STARTED
Auth/DB = NOT STARTED
D2 Foundation = PASS
D2 Mock Demo = PASS
Real AI Live Verification = BLOCKED
D2 Full PASS = NOT YET
Real AI = MOCK DEMO READY / LIVE BLOCKED
Browser Voice Demo = IMPLEMENTED / MICROPHONE MANUAL VERIFICATION REQUIRED
D3 = PARTIAL
External STT = NOT IMPLEMENTED
Real STT = NOT STARTED
Real Push = NOT STARTED
```

아직 전체 Product 구현을 시작하지 않는다.

관련 문서:
- 00
- 02
- 01
- 03
- 04
- 10

DEMO TRACK 완료 전 PHASE 2 Backend/Auth/DB 구현으로 넘어가지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
