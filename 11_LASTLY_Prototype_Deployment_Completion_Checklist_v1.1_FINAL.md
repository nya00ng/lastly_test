# LASTLY Prototype Deployment & Completion Checklist
## AI 생활주기 기억 웹앱
**Deployment & Completion Checklist v1.1 — Final Sync Baseline**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 기준 문서 | 01~10 v1.1 FINAL |
| Checklist 구조 | BLOCKER / REQUIRED / RECOMMENDED·SHOULD |
| Release 기준 | Core MUST 25 + P0 Runtime + External Verification |
| 상태 | **Checklist Baseline / Runtime 미실행** |

---

# 1. 문서 목적
본 문서는 LASTLY Prototype을 외부 사용자에게 공개하기 전, 실제 구현·보안·데이터 무결성·AI Safety·Voice/STT·Notification·배포 상태를 최종 확인하기 위한 실행 체크리스트다.

이 문서의 체크박스는 **문서가 존재하는지**가 아니라 **실제 Runtime에서 검증했는지**를 표시한다.

# 2. 체크리스트 등급
체크 항목은 세 단계로 분리한다.

- **BLOCKER / P0**: 하나라도 실패하거나 미확인 상태면 Release 금지.
- **REQUIRED**: Prototype 품질과 회귀 안정성을 위해 완료해야 하는 필수 운영 항목.
- **RECOMMENDED / SHOULD / N/A**: 편의·확장·선택 기능. 미구현만으로 Core Release를 차단하지 않는다.

기존처럼 모든 항목을 동일한 무게의 체크박스로 취급하지 않는다.

# 3. 체크 상태 규칙
각 항목은 다음 중 하나로 기록한다.

```text
[ ] NOT TESTED
[x] PASS
[!] FAIL
[-] N/A
```

`N/A`는 RECOMMENDED/SHOULD에만 원칙적으로 허용한다. BLOCKER를 N/A 처리하려면 제품 범위에서 해당 기능이 정말 제거되었는지 01~10 문서와 함께 재검토한다.

# 4. 현재 상태
본 문서 생성 시점은 **Specification Baseline**이다.

```text
CHECKLIST DESIGN = COMPLETE
RUNTIME VERIFICATION = NOT YET EXECUTED
RELEASE STATUS = NOT READY
```

체크박스가 작성되어 있다는 이유로 PASS 처리하지 않는다.

# 5. Release 완료 정의
최종 Prototype Release는 최소 다음을 실제로 만족해야 한다.

```text
Core 25 MUST
+ P0 Runtime 100%
+ AI Safety Gate
+ MUST API 21/21 Smoke
+ 2-user Isolation
+ Persistent DB
+ Actual Voice/STT
+ Actual Notification/Re-record
+ External HTTPS Deployment
+ Critical Security Defect 0
```

# 6. Core MVP MUST 25
- [ ] 자연어 Text Input
- [ ] Voice Input
- [ ] Voice → Text
- [ ] Intent Classification
- [ ] Action Extraction
- [ ] Date Extraction
- [ ] AI Result Confirmation
- [ ] AI Result Editing
- [ ] Persistent Record Save
- [ ] Existing Item Matching
- [ ] New Item Creation
- [ ] Last Performed Display
- [ ] All Management Page
- [ ] Per-item History
- [ ] Record Edit/Delete
- [ ] User-set Cycle
- [ ] Next Due Calculation
- [ ] Status Calculation
- [ ] Dashboard
- [ ] Due Notification
- [ ] 오늘 했어요 Re-record
- [ ] Auth
- [ ] Per-user Separation
- [ ] Real Persistent DB
- [ ] External Deployment

# 7. BLOCKER — False Completion
- [ ] PLANNED가 Activity로 저장되지 않는다.
- [ ] NOT_COMPLETED가 Activity로 저장되지 않는다.
- [ ] UNCERTAIN이 확인 없이 Activity로 저장되지 않는다.
- [ ] QUERY가 Activity로 저장되지 않는다.
- [ ] UNKNOWN이 Activity로 저장되지 않는다.
- [ ] OUT_OF_SCOPE가 Activity로 저장되지 않는다.
- [ ] Scope UNCERTAIN이 확인 없이 저장되지 않는다.
- [ ] unresolved clarification이 저장되지 않는다.
- [ ] future performed_date가 저장되지 않는다.
- [ ] AI 결과가 사용자 확인 없이 자동 저장되지 않는다.
- [ ] AI100 실제 Runtime에서 False Completion = 0이다.
- [ ] Forbidden Candidate = 0이다.

