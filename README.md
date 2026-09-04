# LASTLY

> **“언제 했더라?”를 대신 기억해주는 AI 생활주기 기억 웹앱**

LASTLY는 캘린더나 일반 To-do처럼 앞으로 할 일을 관리하는 서비스가 아니라, **사용자가 실제로 마지막으로 한 생활관리 행동을 기억하고 다음 관리시점까지 연결하는 서비스**를 목표로 한다.

프로젝트 팀명은 **언제했조**, 서비스명은 **LASTLY**다.

## 현재 상태

```text
Product / Technical Specification = COMPLETE
Cross-document Audit = COMPLETE
G0 Specification Freeze = PASS
G1 UI Prototype Acceptance = PASS
PHASE 1 UI Prototype = COMPLETE
Current Track = DEMO TRACK
D1 = PASS
Current Task = D3 — Real Voice Input Demo
After Demo Track = PHASE 2 / TASK 1 — Supabase Foundation & Auth Setup
Runtime Implementation = PARTIAL DEMO TRACK ONLY
PHASE 2 Implementation = NOT STARTED
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
Runtime QA = NOT EXECUTED
External Deployment = NOT EXECUTED
```

문서가 완성되었다고 해서 실제 구현이 완료된 것은 아니다. AI, STT, Auth, Database, Notification, External Deployment는 이후 Phase에서 실제 구현해야 한다.

## 핵심 포지셔닝

> **캘린더는 앞으로 할 일을 기억합니다. LASTLY는 마지막으로 한 일을 기억합니다.**

핵심 제품 Loop:

```text
기록 → 기억 → 관리 → 알림 → 재기록
```

LASTLY는 Generic To-do, Calendar, Habit Tracker, Memo, Lifelog를 목표로 하지 않는다.

## 핵심 사용자 경험

예:

```text
사용자: 오늘 이불 빨았어
```

처리 흐름:

```text
Text 또는 Voice
↓
Voice인 경우 STT
↓
AI Parser
↓
Schema Validation
↓
Semantic Validation
↓
Item Matching
↓
User Confirmation / Editing
↓
Record API
↓
Database
↓
Lifecycle 계산
↓
Dashboard / Notification
```

AI 결과는 초기 Prototype에서 자동 저장하지 않는다.

```text
Parse → Confirm / Edit → Save
```

## AI Parser 기준

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

가장 중요한 Safety Rule은 **False Completion 방지**다.

다음은 자동 Activity 후보가 될 수 없다.

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

## Parser와 Item Matching 분리

AI Parser는 기존 DB Management Item ID를 직접 선택하지 않는다.

Parser 책임:

```text
Intent
Scope
Action
Date
Clarification
```

Item Matching 책임:

```text
Exact Item Name
→ Exact Alias
→ Optional Fuzzy Candidate
→ None
```

복수 후보라면 사용자가 직접 선택한다.

## Manual Record Flow

AI가 실패하거나 사용자가 AI 해석을 거절한 경우 별도 Manual Flow를 사용한다. 기존 Parser Segment를 조용히 `COMPLETED`로 바꾸지 않는다.

Manual Flow에서도 Action, Exact Date, Scope, Ownership, Future Date, Duplicate, Idempotency 규칙을 동일하게 적용한다.

## Multiple Action

한 입력에서 최대 5개의 Semantic Action을 처리한다.

```text
1~5개 → 각각 Segment 분리
6개 이상 → TOO_MANY_ACTIONS → 부분 처리 금지
```

복수 Record 저장은 Atomic이어야 한다.

```text
All Validate → Transaction → All Commit
```

한 건이라도 실패하면 전체 Rollback한다.

## Domain Model

### Management Item
반복 관리 대상.

예:
- 이불 세탁
- 칫솔 교체
- 에어컨 필터 청소

### Activity Record
실제 수행 사실.

Activity는 History 전체를 보존하며 Last Date 하나로 덮어쓰지 않는다.

## Lifecycle

```text
ARCHIVED
NO_HISTORY
NO_CYCLE
NORMAL
UPCOMING
DUE
```

우선순위:

```text
ARCHIVED → NO_HISTORY → NO_CYCLE → DUE → UPCOMING → NORMAL
```

Dashboard에는 `DUE / UPCOMING / NORMAL`만 포함하며 `NO_HISTORY / NO_CYCLE / ARCHIVED`는 제외한다.

## Cycle / Next Due

Cycle은 사용자가 설정한다.

```text
cycle_days = N
next_due_date = last_performed_date + cycle_days
```

Upcoming 기준:

```text
upcoming_days = min(5, ceil(cycle_days × 0.2))
minimum = 1
```

## Notification

기본 대상:

```text
Cycle 있음 + Valid Activity 있음 + DUE 상태
```

Action:

```text
오늘 했어요
다른 날 했어요
나중에 알려줘
```

Snooze:

```text
1일 / 3일 / 7일
```

Notification Permission은 Device/Browser 단위이며 UI 의미는 **“이 기기에서 알림 받기”**다.

Push Payload는 Source of Truth가 아니다. 클릭 시 Server에서 최신 Item/Lifecycle 상태를 다시 조회한다.

## MVP Core MUST 25

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

## SHOULD

Core Release Blocker가 아닌 기능:
- Deleted Activity Restore
- Management Item Archive
- Archived Item Restore
- Duplicate Item Merge
- 상세 Item Notification Settings

