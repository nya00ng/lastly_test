# LASTLY QA / Test Case Specification
## AI 생활주기 기억 웹앱
**QA Specification v1.1 — Final Sync Baseline**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 기준 문서 | 01~08 v1.1 FINAL |
| 총 Test Case | 230 |
| 우선순위 | P0 Release Blocker / P1 Required Regression / P2 SHOULD |
| 상태 | **STATIC VALIDATED / RUNTIME NOT YET EXECUTED** |

# 1. 목적
LASTLY Prototype의 실제 AI, DB, Auth, 사용자 분리, Voice/STT, Notification, Persistence, External Deployment를 검증한다.

# 2. 우선순위
- **P0:** Release Blocker. 100% Runtime PASS 필요.
- **P1:** Required Regression.
- **P2:** SHOULD / Non-blocking. 미구현만으로 Core Release를 차단하지 않는다.

# 3. Core Release Gate
P0 100%, S0=0, S1 open=0, AI Safety PASS, **MUST API 21/21**, 2-user Isolation, DB-HARDEN-001, Persistence, Text/Voice Golden Path, 실제 Notification Re-record, External HTTPS, False Completion 0, Partial Multi-save 0.

# 4. SHOULD 범위
Record Restore, Item Archive/Restore, Item Merge, 상세 Item Notification Setting은 SHOULD이며 Core Release Blocker가 아니다.

# 5. Safety
`PLANNED / NOT_COMPLETED / UNCERTAIN / QUERY / UNKNOWN / OUT_OF_SCOPE / scope UNCERTAIN / needs_clarification / future date`는 확정 Activity 후보가 될 수 없다.

# 6. Environment / Evidence
LOCAL → PREVIEW/STAGING → PRODUCTION-LIKE. `tester_a`, `tester_b`로 Isolation을 검증한다. P0는 Build/Commit, 환경, Request/Response, DB Side Effect, Screenshot/Video, Error/Defect ID를 가능한 범위에서 남긴다.

# 7. AI100
08번 Ground Truth 100건을 실제 Provider로 전체 실행한다. Static Dataset 검증을 Runtime AI PASS로 간주하지 않는다.

# 8. Test Cases