# 8. BLOCKER — AI Parser Contract
- [ ] Intent 6종이 구현되어 있다: COMPLETED / PLANNED / NOT_COMPLETED / UNCERTAIN / QUERY / UNKNOWN.
- [ ] Scope 3종이 구현되어 있다: IN_SCOPE / OUT_OF_SCOPE / UNCERTAIN.
- [ ] Date Precision이 EXACT / APPROXIMATE / UNKNOWN / NOT_APPLICABLE로 동작한다.
- [ ] Date Resolution Source가 EXPLICIT / IMPLICIT_TODAY / NONE으로 동작한다.
- [ ] Clarification Type은 COMPLETION / ACTION / DATE / SCOPE다.
- [ ] TARGET은 Parser enum이 아니다.
- [ ] Parser가 기존 DB item_id를 직접 선택하지 않는다.
- [ ] Record Candidate는 Server가 계산한다.
- [ ] AI Numeric Confidence가 자동 저장 권한을 갖지 않는다.
- [ ] Schema Validation 실패 시 저장하지 않는다.
- [ ] Semantic Validation 실패 시 저장하지 않는다.
- [ ] 교정 Retry가 무한 반복되지 않는다.

# 9. BLOCKER — AI100 Runtime
- [ ] 08번 100 Case를 실제 Provider로 전체 실행했다.
- [ ] Schema Pass = 100%.
- [ ] False Completion = 0.
- [ ] Forbidden Candidate = 0.
- [ ] Future Candidate = 0.
- [ ] Intent Accuracy ≥ 98%.
- [ ] Scope Accuracy ≥ 97%.
- [ ] Deterministic Date Accuracy ≥ 98%.
- [ ] Normalization Accuracy ≥ 95%.
- [ ] Prompt/Model/Provider Version을 Evidence에 기록했다.
- [ ] Provider/Prompt 변경 후 100건을 다시 실행했다.

# 10. BLOCKER — Multi-action / Atomicity
- [ ] 최대 5개 Semantic Action을 분리할 수 있다.
- [ ] 6개 초과 입력은 TOO_MANY_ACTIONS다.
- [ ] 6개 초과 입력에서 부분 Segment 저장이 없다.
- [ ] 2~5개 선택 Record 저장은 Atomic이다.
- [ ] 복수 Record 중 1건 실패 시 전체 Rollback된다.
- [ ] Partial Success를 Success UI로 표시하지 않는다.

# 11. BLOCKER — Manual Record Flow
- [ ] AI 실패 시 Manual Record로 전환할 수 있다.
- [ ] AI 결과 거절 시 Manual Record로 전환할 수 있다.
- [ ] PLANNED/NOT_COMPLETED/QUERY/UNKNOWN/OUT_OF_SCOPE 오판을 Parser Segment 직접 변조로 해결하지 않는다.
- [ ] UNCERTAIN은 명시적 완료 확인 후에만 진행한다.
- [ ] Manual Flow에서도 Action이 필요하다.
- [ ] Manual Flow에서도 Exact Date가 필요하다.
- [ ] Manual Flow에서도 future date를 차단한다.
- [ ] Manual Flow에서도 Ownership을 검증한다.
- [ ] Manual Flow에서도 Duplicate/Idempotency 규칙을 적용한다.

# 12. BLOCKER — Auth / Session
- [ ] 실제 Auth가 동작한다.
- [ ] Login 성공 후 Private 화면에 접근한다.
- [ ] Logout 후 Private 화면 접근이 차단된다.
- [ ] Session이 재접속 후 복원된다.
- [ ] Session 만료 시 Private Write가 차단된다.
- [ ] 재인증 후 기존 데이터가 유지된다.

# 13. BLOCKER — 2-user Isolation
테스트 계정 A/B를 반드시 사용한다.