SHOULD 미구현만으로 Core Prototype Release를 실패로 판단하지 않는다.

## Non-goal

초기 Prototype 범위 밖:
- Generic To-do
- Calendar
- Habit Checklist
- Family Sharing
- Photo Action Recognition
- IoT
- External Calendar Integration
- Siri/Bixby Native Integration
- AI Authoritative Cycle Setting
- Personalized AI Cycle Learning
- Advanced Lifestyle Reports
- Generic AI Assistant / Agent

## 권장 기술 구조

```text
Mobile Web / PWA
↓
Next.js / React / TypeScript / Tailwind
↓
Application API / BFF
↓
Supabase Auth / PostgreSQL / RLS
```

AI와 STT는 Provider Adapter 구조를 사용한다.

```text
AIAdapter
STTAdapter
```

## Database

Canonical Table 9개:

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

Activity History가 수행 사실의 Source of Truth다.

## Security

- Supabase Auth
- RLS
- 모든 개인 데이터 User Ownership
- Cross-user Read/Write 차단
- Composite FK
- Application API/BFF가 Canonical Write Path
- Production Browser Direct Core Write 차단
- Service Role Server-only
- Secret을 Client Bundle에 포함하지 않음

### DB-HARDEN-001

Production authenticated browser가 Core Table을 직접 INSERT/UPDATE/DELETE하여 Business Rule을 우회하지 못하도록 DB Migration 자체에 Write Hardening을 포함한다.

## API 기준

```text
MUST = 21
SHOULD = 6
TOTAL = 27
```

Core Release Gate는 **MUST API 21/21**이다.

## AI Validation / QA

AI Validation Dataset:

```text
100 Ground Truth Cases
```

Release Safety Gate:

```text
False Completion = 0
Forbidden Candidate = 0
Future Candidate = 0
Intent Accuracy ≥ 98%
Scope Accuracy ≥ 97%
Deterministic Date Accuracy ≥ 98%
Normalization Accuracy ≥ 95%
```

QA Specification:

```text
230 Test Cases
P0 = Release Blocker
P1 = Required Regression
P2 = SHOULD
```

현재는 Runtime Test 미실행 상태다.

## Development Phases

```text
PHASE 0 Documents Finalization / Freeze
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

## G0

```text
G0 = PASS
```

이는 **Specification Freeze PASS**이며 Runtime 구현 PASS를 의미하지 않는다.

## 문서 목록

```text
00_LASTLY_Cross_Document_Audit_G0_FREEZE_v1.1_FINAL.md
01_LASTLY_PRD_v1.1_FINAL.md
02_LASTLY_Business_Rule_Specification_v1.1_FINAL.md
03_LASTLY_User_Flow_Specification_v1.1_FINAL.md
04_LASTLY_UI_UX_Functional_Specification_v1.1_FINAL.md
05_LASTLY_AI_Parser_Specification_v1.1_FINAL.md
06_LASTLY_Database_ERD_Supabase_Schema_Specification_v1.1_FINAL.md
07_LASTLY_API_Specification_v1.1_FINAL.md
08_LASTLY_AI_Validation_Dataset_v1.1_FINAL.md
09_LASTLY_QA_Test_Case_Specification_v1.1_FINAL.md
10_LASTLY_Solo_Development_Execution_Plan_v1.1_FINAL.md
11_LASTLY_Prototype_Deployment_Completion_Checklist_v1.1_FINAL.md
12_LASTLY_Prototype_Registration_Technical_Differentiation_v1.1_FINAL.md
```

## Repository 권장 구조

```text
LASTLY/
├─ docs/
│  ├─ 00_LASTLY_Cross_Document_Audit_G0_FREEZE_v1.1_FINAL.md
│  ├─ 01_LASTLY_PRD_v1.1_FINAL.md
│  └─ ... 12까지
├─ app/
├─ components/
├─ lib/
├─ server/
├─ supabase/
│  └─ migrations/
├─ tests/
├─ AGENTS.md
├─ README.md
└─ .env.example
```

## 다음 작업

현재 단계는 **DEMO TRACK / D3 — Real Voice Input Demo**이다. D1 Real App UI / IA Redesign은 PASS 상태다. D2 Foundation과 Mock Demo는 PASS 상태이며, 실제 Provider Live Verification은 AI API Key 설정 전까지 BLOCKED다. Browser Voice UI와 Web Speech API 연결은 구현됐지만, 실제 마이크 음성 입력 검증은 수동 확인이 필요해 D3는 PARTIAL 상태다.

DEMO TRACK 완료 후 기존 계획인 **PHASE 2 / TASK 1 — Supabase Foundation & Auth Setup**으로 복귀한다. PHASE 2 구현은 아직 시작하지 않았다. G1 PASS는 PHASE 1의 Fixture 기반 UI Prototype Acceptance PASS를 의미하며, Auth, Database, AI, STT, Push, External Deployment 완료를 의미하지 않는다.

Codex에게 처음부터 “전체 앱을 만들어”라고 하지 않는다. 작은 Task 단위로 구현하고 각 Task 완료 후 Test, Typecheck, Lint, Diff를 확인한다.

세부 요구사항은 반드시 `/docs`의 FINAL 명세서를 기준으로 한다.
