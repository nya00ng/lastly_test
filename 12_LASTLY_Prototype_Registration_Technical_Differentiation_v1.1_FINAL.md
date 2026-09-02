# LASTLY Prototype Registration / Technical Description / Differentiation
## AI 생활주기 기억 웹앱
**Registration & Technical Description v1.1 — Final Sync Baseline**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 기준 문서 | 01~11 v1.1 FINAL |
| 현재 상태 | 문서 설계 완료 단계 / 실제 구현 전 |
| Runtime QA | 미실행 |
| External Deployment | 미실행 |
| 용도 | 등록·발표·심사·기술 설명·차별화 |

---

# 1. 문서 목적
본 문서는 LASTLY Prototype의 등록, 발표, 심사, 기술 설명, 차별화 설명에 사용할 최종 제품·기술 설명 기준이다. 현재 상태와 구현 완료 후 표현을 엄격히 분리하며, 실제 Runtime 검증 전에는 기능 완료처럼 표현하지 않는다.

# 2. 현재 상태
현재 공식 상태:
- 01~12 v1.1 FINAL 문서 정리 단계
- 실제 구현 전
- Runtime QA 미실행
- External Deployment 미실행

현재 권장 표현:
> LASTLY는 AI 생활주기 기억 웹앱 Prototype을 위한 제품·기술 설계를 완료하고 구현을 준비하는 단계다.

# 3. G9 이후 상태 표현
G9 실제 PASS 이후에만:
> LASTLY Prototype은 자연어와 음성으로 생활관리 행동을 기록하고, 마지막 수행일·관리주기·다음 관리시점·실제 알림·재기록까지 이어지는 외부 테스트 가능한 웹앱으로 구현되었다.

# 4. 한 문장 정의
> **LASTLY는 ‘언제 했더라?’를 대신 기억해주는 AI 생활관리 서비스다.**

# 5. 핵심 포지셔닝
캘린더가 앞으로 할 일을 기억한다면 LASTLY는 **마지막으로 한 일을 기억한다.** 반복 생활관리의 과거 수행 기억과 다음 관리 연결이 중심이다.

# 6. 문제 정의
이불 세탁, 칫솔 교체, 필터 청소, 세탁조 청소 같은 생활관리 행동은 반복되지만 매번 캘린더나 투두에 적기 번거롭다. 사용자는 필요할 때 “마지막으로 언제 했지?”를 기억에 의존한다.

# 7. 대표 사용자
초기 대표 사용자는 일과 가사·생활관리를 함께 수행하는 30~40대 워킹맘이다. 이후 1인 가구, 맞벌이 가구, 자취생 등으로 확장 가능하다.

# 8. JTBD
> 생활관리 행동을 했을 때 번거롭게 정리하지 않아도 기록해두고, 나중에 마지막 수행일과 다음 관리시점을 바로 알고 싶다.

# 9. 핵심 가치
AI의 존재 자체가 아니라 **기억 복구와 기록 마찰 감소**가 핵심이다. AI는 구조화하고, 사용자가 사실을 최종 확정한다.

# 10. Core Loop
`기록 → 기억 → 관리 → 알림 → 재기록`

# 11. 입력 방식
Text와 Voice를 모두 지원한다. Voice는 STT를 거쳐 동일한 Record Pipeline으로 들어간다.

# 12. 처리 Pipeline
`Text/Voice → STT(필요 시) → AI Parser → Schema Validation → Semantic Validation → Item Matching → User Confirmation → Record API → DB`

# 13. Intent
`COMPLETED / PLANNED / NOT_COMPLETED / UNCERTAIN / QUERY / UNKNOWN`

# 14. Scope
`IN_SCOPE / OUT_OF_SCOPE / UNCERTAIN`

# 15. Date
`EXACT / APPROXIMATE / UNKNOWN / NOT_APPLICABLE`, Resolution Source는 `EXPLICIT / IMPLICIT_TODAY / NONE`이다.

# 16. IMPLICIT_TODAY
“칫솔 바꿨어”처럼 명시 날짜가 없는 완료문은 현재 Local Date를 제안할 수 있으나 반드시 사용자 Confirmation을 거친다.