- [ ] A가 B의 Item을 읽을 수 없다.
- [ ] A가 B의 Activity를 읽을 수 없다.
- [ ] A가 B의 Item을 수정할 수 없다.
- [ ] A가 B의 Activity를 수정/삭제할 수 없다.
- [ ] A가 B의 Cycle을 변경할 수 없다.
- [ ] A가 B Item에 Complete할 수 없다.
- [ ] A가 B의 AI Log를 읽을 수 없다.
- [ ] A가 B의 Push Subscription을 조작할 수 없다.
- [ ] A가 B의 Notification Delivery를 사용할 수 없다.
- [ ] Cross-user Resource가 오류 메시지로 존재 여부를 과도하게 노출하지 않는다.

# 14. BLOCKER — DB-HARDEN-001
- [ ] Application API/BFF가 Core Write의 Canonical Path다.
- [ ] Production Browser authenticated client의 direct `management_items` INSERT/UPDATE/DELETE가 차단된다.
- [ ] direct `activity_records` INSERT/UPDATE/DELETE가 차단된다.
- [ ] Core Business Rule을 Browser direct DB Write로 우회할 수 없다.
- [ ] Service Role은 Browser Bundle에 없다.
- [ ] Migration 자체에 Grant/Revoke Hardening이 포함되어 있다.
- [ ] API 문서의 별도 후처리에만 Hardening이 의존하지 않는다.

# 15. BLOCKER — Database Schema
9개 Table을 확인한다.

- [ ] profiles
- [ ] management_items
- [ ] activity_records
- [ ] item_aliases
- [ ] notification_settings
- [ ] ai_parse_logs
- [ ] ai_parse_segments
- [ ] push_subscriptions
- [ ] notification_deliveries
- [ ] Migration 순서가 재현 가능하다.
- [ ] RLS가 적용되어 있다.
- [ ] Ownership 관계가 DB 수준에서 보호된다.

# 16. BLOCKER — Activity History Integrity
- [ ] 수행기록을 Last Date 하나로 덮어쓰지 않는다.
- [ ] 한 Item에 여러 Activity가 누적된다.
- [ ] 과거 Activity 추가가 최신 Activity를 삭제하지 않는다.
- [ ] Latest Activity 삭제 시 이전 valid Activity가 Last가 된다.
- [ ] 유일 Activity 삭제 시 Last가 null이 된다.
- [ ] 유일 Activity 삭제 시 Status는 NO_HISTORY다.
- [ ] Soft-deleted Activity는 Last 계산에서 제외된다.
- [ ] Record 이동 시 Source/Target Item Lifecycle이 모두 재계산된다.
- [ ] original_text와 normalized_action_snapshot은 일반 Edit로 덮어쓰지 않는다.

# 17. BLOCKER — Future Date Defense
- [ ] UI에서 미래 완료일 입력을 방지/경고한다.
- [ ] API에서 미래 performed_date를 거절한다.
- [ ] DB Trigger/Constraint 계층에서 우회 Write를 방어한다.
- [ ] AI Parser가 future completion을 Record Candidate로 만들지 않는다.

# 18. BLOCKER — Idempotency
- [ ] Record Create 재시도에서 중복 Activity가 생기지 않는다.
- [ ] 동일 Parse Segment 재저장이 차단된다.
- [ ] Notification Complete Double Tap에서 중복 Activity가 생기지 않는다.
- [ ] Notification Delivery 생성이 중복되지 않는다.
- [ ] Network Retry가 데이터 중복을 만들지 않는다.

# 19. BLOCKER — Persistence
- [ ] Record Save 후 새로고침해도 데이터가 유지된다.
- [ ] Browser 재접속 후 유지된다.
- [ ] Logout/Login 후 유지된다.
- [ ] 다른 Device/Session에서 동일 User 데이터가 DB 기준으로 조회된다.
- [ ] Dummy Local State만으로 Persistence를 흉내 내지 않는다.

# 20. BLOCKER — Item Matching
- [ ] Exact Item Name Match가 동작한다.
- [ ] Alias Match가 동작한다.
- [ ] 복수 Target 가능 시 자동 선택하지 않는다.
- [ ] Fuzzy Match는 확정이 아니라 Candidate다.
- [ ] Match 없음 시 New Item을 제안한다.
- [ ] New Item 이름을 사용자가 수정할 수 있다.
- [ ] Parser와 Matching 결과 책임이 분리되어 있다.

