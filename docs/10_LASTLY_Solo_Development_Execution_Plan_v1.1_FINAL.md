# LASTLY Solo Development Execution Plan
## AI 생활주기 기억 웹앱
**Execution Plan v1.1 — Final Sync Baseline**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 기준 문서 | 01~09 v1.1 FINAL |
| 개발 형태 | 1인 개발 + Codex 보조 |
| Frontend 기준 | Next.js / React / TypeScript / Tailwind |
| Backend 기준 | Application API/BFF |
| DB/Auth | Supabase PostgreSQL / Supabase Auth / RLS |
| 상태 | **Development Execution Baseline / Runtime 구현 전** |

# 1. 목적
LASTLY를 혼자 개발할 때 문서→작은 구현→검증→Gate 방식으로 진행하기 위한 실행 기준이다. 한 번에 전체 앱을 생성하지 않는다.

# 2. Core 개발 원칙
1. Core MUST 25를 우선한다.
2. SHOULD는 Core Release Blocker가 아니다.
3. UI/Dummy/Mock을 실제 기능 완료로 보지 않는다.
4. Runtime Evidence 없이 Gate PASS를 선언하지 않는다.
5. Browser Direct Core Write를 허용하지 않는다.
6. Parser와 Item Matching을 분리한다.
7. Activity History를 누적 보존한다.
8. False Completion을 최우선 Safety로 둔다.
9. 사용자 확인 전 AI 결과를 저장하지 않는다.
10. 다른 사용자 데이터 접근을 허용하지 않는다.

# 3. Core MVP MUST 25
1. 자연어 Text Input
2. Voice Input
3. Voice→Text
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

# 4. SHOULD
Deleted Activity Restore, Item Archive/Restore, Duplicate Item Merge, 상세 Item Notification Settings 및 관련 편의 UI. 미구현만으로 Core 실패가 아니다.

# 5. NOT NOW
Generic To-do, Calendar, Habit Checklist, Family Sharing, Photo Recognition, IoT, External Calendar, Siri/Bixby Native Integration, AI Authoritative Cycle, Personalized AI Cycle Learning, Advanced Lifestyle Reports, Generic AI Agent.

# 6. 전체 Phase / Gate
`PHASE 0~9`, `G0~G9`를 순서대로 진행한다.

# 7. PHASE 0 — Documents Freeze
**목표/작업:** 01~12 v1.1 FINAL 생성, Cross-document Audit, Freeze
**G0 PASS:** 01~12 존재; Core MUST 25/Intent 6/Scope 3/Lifecycle 6/API MUST21·SHOULD6/NO_HISTORY/IMPLICIT_TODAY/Manual Record/DB-HARDEN-001 동기화; Critical contradiction 0

# 8. PHASE 1 — UI Prototype
**목표/작업:** 24 Screen과 핵심 Flow를 Fixture로 구현. Text/Voice UI, AI Confirmation, Clarification, Item Matching, Manual Flow, TOO_MANY_ACTIONS, NO_HISTORY/NO_CYCLE, Error/Empty 포함. 360/390/430 확인.
**G1 PASS:** 24 Screen route/state; 핵심 Flow 클릭 가능; 사용자 확인 없는 저장 UX 없음; Dummy를 실제 기능으로 표시하지 않음

# 9. PHASE 2 — Auth + Database
**목표/작업:** Supabase Auth, 9 Tables, Migration, RLS, Composite FK, Future Date Guard, Idempotency, Lifecycle View, DB-HARDEN-001. Core Write는 Frontend→Application API/BFF→DB.
**G2 PASS:** Auth Runtime; 9 Tables; User A/B Isolation; Browser Direct Core Write 차단; Refresh/Relogin Persistence; Future Date 차단; Lifecycle View

# 10. PHASE 3 — Text AI
**목표/작업:** 실제 AI Provider Adapter, Schema 1.0, Semantic Validation, Intent 6, Scope 3, Clarification 4, IMPLICIT_TODAY, Parser↔Item Matching 분리, Confirmation, Manual Record, Multi-action Atomic Save.
**G3 PASS:** AI100 Runtime Safety Gate; False Completion 0; Item Matching 분리; 6개 초과 TOO_MANY_ACTIONS no-partial