# 17. False Completion Safety
다음은 자동 Activity 후보가 아니다:
`PLANNED / NOT_COMPLETED / UNCERTAIN / QUERY / UNKNOWN / OUT_OF_SCOPE / scope UNCERTAIN / unresolved clarification / future date`.

# 18. Parser와 Item Matching 분리
Parser는 Intent/Scope/Action/Date/Clarification만 담당한다. 기존 Management Item ID 선택은 별도 Item Matching Layer가 담당한다.

# 19. Item Matching
`Exact Item Name → Exact Alias → Optional Fuzzy Candidate → None`. 복수 후보는 사용자가 선택한다.

# 20. Manual Record Flow
AI 실패·거절·오판 시 별도 Manual Flow를 사용한다. 기존 Parser Segment를 몰래 COMPLETED로 바꾸지 않는다.

# 21. Management Item
반복 관리 대상. 예: 이불 세탁, 칫솔 교체, 에어컨 필터 청소.

# 22. Activity Record
실제 수행 사실. 한 Item에 여러 Activity가 누적되며 Last Date 하나로 덮어쓰지 않는다.

# 23. Lifecycle
`ARCHIVED / NO_HISTORY / NO_CYCLE / NORMAL / UPCOMING / DUE`

# 24. Lifecycle Priority
`ARCHIVED → NO_HISTORY → NO_CYCLE → DUE → UPCOMING → NORMAL`

# 25. NO_HISTORY
Item은 존재하지만 valid Activity가 없으면 `NO_HISTORY`. 사용자 문구는 “수행기록 없음”.

# 26. Cycle
사용자가 `cycle_days=N`으로 설정한다. AI가 건강·안전 관련 주기를 권위적으로 확정하지 않는다.

# 27. Next Due
`next_due_date = last_performed_date + cycle_days`

# 28. Upcoming Threshold
`upcoming_days = min(5, ceil(cycle_days*0.2))`, 최소 1일. 7일→2일, 28일→5일, 90일→5일.

# 29. Dashboard
DUE/UPCOMING/NORMAL만 포함하고 NO_HISTORY/NO_CYCLE/ARCHIVED는 제외한다.

# 30. All Management
Active Item 전체를 보여주며 NO_HISTORY와 NO_CYCLE도 포함한다.

# 31. Notification
Cycle + valid History가 있는 DUE Item에 실제 Push를 제공하는 구조다.

# 32. Device Notification
S41은 `이 기기에서 알림 받기` 의미이며 서비스 전체 Global Boolean이 아니다.

# 33. Stale Notification
알림 클릭 시 현재 Item/Lifecycle을 Server에서 다시 조회한다. Push Payload는 Source of Truth가 아니다.

# 34. Snooze
`1일 / 3일 / 7일`. Activity를 만들지 않고 DUE 의미를 유지한다.

# 35. Re-record
`오늘 했어요`와 `다른 날 했어요`는 새 Activity를 추가하며 과거 History를 보존한다.

# 36. MVP MUST 25
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

# 37. SHOULD
Deleted Activity Restore, Item Archive/Restore, Duplicate Item Merge, 상세 Item Notification Settings는 Core Release Blocker가 아니다.

# 38. Non-goal
Generic To-do, Calendar, Habit Checklist, Family Sharing, Photo Recognition, IoT, External Calendar, Siri/Bixby Native, AI Authoritative Cycle, Advanced Reports, Generic AI Agent.

# 39. 기술 구조
`Mobile Web/PWA → Next.js/React/TypeScript → Application API/BFF → Supabase Auth/PostgreSQL`

# 40. Database
`profiles / management_items / activity_records / item_aliases / notification_settings / ai_parse_logs / ai_parse_segments / push_subscriptions / notification_deliveries`

# 41. 보안
Supabase Auth, RLS, Composite FK, Application API/BFF Canonical Write, Production Browser Direct Core Write 차단, Service Role Server-only.

# 42. DB-HARDEN-001
Production Browser authenticated client가 Core Table을 직접 INSERT/UPDATE/DELETE해 Business Rule을 우회하지 못하도록 Canonical Migration에 Hardening을 포함한다.

# 43. API
v1.1 Canonical API는 **MUST 21 / SHOULD 6 / TOTAL 27**. `POST /query`는 NEXT.