# 21. BLOCKER — Lifecycle
- [ ] ARCHIVED 상태 계산이 가능하다.
- [ ] NO_HISTORY 상태가 존재한다.
- [ ] NO_CYCLE 상태가 존재한다.
- [ ] NORMAL 상태가 존재한다.
- [ ] UPCOMING 상태가 존재한다.
- [ ] DUE 상태가 존재한다.
- [ ] Priority는 ARCHIVED → NO_HISTORY → NO_CYCLE → DUE → UPCOMING → NORMAL이다.
- [ ] `upcoming_days = min(5, ceil(cycle_days*0.2))`, 최소 1이 적용된다.
- [ ] 7일 Cycle의 Upcoming은 2일이다.
- [ ] 28/90일 Cycle의 Upcoming은 최대 5일이다.

# 22. BLOCKER — Cycle / Next Due
- [ ] Cycle은 User-defined다.
- [ ] Cycle이 없어도 기록은 가능하다.
- [ ] AI가 건강/안전 주기를 권위적으로 확정하지 않는다.
- [ ] next_due = last_performed_date + cycle_days다.
- [ ] 조기 완료 시 실제 수행일 기준으로 Cycle을 다시 시작한다.
- [ ] 지연 완료도 실제 수행일 기준으로 다시 시작한다.
- [ ] Activity가 없으면 next_due는 null이다.

# 23. BLOCKER — Dashboard
- [ ] DUE를 포함한다.
- [ ] UPCOMING을 포함한다.
- [ ] NORMAL을 포함한다.
- [ ] NO_HISTORY를 제외한다.
- [ ] NO_CYCLE을 제외한다.
- [ ] ARCHIVED를 제외한다.
- [ ] DUE는 오래 overdue된 Item부터 정렬한다.
- [ ] UPCOMING/NORMAL은 next_due 빠른 순이다.

# 24. BLOCKER — Voice / STT
- [ ] 실제 Microphone 입력이 동작한다.
- [ ] 실제 STT Provider가 동작한다.
- [ ] Transcript가 사용자에게 표시된다.
- [ ] Transcript를 수정할 수 있다.
- [ ] 수정된 Transcript가 AI Parser 입력이 된다.
- [ ] STT 실패 시 Text Fallback이 있다.
- [ ] Mic 권한 거부가 App 전체 사용을 막지 않는다.
- [ ] Voice Golden Path가 실제 DB Activity까지 이어진다.
- [ ] Voice NOT_COMPLETED가 저장되지 않는다.
- [ ] Voice QUERY가 저장되지 않는다.

# 25. BLOCKER — Notification Device Model
- [ ] Notification Permission은 맥락 있는 시점에 요청한다.
- [ ] 첫 앱 진입에서 무조건 Permission Prompt를 띄우지 않는다.
- [ ] S41은 `이 기기에서 알림 받기` 의미다.
- [ ] Service 전체를 나타내는 가짜 Global Boolean으로 구현하지 않는다.
- [ ] Push Subscription이 User + Device/Browser 단위로 저장된다.
- [ ] 다른 User Subscription을 조작할 수 없다.

# 26. BLOCKER — Notification Delivery
- [ ] Cycle + valid History + DUE Item만 기본 Due Notification 대상이다.
- [ ] NO_HISTORY는 대상이 아니다.
- [ ] NO_CYCLE은 대상이 아니다.
- [ ] Reconcile이 필요한 Delivery를 생성한다.
- [ ] Dispatch가 실제 Push를 전송한다.
- [ ] Push 실패를 기록할 수 있다.
- [ ] Push 실패가 기존 Activity를 삭제하지 않는다.
- [ ] Wrong-user Notification이 발생하지 않는다.

# 27. BLOCKER — Stale Notification
- [ ] Notification 클릭 시 Server에서 현재 Item 상태를 다시 조회한다.
- [ ] Push Payload 자체를 Source of Truth로 사용하지 않는다.
- [ ] 새 Activity로 DUE가 해소된 옛 Notification을 Stale로 판단한다.
- [ ] Stale Notification에서 잘못된 완료 Action을 강제하지 않는다.
- [ ] Cycle 변경/삭제 후 옛 Delivery 상태가 재검증된다.