# 11. PHASE 4 — Voice / STT
**목표/작업:** Mic→실제 STT→Transcript→사용자 수정→AI Parser. STT Adapter와 Text Fallback.
**G4 PASS:** 실제 Mic/STT; Transcript 표시·수정; 권한 거부/실패 fallback; Voice Golden Path DB Save; NOT_COMPLETED/QUERY Safety

# 12. PHASE 5 — Management / History / Edit
**목표/작업:** All Management, Detail, History, Record performed_date/item_id Edit, Soft Delete, Duplicate Warning, Snapshot 불변. 유일 Activity 삭제 시 NO_HISTORY.
**G5 PASS:** History 누적; Edit/Move/Delete; NO_HISTORY 전환; Duplicate; Persistence. Restore/Archive/Merge 미구현만으로 실패하지 않음

# 13. PHASE 6 — Lifecycle / Cycle / Dashboard
**목표/작업:** User cycle_days, next_due=last+cycle, upcoming=min(5,ceil(cycle*0.2)) min1, 상태 우선순위 ARCHIVED→NO_HISTORY→NO_CYCLE→DUE→UPCOMING→NORMAL.
**G6 PASS:** 6 Lifecycle 상태; Dashboard는 DUE/UPCOMING/NORMAL만; 정렬; Early/Late completion rebase; NO_HISTORY 정확

# 14. PHASE 7 — Notification / Re-record
**목표/작업:** 맥락 기반 Device Permission, Push Subscription, Reconcile/Dispatch, Landing 최신 조회, Stale 처리, 오늘 했어요/다른 날 했어요, Snooze 1/3/7, old delivery 무효화.
**G7 PASS:** 실제 Push; Device 의미; Stale re-fetch; Re-record History 유지; Snooze Activity 0; Double-tap idempotency; Wrong-user 차단

# 15. PHASE 8 — QA / User Test
**목표/작업:** 08 AI100과 09 QA를 실제 구현에 실행. P0 Release Blocker, P1 Regression, P2 SHOULD.
**G8 PASS:** P0 Runtime 100%; S0=0; S1 open=0; AI Safety; MUST API 21/21; 2-user Isolation; Persistence; Voice; Notification Loop

# 16. PHASE 9 — Deployment / Final Verification
**목표/작업:** HTTPS 외부 URL, Production Secret, Migration, Worker, Backup/Rollback, External Smoke/Security Smoke.
**G9 PASS:** Core MUST 25 실제 동작; External Text/Voice/Save/Refresh/Relogin/Dashboard/Push/Re-record; Critical Security Defect 0; Rollback Path

# 17. 현재 G0 상태
01~12 v1.1 FINAL 문서와 Cross-document Audit가 완료되어 G0는 PASS 상태다. PHASE 1 UI Prototype Acceptance Review가 완료되어 G1도 PASS 상태다. 사용자 요구에 따라 기존 PHASE 2 진입 전 별도 DEMO TRACK을 먼저 진행한다. 현재 기준 상태는 Specification Freeze 완료 / PHASE 1 완료 / DEMO TRACK 진행 중 / PHASE 2 구현 전이며, D1 — Real App UI / IA Redesign은 PASS 상태이고 현재 Task는 D3 — Real Voice Input Demo이다. D2 Foundation과 Mock Demo는 PASS 상태이며, 실제 Provider Live Verification은 AI API Key 설정 전까지 BLOCKED다. Browser Voice UI와 Web Speech API 연결은 구현됐지만, 실제 마이크 음성 입력 검증은 수동 확인이 필요해 D3는 PARTIAL 상태다. DEMO TRACK 완료 후 기존 진행 순서인 PHASE 2 / TASK 1 — Supabase Foundation & Auth Setup으로 복귀한다. PHASE 2 Auth, Database, STT, Push Runtime 구현은 아직 시작하지 않았다.

# 18. 문서 우선순위
Product Scope=PRD, Business Meaning=BRS, Flow=UFS, Screen Behavior=UI/UX FS, AI=Parser, Persistence/Security=DB, Transport=API, AI Ground Truth=08, Release Verification=09, Execution Order=10, Release Operation=11, External Description=12. 충돌 시 임의 구현하지 않는다.