# 44. Atomic Multi-save
2~5개는 All-or-Nothing Transaction. 6개 이상은 `TOO_MANY_ACTIONS`이며 부분 처리하지 않는다.

# 45. Duplicate / Idempotency
Same Item+Same Date는 hard unique가 아니다. 경고 후 명시적 추가 가능. Retry 중복은 Idempotency Key, source_parse_segment_id, Delivery Idempotency로 방지.

# 46. AI Validation
08번은 100 Ground Truth Cases, Parser Schema 1.0. Runtime Gate는 False Completion 0, Forbidden Candidate 0, Future Candidate 0, Intent≥98%, Scope≥97%, Date≥98%, Normalization≥95%.

# 47. QA
09번은 230 Test Cases. P0 Release Blocker / P1 Required Regression / P2 SHOULD. Core Gate는 P0 Runtime 100%와 MUST API 21/21.

# 48. Deployment Checklist
11번은 BLOCKER/P0, REQUIRED, RECOMMENDED/SHOULD/N/A의 3단계 구조이며 현재 Runtime Verification은 미실행.

# 49. 개발 단계
`PHASE 0 Documents Freeze → 1 UI → 2 Auth/DB → 3 Text AI → 4 Voice/STT → 5 Management → 6 Lifecycle → 7 Notification → 8 QA → 9 Deployment`

# 50. 현재 Gate
현재 G0는 아직 미통과다. 12번 생성 후 01~12 Cross-document Audit와 Freeze가 필요하다.

# 51. Codex 개발 방식
G0 이후 `/docs/01~12`, `AGENTS.md`, `README.md`, `.env.example`을 두고 작은 Task 단위로 구현·검증한다.

# 52. 차별점 1
캘린더/투두가 미래 일정·할 일 중심이라면 LASTLY는 과거 완료 행동의 마지막 수행일을 중심으로 한다.

# 53. 차별점 2
아무 일상을 저장하는 Lifelog가 아니라 반복 관리 의미가 있는 완료 행동을 중심으로 구조화한다.

# 54. 차별점 3
AI 자동저장보다 구조화·불확실성 노출·사용자 Confirmation·History 보존을 우선한다.

# 55. 차별점 4
False Completion을 별도 Release Safety Gate로 관리한다.

# 56. 차별점 5
`Activity History → Last Performed → Cycle → Next Due → Status → Dashboard → Notification → Re-record`로 연결한다.

# 57. 기존 대안 비교
| 대안 | 중심 | LASTLY 차이 |
|---|---|---|
| 캘린더 | 미래 일정 | 마지막 수행 기억이 중심이 아님 |
| To-do | 할 일 완료 | 작은 생활관리 완료 기록 축적에 마찰 |
| Habit Tracker | 반복 체크 | 실제 수행 History와 마지막 수행 기억이 중심이 아님 |
| Memo | 자유 기록 | 구조화·주기·상태·알림 연결 부족 |
| Generic AI | 대화 | 사용자별 장기 Activity History 관리가 핵심이 아님 |

# 58. 등록용 문제 설명
> 생활 속 반복 관리 행동은 자주 기록하지 않아 마지막 수행 시점을 기억하기 어렵습니다. LASTLY는 이런 완료 행동을 자연어로 기록하고 마지막 수행일과 다음 관리시점을 이어 관리하는 AI 생활주기 기억 웹앱을 목표로 합니다.

# 59. 등록용 해결 방식
> 사용자가 자연어로 입력하면 AI가 완료 여부, 행동, 날짜를 구조화하고 사용자가 확인한 뒤 Activity History로 저장합니다. 사용자가 Cycle을 설정하면 다음 관리시점과 상태를 계산하고 알림과 재기록으로 Loop를 이어갑니다.

# 60. 기술 차별화 설명
> Intent·Scope·Action·Date 구조화, 사용자 Confirmation, Parser와 Item Matching 분리, False Completion Safety, Activity History 보존, 사용자별 데이터 분리, Lifecycle·Notification Re-record 연결이 핵심 기술 구조입니다.

# 61. 10초 소개
> LASTLY는 ‘언제 했더라?’를 대신 기억해주는 AI 생활관리 앱입니다. 생활관리 행동을 말이나 글로 기록하면 마지막 수행일과 다음 관리시점까지 이어서 기억해줍니다.

