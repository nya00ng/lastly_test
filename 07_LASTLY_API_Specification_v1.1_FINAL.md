# LASTLY API Specification
## AI 생활주기 기억 웹앱
**API Spec v1.1 — Final Sync Baseline**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 문서 | API Specification |
| 기준 문서 | 01 PRD v1.1 FINAL / 02 BRS v1.1 FINAL / 03 UFS v1.1 FINAL / 04 UI·UX FS v1.1 FINAL / 05 AI Parser v1.1 FINAL / 06 DB·ERD v1.1 FINAL |
| 제품 형태 | Mobile-first Web App / PWA |
| Backend Pattern | Application API / BFF |
| DB/Auth | Supabase PostgreSQL / Supabase Auth |
| 기준일 | 2026.08.31 |
| 문서 상태 | **Development Baseline — Final Sync** |

---

# 1. 문서 목적

이 문서는 LASTLY Prototype의 Frontend ↔ Application API/BFF ↔ Supabase 사이의 실제 통신 계약을 고정한다.

정의 범위:

- 인증
- STT
- AI Parse
- Parse Clarification Resolution
- Item Matching
- Record Create/Edit/Delete
- Dashboard
- All Management
- Item Detail
- Activity History
- Cycle
- Quick Complete
- Notification
- Push Subscription
- Snooze
- Worker/Internal Endpoint
- Ownership
- Duplicate Guard
- Idempotency
- Transaction
- 오류 계약
- MUST / SHOULD Endpoint 구분
- Core Release Gate
- Codex 구현 절대 규칙

---

# 2. API 설계 핵심 원칙

## API-P01 — Canonical Write Path

Production Prototype의 Core Write는 Application API/BFF를 통해서만 수행한다.

Browser가 Supabase Core Table을 직접 INSERT/UPDATE/DELETE하지 않는다.

## API-P02 — 사용자 사실 우선

AI 결과가 아니라 사용자가 최종 확인한 사실만 Activity로 저장한다.

## API-P03 — Parser와 Item Matching 분리

AI Parser는 Item ID를 선택하지 않는다.

## API-P04 — Record Candidate는 서버 파생

AI Provider가 `record_candidate`를 결정하지 않는다.

## API-P05 — False Completion 방지

PLANNED / NOT_COMPLETED / QUERY / UNKNOWN / OUT_OF_SCOPE는 AI Parse 결과에서 직접 완료 Record로 승격하지 않는다.

## API-P06 — Manual Record는 별도 경로

AI가 틀렸거나 실패하면 사용자 확정값으로 Manual Record를 만든다.

## API-P07 — Idempotency

Retry, Double Click, 동일 Parse Segment 재전송으로 중복 Activity가 생기면 안 된다.

## API-P08 — Ownership

다른 사용자 Resource 접근은 일반적으로 404로 응답하여 존재 여부를 노출하지 않는다.

## API-P09 — DB 성공 전 Success 금지

실제 Transaction Commit 전 Success Response를 반환하지 않는다.

## API-P10 — SHOULD Endpoint는 Core Gate와 분리

Archive / Restore / Merge / Item-level Notification Setting은 SHOULD다.

---

# 3. Base URL

예:

```text
/api
```

실제 Hosting Provider에 따라 Prefix는 변경 가능하지만 Endpoint 의미 계약은 유지한다.

---

# 4. Authentication

Private Endpoint는 Supabase Auth Session/JWT를 사용한다.

Server는 Token을 검증하여 실제 Auth User ID를 얻는다.

Client Request Body의 `user_id`는 신뢰하지 않는다.

---

# 5. Authorization 실패 표현

다른 사용자 Resource ID를 요청한 경우 기본:

```text
404 RESOURCE_NOT_FOUND
```

을 사용한다.

이유:

- Resource 존재 여부 노출 최소화
- Ownership 정책 일관성

인증 자체가 없거나 만료된 경우:

```text
401 UNAUTHENTICATED
```

---

# 6. 공통 Request Header

권장:

```text
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-Id: <uuid>
Idempotency-Key: <opaque-string>   // Write Endpoint 필요 시
```

---

# 7. 공통 Response Envelope

성공:

```json
{
  "data": {}
}
```

실패:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 표시 가능한 메시지",
    "request_id": "..."
  }
}
```

---

# 8. Error Code 원칙

- Stable Code
- 사용자 Copy와 분리 가능
- Stack Trace 미노출
- Provider Secret 미노출
- DB Raw Error 미노출

---

# 9. Core MUST Endpoint Set

Core Prototype에 필요한 Endpoint:

```text
GET    /me
PATCH  /me

POST   /stt/transcribe

POST   /ai/parse
POST   /ai/parses/{parse_id}/resolve

GET    /dashboard

GET    /items
GET    /items/{item_id}
PATCH  /items/{item_id}
PUT    /items/{item_id}/cycle
GET    /items/{item_id}/activities

POST   /records
PATCH  /records/{record_id}
DELETE /records/{record_id}

POST   /items/{item_id}/complete

POST   /push/subscriptions
DELETE /push/subscriptions/{subscription_id}

GET    /notifications/{delivery_id}
POST   /items/{item_id}/snooze