# 19. Codex Handoff
본격 구현은 G0 PASS 이후. Repository에 `/docs/01~12`, `AGENTS.md`, `README.md`, `.env.example`을 둔다.

# 20. Repository 권장 구조
`app/`, `components/`, `lib/`, `server/`, `supabase/migrations/`, `tests/`, `docs/`, `AGENTS.md`, `README.md`, `.env.example`.

# 21. AGENTS.md 필수 규칙
문서 우선순위, Core 25, SHOULD 비차단, Browser Direct Core Write 금지, Parser/Item Matching 분리, History 보존, False Completion 금지, Migration/Secret/Test 규칙.

# 22. Codex Task 크기
한 Task=하나의 검증 가능한 목표. 예: `POST /records 구현`은 적절하지만 `LASTLY 전체 앱 완성`은 금지.

# 23. Codex Task Template
`Goal / Reference docs / Allowed files / Forbidden changes / Acceptance criteria / Tests to run / Expected output`을 사용한다.

# 24. Git 전략
Solo Prototype은 `main`, `feature/<small-task>`, `fix/<issue>` 정도로 단순화한다. 한 Commit에 가능한 한 하나의 논리 변경.

# 25. 환경
LOCAL / PREVIEW 또는 STAGING / PRODUCTION. Production Secret은 분리한다.

# 26. Secret
Service Role, AI Key, STT Key, Web Push Private Key는 Server-only. Git/Frontend Bundle/Client Log에 노출하지 않는다.

# 27. Provider Adapter
AI와 STT를 각각 Adapter 뒤에 둔다. Provider 변경이 Business Rule 변경으로 번지지 않게 한다.

# 28. Shared Domain Types
Intent, Scope, DatePrecision, DateResolutionSource, LifecycleStatus, ClarificationType, RecordSource, ItemMatchType을 중앙화한다.

# 29. Business Logic 위치
Record Candidate, Lifecycle, Matching, Validation, Date 규칙을 UI Component에 중복 구현하지 않는다.

# 30. Date 규칙
Timezone 기반 날짜 Utility를 중앙화하고 Server의 current_local_date를 권위값으로 사용한다.

# 31. AI Safety
PLANNED/NOT_COMPLETED/UNCERTAIN/QUERY/UNKNOWN/OUT_OF_SCOPE/scope UNCERTAIN/unresolved clarification/future date는 자동 Activity 후보 금지.

# 32. AI100 Gate
Schema 100%, False Completion 0, Forbidden Candidate 0, Future Candidate 0, Intent≥98%, Scope≥97%, Deterministic Date≥98%, Normalization≥95%. Prompt/Model/Provider 변경 시 100건 전체 재실행.

# 33. Multi-action
최대 5개. 2~5개 저장은 Atomic. 6개 이상은 `TOO_MANY_ACTIONS`, 부분 처리/부분 저장 금지.

# 34. Manual Record
AI 실패/거절/오판 시 별도 Manual Flow. Parser Segment를 몰래 COMPLETED로 변조하지 않으며 Action/Exact Date/Scope/Ownership/Future/Duplicate 규칙을 동일 적용.

# 35. DB Write
Canonical Core Write는 Frontend→Application API/BFF→DB. DB-HARDEN-001에 따라 Production Browser direct core write를 차단한다.

# 36. DB 핵심
9 Tables, RLS, Composite FK, Future Date 3중 방어, Idempotency, Lifecycle View, Activity History 누적.

# 37. Lifecycle
상태는 `ARCHIVED / NO_HISTORY / NO_CYCLE / NORMAL / UPCOMING / DUE`. 우선순위는 ARCHIVED→NO_HISTORY→NO_CYCLE→DUE→UPCOMING→NORMAL.

# 38. Dashboard
DUE/UPCOMING/NORMAL만 포함. NO_HISTORY/NO_CYCLE/ARCHIVED 제외. DUE는 오래 overdue 순, 나머지는 next_due 빠른 순.

# 39. Cycle
사용자가 설정한다. next_due=last_performed_date+cycle_days. Upcoming threshold=min(5,ceil(cycle_days*0.2)), 최소1. 조기/지연 완료 모두 실제 수행일 기준 재시작.

# 40. Record Edit/Delete
Core Edit는 performed_date와 같은 사용자 item_id 이동. original_text/normalized_action_snapshot/input_method/source_parse_segment_id는 일반 편집 대상이 아니다. 유일 Activity 삭제 시 NO_HISTORY.