# 62. 30초 소개
> 캘린더는 앞으로 할 일을 기록하지만 생활에는 ‘마지막으로 언제 했지?’가 중요한 일이 많습니다. LASTLY는 자연어로 완료 행동을 기록하고 History를 남긴 뒤, 사용자가 정한 주기로 다음 관리시점과 알림까지 연결합니다.

# 63. 1분 소개
> LASTLY는 이불 세탁, 칫솔 교체, 필터 관리처럼 매번 캘린더에 적지 않지만 마지막 수행일이 중요한 생활관리 행동을 기억하는 서비스입니다. 자연어 또는 음성을 AI가 구조화하고 사용자가 확인한 뒤 History로 저장합니다. Cycle을 설정하면 다음 관리시점과 상태를 계산하고, 알림 후 ‘오늘 했어요’로 다시 Activity를 추가합니다. 핵심은 AI가 대신 결정하는 것이 아니라 기록 마찰과 기억 부담을 줄이는 것입니다.

# 64. FAQ — 캘린더와 차이
캘린더는 미래 일정 중심이고 LASTLY는 과거 완료 행동의 마지막 수행일 중심이다.

# 65. FAQ — 투두와 차이
투두는 할 일 생성·완료 체크가 중심이고 LASTLY는 이미 한 행동의 History와 다음 관리 연결이 중심이다.

# 66. FAQ — AI 오판
AI 결과는 자동 저장하지 않고 사용자가 확인·수정한다.

# 67. FAQ — 계획을 완료로 오해
PLANNED/NOT_COMPLETED/QUERY/UNKNOWN을 별도 Intent로 분리하고 False Completion 0을 Safety Gate로 둔다.

# 68. FAQ — 필터가 여러 개
Parser가 Item을 고르지 않고 Item Matching에서 후보를 보여주며 사용자가 선택한다.

# 69. FAQ — 날짜를 안 말함
IMPLICIT_TODAY로 현재 Local Date를 제안할 수 있으나 사용자 Confirmation이 필요하다.

# 70. FAQ — 날짜가 불확실
AI가 Exact Date를 발명하지 않고 Approximate/Unknown으로 처리한 뒤 사용자에게 실제 날짜를 확인한다.

# 71. FAQ — 기록 수정
performed_date와 같은 사용자 Item 연결은 수정 가능하지만 original_text와 normalized_action_snapshot은 일반 편집 대상으로 두지 않는다.

# 72. FAQ — 같은 날 두 번
중복 경고 후 사용자가 명시적으로 추가할 수 있다.

# 73. FAQ — 개인정보
Auth/RLS와 API/BFF Canonical Write를 사용하고 Cross-user 접근과 Browser direct write를 차단하는 구조를 기준으로 한다.

# 74. FAQ — 알림
DUE Item에 Push를 제공하고 클릭 시 현재 상태를 다시 조회해 Stale Notification을 처리한다.

# 75. FAQ — Snooze
1/3/7일 미루기가 가능하며 Activity를 만들지 않는다.

# 76. FAQ — Siri/Bixby
초기 MVP가 아니며 향후 공통 Record API를 통해 외부 입력 채널로 확장 가능하다.

# 77. FAQ — AI Cycle 추천
초기에는 사용자가 Cycle을 설정하며 AI가 권위적으로 결정하지 않는다.

# 78. FAQ — 지금 완성 여부
현재는 제품·기술 문서 설계 완료 단계이며 실제 AI/STT/DB/Push/외부 배포는 이후 Phase별 구현과 Runtime Gate를 통과해야 한다.

# 79. 현재 말하면 안 되는 표현
“AI 정확도 검증 완료”, “100개 테스트 통과”, “230개 QA 통과”, “보안 검증 완료”, “Push 구현 완료”, “서비스 완성”, “Production Ready”, “G9 PASS”는 Runtime Evidence 전에는 사용하지 않는다.

# 80. 과장 금지
업계 최고 정확도, 완벽한 AI, 모든 기기 지원, 의료·건강 안전 주기 보장, 개인정보 완전 안전 같은 표현은 근거 없이 사용하지 않는다.