## QA-001 — 로그인 성공
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `로그인 성공` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-002 — 로그아웃 후 Private 접근 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `로그아웃 후 Private 접근 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-003 — 세션 만료 Write 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `세션 만료 Write 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-004 — 재로그인 Persistence
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `재로그인 Persistence` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-005 — 2-user Item Read 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `2-user Item Read 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-006 — 2-user Activity Read 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `2-user Activity Read 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-007 — 2-user Item Write 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `2-user Item Write 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-008 — 2-user Activity Write 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `2-user Activity Write 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-009 — Browser Direct Core Write 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Browser Direct Core Write 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-010 — Service Role Secret 비노출
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Service Role Secret 비노출` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-011 — 명확한 COMPLETED 분석
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `명확한 COMPLETED 분석` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-012 — IMPLICIT_TODAY 확인
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `IMPLICIT_TODAY 확인` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-013 — PLANNED 저장 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `PLANNED 저장 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-014 — NOT_COMPLETED 저장 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `NOT_COMPLETED 저장 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-015 — QUERY 저장 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `QUERY 저장 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-016 — UNKNOWN 저장 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `UNKNOWN 저장 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-017 — OUT_OF_SCOPE 저장 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `OUT_OF_SCOPE 저장 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-018 — Scope UNCERTAIN 확인
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Scope UNCERTAIN 확인` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-019 — Completion UNCERTAIN 확인
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Completion UNCERTAIN 확인` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-020 — Approximate Date 정확화 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Approximate Date 정확화 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-021 — Future Completion 저장 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Future Completion 저장 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-022 — Parser TARGET 선택 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Parser TARGET 선택 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-023 — Item Matching MULTIPLE 사용자 선택
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Item Matching MULTIPLE 사용자 선택` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-024 — Item Matching NONE 신규 Item 제안
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Item Matching NONE 신규 Item 제안` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-025 — Alias Match
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Alias Match` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-026 — Fuzzy 자동연결 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Fuzzy 자동연결 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-027 — AI 결과 편집 후 재검증
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI 결과 편집 후 재검증` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-028 — AI 거절→Manual Record Flow
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI 거절→Manual Record Flow` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-029 — PLANNED 오판→Manual Flow
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `PLANNED 오판→Manual Flow` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-030 — OUT_OF_SCOPE 오판→Manual Flow
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `OUT_OF_SCOPE 오판→Manual Flow` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-031 — 5개 행동 분리
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `5개 행동 분리` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-032 — 6개 행동 TOO_MANY_ACTIONS
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `6개 행동 TOO_MANY_ACTIONS` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-033 — 6개 행동 부분 저장 0
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `6개 행동 부분 저장 0` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-034 — 완료+미완료 MIXED
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `완료+미완료 MIXED` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-035 — 완료+QUERY MIXED
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `완료+QUERY MIXED` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-036 — 부정문 False Completion 방지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `부정문 False Completion 방지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-037 — AI Provider 실패 fallback
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI Provider 실패 fallback` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-038 — AI Timeout fallback
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI Timeout fallback` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-039 — AI Invalid JSON 저장 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI Invalid JSON 저장 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-040 — AI Semantic Invalid 저장 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI Semantic Invalid 저장 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-041 — AI100 False Completion 0
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI100 False Completion 0` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-042 — AI100 Forbidden Candidate 0
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI100 Forbidden Candidate 0` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-043 — AI100 Intent >=98%
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI100 Intent >=98%` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-044 — AI100 Scope >=97%
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI100 Scope >=97%` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-045 — 신규 Item+Activity Atomic Save
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `신규 Item+Activity Atomic Save` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-046 — 기존 Item Activity Save
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `기존 Item Activity Save` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-047 — DB 성공 전 Success 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `DB 성공 전 Success 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-048 — 새로고침 Persistence
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `새로고침 Persistence` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-049 — 재로그인 Persistence
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `재로그인 Persistence` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-050 — Activity History 누적
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Activity History 누적` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-051 — Last Performed 계산
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Last Performed 계산` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-052 — 과거 Activity 추가 시 Last 불변
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `과거 Activity 추가 시 Last 불변` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-053 — Future Date API 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Future Date API 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-054 — Future Date DB Trigger 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Future Date DB Trigger 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-055 — Same-day Duplicate 경고
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Same-day Duplicate 경고` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-056 — Duplicate 승인 후 실제 추가
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Duplicate 승인 후 실제 추가` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-057 — Idempotency Retry 중복 0
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Idempotency Retry 중복 0` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-058 — Parse Segment Retry 중복 0
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Parse Segment Retry 중복 0` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-059 — 2건 Atomic Save
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `2건 Atomic Save` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-060 — 3건 중 1건 실패 전체 Rollback
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `3건 중 1건 실패 전체 Rollback` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-061 — Record Date Edit
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Record Date Edit` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-062 — Record Item Move
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Record Item Move` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-063 — Cross-user Move 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Cross-user Move 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-064 — Snapshot 일반 편집 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Snapshot 일반 편집 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-065 — Original Text 일반 편집 금지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Original Text 일반 편집 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-066 — Latest Activity Delete
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Latest Activity Delete` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-067 — Only Activity Delete→NO_HISTORY
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Only Activity Delete→NO_HISTORY` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-068 — 삭제 기록 기본 History 제외
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `삭제 기록 기본 History 제외` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-069 — NO_HISTORY next_due null
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `NO_HISTORY next_due null` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-070 — Manual Record Save
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Manual Record Save` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-071 — Manual Future Date 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Manual Future Date 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-072 — Manual Cross-user Item 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Manual Cross-user Item 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-073 — 빈 Item Name 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `빈 Item Name 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-074 — Activity 실패 시 빈 신규 Item 잔존 0
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Activity 실패 시 빈 신규 Item 잔존 0` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-075 — NO_HISTORY 계산
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `NO_HISTORY 계산` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-076 — NO_CYCLE 계산
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `NO_CYCLE 계산` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-077 — NORMAL 계산
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `NORMAL 계산` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-078 — UPCOMING 7일=2일
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `UPCOMING 7일=2일` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-079 — UPCOMING 28일=5일
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `UPCOMING 28일=5일` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-080 — UPCOMING 90일=5일
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `UPCOMING 90일=5일` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-081 — DUE 경계 today==next_due
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `DUE 경계 today==next_due` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-082 — DUE overdue
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `DUE overdue` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-083 — Next Due 계산
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Next Due 계산` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-084 — 조기 완료 Cycle Restart
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `조기 완료 Cycle Restart` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-085 — 늦은 완료 Cycle Restart
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `늦은 완료 Cycle Restart` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-086 — Cycle 설정
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Cycle 설정` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-087 — Cycle 제거→NO_CYCLE
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Cycle 제거→NO_CYCLE` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-088 — Cycle 존재+History 없음→NO_HISTORY
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Cycle 존재+History 없음→NO_HISTORY` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-089 — Dashboard DUE 포함
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Dashboard DUE 포함` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-090 — Dashboard UPCOMING 포함
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Dashboard UPCOMING 포함` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-091 — Dashboard NORMAL 포함
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Dashboard NORMAL 포함` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-092 — Dashboard NO_HISTORY 제외
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Dashboard NO_HISTORY 제외` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-093 — Dashboard NO_CYCLE 제외
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Dashboard NO_CYCLE 제외` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-094 — Dashboard DUE 정렬
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Dashboard DUE 정렬` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-095 — Dashboard UPCOMING 정렬
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Dashboard UPCOMING 정렬` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-096 — All Management NO_HISTORY 포함
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `All Management NO_HISTORY 포함` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-097 — All Management NO_CYCLE 포함
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `All Management NO_CYCLE 포함` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-098 — Voice Listening
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Voice Listening` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-099 — 실제 STT 변환
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `실제 STT 변환` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-100 — STT Transcript 표시
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `STT Transcript 표시` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-101 — STT Transcript 수정
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `STT Transcript 수정` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-102 — STT→AI
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `STT→AI` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-103 — STT 실패 Text fallback
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `STT 실패 Text fallback` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-104 — 마이크 권한 거부 Text 사용
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `마이크 권한 거부 Text 사용` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-105 — 빈 음성 저장 없음
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `빈 음성 저장 없음` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-106 — Voice Golden Path
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Voice Golden Path` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-107 — Voice NOT_COMPLETED Safety
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Voice NOT_COMPLETED Safety` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-108 — Voice QUERY Safety
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Voice QUERY Safety` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-109 — DUE Notification 대상
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `DUE Notification 대상` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-110 — NO_CYCLE Notification 제외
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `NO_CYCLE Notification 제외` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-111 — NO_HISTORY Notification 제외
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `NO_HISTORY Notification 제외` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-112 — Push 권한 거부 앱 사용 가능
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Push 권한 거부 앱 사용 가능` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-113 — Device Subscription 등록
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Device Subscription 등록` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-114 — Cross-user Subscription 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Cross-user Subscription 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-115 — Push Dispatch
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Push Dispatch` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-116 — Push 실패 Activity 불변
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Push 실패 Activity 불변` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-117 — Notification Landing 최신 조회
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Notification Landing 최신 조회` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-118 — Stale Notification 감지
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Stale Notification 감지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-119 — Stale 완료 Action 없음
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Stale 완료 Action 없음` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-120 — 오늘 했어요 Activity 추가
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `오늘 했어요 Activity 추가` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-121 — 오늘 했어요 History 보존
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `오늘 했어요 History 보존` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-122 — 오늘 했어요 Next Due 갱신
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `오늘 했어요 Next Due 갱신` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-123 — 다른 날 했어요 과거 날짜 저장
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `다른 날 했어요 과거 날짜 저장` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-124 — 다른 날 미래 날짜 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `다른 날 미래 날짜 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-125 — Snooze 1일
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Snooze 1일` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-126 — Snooze 3일
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Snooze 3일` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-127 — Snooze 7일
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Snooze 7일` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-128 — Snooze 2일 조작 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Snooze 2일 조작 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-129 — Snooze 후 새 Activity old delivery 무효화
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Snooze 후 새 Activity old delivery 무효화` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-130 — New Completion old pending 무효화
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `New Completion old pending 무효화` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-131 — Notification Double Tap Idempotency
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Notification Double Tap Idempotency` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-132 — Wrong-user Delivery 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Wrong-user Delivery 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-133 — Notification Permission 맥락 요청
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Notification Permission 맥락 요청` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-134 — Device 상태와 Item Setting 분리
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Device 상태와 Item Setting 분리` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-135 — Push Payload 최소화
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Push Payload 최소화` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-136 — MUST API 21/21 Smoke
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `MUST API 21/21 Smoke` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-137 — External HTTPS
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `External HTTPS` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-138 — External Login
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `External Login` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-139 — External Text Golden Path
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `External Text Golden Path` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-140 — External Voice Golden Path
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `External Voice Golden Path` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-141 — External Refresh Persistence
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `External Refresh Persistence` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-142 — External Relogin Persistence
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `External Relogin Persistence` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-143 — External Dashboard
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `External Dashboard` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-144 — External Push Subscription
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `External Push Subscription` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-145 — External Notification Re-record Loop
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `External Notification Re-record Loop` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-146 — Production Direct Write 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Production Direct Write 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-147 — Production 2-user Isolation
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Production 2-user Isolation` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-148 — Internal Endpoint Browser 차단
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Internal Endpoint Browser 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-149 — Production Bundle Secret 없음
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Production Bundle Secret 없음` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-150 — DB Migration/RLS/Hardening 적용
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `DB Migration/RLS/Hardening 적용` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-151 — Backup/Rollback 준비
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Backup/Rollback 준비` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-152 — Error UI Raw Stack 미노출
- **Priority:** P0
- **Area:** CORE / SAFETY / RELEASE
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Error UI Raw Stack 미노출` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-153 — Empty State 첫 기록 유도
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Empty State 첫 기록 유도` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-154 — All Management 검색
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `All Management 검색` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-155 — Item Detail History 진입
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Item Detail History 진입` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-156 — Record Edit 취소
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Record Edit 취소` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-157 — Record Delete 확인 UI
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Record Delete 확인 UI` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-158 — Create Undo UI
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Create Undo UI` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-159 — Undo 약 10초
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Undo 약 10초` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-160 — Dashboard Empty
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Dashboard Empty` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-161 — NO_HISTORY Copy
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `NO_HISTORY Copy` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-162 — NO_CYCLE Copy
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `NO_CYCLE Copy` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-163 — 44px Touch Target
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `44px Touch Target` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-164 — 360px Layout
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `360px Layout` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-165 — 390px Layout
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `390px Layout` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-166 — 430px Layout
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `430px Layout` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-167 — Keyboard Input
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Keyboard Input` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-168 — Loading 중 Double Submit 방지
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Loading 중 Double Submit 방지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-169 — Network Fail 입력 보존
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Network Fail 입력 보존` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-170 — Date Fail 부분 수정
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Date Fail 부분 수정` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-171 — Item Match Fail→New Item
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Item Match Fail→New Item` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-172 — Alias 동일 Item 중복 방지
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Alias 동일 Item 중복 방지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-173 — 동일 Alias 복수 Target Ambiguity
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `동일 Alias 복수 Target Ambiguity` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-174 — Activity Pagination
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Activity Pagination` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-175 — Items Pagination
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Items Pagination` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-176 — Dashboard Private Cache
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Dashboard Private Cache` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-177 — Request ID Error Trace
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Request ID Error Trace` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-178 — AI Input 500자 제한
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI Input 500자 제한` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-179 — Item Name 100자 제한
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Item Name 100자 제한` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-180 — Cycle 0 차단
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Cycle 0 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-181 — Cycle 음수 차단
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Cycle 음수 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-182 — Invalid Timezone 차단
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Invalid Timezone 차단` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-183 — Asia/Seoul 자정 경계
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Asia/Seoul 자정 경계` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-184 — 지난 토요일 규칙
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `지난 토요일 규칙` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-185 — 무연도 월일 most-recent non-future
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `무연도 월일 most-recent non-future` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-186 — Parser Log와 Activity 분리
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Parser Log와 Activity 분리` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-187 — AI Log Ownership
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI Log Ownership` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-188 — Push Key Log 금지
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Push Key Log 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-189 — Provider Key Frontend 금지
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Provider Key Frontend 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-190 — AI Rate Limit
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI Rate Limit` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-191 — STT Rate Limit
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `STT Rate Limit` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-192 — Malformed UUID
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Malformed UUID` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-193 — Malformed Date
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Malformed Date` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-194 — Search SQL Injection 방어
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Search SQL Injection 방어` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-195 — XSS Item Name 방어
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `XSS Item Name 방어` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-196 — Notification Retry Bound
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Notification Retry Bound` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-197 — Expired Push Subscription
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Expired Push Subscription` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-198 — Delivery Idempotency
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Delivery Idempotency` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-199 — Activity Save 후 Notification Fail 시 Activity 유지
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Activity Save 후 Notification Fail 시 Activity 유지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-200 — Cycle Change Reconcile
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Cycle Change Reconcile` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-201 — Record Date Edit Reconcile
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Record Date Edit Reconcile` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-202 — Record Move Reconcile
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Record Move Reconcile` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-203 — Delete Latest Reconcile
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Delete Latest Reconcile` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-204 — 마이크 거부 Text Fallback
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `마이크 거부 Text Fallback` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-205 — Onboarding Example DB 저장 금지
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Onboarding Example DB 저장 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-206 — QUERY Detection Save 오작동 금지
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `QUERY Detection Save 오작동 금지` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-207 — 임의 Lifestyle Score 없음
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `임의 Lifestyle Score 없음` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-208 — AI Authoritative Cycle 없음
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `AI Authoritative Cycle 없음` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-209 — Lifecycle View RLS
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Lifecycle View RLS` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-210 — Soft-deleted Last 제외
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Soft-deleted Last 제외` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-211 — Item Rename History 보존
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Item Rename History 보존` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-212 — Item Rename Snapshot 불변
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Item Rename Snapshot 불변` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-213 — History 최신순
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `History 최신순` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-214 — Snooze Calendar Day
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Snooze Calendar Day` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-215 — Multiple Device Subscription
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Multiple Device Subscription` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-216 — Logout One Device
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Logout One Device` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-217 — 첫 진입 Push 강제 Prompt 없음
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `첫 진입 Push 강제 Prompt 없음` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-218 — QUERY query_type 필수
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `QUERY query_type 필수` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-219 — EXACT resolved_date 필수
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `EXACT resolved_date 필수` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-220 — Clarification Consistency
- **Priority:** P1
- **Area:** REQUIRED REGRESSION
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Clarification Consistency` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-221 — Record Restore [SHOULD]
- **Priority:** P2
- **Area:** SHOULD / NON-BLOCKING
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Record Restore [SHOULD]` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-222 — Restore Duplicate Guard [SHOULD]
- **Priority:** P2
- **Area:** SHOULD / NON-BLOCKING
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Restore Duplicate Guard [SHOULD]` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-223 — Item Archive [SHOULD]
- **Priority:** P2
- **Area:** SHOULD / NON-BLOCKING
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Item Archive [SHOULD]` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-224 — Archived Item Restore [SHOULD]
- **Priority:** P2
- **Area:** SHOULD / NON-BLOCKING
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Archived Item Restore [SHOULD]` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-225 — Item Merge [SHOULD]
- **Priority:** P2
- **Area:** SHOULD / NON-BLOCKING
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Item Merge [SHOULD]` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-226 — Cross-user Merge 차단 [SHOULD]
- **Priority:** P2
- **Area:** SHOULD / NON-BLOCKING
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Cross-user Merge 차단 [SHOULD]` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-227 — Merge Transaction Rollback [SHOULD]
- **Priority:** P2
- **Area:** SHOULD / NON-BLOCKING
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Merge Transaction Rollback [SHOULD]` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-228 — Item Notification Setting GET [SHOULD]
- **Priority:** P2
- **Area:** SHOULD / NON-BLOCKING
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Item Notification Setting GET [SHOULD]` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-229 — Item Notification Setting PATCH [SHOULD]
- **Priority:** P2
- **Area:** SHOULD / NON-BLOCKING
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Item Notification Setting PATCH [SHOULD]` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

## QA-230 — Archive UI [SHOULD]
- **Priority:** P2
- **Area:** SHOULD / NON-BLOCKING
- **Precondition:** 해당 기능 및 필요한 Fixture가 준비되어 있다.
- **Steps:** 제목의 조건을 실제 UI/API/DB 경로에서 실행하고 필요한 경우 우회 요청도 시도한다.
- **Expected:** `Archive UI [SHOULD]` 계약이 v1.1 기준과 일치하고 데이터/보안 무결성을 깨뜨리지 않는다.
- **Runtime Evidence:** 실행 시 기록

# 9. Screen Coverage
`S00 S01 S02 S10 S11 S12 S13 S14 S15 S16 S17 S20 S21 S22 S23 S24 S25 S30 S31 S32 S33 S40 S41 S50` — 24/24.

# 10. DB Coverage
`profiles`, `management_items`, `activity_records`, `item_aliases`, `notification_settings`, `ai_parse_logs`, `ai_parse_segments`, `push_subscriptions`, `notification_deliveries` — 9/9. RLS, Composite FK, Future Date Trigger, Idempotency, DB-HARDEN-001을 Runtime 검증한다.

# 11. API Coverage
Core Gate는 **MUST API 21/21**이다. SHOULD 6 Endpoint는 구현 범위에서 Regression하며 Core Gate에 포함하지 않는다.

# 12. Lifecycle Coverage
`ARCHIVED / NO_HISTORY / NO_CYCLE / NORMAL / UPCOMING / DUE`.

# 13. Notification Coverage
현재 Device Permission/Subscription, DUE Delivery, Stale Notification, 오늘 했어요, 다른 날 했어요, **Snooze 1/3/7**, 새 Activity 이후 old Delivery 무효화를 검증한다. S41은 가짜 Global Service Boolean이 아니다.

# 14. Atomicity / Overflow
2~5개 Record는 All-or-Nothing. 한 건 실패 시 전체 Rollback. 6개 초과 입력은 `TOO_MANY_ACTIONS`이며 부분 저장하지 않는다.

# 15. Manual Record Flow
AI 실패/거절/오판 시 Parser Segment를 몰래 COMPLETED로 변조하지 않는다. Manual Flow에서도 Action, Exact Date, Scope, Ownership, Future Date, Duplicate, Idempotency 규칙을 동일하게 적용한다.

# 16. Defect Severity
- S0: 데이터 유출/손실, False Completion, Secret 노출, 핵심 무결성 붕괴
- S1: Core Golden Path 중단
- S2: 주요 오류이나 우회 가능
- S3: 경미한 UI/Copy

# 17. Stop-the-Line
False Completion, Cross-user Read/Write, Activity History Loss, False Success UI, Partial Multi-save, Future Activity 저장, Browser Direct Core Write, Secret 노출, Wrong-user Notification, External Golden Path 붕괴 시 Release 중단.

# 18. Runtime 상태
현재는 `STATIC VALIDATED`. 실제 앱에서 실행하기 전 Runtime PASS를 선언하지 않는다.

# 19. Codex 절대 규칙
1. SHOULD 때문에 P0를 늘리지 않는다.
2. 실패 Test를 삭제해 PASS율을 높이지 않는다.
3. False Completion을 평균 Accuracy로 상쇄하지 않는다.
4. Mock 성공을 Runtime PASS로 기록하지 않는다.
5. 2-user Isolation을 단일 사용자 Test로 대체하지 않는다.
6. 가짜 Push 화면을 실제 Notification PASS로 기록하지 않는다.
7. Dummy Data를 Persistence PASS로 기록하지 않는다.
8. P2 미구현을 Core 실패로 판정하지 않는다.
9. Test 실패를 Ground Truth 임의 변경으로 해결하지 않는다.
10. 실제 Evidence 없이 Release Gate PASS를 선언하지 않는다.

# 20. Final Completion Rule
`Core 25 MUST + P0 Runtime 100% + AI Safety + MUST API 21/21 + 2-user Isolation + Persistence + Voice/STT + Push/Re-record + External Deployment`가 실제 PASS해야 Prototype 완료다.

---
**TOTAL:** 230  
**P0:** 152  
**P1:** 68  
**P2:** 10  
**SHOULD Release Blocking:** 없음  
**NO_HISTORY / UNKNOWN / Manual Record / TOO_MANY_ACTIONS / Atomic Multi-save / Stale Notification / Device Notification / Snooze 1/3/7:** 반영  
**Runtime QA:** 아직 미실행