# 41. Notification Permission
첫 앱 진입 강제 요청 금지. Cycle 설정 등 맥락에서 요청. S41은 `이 기기에서 알림 받기` 의미이며 가짜 Global Boolean이 아니다.

# 42. Notification Loop
DUE→Reconcile→Dispatch→Landing에서 현재 상태 re-fetch→오늘 했어요/다른 날 했어요/Snooze. Stale Payload를 Source of Truth로 사용하지 않는다.

# 43. Snooze
1/3/7 calendar days. Activity를 만들지 않고 DUE는 유지. 새 Activity 발생 시 old snooze/delivery를 무효화/재조정한다.

# 44. Notification Failure
Activity Save 성공 후 Push 후처리 실패 때문에 Activity를 Rollback하지 않는다. 수행 사실이 Source of Truth다.

# 45. Test Pyramid
Unit→Integration→API→E2E→External Smoke. Safety Critical Rule은 여러 Layer에서 검증한다.

# 46. Unit Test 우선
Record Candidate, Lifecycle, Upcoming Threshold, Relative Date, Duplicate, Matching, Validation.

# 47. Integration Test 우선
Record Transaction, User Isolation, Delete/Recalculate, Cycle/Recalculate, Notification Reconcile, Idempotency.

# 48. E2E 우선
Text Golden Path, Voice Golden Path, Manual Flow, Notification Re-record, 2-user Negative.

# 49. Test 명령
Repository Script가 실제 생성된 뒤 AGENTS.md에 `typecheck/lint/test/e2e` 정확한 명령을 고정한다. 없는 Script를 있다고 가정하지 않는다.

# 50. Task Definition of Done
구현 + Test + Typecheck + Lint + Error Handling + 문서 영향 확인 + Diff Review.

# 51. Phase Definition of Done
해당 Phase Acceptance Criteria와 Gate Runtime Test가 실제 PASS해야 한다.

# 52. Product Definition of Done
G9 실제 PASS. 문서/Mock/UI만 완성된 상태는 Product Done이 아니다.

# 53. Migration
Schema 변경은 Migration 생성→Local/Preview 적용→기존 데이터 영향→Rollback/Forward Fix 검토→Production 적용.

# 54. Backup/Rollback
중요 Migration/Release 전 복구 가능 상태를 확인한다. App Rollback과 DB Rollback을 구분하며 DB는 Forward Fix가 더 안전할 수 있다.

# 55. Observability
최소 Request ID, Error, Provider Failure, Notification Failure, Internal Worker Result. 생활 원문/Secret을 무분별하게 Log하지 않는다.

# 56. 비용 관리
AI/STT/Push/Hosting에 Rate Limit, Request Length, Timeout, Retry 제한을 둔다. AI 교정 Retry 최대 1회.

# 57. Mobile-first
360/390/430과 실제 Mobile Browser에서 Keyboard, Mic, Permission, Push, Touch를 확인한다.

# 58. PWA/Browser
PWA 설치 UI보다 Core Loop를 우선한다. Voice/Push Browser 지원 차이는 Phase 7~8에서 실제 Matrix로 검증하고 Fallback을 제공한다.

# 59. User Test
자연어 기록 편의, AI 확인 이해도, 마지막 수행 기억 가치, Cycle 설정 난이도, Dashboard 유용성, 알림 후 재기록 자연스러움을 관찰한다.

# 60. Scope Inflation 방지
User Test 요청을 즉시 Core Scope에 넣지 않는다. 반복 문제인지 기록하고 Core/Should/Later로 분류한다.

# 61. Issue Label
Bug / Core / Should / Later / Security / Data Integrity. Security와 Data Integrity가 UI Polish보다 우선한다.

# 62. Known Limitation
SHOULD 미구현이나 특정 Browser 제한을 숨기지 않고 명시한다.

# 63. Release Candidate
G8 PASS→RC→Production-like Smoke→Deploy→External Smoke→G9.

# 64. 예상 작업량
달력 약속 대신 상대 크기 사용: Phase0 M, Phase1 L, Phase2 L, Phase3 XL, Phase4 M, Phase5 L, Phase6 M, Phase7 XL, Phase8 XL, Phase9 L.