# 28. BLOCKER — Notification Re-record
- [ ] `오늘 했어요`가 오늘 날짜 새 Activity를 만든다.
- [ ] 과거 History를 유지한다.
- [ ] Last Performed가 갱신된다.
- [ ] Next Due가 갱신된다.
- [ ] `다른 날 했어요`가 정확한 과거 날짜를 받을 수 있다.
- [ ] 다른 날 했어요에서 미래 날짜를 차단한다.
- [ ] 새 Activity 후 old pending/snooze/delivery를 무효화 또는 재조정한다.

# 29. BLOCKER — Snooze
- [ ] 1일 Snooze가 동작한다.
- [ ] 3일 Snooze가 동작한다.
- [ ] 7일 Snooze가 동작한다.
- [ ] MVP 외 임의 Snooze 값을 API 조작으로 넣을 수 없다.
- [ ] Snooze는 Activity를 만들지 않는다.
- [ ] Snooze 후에도 Item의 Lifecycle Status는 DUE 의미를 유지한다.
- [ ] Calendar Day는 User Timezone 기준이다.

# 30. BLOCKER — MUST API Smoke
07번 기준 **MUST API 21/21**을 실제 Environment에서 Smoke Test한다.

- [ ] 모든 MUST Endpoint가 인증 정책과 일치한다.
- [ ] Request Validation이 동작한다.
- [ ] Ownership Validation이 동작한다.
- [ ] Error Contract가 일관된다.
- [ ] Core Write가 Server Business Rule을 우회하지 않는다.
- [ ] 21/21 Smoke 결과 Evidence가 있다.

SHOULD 6 Endpoint는 Core Release Gate에 포함하지 않는다.

# 31. BLOCKER — External Deployment
- [ ] 실제 외부 HTTPS URL이 있다.
- [ ] 외부 URL에서 Login 가능하다.
- [ ] Text Golden Path가 동작한다.
- [ ] Voice Golden Path가 동작한다.
- [ ] Save 후 Refresh Persistence가 동작한다.
- [ ] Relogin Persistence가 동작한다.
- [ ] Dashboard가 실제 DB 데이터를 사용한다.
- [ ] 지원 환경에서 실제 Push Subscription이 가능하다.
- [ ] Notification → Re-record Loop가 동작한다.

# 32. BLOCKER — Production Security Smoke
- [ ] HTTPS가 강제된다.
- [ ] Production Browser Direct Core Write가 실패한다.
- [ ] User A/B Cross Access가 실패한다.
- [ ] Internal Notification Endpoint가 Browser에서 보호된다.
- [ ] Frontend Bundle에 Server Secret이 없다.
- [ ] Raw Stack/DB Secret이 Error UI에 노출되지 않는다.
- [ ] AI/STT Provider Secret이 Client에 없다.
- [ ] Web Push Private Key가 Client에 없다.

# 33. BLOCKER — Backup / Rollback
- [ ] Production Migration 전 Backup/복구 경로를 확인했다.
- [ ] Migration 파일이 Version Control에 있다.
- [ ] 이전 App Build로 Rollback 가능한 경로가 있다.
- [ ] DB Migration 실패 시 대응 절차가 있다.
- [ ] Destructive Migration은 별도 검토했다.
- [ ] Notification Worker 변경 Rollback 경로가 있다.

# 34. BLOCKER — Release QA
09번 기준:

- [ ] P0 Runtime 100% PASS.
- [ ] S0 Critical Defect = 0.
- [ ] S1 Open Defect = 0.
- [ ] AI Safety Gate PASS.
- [ ] MUST API 21/21 PASS.
- [ ] 2-user Isolation PASS.
- [ ] Persistence PASS.
- [ ] Text Golden Path PASS.
- [ ] Voice Golden Path PASS.
- [ ] Notification Re-record PASS.
- [ ] External URL Smoke PASS.

# 35. REQUIRED — UI/UX
- [ ] 24 Screen ID가 구현/추적된다.
- [ ] 360px Layout을 확인했다.
- [ ] 390px Layout을 확인했다.
- [ ] 430px Layout을 확인했다.
- [ ] 주요 Touch Target이 약 44px 이상이다.
- [ ] Error 상태가 명확하다.
- [ ] Loading 중 Double Submit을 방지한다.
- [ ] Empty State가 가짜 User Data를 만들지 않는다.
- [ ] NO_HISTORY 문구가 이해 가능하다.
- [ ] NO_CYCLE 문구가 이해 가능하다.
- [ ] Status를 색상만으로 전달하지 않는다.