POST   /api/internal/notifications/reconcile
POST   /api/internal/notifications/dispatch
```

Core MUST Endpoint 수:

```text
21
```

---

# 10. SHOULD Endpoint Set

Core 25 MUST와 분리:

```text
POST  /records/{record_id}/restore
POST  /items/{item_id}/archive
POST  /items/{item_id}/restore
POST  /items/merge
GET   /items/{item_id}/notification-settings
PATCH /items/{item_id}/notification-settings
```

SHOULD Endpoint 수:

```text
6
```

총 v1.1 Canonical Endpoint:

```text
26
```

---

# 11. Future / NEXT Endpoint

대화형 기억 조회:

```text
POST /query
```

는 NEXT이며 v1.1 Core Contract에 포함하지 않는다.

---

# 12. GET /me

목적:

현재 사용자 Profile과 App Context 조회.

Response:

```json
{
  "data": {
    "user_id": "uuid",
    "timezone": "Asia/Seoul",
    "locale": "ko-KR"
  }
}
```

---

# 13. PATCH /me

MUST.

수정 가능:

```text
timezone
locale
```

Request:

```json
{
  "timezone": "Asia/Seoul",
  "locale": "ko-KR"
}
```

Server는 Timezone 유효성을 검증한다.

---

# 14. POST /stt/transcribe

목적:

Voice Audio → Transcript.

Request:

```text
multipart/form-data
audio=<file>
```

Response:

```json
{
  "data": {
    "transcript": "오늘 이불 빨았어"
  }
}
```

---

# 15. STT 입력 검증

Server에서 최소:

- 파일 존재
- MIME 허용 목록
- 최대 크기
- 최대 길이
- 비정상 파일 거부

구체 크기/시간 제한은 구현 환경에서 고정한다.

---

# 16. STT 실패

Response 예:

```json
{
  "error": {
    "code": "STT_FAILED",
    "message": "음성을 텍스트로 바꾸지 못했어요.",
    "request_id": "..."
  }
}
```

Frontend는 Text Fallback을 제공한다.

---

# 17. POST /ai/parse

Client Request:

```json
{
  "text": "오늘 이불 빨았어",
  "input_method": "TEXT"
}
```

허용 input_method:

```text
TEXT
VOICE
```

Server가 Context를 추가한다.

---

# 18. /ai/parse Server Context

Server 내부 Request:

```json
{
  "text": "오늘 이불 빨았어",
  "context": {
    "current_local_date": "2026-08-31",
    "timezone": "Asia/Seoul",
    "locale": "ko-KR"
  }
}
```

Client가 `current_local_date`를 권위적으로 정하지 않는다.

---

# 19. /ai/parse 처리 순서

```text
Auth
↓
Input Validation
↓
AI Provider
↓
JSON Schema Validation
↓
Semantic Validation
↓
Parse Log/Segments 저장
↓
Server Record Candidate 계산
↓
Item Matching
↓
Client Response
```

---

# 20. /ai/parse는 Activity를 저장하지 않음

MUST NOT:

- Management Item 생성
- Activity 생성
- Cycle 생성
- Notification 생성

---

# 21. AI Parse Response — Single Completed

```json
{
  "data": {
    "parse_id": "uuid",
    "schema_version": "1.0",
    "result_type": "SINGLE",
    "overflow_detected": false,
    "segments": [
      {
        "segment_id": "s1",
        "source_text": "오늘 이불 빨았어",
        "intent": "COMPLETED",
        "scope": "IN_SCOPE",
        "normalized_action": "이불 세탁",
        "date_expression": "오늘",
        "resolved_date": "2026-08-31",
        "date_precision": "EXACT",
        "date_resolution_source": "EXPLICIT",
        "query_type": null,
        "needs_clarification": false,
        "clarification_types": [],
        "record_candidate": true,
        "item_match": {
          "type": "NONE",
          "candidates": []
        }
      }
    ]
  }
}
```

`record_candidate`와 `item_match`는 API가 Parser Response에 추가하는 파생 데이터다.

---

# 22. item_match.type

허용:

```text
NOT_APPLICABLE
NONE
SINGLE
MULTIPLE
```

---

# 23. item_match.reason

Candidate 단위 Reason:

```text
EXACT_NAME
EXACT_ALIAS
FUZZY
```

Fuzzy는 자동 연결이 아니다.

---

# 24. Item Candidate Shape

```json
{
  "item_id": "uuid",
  "name": "이불 세탁",
  "match_reason": "EXACT_NAME"
}
```

다른 사용자 Item은 절대 포함하지 않는다.

---

# 25. Item Matching 순서

```text
1. current user active Item exact name
2. current user active Alias exact
3. optional fuzzy candidates
4. none
```

Archived Item은 기본 후보에서 제외한다.

---

# 26. Record Candidate 공식

Server 계산:

```text
intent == COMPLETED
AND scope == IN_SCOPE
AND normalized_action != null
AND date_precision == EXACT
AND resolved_date != null
AND resolved_date <= current_local_date
AND needs_clarification == false
```

---

# 27. Numeric Confidence 금지

API는 LLM Numeric Confidence Threshold를 저장 판단에 사용하지 않는다.

---

# 28. TOO_MANY_ACTIONS

Parser 정상 결과로 취급한다.

HTTP Error로 만들지 않아도 된다.

Response:

```json
{
  "data": {
    "parse_id": "uuid",
    "schema_version": "1.0",
    "result_type": "TOO_MANY_ACTIONS",
    "overflow_detected": true,
    "segments": []
  }
}
```

---

# 29. POST /ai/parses/{parse_id}/resolve

목적:

Parser Clarification 해결.

Core MUST.

다룰 수 있는 유형:

```text
COMPLETION
ACTION
DATE
SCOPE
```

TARGET은 이 Endpoint의 Parser Clarification Type이 아니다.

---

# 30. Resolve Request — Date

```json
{
  "segment_id": "s1",
  "resolution": {
    "type": "DATE",
    "resolved_date": "2026-08-25"
  }
}
```

---

# 31. Resolve Request — Action

```json
{
  "segment_id": "s1",
  "resolution": {
    "type": "ACTION",
    "normalized_action": "욕실 환풍기 청소"
  }
}
```

Action 변경 후 Item Matching을 다시 수행한다.

---

# 32. Resolve Request — Scope

```json
{
  "segment_id": "s1",
  "resolution": {
    "type": "SCOPE",
    "scope": "IN_SCOPE"
  }
}
```

Scope `UNCERTAIN`을 사용자 확인으로 해소하는 경우에 사용한다.

---

# 33. Resolve Request — Completion

`UNCERTAIN`의 사용자 완료 확인에 사용 가능.

```json
{
  "segment_id": "s1",
  "resolution": {
    "type": "COMPLETION",
    "completed": true
  }
}
```

단, 완료 확인만으로 바로 Record Candidate가 되지는 않는다.

Action/Date/SCOPE가 모두 확정되어야 한다.

---

# 34. PLANNED/NOT_COMPLETED/QUERY/UNKNOWN 직접 resolve 금지

이 Intent가 AI 오판이었다면 기존 Segment를 직접 `COMPLETED`로 바꾸지 않는다.

Response:

```json
{
  "error": {
    "code": "MANUAL_RECORD_REQUIRED",
    "message": "직접 기록으로 다시 확인해주세요.",
    "request_id": "..."
  }
}
```

Frontend는 Manual Record Flow로 전환한다.

---

# 35. OUT_OF_SCOPE 직접 승격 금지

OUT_OF_SCOPE AI 판정이 틀렸다고 사용자가 수정하려는 경우도 Manual Record Flow로 전환한다.

---

# 36. Resolve Response

```json
{
  "data": {
    "parse_id": "uuid",
    "segment": {
      "segment_id": "s1",
      "record_candidate": true,
      "item_match": {
        "type": "SINGLE",
        "candidates": [
          {
            "item_id": "uuid",
            "name": "이불 세탁",
            "match_reason": "EXACT_NAME"
          }
        ]
      }
    }
  }
}
```

---

# 37. Manual Record Contract

Manual Record는 `POST /records`로 직접 저장할 수 있으나 Request에:

```text
source = MANUAL
```

을 명시한다.

AI Parse ID 없이도 가능하다.

---

# 38. POST /records

Core MUST.

단일 또는 복수 Activity 저장.

Request:

```json
{
  "records": [
    {
      "source": "AI_PARSE",
      "parse_id": "uuid",
      "segment_id": "s1",
      "item": {
        "mode": "EXISTING",
        "item_id": "uuid"
      },
      "performed_date": "2026-08-31",
      "confirmed_action": "이불 세탁"
    }
  ]
}
```

---

# 39. /records item.mode

허용:

```text
EXISTING
NEW
```

---

# 40. NEW Item Request

```json
{
  "item": {
    "mode": "NEW",
    "name": "욕실 환풍기 청소"
  }
}
```

신규 Item은 실제 Activity와 Transaction으로 함께 생성한다.

---

# 41. Manual Record Request

```json
{
  "records": [
    {
      "source": "MANUAL",
      "item": {
        "mode": "NEW",
        "name": "욕실 환풍기 청소"
      },
      "performed_date": "2026-08-31",
      "confirmed_action": "욕실 환풍기 청소",
      "original_text": "욕실 환풍기 청소했어"
    }
  ]
}
```

---

# 42. Quick Complete Request

Quick Complete는 `/records`를 직접 호출하기보다 전용 `/items/{item_id}/complete`를 사용한다.

---

# 43. /records 서버 검증

AI_PARSE:

- parse_id 존재
- current user 소유
- segment_id 존재
- Segment Valid
- Record Candidate
- User Confirmation 값 일치/허용 범위
- Item Match/Target 선택 유효
- Future Date 아님

MANUAL:

- Action 존재
- 정확한 Date
- IN_SCOPE 사용자 확정
- Future Date 아님
- Item 유효

공통:

- Ownership
- Duplicate
- Idempotency
- Transaction

---

# 44. 사용자 Confirmation의 API 의미

Frontend가 Confirmation UI를 보여줬다는 사실만 신뢰하지 않는다.

Server는 저장 Request가 모든 필수 확정값을 포함하는지 검증한다.

---

# 45. Duplicate Guard

기본 중복 후보:

```text
same user
same active item
same performed_date
not deleted
```

중복이면 기본 Response:

```json
{
  "error": {
    "code": "DUPLICATE_CONFIRMATION_REQUIRED",
    "message": "같은 날짜에 같은 기록이 이미 있어요.",
    "request_id": "..."
  }
}
```

---

# 46. Duplicate Override

사용자가 “그래도 추가”를 명시한 경우:

```json
{
  "allow_same_day_duplicate": true
}
```

를 해당 Record에 포함할 수 있다.

Idempotency-Key는 별도로 유지한다.

---

# 47. Idempotency-Key

Write Request마다 Client가 재사용 가능한 고유 Key를 보낸다.

동일 Key 재전송:

```text
새 Activity 추가 X
기존 결과 반환
```

---

# 48. AI Parse Segment Idempotency

같은 `source_parse_segment_id`로 두 번째 Activity를 만들 수 없다.

DB Unique Partial Index를 최종 방어로 사용한다.

---

# 49. Multiple Record Save

2~5 Record 저장:

```text
전체 검증
↓
BEGIN
↓
Item 생성/연결
↓
Activity 저장
↓
COMMIT
```

한 Record 실패 시 전체 Rollback.

---

# 50. POST /records 성공 Response

```json
{
  "data": {
    "records": [
      {
        "record_id": "uuid",
        "item_id": "uuid",
        "performed_date": "2026-08-31"
      }
    ]
  }
}
```

---

# 51. GET /dashboard

Core MUST.

Response는 현재 사용자 Lifecycle View 기준.

```json
{
  "data": {
    "due": [],
    "upcoming": [],
    "normal": []
  }
}
```

NO_HISTORY/NO_CYCLE/ARCHIVED는 기본 제외.

---

# 52. Dashboard Item Shape

```json
{
  "item_id": "uuid",
  "name": "이불 세탁",
  "status": "DUE",
  "last_performed_date": "2026-08-01",
  "next_due_date": "2026-08-29",
  "elapsed_days": 30
}
```

---

# 53. Dashboard 정렬

Server에서 정렬 후 반환하는 것을 권장.

DUE:
- overdue 오래된 순

UPCOMING/NORMAL:
- next_due 빠른 순

---

# 54. GET /items

Core MUST.

Query 예:

```text
?search=필터
&limit=20
&cursor=...
```

기본:

- Active Item만
- NO_HISTORY 포함
- NO_CYCLE 포함
- ARCHIVED 제외

---

# 55. /items Search

검색 대상:

- Item Name
- Alias

다른 사용자 Item은 제외.

---

# 56. GET /items/{item_id}

Core MUST.

Response:

```json
{
  "data": {
    "item_id": "uuid",
    "name": "이불 세탁",
    "cycle_days": 28,
    "last_performed_date": "2026-08-31",
    "next_due_date": "2026-09-28",
    "status": "NORMAL",
    "elapsed_days": 0
  }
}
```

---

# 57. PATCH /items/{item_id}

Core MUST 최소 수정:

```text
name
```

Request:

```json
{
  "name": "침구 세탁"
}
```

Activity History/Snapshot을 변경하지 않는다.

---

# 58. Item Patch 금지

다음을 Client가 직접 수정하지 않는다.

```text
last_performed_date
next_due_date
status
user_id
archived_at   // 별도 SHOULD endpoint
```

---

# 59. PUT /items/{item_id}/cycle

Core MUST.

설정:

```json
{
  "cycle_days": 28
}
```

제거:

```json
{
  "cycle_days": null
}
```

---

# 60. Cycle Validation

허용:

```text
null
integer >= 1
```

Cycle 변경은 Activity History를 변경하지 않는다.

---

# 61. GET /items/{item_id}/activities

Core MUST.

기본:

- 삭제되지 않은 Activity
- 최신순
- Pagination

Response:

```json
{
  "data": {
    "items": [
      {
        "record_id": "uuid",
        "performed_date": "2026-08-31",
        "original_text": "오늘 이불 빨았어",
        "normalized_action_snapshot": "이불 세탁",
        "input_method": "TEXT"
      }
    ],
    "next_cursor": null
  }
}
```

---

# 62. PATCH /records/{record_id}

Core MUST.

수정 가능:

```text
performed_date
item_id
```

Request:

```json
{
  "performed_date": "2026-08-30"
}
```

또는:

```json
{
  "item_id": "uuid"
}
```

---

# 63. Record Edit 금지 필드

Client가 일반 Edit로 변경하지 않는다.

```text
original_text
normalized_action_snapshot
input_method
source_parse_segment_id
user_id
```

---

# 64. Record Move Validation

새 Item:

- current user 소유
- Active
- Future Date 아님
- Duplicate Guard

원본/대상 Item Notification Side Effect를 모두 조정한다.

---

# 65. DELETE /records/{record_id}

Core MUST.

Soft Delete.

성공:

```json
{
  "data": {
    "record_id": "uuid",
    "deleted": true
  }
}
```

최신 Record 삭제 시 이전 Record가 Last가 된다.

유일 Record 삭제 시 Item은 NO_HISTORY.

---

# 66. POST /records/{record_id}/restore [SHOULD]

삭제 Activity Restore.

Server 재검증:

- Ownership
- Future Date
- Target Item 상태
- Duplicate

Core Release Blocker 아님.

---

# 67. POST /items/{item_id}/complete

Core MUST.

Quick Complete.

Request:

```json
{
  "performed_date": "2026-08-31",
  "source": "QUICK_COMPLETE"
}
```

Notification Today Complete일 경우:

```json
{
  "performed_date": "2026-08-31",
  "source": "NOTIFICATION",
  "delivery_id": "uuid"
}
```

---

# 68. /complete Date

Item Detail “오늘 했어요”:

- Server가 User Today를 계산할 수도 있음
- Client 값을 보내더라도 Server 재검증

“다른 날 했어요”는 정확한 과거 Date를 보낸다.

---

# 69. /complete Duplicate

같은 Item + 같은 Date 기존 Activity:

```text
DUPLICATE_CONFIRMATION_REQUIRED
```

사용자 확인 후 `allow_same_day_duplicate=true`.

---

# 70. /complete Idempotency

Notification Double Tap/Retry로 중복 Activity가 생기지 않는다.

---

# 71. POST /items/{item_id}/archive [SHOULD]

Request body 없음.

성공:

```json
{
  "data": {
    "item_id": "uuid",
    "archived": true
  }
}
```

Core Release Blocker 아님.

---

# 72. POST /items/{item_id}/restore [SHOULD]

Archived Item Restore.

현재 History/Cycle 기준 Lifecycle 재계산.

---

# 73. POST /items/merge [SHOULD]

Request:

```json
{
  "target_item_id": "uuid",
  "source_item_id": "uuid",
  "cycle_resolution": {
    "mode": "KEEP_TARGET"
  }
}
```

---

# 74. Merge Cycle Resolution

허용 예:

```text
KEEP_TARGET
USE_SOURCE
SET_VALUE
NONE
```

`SET_VALUE`면 `cycle_days` 추가.

Server가 임의 선택하지 않는다.

---

# 75. Merge Transaction

반드시 전체 성공/전체 실패.

History 손실 금지.

다른 사용자 Item Merge 금지.

---

# 76. GET /items/{item_id}/notification-settings [SHOULD]

Response:

```json
{
  "data": {
    "enabled": true,
    "remind_local_time": "09:00"
  }
}
```

S41 Device Permission과 다른 개념이다.

---

# 77. PATCH /items/{item_id}/notification-settings [SHOULD]

Request:

```json
{
  "enabled": true,
  "remind_local_time": "09:00"
}
```

Core MUST와 분리.

---

# 78. POST /push/subscriptions

Core MUST.

Request:

```json
{
  "endpoint": "https://...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  },
  "user_agent": "..."
}
```

Server가 현재 User와 연결한다.

---

# 79. Push Subscription Response

```json
{
  "data": {
    "subscription_id": "uuid",
    "active": true
  }
}
```

---

# 80. Push Subscription Security

Browser가 DB Table을 직접 쓰지 않는다.

Endpoint/key를 Log에 무분별하게 출력하지 않는다.

---

# 81. DELETE /push/subscriptions/{subscription_id}

Core MUST.

현재 User 소유 Subscription만 비활성화/삭제.

Logout 시 현재 Device에 대해 호출 가능.

---

# 82. GET /notifications/{delivery_id}

Core MUST.

Notification Landing의 최신 상태 조회.

Response:

```json
{
  "data": {
    "delivery_id": "uuid",
    "item": {
      "item_id": "uuid",
      "name": "이불 세탁",
      "status": "DUE",
      "last_performed_date": "2026-08-01",
      "next_due_date": "2026-08-29"
    },
    "is_stale": false,
    "actions": [
      "COMPLETE_TODAY",
      "COMPLETE_OTHER_DATE",
      "SNOOZE"
    ]
  }
}
```

---

# 83. Stale Notification

이미 새 Activity로 기존 Due가 해소된 경우:

```json
{
  "data": {
    "delivery_id": "uuid",
    "is_stale": true,
    "actions": []
  }
}
```

Frontend는 완료 Action을 강요하지 않는다.

---

# 84. POST /items/{item_id}/snooze

Core MUST.

Request:

```json
{
  "delivery_id": "uuid",
  "days": 3
}
```

허용:

```text
1
3
7
```

---

# 85. Snooze 규칙

Server MUST 확인:

- current user item
- DUE 상태
- Delivery 유효
- stale 아님
- days ∈ {1,3,7}

---

# 86. Snooze 결과

```text
Activity 변화 없음
Last 변화 없음
Next Due 변화 없음
Status = DUE
Notification 재예약
```

Response:

```json
{
  "data": {
    "item_id": "uuid",
    "status": "DUE",
    "snoozed_until": "2026-09-03T09:00:00+09:00"
  }
}
```

---

# 87. New Activity After Snooze

어떤 경로든 새 최신 Activity 생성:

- 이전 Snooze Delivery 무효화
- 이전 Pending Due 무효화
- 새 Lifecycle 기준 Notification 재정리

---

# 88. POST /api/internal/notifications/reconcile

Core MUST의 Internal Worker Endpoint.

외부 사용자 호출 금지.

역할:

- Lifecycle DUE 확인
- Setting 확인
- Active Subscription 확인
- 기존 Pending/obsolete 비교
- 필요한 Delivery 생성/취소

---

# 89. Internal Auth

Internal Endpoint는 일반 User JWT가 아니라 Server-to-Server Secret/Platform Auth를 사용한다.

Browser에서 호출할 수 없어야 한다.

---

# 90. POST /api/internal/notifications/dispatch

Core MUST Internal Endpoint.

역할:

- PENDING Delivery 조회
- Web Push 전송
- SENT/FAILED 상태 갱신
- Retry 제한
- 만료 Subscription 처리

---

# 91. Notification Worker Idempotency

동일 논리 Due/Subscription에 중복 Delivery가 생성되지 않도록 idempotency_key 사용.

---

# 92. Notification Payload Privacy

Push에는 생활 상세정보를 최소화.

권장:

```json
{
  "delivery_id": "uuid",
  "title": "LASTLY",
  "body": "관리할 항목이 있어요."
}
```

상세는 인증 후 GET `/notifications/{delivery_id}`.

---

# 93. Notification 후처리 실패

Activity Save가 성공했다면 Notification cancel/reschedule 실패 때문에 Activity 자체를 Rollback하지 않는다.

Activity가 사실 Source of Truth다.

---

# 94. Common Validation — UUID

잘못된 UUID Format은 Resource Query 전에 Validation.

예:

```text
INVALID_ID
```

---

# 95. Common Validation — Date

형식:

```text
YYYY-MM-DD
```

Future Activity Date 금지.

Server User Timezone 기준 검증.

---

# 96. Common Validation — Cycle

```text
null
또는 integer >= 1
```

---

# 97. Common Validation — Text Length

AI Input:

```text
1~500자
```

Item Name/Action Snapshot:

```text
1~100자
```

정확한 상세 한도는 DB Constraint와 일치해야 한다.

---

# 98. Rate Limit 대상

최소:

- `/stt/transcribe`
- `/ai/parse`
- `/records`
- `/push/subscriptions`
- Internal Dispatch 방어

비용성 Provider를 무제한 호출하지 않는다.

---

# 99. AI Timeout

기본:

```text
15초
```

Schema/Semantic 교정 재시도 최대 1회.

---

# 100. STT Timeout

무한 대기 금지.

정확한 수치는 Provider 도입 시 고정한다.

---

# 101. Provider Error Mapping

AI:

```text
AI_PROVIDER_ERROR
AI_TIMEOUT
AI_INVALID_OUTPUT
```

STT:

```text
STT_PROVIDER_ERROR
STT_TIMEOUT
STT_INVALID_AUDIO
```

---

# 102. Save Error Mapping

예:

```text
FUTURE_DATE_NOT_ALLOWED
DUPLICATE_CONFIRMATION_REQUIRED
UNRESOLVED_CLARIFICATION
INVALID_ITEM_TARGET
RESOURCE_NOT_FOUND
CONFLICT
SAVE_FAILED
```

---

# 103. UNRESOLVED_CLARIFICATION

AI_PARSE Record 저장 Request에 미해결 Clarification이 있으면:

```json
{
  "error": {
    "code": "UNRESOLVED_CLARIFICATION",
    "message": "확인이 필요한 항목이 있어요.",
    "request_id": "..."
  }
}
```

---

# 104. INVALID_RECORD_SOURCE

허용되지 않은 Record Source가 오면 거부.

정식 Source:

```text
AI_PARSE
MANUAL
```

Quick Complete는 전용 Endpoint.

---

# 105. NOT_COMPLETED API 조작 방어

Client가 AI Parse 결과를 무시하고:

```text
intent=NOT_COMPLETED Segment
→ POST /records
```

를 보내도 Server가 차단한다.

---

# 106. PLANNED API 조작 방어

동일.

Activity 저장 금지.

---

# 107. QUERY API 조작 방어

동일.

Activity 저장 금지.

---

# 108. UNKNOWN API 조작 방어

동일.

Manual Flow를 사용해야 한다.

---

# 109. OUT_OF_SCOPE API 조작 방어

동일.

Manual Flow에서 사용자가 별도로 생활관리 사실을 확정해야 한다.

---

# 110. UNCERTAIN API 조작 방어

완료 확인/Action/Date 해결 내역 없이 저장 금지.

---

# 111. Cross-user Item 조작

User A가 User B item_id로:

```text
POST /records
PATCH /records
POST /complete
PUT /cycle
```

요청:

```text
404 RESOURCE_NOT_FOUND
```

---

# 112. Cross-user Record 조작

User A가 User B record_id로 Edit/Delete:

```text
404 RESOURCE_NOT_FOUND
```

---

# 113. Cross-user Delivery 조작

다른 User delivery_id 조회/Snooze:

```text
404 RESOURCE_NOT_FOUND
```

---

# 114. Transaction — New Item + Record

```text
BEGIN
↓
New Item INSERT
↓
Alias optional
↓
Activity INSERT
↓
COMMIT
```

중간 실패 시 빈 Item만 남기지 않는다.

---

# 115. Transaction — Multi Record

선택된 모든 Segment 저장은 All-or-Nothing.

---

# 116. Transaction — Merge [SHOULD]

Activity/Alias/Setting/Delivery 이동과 Source Archive를 하나의 Transaction으로 처리.

---

# 117. Lifecycle 재계산

DB View 기반이라 기본적으로 Read 시 최신 계산.

하지만 Notification Side Effect는 다음 이벤트 후 reconcile 대상이 된다.

- Activity Create
- Record Date Edit
- Item Move
- Record Delete
- Restore [SHOULD]
- Cycle Set/Remove
- Item Merge [SHOULD]
- Archive/Restore [SHOULD]
- Today Complete
- Other Date

---

# 118. GET /dashboard Cache

사용자별 민감 데이터이므로 Public Shared Cache 금지.

필요 시 Private/short-lived 전략만 사용.

---

# 119. Pagination

History/List는 Cursor 기반을 권장.

예:

```json
{
  "data": {
    "items": [],
    "next_cursor": "..."
  }
}
```

---

# 120. Sorting 서버 책임

Dashboard 정렬은 Server Contract로 고정.

All Management 정렬은 UI/API에서 변경 가능하나 사용자별 결과 일관성을 유지한다.

---

# 121. Search Security

Search String에 SQL 직접 삽입 금지.

Parameterized Query 사용.

---

# 122. Log 최소 필드

권장:

- request_id
- endpoint
- auth user id
- status
- latency
- error_code
- provider/model
- prompt_version
- validation_status

---

# 123. Log 금지

- Access Token
- Refresh Token
- Service Role Secret
- STT Secret
- Push Private Key
- Password
- 원문 무차별 복제

---

# 124. Service Role

Server-only.

Frontend 환경변수로 노출하지 않는다.

---

# 125. Supabase Direct Read

Prototype에서는 본인 데이터 일부를 Browser가 RLS 기반으로 직접 읽을 수 있어도 된다.

그러나 Canonical Product Contract는 API/BFF를 기준으로 문서화한다.

Write는 반드시 API/BFF.

---

# 126. Optimistic UI 제한

Activity Create/Edit/Delete는 Server Commit 전 확정 Success로 표시하지 않는다.

비파괴 UI State에는 Optimistic UX를 사용할 수 있으나 저장 사실을 거짓 표시하지 않는다.

---

# 127. Retry 정책

Read:
- 제한적 자동 Retry 가능

Write:
- Idempotency-Key가 있는 경우만 안전한 자동 Retry 고려

AI/STT:
- 사용자 입력 보존
- 무한 Retry 금지

---

# 128. Client State 복구

Network/Session 오류 시 Frontend가 원문/확정값을 보존할 수 있도록 Error Response가 불필요하게 화면 State를 초기화하지 않게 한다.

---

# 129. Session Expired

Write 중 Auth 만료:

```text
401 UNAUTHENTICATED
```

Frontend:

```text
입력 유지
→ 재로그인
→ 안전한 Retry
```

---

# 130. API Versioning

초기 Prototype은 URL에 `/v1`을 강제하지 않아도 된다.

Breaking Contract 발생 시:

- 문서 Version
- JSON Schema Version
- Migration
- Client Compatibility

를 함께 검토한다.

---

# 131. Prompt Version

AI Parse Log에 저장.

Prompt 변경 후 08 Validation Dataset 전체 Runtime Test 필요.

---

# 132. Parser Schema Version

현재:

```text
1.0
```

API Response에서도 유지.

---

# 133. MUST / SHOULD 분리 원칙

MUST Endpoint 미구현:

```text
Core Prototype 미완료
```

SHOULD Endpoint 미구현:

```text
Known Limitation 가능
Core Prototype 실패 아님
```

SHOULD 미구현만으로 Core API Prototype을 실패로 판정하지 않는다.

---

# 134. Endpoint Matrix

| Method | Endpoint | Priority |
|---|---|---|
| GET | /me | MUST |
| PATCH | /me | MUST |
| POST | /stt/transcribe | MUST |
| POST | /ai/parse | MUST |
| POST | /ai/parses/{parse_id}/resolve | MUST |
| GET | /dashboard | MUST |
| GET | /items | MUST |
| GET | /items/{item_id} | MUST |
| PATCH | /items/{item_id} | MUST |
| PUT | /items/{item_id}/cycle | MUST |
| GET | /items/{item_id}/activities | MUST |
| POST | /records | MUST |
| PATCH | /records/{record_id} | MUST |
| DELETE | /records/{record_id} | MUST |
| POST | /items/{item_id}/complete | MUST |
| POST | /push/subscriptions | MUST |
| DELETE | /push/subscriptions/{subscription_id} | MUST |
| GET | /notifications/{delivery_id} | MUST |
| POST | /items/{item_id}/snooze | MUST |
| POST | /api/internal/notifications/reconcile | MUST |
| POST | /api/internal/notifications/dispatch | MUST |
| POST | /records/{record_id}/restore | SHOULD |
| POST | /items/{item_id}/archive | SHOULD |
| POST | /items/{item_id}/restore | SHOULD |
| POST | /items/merge | SHOULD |
| GET | /items/{item_id}/notification-settings | SHOULD |
| PATCH | /items/{item_id}/notification-settings | SHOULD |

본 Matrix와 Section 9의 Endpoint 수는 동일하게 유지한다.

---

# 135. Canonical Endpoint Count

Final Matrix 기준:

```text
MUST = 21
SHOULD = 6
TOTAL = 27
```

Core MUST Set은 **21개**, SHOULD Set은 **6개**, 총 **27개**다.

---

# 136. Core 25 MUST → API Traceability

| MVP MUST | API |
|---|---|
| Text Input | Frontend + /ai/parse |
| Voice Input | /stt/transcribe |
| Voice→Text | /stt/transcribe |
| Intent/Action/Date | /ai/parse |
| AI Confirmation | Client + /records validation |
| AI 결과 수정 | /ai/parses/{id}/resolve / Manual |
| Persistent Save | /records |
| Item Matching | /ai/parse 후속 Matching |
| New Item | /records |
| Last Performed | /items / dashboard |
| All Management | /items |
| Item History | /items/{id}/activities |
| Record Edit/Delete | /records/{id} |
| User Cycle | /items/{id}/cycle |
| Next Due | /items / dashboard |
| Status | /items / dashboard |
| Dashboard | /dashboard |
| Due Notification | internal worker + /notifications |
| 오늘 했어요 | /items/{id}/complete |
| Auth | Supabase Auth + API Auth |
| User Isolation | 모든 Private Endpoint |
| Persistent DB | API → Supabase |
| External Deployment | 모든 Endpoint Production Smoke |

---

# 137. API Release Gate

Core:

```text
MUST 21 Endpoint Contract Smoke = PASS
False Completion API Bypass = 0
Future Date Bypass = 0
Cross-user Access = 0
Duplicate Retry = 0
Multi-save Partial Commit = 0
DB Write Bypass = 0
Notification Stale Flow = PASS
```

SHOULD 6 Endpoint는 별도 Regression Pack으로 관리한다.

---

# 138. Security Gate

반드시:

- Auth Token 검증
- Ownership 검증
- Server Secret 비노출
- Browser Core Write 차단
- Internal Endpoint Browser 호출 차단
- Input Validation
- Rate Limit
- Prompt Injection Safety
- Push User Mapping 검증

---

# 139. Golden Path — Text API

```text
POST /ai/parse
↓
Item Match
↓
POST /records
↓
GET /items/{id}
↓
PUT /items/{id}/cycle
↓
GET /dashboard
```

---

# 140. Golden Path — Voice API

```text
POST /stt/transcribe
↓
POST /ai/parse
↓
POST /records
```

---

# 141. Golden Path — Notification API

```text
POST internal reconcile
↓
POST internal dispatch
↓
GET /notifications/{delivery_id}
↓
POST /items/{item_id}/complete
↓
GET /dashboard
```

---

# 142. Golden Path — Snooze API

```text
GET /notifications/{delivery_id}
↓
POST /items/{item_id}/snooze
↓
Activity 0
↓
status DUE
```

---

# 143. Critical Negative — PLANNED

```text
POST /ai/parse
→ PLANNED
→ POST /records 조작
→ 차단
```

---

# 144. Critical Negative — NOT_COMPLETED

동일하게 차단.

---

# 145. Critical Negative — QUERY

동일하게 차단.

---

# 146. Critical Negative — UNKNOWN

동일하게 차단하고 Manual Flow 사용.

---

# 147. Critical Negative — OUT_OF_SCOPE

직접 저장 차단.

---

# 148. Critical Negative — Future Date

Frontend 조작으로 미래 Date 요청:

```text
API 차단
DB Trigger 최종 차단
```

---

# 149. Critical Negative — Cross-user

다른 User Resource ID:

```text
404
```

---

# 150. Critical Negative — Duplicate Retry

동일 Idempotency-Key 재전송:

```text
Activity 추가 0
기존 결과 반환
```

---

# 151. Critical Negative — Multi Save

3건 중 1건 실패:

```text
3건 전체 Rollback
```

---

# 152. Critical Negative — Stale Push

이미 새 Activity 존재:

```text
GET notification
→ is_stale=true
→ complete action 없음
```

---

# 153. Critical Negative — Snooze

```text
POST snooze
→ Activity Count 변화 0
```

---

# 154. Critical Negative — Direct DB Write

Browser authenticated Supabase write:

```text
실패
```

정상 API Write:

```text
성공
```

---

# 155. QA Evidence

각 Endpoint Test는 최소:

- Request
- Auth User
- Response
- DB Side Effect
- Error Code
- Request ID

를 기록 가능하게 한다.

---

# 156. Codex 구현 절대 규칙

Codex는 다음을 임의 변경하지 않는다.

1. Browser direct Core Write 허용
2. Service Role Frontend 노출
3. AI Parse에서 Activity 저장
4. Parser가 Item ID 선택
5. Numeric Confidence로 자동저장
6. PLANNED/NOT_COMPLETED/QUERY/UNKNOWN 직접 COMPLETED 승격
7. OUT_OF_SCOPE 직접 저장
8. `TARGET`을 Parser Clarification Enum에 추가
9. 동일 Item/Date를 DB UNIQUE로 강제
10. Multi-save 부분 성공 허용
11. Snooze Activity 생성
12. Stale Push에서 완료 Action 강제
13. SHOULD Endpoint를 Core Release Blocker로 변경
14. 다른 사용자 Resource에 200/403로 존재 여부 노출
15. DB 성공 전 Success Response 반환

---

# 157. 구현 순서 권장

```text
Auth
↓
Read API
↓
Record API
↓
AI Parse
↓
Item Matching
↓
Cycle/Dashboard
↓
STT
↓
Push Subscription
↓
Notification Worker
↓
Snooze
↓
SHOULD Endpoint
```

실제 개발 Phase 순서는 10번 문서를 우선한다.

---

# 158. API Documentation Format

Codex 구현 후 OpenAPI 또는 타입 기반 Contract를 생성할 수 있다.

단, 자동 생성 Schema가 본 Business Rule을 대체하지 않는다.

---

# 159. Static Validation과 Runtime Validation 구분

본 문서에서 가능한 것:

- Endpoint 계약 정합성
- MUST/SHOULD 분리
- JSON 예제 parse
- 상위 문서 책임 경계 대조

실제 구현 후 필요한 것:

- Auth Runtime
- RLS
- Service Role
- Transaction
- Idempotency
- Provider
- Worker
- Web Push
- External URL

---

# 160. Final Sync 검증 기준

본 문서는 다음을 반영한다.

- PRD v1.1 MUST/SHOULD
- BRS v1.1 Manual Override
- UFS v1.1 Item Matching 책임
- UI/UX v1.1 Device Notification
- AI Parser v1.1 Schema 1.0
- DB v1.1 Production Hardening
- NO_HISTORY
- Snapshot 불변
- Stale Notification
- Snooze 1/3/7
- Multi-save Atomicity
- 2-user Isolation
- Core/Optional Release Gate 분리

---

# 161. Development Baseline 완료

본 문서를 LASTLY Application API/BFF의 최종 개발 기준선으로 사용한다.

핵심 원칙:

> **AI가 분석하고, 사용자가 확인하며, API가 Business Rule을 재검증하고, DB가 최종 무결성을 보장한다.**

---

## API Spec v1.1 Final Sync 상태

**상위 문서 Final Sync:** 완료  
**Canonical Endpoint:** 27개  
**MUST:** 21개  
**SHOULD:** 6개  
**Parser ↔ Item Matching:** 분리  
**Manual Record:** 반영  
**Record Candidate 서버 계산:** 반영  
**Duplicate / Idempotency:** 반영  
**Multi-save Transaction:** 반영  
**NO_HISTORY:** 반영  
**Record Snapshot 불변:** 반영  
**Device Notification:** 반영  
**Stale Notification:** 반영  
**Snooze 1/3/7:** 반영  
**DB-HARDEN-001 연계:** 반영  
**Cross-user 404 정책:** 반영  
**Codex 구현 기준:** 사용 가능