# 65. Solo 위험 우선순위
Data Integrity→False Completion→User Isolation→Core Recording Loop→Lifecycle→Notification→Polish.

# 66. Codex 과도 변경 방지
AGENTS.md, 작은 Task, Reference docs, Diff Review, Tests, Gate로 통제한다. 예상 외 Dependency/Security/Migration/Business Rule 변경을 반드시 검토한다.

# 67. QA 기준
09번의 P0/P1/P2를 따른다. P2만 실패했다고 Release를 막지 않는다. MUST API Release Gate는 21/21이다.

# 68. External Smoke
외부 HTTPS URL에서 Login→Text→Voice→Save→Refresh→Relogin→Dashboard→Push→Re-record를 확인한다.

# 69. Security Smoke
Production direct core write 차단, 2-user Isolation, Internal Endpoint Browser 차단, Secret Bundle 미노출, HTTPS, Raw Stack 미노출.

# 70. 최종 Cross-document Audit
11/12 생성 후 01~12에서 Core MUST25, API MUST21/SHOULD6, Intent6, Scope3, Lifecycle6, Clarification4, NO_HISTORY, IMPLICIT_TODAY, Manual Record, Item Matching, Device Notification, Snooze 1/3/7, Atomic Multi-save, DB-HARDEN-001 대조를 완료했다.

# 71. G0 Freeze Artifact
Cross Audit 통과 후 Repository `/docs`에 01~12를 고정하고 이후 Business Rule 변경은 관련 문서와 Test를 함께 수정한다.

# 72. 개발 시작 전 체크
11 v1.1 FINAL → 12 v1.1 FINAL → 01~12 Cross Audit → G0 PASS → Repository → docs → AGENTS.md → README → .env.example → Phase 1 Task.

# 73. 최종 실행 원칙
한 번에 전체 앱을 만들지 않는다. 문서로 기준을 고정하고 작은 기능을 만들고 실제 검증 후 다음 Gate로 이동한다.

---
## Execution Plan v1.1 Final Sync 상태
- PHASE 0~9: 정의 완료
- G0~G9: 정의 완료
- Core MUST 25: 동기화
- MUST API 21 / SHOULD API 6: 동기화
- NO_HISTORY / UNKNOWN / IMPLICIT_TODAY / Manual Record: 반영
- Parser ↔ Item Matching: 분리
- DB-HARDEN-001: 반영
- Device/Stale Notification / Snooze 1/3/7: 반영
- SHOULD 비차단: 반영
- Codex Workflow: 반영
- **현재 G0: PASS — 11/12 및 01~12 Cross-document Audit 완료**
- **현재 G1: PASS — PHASE 1 UI Prototype Acceptance 완료**
- **PHASE 1: COMPLETE**
- **Current Track: DEMO TRACK**
- **D1: PASS — Real App UI / IA Redesign**
- **Current Task: D3 — Real Voice Input Demo**
- **TASK 1: PASS — Application UI Scaffold**
- **TASK 2: PASS — 24 Screen ID Fixture UI Structure**
- **TASK 3: PASS — Fixture Interaction & Edge-State Refinement**
- **TASK 3.1: PASS — Fixture Contract Fix**
- **TASK 3.2: PASS — Interaction Completion Gate**
- **TASK 3.3: PASS — Final Functional Guard Fix**
- **TASK 4: PASS — UI Polish & Accessibility Review**
- **After Demo Track: PHASE 2 / TASK 1 — Supabase Foundation & Auth Setup**
- **PHASE 2 구현: 아직 시작 전**
- **Auth/DB: 아직 시작 전**
- **D2 Foundation: PASS**
- **D2 Mock Demo: PASS**
- **Real AI Live Verification: BLOCKED**
- **D2 Full PASS: NOT YET**
- **Real AI: Mock Demo Ready / Live Blocked**
- **Browser Voice Demo: IMPLEMENTED / MICROPHONE MANUAL VERIFICATION REQUIRED**
- **D3: PARTIAL**
- **External STT: NOT IMPLEMENTED**
- **Real STT: 아직 시작 전**
- **Real Push: 아직 시작 전**
- **Runtime 구현: DEMO TRACK 범위에서 부분 진행**