# 36. REQUIRED — Record UX
- [ ] AI Confirmation에서 Action/Date를 확인할 수 있다.
- [ ] IMPLICIT_TODAY 제안도 확인을 거친다.
- [ ] Item Matching Ambiguity를 사용자가 해결할 수 있다.
- [ ] Duplicate Warning이 있다.
- [ ] Create 직후 짧은 Undo UX를 제공한다면 실제 데이터 정책과 일치한다.
- [ ] Network Failure 시 입력을 가능한 범위에서 보존한다.
- [ ] Date 오류만 수정할 때 전체 입력을 다시 시작하지 않아도 된다.

# 37. REQUIRED — Data Quality
- [ ] Item Rename이 History를 삭제하지 않는다.
- [ ] Item Rename이 과거 Snapshot을 덮어쓰지 않는다.
- [ ] History가 최신순으로 보인다.
- [ ] Soft-deleted Activity가 기본 History에서 제외된다.
- [ ] Same-day Duplicate를 완전히 금지하지 않고 명시적 추가를 허용할 수 있다.
- [ ] Alias가 동일 Item에 불필요하게 중복되지 않는다.

# 38. REQUIRED — Validation / Input Security
- [ ] AI Input Length 제한이 있다.
- [ ] Item Name Length 제한이 있다.
- [ ] cycle_days 0/음수를 차단한다.
- [ ] Invalid Timezone을 차단한다.
- [ ] Malformed UUID를 안전하게 처리한다.
- [ ] Malformed Date를 안전하게 처리한다.
- [ ] Search Input이 SQL Injection을 일으키지 않는다.
- [ ] Item Name 출력이 XSS를 실행하지 않는다.

# 39. REQUIRED — Date / Timezone
- [ ] User Timezone 기준 current_local_date를 사용한다.
- [ ] 초기 Asia/Seoul 동작을 확인한다.
- [ ] 자정 경계에서 날짜가 틀어지지 않는다.
- [ ] `지난 토요일`은 nearest Saturday strictly before current date 규칙을 따른다.
- [ ] 완료문 월/일 무연도는 most recent non-future occurrence를 제안한다.
- [ ] Approximate Date를 AI가 임의 Exact Date로 발명하지 않는다.

# 40. REQUIRED — Observability
- [ ] Request ID로 주요 Server Error를 추적할 수 있다.
- [ ] AI Provider Failure를 확인할 수 있다.
- [ ] STT Provider Failure를 확인할 수 있다.
- [ ] Notification Reconcile/Dispatch Failure를 확인할 수 있다.
- [ ] Log에 Secret을 남기지 않는다.
- [ ] 생활 원문을 필요 이상으로 Log하지 않는다.

# 41. REQUIRED — Rate / Retry
- [ ] AI 호출에 Rate/Usage 보호가 있다.
- [ ] STT 호출에 Rate/Usage 보호가 있다.
- [ ] AI Timeout이 무한 대기하지 않는다.
- [ ] AI 교정 Retry가 최대 1회다.
- [ ] Notification Worker Retry가 무한 반복되지 않는다.
- [ ] Expired Push Subscription을 처리한다.

# 42. REQUIRED — Notification Reconciliation
- [ ] Cycle 변경 후 Delivery가 현재 상태와 동기화된다.
- [ ] Activity Date 수정 후 동기화된다.
- [ ] Activity Item 이동 후 양쪽 Item이 동기화된다.
- [ ] Latest Activity 삭제 후 동기화된다.
- [ ] New Completion 후 옛 Delivery가 현재 상태를 오염시키지 않는다.

# 43. REQUIRED — External Mobile
실제 Mobile Browser에서 확인한다.

- [ ] Keyboard Input
- [ ] Microphone Permission
- [ ] Voice Recording
- [ ] STT
- [ ] Push Permission
- [ ] Notification Click
- [ ] Touch Interaction
- [ ] 화면 Rotation/Resize에서 Core Flow가 붕괴하지 않음