# 81. 데모 순서
Problem → Record Input → Voice/STT → AI Confirmation → Item Matching → Saved → History → Cycle → Dashboard → DUE Notification → 오늘 했어요 → 새 Activity.

# 82. 스크린샷 목록
Login, Empty, Text Record, Voice Listening, STT Result, AI Confirmation, Clarification, Item Matching, Saved, Dashboard, All Management, Detail, History, Edit, Cycle, Notification Landing, Snooze, Re-record.

# 83. 데모 데이터 원칙
Fixture는 실제 사용자 데이터와 분리하며 가짜 데이터를 실제 개인 기록처럼 표현하지 않는다.

# 84. NEXT
Natural-language Query, 실제 기억 조회, 검색 개선, Cycle 제안, History Trend, 외부 입력 채널.

# 85. Personalization
사용자 설정 Cycle과 실제 평균 수행 간격을 비교해 조정 제안을 할 수 있으나 최종 결정은 사용자에게 둔다.

# 86. Report
실제 History가 쌓이면 최근 수행 횟수, 평균 간격, 가장 오래 미룬 항목, Item Timeline 등을 제공할 수 있다. 근거 없는 Lifestyle Score는 만들지 않는다.

# 87. 기술스택 표현
`Frontend: Next.js/React/TypeScript/Tailwind / Backend: API-BFF / DB-Auth: Supabase / AI: Structured-output Adapter / STT: Replaceable Adapter / Notification: Web Push + reconcile/dispatch`

# 88. 산출물
01 PRD, 02 BRS, 03 UFS, 04 UI/UX FS, 05 AI Parser, 06 DB/ERD, 07 API, 08 AI Validation, 09 QA, 10 Execution Plan, 11 Deployment Checklist, 12 본 문서.

# 89. 최종 Cross-document Audit
`Core MUST25 / API MUST21·SHOULD6 / Intent6 / Scope3 / Lifecycle6 / Clarification4 / NO_HISTORY / IMPLICIT_TODAY / Parser↔Item Matching / Manual Record / Atomic Multi-save / TOO_MANY_ACTIONS / DB-HARDEN-001 / Device Notification / Stale Notification / Snooze1·3·7 / SHOULD 비차단`을 대조한다.

# 90. G0 Freeze 조건
`12 v1.1 FINAL → 01~12 Cross-document Audit → Critical Contradiction 0 → Freeze → G0 PASS → Codex Handoff`

# 91. 현재 등록용 상태 문구
> LASTLY는 반복 생활관리에서 ‘마지막으로 언제 했는지’를 기억하기 어려운 문제를 해결하기 위해 설계된 AI 생활주기 기억 웹앱 Prototype 프로젝트다. 현재 제품 요구사항, AI 파서, 데이터 구조, API, 테스트, 배포 기준까지 문서 설계를 완료하는 단계이며 이후 Phase별 구현과 Runtime 검증을 진행한다.

# 92. G9 이후 등록용 상태 문구
> LASTLY는 자연어와 음성으로 생활관리 완료 행동을 기록하고 수행 History·관리주기·다음 관리시점·알림·재기록을 연결하는 외부 테스트 가능한 AI 생활주기 기억 웹앱 Prototype으로 구현되었다.

# 93. 최종 핵심 메시지
> **LASTLY의 경쟁력은 AI가 대신 기억하는 것 자체가 아니라, 사용자가 놓치기 쉬운 작은 생활관리 행동을 자연스럽게 기록하고 신뢰 가능한 수행 History로 축적해 다음 관리까지 연결하는 데 있다.**

---
## v1.1 Final Sync 상태
- Core MUST 25: 반영
- Lifecycle 6종(NO_HISTORY / ARCHIVED 포함): 반영
- MUST API 21 / SHOULD 6: 반영
- UNKNOWN / IMPLICIT_TODAY / Manual Record: 반영
- Parser ↔ Item Matching: 분리
- Atomic Multi-save / TOO_MANY_ACTIONS: 반영
- DB-HARDEN-001: 반영
- Device / Stale Notification / Snooze 1/3/7: 반영
- AI100 / QA230: Static과 Runtime 구분
- SHOULD 비차단: 반영
- 현재 G0: 아직 미통과
- 실제 Prototype 완료 표현: G9 이후에만 사용