# 44. REQUIRED — Environment
- [ ] LOCAL 환경이 분리되어 있다.
- [ ] PREVIEW/STAGING 환경이 있다.
- [ ] PRODUCTION 환경이 분리되어 있다.
- [ ] Production Secret을 Preview에 무분별하게 공유하지 않는다.
- [ ] `.env.example`에는 실제 Secret이 없다.
- [ ] Production DB와 Test Fixture를 혼동하지 않는다.

# 45. REQUIRED — Migration
- [ ] Migration이 순서대로 재적용 가능하다.
- [ ] Dashboard 수동 수정만으로 Schema 상태를 유지하지 않는다.
- [ ] Migration 전후 기존 데이터 영향을 확인한다.
- [ ] Migration 실패 시 Partial Unknown State를 방치하지 않는다.
- [ ] 필요한 Forward Fix/Rollback 전략을 기록한다.

# 46. REQUIRED — Codex / Repository
- [ ] `/docs`에 Freeze된 01~12 문서를 둔다.
- [ ] `AGENTS.md`가 있다.
- [ ] `README.md`가 있다.
- [ ] `.env.example`이 있다.
- [ ] Codex가 Core/SHOULD 구분을 따른다.
- [ ] Codex가 Test 실패를 삭제로 해결하지 않는다.
- [ ] 예상 외 Dependency 추가를 Review한다.
- [ ] 예상 외 Migration/Security 변경을 Review한다.
- [ ] Typecheck/Lint/Test 명령이 실제 Repository Script와 일치한다.

# 47. REQUIRED — Test Evidence
P0 Test에는 가능한 경우 다음을 기록한다.

- [ ] 실행일
- [ ] Environment
- [ ] Build/Commit
- [ ] Tester
- [ ] Request/Response
- [ ] DB Side Effect
- [ ] Screenshot/Video
- [ ] Error Code
- [ ] Defect ID

# 48. RECOMMENDED / SHOULD — Record Restore
- [ ] Deleted Activity Restore를 구현했거나 N/A로 명시했다.
- [ ] Restore 시 Lifecycle을 재계산한다.
- [ ] Restore가 Duplicate/Ownership 규칙을 우회하지 않는다.

# 49. RECOMMENDED / SHOULD — Item Archive / Restore
- [ ] Item Archive를 구현했거나 N/A로 명시했다.
- [ ] Archive가 History를 삭제하지 않는다.
- [ ] Archived Item Restore를 구현했거나 N/A로 명시했다.
- [ ] ARCHIVED Item은 기본 Dashboard에서 제외된다.

# 50. RECOMMENDED / SHOULD — Item Merge
- [ ] Duplicate Item Merge를 구현했거나 N/A로 명시했다.
- [ ] Merge가 Activity History를 손실하지 않는다.
- [ ] Cross-user Merge를 차단한다.
- [ ] Merge 중 실패 시 Partial Merge가 없다.

# 51. RECOMMENDED / SHOULD — Item Notification Settings
- [ ] 상세 Item Notification Setting을 구현했거나 N/A로 명시했다.
- [ ] Device Permission과 Item Setting을 혼동하지 않는다.
- [ ] 설정 변경이 Reconcile에 반영된다.

# 52. RECOMMENDED — Accessibility
- [ ] Keyboard Focus를 확인했다.
- [ ] Form Label을 확인했다.
- [ ] Error가 Screen Reader에 전달 가능한 구조인지 확인했다.
- [ ] Contrast를 확인했다.
- [ ] Motion이 핵심 정보 이해를 방해하지 않는다.

# 53. RECOMMENDED — Browser Matrix
- [ ] iOS Safari에서 Core Flow 확인.
- [ ] Android Chrome에서 Core Flow 확인.
- [ ] Desktop Chrome에서 확인.
- [ ] 지원되지 않는 Voice/Push 환경에 Fallback/안내가 있다.

# 54. RECOMMENDED — User Test
- [ ] 실제 외부 사용자가 자연어 기록을 시도했다.
- [ ] AI Confirmation 이해도를 관찰했다.
- [ ] “마지막으로 언제 했는지” 정보의 유용성을 확인했다.
- [ ] Cycle 설정 난이도를 확인했다.
- [ ] Dashboard의 관리 우선순위를 이해하는지 확인했다.
- [ ] Notification 후 Re-record가 자연스러운지 확인했다.
- [ ] 요청 기능을 즉시 Core Scope로 편입하지 않고 Issue로 기록했다.

# 55. RECOMMENDED — Known Limitations
- [ ] 미구현 SHOULD를 명시한다.
- [ ] Browser별 Voice/Push 제한을 명시한다.
- [ ] Prototype에서 지원하지 않는 기능을 명시한다.
- [ ] Dummy/Mock가 남아 있다면 사용자에게 실제 기능처럼 보이지 않게 한다.

# 56. NO-GO 판정표
다음 조건은 **체크하는 긍정 항목이 아니라 Release 금지 조건**이다. 하나라도 TRUE면 배포하지 않는다.

| NO-GO | 반드시 FALSE여야 함 |
|---|---|
| False Completion 발생 | FALSE |
| Cross-user Read/Write 가능 | FALSE |
| Activity History 손실 | FALSE |
| Partial Multi-save | FALSE |
| Future completed Activity 저장 | FALSE |
| DB 성공 전 Success UI | FALSE |
| Browser Direct Core Write 가능 | FALSE |
| Server Secret Client 노출 | FALSE |
| Wrong-user Notification | FALSE |
| External Golden Path 붕괴 | FALSE |
| S0 Defect 존재 | FALSE |
| S1 Open Defect 존재 | FALSE |

# 57. Release Sign-off
Release 직전 아래를 실제 결과로 채운다.

```text
Build/Commit:
Environment:
External URL:
AI Provider/Model:
AI Prompt Version:
STT Provider:
DB Migration Version:
P0 PASS:
P0 FAIL:
S0:
S1 Open:
MUST API Smoke:
AI100:
2-user Isolation:
Voice:
Push/Re-record:
Backup:
Rollback:
Final Decision: GO / NO-GO
Reviewer:
Date:
```

# 58. Final GO 조건
`GO`는 다음 조건에서만 가능하다.

- Core MUST 25 실제 구현
- BLOCKER/P0 Runtime 100% PASS
- AI100 Safety PASS
- MUST API 21/21 PASS
- 2-user Isolation PASS
- Persistent DB PASS
- Voice/STT PASS
- Notification/Re-record PASS
- External Deployment PASS
- NO-GO 조건 전부 FALSE

# 59. Checklist 사용 규칙
1. 구현 전에 미리 PASS 표시하지 않는다.
2. Static Spec 검증과 Runtime 검증을 구분한다.
3. Mock Test만으로 External Runtime PASS를 선언하지 않는다.
4. SHOULD 미구현을 Core Failure로 만들지 않는다.
5. 반대로 Security/Data Integrity 항목을 SHOULD로 낮추지 않는다.
6. 실패를 숨기기 위해 Checklist 항목을 삭제하지 않는다.
7. Ground Truth를 임의 변경해 Test를 통과시키지 않는다.
8. 실제 Evidence와 함께 최종 판정한다.

# 60. 현재 Release 판정
현재는 구현 전 Specification 단계이므로:

```text
FINAL DECISION = NO-GO
REASON = Runtime verification not yet executed
```

이는 설계 실패가 아니라 아직 개발·Runtime QA·외부 배포 검증 전이라는 의미다.

---
## v1.1 Final Sync 요약

- Core MUST 25: 반영
- P0 / REQUIRED / SHOULD 계층화: 반영
- 1,000개 이상 동일가중 체크 방식 제거
- False Completion: BLOCKER
- 2-user Isolation: BLOCKER
- DB-HARDEN-001: BLOCKER
- Activity History Integrity: BLOCKER
- Multi-record Atomicity: BLOCKER
- UNKNOWN / IMPLICIT_TODAY / Manual Record: 반영
- NO_HISTORY: 반영
- Voice/STT: 실제 Runtime 기준
- Device Notification / Stale Notification: 반영
- Snooze 1/3/7: 반영
- MUST API 21/21: Release Gate
- Restore / Archive / Merge / 상세 Notification Setting: SHOULD 비차단
- NO-GO 문구를 긍정 Checkbox와 분리
- Runtime Verification: 아직 미실행
- 현재 Release Decision: NO-GO
