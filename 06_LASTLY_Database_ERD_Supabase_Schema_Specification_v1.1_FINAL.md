# LASTLY Database / ERD & Supabase Schema Specification
## AI 생활주기 기억 웹앱
**DB-ERD Spec v1.1 — Final Sync Baseline**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 문서 | Database / ERD & Supabase Schema Specification |
| 기준 문서 | 01 PRD v1.1 FINAL / 02 BRS v1.1 FINAL / 03 UFS v1.1 FINAL / 04 UI·UX FS v1.1 FINAL / 05 AI Parser v1.1 FINAL |
| 후속 계약 | 07 API / 09 QA / 10 Development Plan / 11 Deployment Checklist |
| DB | Supabase PostgreSQL |
| Auth | Supabase Auth |
| 제품 형태 | Mobile-first Web App / PWA |
| 기준일 | 2026.08.31 |
| 문서 상태 | **Development Baseline — Final Sync** |

---

# 1. 문서 목적

이 문서는 LASTLY Prototype의 실제 Supabase/PostgreSQL 데이터 구조를 개발 가능한 수준으로 고정한다.

정의 범위:

- ERD
- Table 책임
- Column / Type / Constraint
- Activity History Source of Truth
- `NO_HISTORY / NO_CYCLE / NORMAL / UPCOMING / DUE / ARCHIVED` 파생 구조
- User Ownership
- Cross-user 관계 차단
- Soft Delete
- Item Archive / Restore [SHOULD]
- Item Merge 지원 구조 [SHOULD]
- AI Parse Log / Segment
- Push Subscription / Notification Delivery
- Index
- Trigger
- RLS
- Grant
- Security-invoker View
- Production Write Hardening
- 실제 Supabase Migration SQL
- Migration 검증 기준

이 문서는 Frontend가 DB를 직접 수정하는 계약을 정의하지 않는다.

**Core Write의 Canonical Path는 Application API/BFF다.**

---

# 2. Final Sync 핵심 보완

v1.1에서 다음을 최종 반영했다.

1. `NO_HISTORY`를 공식 Lifecycle 상태로 반영
2. `ARCHIVED`는 SHOULD Item 관리 기능을 위한 상태로 유지
3. `last_performed / next_due / status`를 authoritative column으로 중복 저장하지 않음
4. Activity History를 Source of Truth로 유지
5. `is_active + archived_at` 같은 이중 상태 제거
6. `is_deleted + deleted_at` 같은 이중 상태 제거
7. Production에서 Browser authenticated 직접 Core Write 경로 제거
8. `DB-HARDEN-001`을 API 부록이 아니라 **본 DB Migration의 필수 단계**로 편입
9. Item-level Notification Setting은 DB가 지원하되 UI는 SHOULD 가능
10. Push Permission을 Profile Global Boolean으로 저장하지 않음
11. AI Parser `TARGET`을 DB AI Clarification Enum에 추가하지 않음
12. `UNKNOWN`, `IMPLICIT_TODAY` 등 Parser v1.1과 Schema v1.0 계약 유지
13. Duplicate는 같은 날 실제 복수 수행이 가능하므로 `(item,date)` DB UNIQUE로 강제하지 않음
14. Retry 중복은 `idempotency_key` 및 Parse Segment 연결로 방어
15. Future performed date는 DB Trigger까지 포함한 다층 방어
16. Cross-user Item/Activity 관계는 Composite FK로 방어

---

# 3. 데이터 설계 핵심 원칙

## DB-P01 — Activity History가 사실의 Source of Truth

```text
실제 수행 사실
= activity_records
```

## DB-P02 — 파생값 중복 저장 금지

다음을 Management Item authoritative column으로 저장하지 않는다.

```text
last_performed_date
next_due_date
status
elapsed_days
```

## DB-P03 — Item과 Activity 분리

```text
Management Item 1
→ Activity Record N
```

## DB-P04 — 사용자 소유권 명시

개인 Domain Row는 `user_id`를 가진다.

## DB-P05 — Cross-user 관계 차단

Activity와 Item의 `user_id`가 다르면 DB 관계 자체가 성립하지 않게 한다.

## DB-P06 — Browser Write를 Business Rule 우회 경로로 사용하지 않음

Production Prototype에서 개인 Core Table Write는 Application API/BFF가 수행한다.

## DB-P07 — RLS는 방어 계층

RLS를 Business Rule 전체 구현의 대체물로 사용하지 않는다.

## DB-P08 — Soft Delete

Activity 일반 삭제는 `deleted_at`을 사용한다.

## DB-P09 — Archive

Management Item 비활성화는 `archived_at`을 사용한다.

## DB-P10 — Push 상태는 Device 단위

Browser Push Permission/Subscription은 Profile Global Boolean으로 모델링하지 않는다.

---

# 4. Core MUST와 SHOULD의 DB 관계

Core MUST에 직접 필요한 구조:

- profiles
- management_items
- activity_records
- item_aliases
- ai_parse_logs
- ai_parse_segments
- notification_settings
- push_subscriptions
- notification_deliveries
- Lifecycle View
- RLS / Ownership
- Future Date Guard
- Idempotency 지원

SHOULD 기능:

- Record Restore: `deleted_at`으로 지원
- Item Archive/Restore: `archived_at`으로 지원
- Item Merge: 동일 Table 구조와 Transaction으로 지원

SHOULD가 미구현이어도 Schema를 다시 만드는 일이 없도록 데이터 구조는 처음부터 호환 가능하게 둔다.

---

# 5. Logical ERD

```text
auth.users
   │
   ├── 1 ── 1 profiles
   │
   ├── 1 ── N management_items
   │           │
   │           ├── 1 ── N activity_records
   │           ├── 1 ── N item_aliases
   │           ├── 1 ── 1 notification_settings
   │           └── 1 ── N notification_deliveries
   │
   ├── 1 ── N ai_parse_logs
   │           │
   │           └── 1 ── N ai_parse_segments
   │                         │
   │                         └── 0..1 ── activity_records
   │
   ├── 1 ── N push_subscriptions
   │           │
   │           └── 1 ── N notification_deliveries
   │
   └── 1 ── N notification_deliveries
```

---

# 6. Physical Table Set

정식 Table 9개:

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

---

# 7. profiles 책임

사용자 앱 설정의 최소 Profile.

저장:

- user_id
- timezone
- locale
- created_at
- updated_at

저장하지 않음:

- Browser Notification Permission Global Boolean
- Last Activity
- Dashboard 상태
- 다른 사용자 정보

---

# 8. management_items 책임

반복 관리되는 생활관리 단위.

저장:

- id
- user_id
- name
- cycle_days
- archived_at
- created_at
- updated_at

파생:

- last_performed_date
- next_due_date
- status
- upcoming_days

---

# 9. cycle_days 물리 표현

BRS의:

```text
NONE
INTERVAL_DAYS
```

를 DB에서는 다음처럼 단순 표현한다.

```text
cycle_days IS NULL
→ NONE

cycle_days >= 1
→ INTERVAL_DAYS
```

별도 `cycle_type` + `cycle_days` 이중 상태를 만들지 않는다.

---

# 10. activity_records 책임

사용자가 실제로 수행한 한 번의 사건.

저장:

- user_id
- item_id
- performed_date
- original_text
- normalized_action_snapshot
- input_method
- source_parse_segment_id
- idempotency_key
- deleted_at
- timestamps

---

# 11. Activity Snapshot 원칙

Item 이름이 나중에 바뀌어도 Activity 생성 당시의 확정 Action 의미를 추적할 수 있도록:

```text
normalized_action_snapshot
```

을 유지한다.

일반 Record Edit에서 이 Snapshot을 직접 변경하지 않는다.

---

# 12. Activity Original Text

자연어 기반 입력은 가능한 경우:

```text
original_text
```

를 보존한다.

Quick Complete/Notification 등 자연어가 없는 Flow는 `null` 가능.

---

# 13. activity input_method

정식 값:

```text
TEXT
VOICE
MANUAL
QUICK_COMPLETE
NOTIFICATION
```

STT는 Voice 입력의 변환 단계이며 별도 Activity 사실 Type이 아니다.

---

# 14. Activity Soft Delete

삭제:

```text
deleted_at = timestamptz
```

유효:

```text
deleted_at IS NULL
```

별도 `is_deleted`를 두지 않는다.

---

# 15. Item Archive

Archive:

```text
archived_at != null
```

Active:

```text
archived_at IS NULL
```

별도 `is_active`를 두지 않는다.

---

# 16. item_aliases 책임

같은 Management Item을 다른 자연어 표현으로 찾기 위한 사용자 확정 Alias.

예:

```text
이불 빨래
이불 빨기
→ 이불 세탁
```

전체 Raw Sentence를 Alias로 저장하지 않는다.

---

# 17. Alias Unique 정책

같은 Alias가 다른 Item에 존재할 수 있다.

예:

```text
필터 청소
→ 거실 에어컨 필터
→ 안방 에어컨 필터
```

따라서 `user_id + alias`를 DB UNIQUE로 강제하지 않는다.

같은 Item 내부의 동일 Alias만 중복 방지한다.

---

# 18. notification_settings 책임

Item별 관리 알림 Preference.

MVP DB 지원:

- enabled
- remind_local_time

중요:

> S41의 “이 기기에서 알림 받기”는 Browser/Device Push 상태이며 이 Table의 전역 Boolean이 아니다.

Item-level Notification UI 자체는 SHOULD일 수 있다.

---

# 19. ai_parse_logs 책임

각 AI Parse 요청의 기술적 실행 기록.

저장 가능 정보:

- user_id
- input_text
- input_method
- parse 기준 날짜/Timezone/Locale
- provider/model
- prompt_version
- schema_version
- result_type
- overflow
- validation_status
- error_code
- created_at

사용자 Activity 사실과 분리한다.

---

# 20. AI Parse Log 개인정보

`input_text`는 Debug/회귀 분석 목적에 필요한 범위에서만 보존한다.

Production 운영 시 Retention/Masking 정책을 별도 운영 규칙으로 둘 수 있다.

Activity의 사용자 확정 원문과 AI 기술 Log는 다른 목적의 데이터다.

---

# 21. ai_parse_segments 책임

Schema-valid Parser Segment 저장.

필드:

- intent
- scope
- normalized_action
- date fields
- query_type
- needs_clarification
- clarification_types

Parser Contract v1.0과 일치한다.

---

# 22. Parser Clarification DB Enum

정식 값:

```text
COMPLETION
ACTION
DATE
SCOPE
```

`TARGET`을 추가하지 않는다.

TARGET은 Item Matching UI/Application Layer의 문제다.

---

# 23. push_subscriptions 책임

Web Push Subscription의 Device/Browser 단위 정보.

저장:

- endpoint
- endpoint_hash
- p256dh
- auth_secret
- user_agent
- active
- timestamps

Browser Permission Boolean을 Profile에 중복 저장하지 않는다.

---

# 24. Push Subscription 보안

`endpoint`, `p256dh`, `auth_secret`은 Server-managed Data다.

일반 Browser authenticated Client가 Table을 직접 읽거나 수정하지 않는다.

---

# 25. notification_deliveries 책임

실제 알림 예정/전송/실패/취소 상태를 관리한다.

저장:

- user_id
- item_id
- subscription_id
- due_date
- scheduled_for
- snoozed_until
- status
- attempt_count
- idempotency_key
- last_error_code
- sent_at
- timestamps

---

# 26. Notification Delivery Status

```text
PENDING
SENT
FAILED
CANCELLED
OBSOLETE
```

새 Activity로 기존 Due가 무효화되면 `OBSOLETE` 또는 `CANCELLED` 처리 가능.

---

# 27. Snooze DB 의미

Snooze는 Activity를 만들지 않는다.

새 재알림 Delivery를 만들거나 기존 Pending Delivery를 재예약할 수 있다.

어느 방식을 쓰든 다음은 불변:

```text
Activity 변화 없음
next_due 변화 없음
DUE 유지
```

---

# 28. Notification idempotency

같은 논리 Notification이 Retry로 중복 생성되지 않도록:

```text
notification_deliveries.idempotency_key
```

를 Unique로 사용한다.

---

# 29. Record idempotency

일반 Record Create Retry:

```text
activity_records.idempotency_key
```

AI Parse Segment 기반 Create:

```text
source_parse_segment_id
```

를 사용하여 기술 재전송 중복을 방지한다.

---

# 30. 실제 같은 날 복수 수행

동일:

```text
user
item
performed_date
```

인 Activity가 실제로 여러 번 있을 수 있다.

따라서 DB에:

```text
UNIQUE(user_id, item_id, performed_date)
```

를 만들지 않는다.

중복 가능성은 API/UX에서 사용자 확인한다.

---

# 31. User Ownership

개인 Domain Table에는 `user_id`를 둔다.

Application API는 Auth User와 Row `user_id`를 일치시킨다.

DB는 Composite FK와 RLS로 추가 방어한다.

---

# 32. Cross-user Composite FK

예:

```text
activity_records(item_id, user_id)
→ management_items(id, user_id)
```

User A Activity가 User B Item을 참조할 수 없다.

같은 패턴을 Alias/Notification에도 적용한다.

---

# 33. Timezone

초기 Profile 기본:

```text
Asia/Seoul
```

유효 IANA Timezone만 저장한다.

---

# 34. User Today

DB 최종 Date Guard에서는:

```text
profiles.timezone
```

을 사용하여 User Today를 계산한다.

서버 UTC Date를 그대로 사용하지 않는다.

---

# 35. Future performed_date 방어

3계층:

```text
Frontend Date Picker
↓
Application API Validation
↓
Database Trigger
```

DB Trigger가 최종 안전장치다.

---

# 36. Lifecycle Source

Lifecycle 계산 입력:

```text
management_items.archived_at
management_items.cycle_days
MAX(active activity_records.performed_date)
profiles.timezone
```

---

# 37. Lifecycle Status

```text
ARCHIVED
NO_HISTORY
NO_CYCLE
NORMAL
UPCOMING
DUE
```

---

# 38. Status 우선순위

```text
1. archived_at exists → ARCHIVED
2. active Activity 0 → NO_HISTORY
3. cycle_days is null → NO_CYCLE
4. User Today >= next_due → DUE
5. next_due <= User Today + upcoming_days → UPCOMING
6. else → NORMAL
```

---

# 39. Upcoming Formula

```text
upcoming_days
= min(5, ceil(cycle_days × 0.20))
최소 1
```

---

# 40. Next Due Formula

```text
next_due_date
= last_performed_date + cycle_days
```

---

# 41. Lifecycle 저장 정책

Lifecycle 결과는 View/Read Model에서 계산한다.

Core Table에 다음을 authoritative하게 저장하지 않는다.

```text
last_performed_date
next_due_date
status
```

---

# 42. View Security

Lifecycle View는 `security_invoker = true`를 사용하여 호출자의 Base Table RLS를 유지한다.

---

# 43. RLS 전략

Production Browser authenticated 사용자는:

**직접 읽기 가능(본인 Row만):**
- profiles
- management_items
- activity_records
- item_aliases
- notification_settings
- management_item_lifecycle_v

**직접 Table 접근 금지:**
- ai_parse_logs
- ai_parse_segments
- push_subscriptions
- notification_deliveries

**직접 Write 금지:**
- 모든 Core/App Table

Write는 Application API/BFF가 담당한다.

---

# 44. 왜 RLS Write Policy만으로 부족한가

사용자 본인 Row라고 해도 Browser가 직접 Write하면 다음 Domain Rule을 우회할 수 있다.

- AI Confirmation
- Duplicate Guard
- Future Date
- Atomic Multi Save
- Item Matching
- Idempotency
- Notification Side Effect
- Manual Override Rule

따라서 Production에서는 `authenticated` 직접 Write Grant 자체를 제거한다.

---

# 45. DB-HARDEN-001

Production 필수 Migration.

목표:

```text
Browser authenticated direct INSERT/UPDATE/DELETE 제거
```

이 Migration은 Optional 보안 부록이 아니라 **본 v1.1의 필수 Production Baseline**이다.

---

# 46. RLS와 Service Role

Application API/BFF는 Server-only Secret을 사용한다.

Service-role Secret은 Browser Bundle에 절대 포함하지 않는다.

Server는 Service Role의 강한 권한을 사용할 수 있으므로 API의 Auth/Ownership/Domain Validation이 반드시 선행되어야 한다.

---

# 47. Enum 목록

PostgreSQL Enum:

```text
management_status
record_input_method
ai_intent
ai_scope
ai_date_precision
ai_date_resolution_source
ai_query_type
ai_result_type
ai_clarification_type
ai_validation_status
notification_delivery_status
```

---

# 48. management_status Enum

```text
ARCHIVED
NO_HISTORY
NO_CYCLE
NORMAL
UPCOMING
DUE
```

Derived View 용도.

---

# 49. ai_intent Enum

```text
COMPLETED
PLANNED
NOT_COMPLETED
UNCERTAIN
QUERY
UNKNOWN
```

---

# 50. ai_scope Enum

```text
IN_SCOPE
OUT_OF_SCOPE
UNCERTAIN
```

---

# 51. ai_date_precision Enum

```text
EXACT
APPROXIMATE
UNKNOWN
NOT_APPLICABLE
```

---

# 52. ai_date_resolution_source Enum

```text
EXPLICIT
IMPLICIT_TODAY
NONE
```

---

# 53. ai_query_type Enum

```text
LAST_PERFORMED
ELAPSED_SINCE
HISTORY
NEXT_DUE
OTHER
```

Nullable.

---

# 54. ai_result_type Enum

```text
SINGLE
MULTIPLE
MIXED
QUERY_ONLY
NO_ACTION
TOO_MANY_ACTIONS
```

---

# 55. ai_clarification_type Enum

```text
COMPLETION
ACTION
DATE
SCOPE
```

---

# 56. ai_validation_status Enum

```text
RECEIVED
VALID
INVALID_SCHEMA
INVALID_SEMANTIC
PROVIDER_ERROR
TIMEOUT
```

---

# 57. notification_delivery_status Enum

```text
PENDING
SENT
FAILED
CANCELLED
OBSOLETE
```

---

# 58. Migration Strategy

권장 순서:

```text
001_extensions_and_enums.sql
002_core_tables.sql
003_constraints_indexes_triggers.sql
004_rls_and_read_grants.sql
005_lifecycle_view.sql
006_production_write_hardening.sql
```

초기 Prototype에서도 006을 Production-like 환경에 반드시 적용한다.

---

# 59. Migration 001 — Extensions / Enums

```sql
create extension if not exists pgcrypto;

create type public.management_status as enum (
  'ARCHIVED',
  'NO_HISTORY',
  'NO_CYCLE',
  'NORMAL',
  'UPCOMING',
  'DUE'
);

create type public.record_input_method as enum (
  'TEXT',
  'VOICE',
  'MANUAL',
  'QUICK_COMPLETE',
  'NOTIFICATION'
);

create type public.ai_intent as enum (
  'COMPLETED',
  'PLANNED',
  'NOT_COMPLETED',
  'UNCERTAIN',
  'QUERY',
  'UNKNOWN'
);

create type public.ai_scope as enum (
  'IN_SCOPE',
  'OUT_OF_SCOPE',
  'UNCERTAIN'
);

create type public.ai_date_precision as enum (
  'EXACT',
  'APPROXIMATE',
  'UNKNOWN',
  'NOT_APPLICABLE'
);

create type public.ai_date_resolution_source as enum (
  'EXPLICIT',
  'IMPLICIT_TODAY',
  'NONE'
);

create type public.ai_query_type as enum (
  'LAST_PERFORMED',
  'ELAPSED_SINCE',
  'HISTORY',
  'NEXT_DUE',
  'OTHER'
);

create type public.ai_result_type as enum (
  'SINGLE',
  'MULTIPLE',
  'MIXED',
  'QUERY_ONLY',
  'NO_ACTION',
  'TOO_MANY_ACTIONS'
);

create type public.ai_clarification_type as enum (
  'COMPLETION',
  'ACTION',
  'DATE',
  'SCOPE'
);

create type public.ai_validation_status as enum (
  'RECEIVED',
  'VALID',
  'INVALID_SCHEMA',
  'INVALID_SEMANTIC',
  'PROVIDER_ERROR',
  'TIMEOUT'
);

create type public.notification_delivery_status as enum (
  'PENDING',
  'SENT',
  'FAILED',
  'CANCELLED',
  'OBSOLETE'
);
```

---

# 60. Migration 002 — profiles

```sql
create table public.profiles (
  user_id uuid primary key
    references auth.users(id) on delete cascade,

  timezone text not null default 'Asia/Seoul',
  locale text not null default 'ko-KR',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_timezone_not_blank
    check (btrim(timezone) <> ''),

  constraint profiles_locale_not_blank
    check (btrim(locale) <> '')
);
```

---

# 61. Migration 002 — management_items

```sql
create table public.management_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users(id) on delete cascade,

  name text not null,
  cycle_days integer null,
  archived_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint management_items_name_not_blank
    check (btrim(name) <> ''),

  constraint management_items_name_length
    check (char_length(name) <= 100),

  constraint management_items_cycle_days_valid
    check (cycle_days is null or cycle_days >= 1),

  constraint management_items_id_user_unique
    unique (id, user_id)
);
```

---

# 62. Migration 002 — ai_parse_logs

```sql
create table public.ai_parse_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users(id) on delete cascade,

  input_text text null,
  input_method public.record_input_method not null,

  current_local_date date not null,
  timezone text not null,
  locale text not null default 'ko-KR',

  provider text null,
  model text null,
  prompt_version text not null,
  schema_version text not null default '1.0',

  result_type public.ai_result_type null,
  overflow_detected boolean null,

  validation_status public.ai_validation_status not null
    default 'RECEIVED',

  error_code text null,

  created_at timestamptz not null default now(),

  constraint ai_parse_logs_input_length
    check (input_text is null or char_length(input_text) <= 500),

  constraint ai_parse_logs_schema_version
    check (schema_version = '1.0'),

  constraint ai_parse_logs_id_user_unique
    unique (id, user_id)
);
```

---

# 63. Migration 002 — ai_parse_segments

```sql
create table public.ai_parse_segments (
  id uuid primary key default gen_random_uuid(),

  parse_log_id uuid not null,
  user_id uuid not null,

  segment_id text not null,
  source_text text not null,

  intent public.ai_intent not null,
  scope public.ai_scope not null,

  normalized_action text null,
  date_expression text null,
  resolved_date date null,
  date_precision public.ai_date_precision not null,
  date_resolution_source public.ai_date_resolution_source not null,

  query_type public.ai_query_type null,

  needs_clarification boolean not null default false,
  clarification_types public.ai_clarification_type[]
    not null default '{}',

  created_at timestamptz not null default now(),

  constraint ai_parse_segments_log_owner_fk
    foreign key (parse_log_id, user_id)
    references public.ai_parse_logs(id, user_id)
    on delete cascade,

  constraint ai_parse_segments_segment_id_format
    check (segment_id ~ '^s[1-9][0-9]*$'),

  constraint ai_parse_segments_source_length
    check (
      char_length(source_text) >= 1
      and char_length(source_text) <= 500
    ),

  constraint ai_parse_segments_action_length
    check (
      normalized_action is null
      or char_length(normalized_action) <= 100
    ),

  constraint ai_parse_segments_date_expression_length
    check (
      date_expression is null
      or char_length(date_expression) <= 100
    ),

  constraint ai_parse_segments_query_consistency
    check (
      (intent = 'QUERY' and query_type is not null)
      or
      (intent <> 'QUERY' and query_type is null)
    ),

  constraint ai_parse_segments_exact_date_consistency
    check (
      (date_precision = 'EXACT' and resolved_date is not null)
      or
      (date_precision <> 'EXACT' and resolved_date is null)
    ),

  constraint ai_parse_segments_not_applicable_consistency
    check (
      date_precision <> 'NOT_APPLICABLE'
      or date_resolution_source = 'NONE'
    ),

  constraint ai_parse_segments_clarification_consistency
    check (
      needs_clarification =
      (cardinality(clarification_types) > 0)
    ),

  constraint ai_parse_segments_segment_unique
    unique (parse_log_id, segment_id),

  constraint ai_parse_segments_id_user_unique
    unique (id, user_id)
);
```

---

# 64. Migration 002 — activity_records

```sql
create table public.activity_records (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id) on delete cascade,

  item_id uuid not null,

  performed_date date not null,

  original_text text null,
  normalized_action_snapshot text not null,

  input_method public.record_input_method not null,

  source_parse_segment_id uuid null,
  idempotency_key text null,

  deleted_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint activity_records_item_owner_fk
    foreign key (item_id, user_id)
    references public.management_items(id, user_id)
    on delete cascade,

  constraint activity_records_parse_owner_fk
    foreign key (source_parse_segment_id, user_id)
    references public.ai_parse_segments(id, user_id),

  constraint activity_records_original_text_length
    check (
      original_text is null
      or char_length(original_text) <= 500
    ),

  constraint activity_records_action_snapshot_not_blank
    check (btrim(normalized_action_snapshot) <> ''),

  constraint activity_records_action_snapshot_length
    check (char_length(normalized_action_snapshot) <= 100),

  constraint activity_records_idempotency_length
    check (
      idempotency_key is null
      or char_length(idempotency_key) <= 200
    )
);
```

---

# 65. Migration 002 — item_aliases

```sql
create table public.item_aliases (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null,
  item_id uuid not null,

  alias text not null,

  created_at timestamptz not null default now(),

  constraint item_aliases_item_owner_fk
    foreign key (item_id, user_id)
    references public.management_items(id, user_id)
    on delete cascade,

  constraint item_aliases_alias_not_blank
    check (btrim(alias) <> ''),

  constraint item_aliases_alias_length
    check (char_length(alias) <= 100)
);
```

---

# 66. Migration 002 — notification_settings

```sql
create table public.notification_settings (
  item_id uuid primary key,
  user_id uuid not null,

  enabled boolean not null default true,
  remind_local_time time not null default time '09:00',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint notification_settings_item_owner_fk
    foreign key (item_id, user_id)
    references public.management_items(id, user_id)
    on delete cascade,

  constraint notification_settings_id_user_unique
    unique (item_id, user_id)
);
```

---

# 67. Migration 002 — push_subscriptions

```sql
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id) on delete cascade,

  endpoint text not null,

  endpoint_hash text
    generated always as (md5(endpoint)) stored,

  p256dh text not null,
  auth_secret text not null,

  user_agent text null,
  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint push_subscriptions_endpoint_not_blank
    check (btrim(endpoint) <> ''),

  constraint push_subscriptions_p256dh_not_blank
    check (btrim(p256dh) <> ''),

  constraint push_subscriptions_auth_not_blank
    check (btrim(auth_secret) <> ''),

  constraint push_subscriptions_id_user_unique
    unique (id, user_id),

  constraint push_subscriptions_user_endpoint_unique
    unique (user_id, endpoint_hash)
);
```

---

# 68. Migration 002 — notification_deliveries

```sql
create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id) on delete cascade,

  item_id uuid not null,
  subscription_id uuid null,

  due_date date not null,
  scheduled_for timestamptz not null,
  snoozed_until timestamptz null,

  status public.notification_delivery_status not null
    default 'PENDING',

  attempt_count integer not null default 0,
  idempotency_key text not null,
  last_error_code text null,

  sent_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint notification_deliveries_item_owner_fk
    foreign key (item_id, user_id)
    references public.management_items(id, user_id)
    on delete cascade,

  constraint notification_deliveries_subscription_owner_fk
    foreign key (subscription_id, user_id)
    references public.push_subscriptions(id, user_id),

  constraint notification_deliveries_attempt_count_valid
    check (attempt_count >= 0),

  constraint notification_deliveries_idempotency_not_blank
    check (btrim(idempotency_key) <> ''),

  constraint notification_deliveries_idempotency_unique
    unique (idempotency_key)
);
```

---

# 69. Table Creation Count

Migration 002의 정식 Table 수:

```text
9
```

다른 파생 상태를 저장하기 위한 숨은 Table을 추가하지 않는다.

---

# 70. updated_at Trigger Function

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

---

# 71. updated_at Triggers

```sql
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger trg_management_items_updated_at
before update on public.management_items
for each row execute function public.set_updated_at();

create trigger trg_activity_records_updated_at
before update on public.activity_records
for each row execute function public.set_updated_at();

create trigger trg_notification_settings_updated_at
before update on public.notification_settings
for each row execute function public.set_updated_at();

create trigger trg_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row execute function public.set_updated_at();

create trigger trg_notification_deliveries_updated_at
before update on public.notification_deliveries
for each row execute function public.set_updated_at();
```

---

# 72. Timezone Validation Function

```sql
create or replace function public.assert_valid_timezone()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from pg_timezone_names
    where name = new.timezone
  ) then
    raise exception 'INVALID_TIMEZONE';
  end if;

  return new;
end;
$$;
```

---

# 73. Timezone Trigger

```sql
create trigger trg_profiles_validate_timezone
before insert or update of timezone
on public.profiles
for each row execute function public.assert_valid_timezone();
```

---

# 74. User Today Function

```sql
create or replace function public.user_today(tz text)
returns date
language sql
stable
as $$
  select timezone(tz, now())::date;
$$;
```

---

# 75. Future Activity Guard Function

```sql
create or replace function public.reject_future_activity_date()
returns trigger
language plpgsql
as $$
declare
  v_timezone text;
  v_today date;
begin
  select p.timezone
    into v_timezone
  from public.profiles p
  where p.user_id = new.user_id;

  v_timezone := coalesce(v_timezone, 'Asia/Seoul');
  v_today := public.user_today(v_timezone);

  if new.performed_date > v_today then
    raise exception 'FUTURE_PERFORMED_DATE_NOT_ALLOWED';
  end if;

  return new;
end;
$$;
```

---

# 76. Future Activity Trigger

```sql
create trigger trg_activity_records_future_date
before insert or update of performed_date, user_id
on public.activity_records
for each row execute function public.reject_future_activity_date();
```

DB Trigger는 Frontend/API 검증을 대체하지 않고 최종 방어층이다.

---

# 77. Supabase Auth Profile Trigger

```sql
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    user_id,
    timezone,
    locale
  )
  values (
    new.id,
    'Asia/Seoul',
    'ko-KR'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
```

가입 후 Profile 생성 실패는 Auth/DB QA에서 검증한다.

---

# 78. upcoming_days Function

```sql
create or replace function public.upcoming_days(cycle_days integer)
returns integer
language sql
immutable
strict
as $$
  select greatest(
    1,
    least(
      5,
      ceil(cycle_days::numeric * 0.20)::integer
    )
  );
$$;
```

---

# 79. Index — management_items

```sql
create index idx_management_items_user_active
on public.management_items(user_id, archived_at, created_at desc);

create index idx_management_items_user_name
on public.management_items(user_id, lower(name));
```

---

# 80. Index — activity_records

```sql
create index idx_activity_records_item_active_date
on public.activity_records(
  item_id,
  performed_date desc,
  created_at desc
)
where deleted_at is null;

create index idx_activity_records_user_active
on public.activity_records(
  user_id,
  created_at desc
)
where deleted_at is null;

create unique index ux_activity_records_user_idempotency
on public.activity_records(user_id, idempotency_key)
where idempotency_key is not null;

create unique index ux_activity_records_parse_segment
on public.activity_records(source_parse_segment_id)
where source_parse_segment_id is not null;
```

`item_id + performed_date` UNIQUE는 만들지 않는다.

---

# 81. Index — item_aliases

```sql
create unique index ux_item_aliases_item_alias
on public.item_aliases(
  item_id,
  lower(btrim(alias))
);

create index idx_item_aliases_user_alias
on public.item_aliases(
  user_id,
  lower(btrim(alias))
);
```

---

# 82. Index — AI Parse

```sql
create index idx_ai_parse_logs_user_created
on public.ai_parse_logs(user_id, created_at desc);

create index idx_ai_parse_segments_log
on public.ai_parse_segments(parse_log_id, segment_id);
```

---

# 83. Index — Push / Notification

```sql
create index idx_push_subscriptions_user_active
on public.push_subscriptions(user_id, active);

create index idx_notification_deliveries_pending
on public.notification_deliveries(
  status,
  scheduled_for
)
where status = 'PENDING';

create index idx_notification_deliveries_user_item
on public.notification_deliveries(
  user_id,
  item_id,
  due_date desc
);
```

---

# 84. RLS Enable

```sql
alter table public.profiles enable row level security;
alter table public.management_items enable row level security;
alter table public.activity_records enable row level security;
alter table public.item_aliases enable row level security;
alter table public.notification_settings enable row level security;
alter table public.ai_parse_logs enable row level security;
alter table public.ai_parse_segments enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_deliveries enable row level security;
```

---

# 85. RLS Read Policy — profiles

```sql
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);
```

---

# 86. RLS Read Policy — management_items

```sql
create policy management_items_select_own
on public.management_items
for select
to authenticated
using (auth.uid() = user_id);
```

---

# 87. RLS Read Policy — activity_records

```sql
create policy activity_records_select_own
on public.activity_records
for select
to authenticated
using (auth.uid() = user_id);
```

삭제된 Activity의 일반 Client 표시 여부는 API/UI가 결정할 수 있다.

RLS는 Ownership을 다룬다.

---

# 88. RLS Read Policy — item_aliases

```sql
create policy item_aliases_select_own
on public.item_aliases
for select
to authenticated
using (auth.uid() = user_id);
```

---

# 89. RLS Read Policy — notification_settings

```sql
create policy notification_settings_select_own
on public.notification_settings
for select
to authenticated
using (auth.uid() = user_id);
```

---

# 90. Server-managed Table RLS

다음 Table에는 authenticated Browser용 SELECT/WRITE Policy를 만들지 않는다.

```text
ai_parse_logs
ai_parse_segments
push_subscriptions
notification_deliveries
```

Application API가 필요한 데이터를 최소 형태로 반환한다.

---

# 91. RLS Write Policy

Production Baseline에서는 authenticated Client를 위한 INSERT/UPDATE/DELETE Policy를 만들지 않는다.

Core Write는 Application API/BFF가 수행한다.

---

# 92. Base Grants 초기화

```sql
revoke all on table public.profiles
from anon, authenticated;

revoke all on table public.management_items
from anon, authenticated;

revoke all on table public.activity_records
from anon, authenticated;

revoke all on table public.item_aliases
from anon, authenticated;

revoke all on table public.notification_settings
from anon, authenticated;

revoke all on table public.ai_parse_logs
from anon, authenticated;

revoke all on table public.ai_parse_segments
from anon, authenticated;

revoke all on table public.push_subscriptions
from anon, authenticated;

revoke all on table public.notification_deliveries
from anon, authenticated;
```

---

# 93. Authenticated Read Grants

```sql
grant select on table public.profiles
to authenticated;

grant select on table public.management_items
to authenticated;

grant select on table public.activity_records
to authenticated;

grant select on table public.item_aliases
to authenticated;

grant select on table public.notification_settings
to authenticated;
```

RLS가 본인 Row만 허용한다.

---

# 94. Trigger Function Execute 권한 제거

```sql
revoke all on function public.set_updated_at()
from public, anon, authenticated;

revoke all on function public.assert_valid_timezone()
from public, anon, authenticated;

revoke all on function public.reject_future_activity_date()
from public, anon, authenticated;

revoke all on function public.handle_new_auth_user()
from public, anon, authenticated;
```

Trigger 실행 자체에는 Client Execute 권한이 필요하지 않다.

---

# 95. Read Helper Function 권한

Lifecycle View가 사용하는 안전한 Read Helper:

```sql
revoke all on function public.user_today(text)
from public, anon, authenticated;

revoke all on function public.upcoming_days(integer)
from public, anon, authenticated;

grant execute on function public.user_today(text)
to authenticated;

grant execute on function public.upcoming_days(integer)
to authenticated;
```

---

# 96. Lifecycle View SQL

```sql
create or replace view public.management_item_lifecycle_v
with (security_invoker = true)
as
select
  mi.id as item_id,
  mi.user_id,
  mi.name,
  mi.cycle_days,
  mi.archived_at,

  latest.last_performed_date,

  case
    when latest.last_performed_date is null
      or mi.cycle_days is null
    then null
    else latest.last_performed_date + mi.cycle_days
  end as next_due_date,

  case
    when mi.cycle_days is null then null
    else public.upcoming_days(mi.cycle_days)
  end as upcoming_days,

  (
    public.user_today(
      coalesce(p.timezone, 'Asia/Seoul')
    )
    - latest.last_performed_date
  ) as elapsed_days,

  (
    case
      when mi.archived_at is not null
        then 'ARCHIVED'

      when latest.last_performed_date is null
        then 'NO_HISTORY'

      when mi.cycle_days is null
        then 'NO_CYCLE'

      when public.user_today(
        coalesce(p.timezone, 'Asia/Seoul')
      ) >= latest.last_performed_date + mi.cycle_days
        then 'DUE'

      when latest.last_performed_date + mi.cycle_days
        <= public.user_today(
          coalesce(p.timezone, 'Asia/Seoul')
        ) + public.upcoming_days(mi.cycle_days)
        then 'UPCOMING'

      else 'NORMAL'
    end
  )::public.management_status as status

from public.management_items mi

left join public.profiles p
  on p.user_id = mi.user_id

left join lateral (
  select max(ar.performed_date) as last_performed_date
  from public.activity_records ar
  where ar.item_id = mi.id
    and ar.user_id = mi.user_id
    and ar.deleted_at is null
) latest on true;
```

---

# 97. Lifecycle View Grant

```sql
revoke all on table public.management_item_lifecycle_v
from anon, authenticated;

grant select on table public.management_item_lifecycle_v
to authenticated;
```

`security_invoker`로 Base Table RLS가 유지되어야 한다.

---

# 98. Lifecycle View 해석 예

Activity 0건:

```text
NO_HISTORY
```

Activity 존재 + Cycle null:

```text
NO_CYCLE
```

Cycle 존재:

```text
NORMAL / UPCOMING / DUE
```

Archived:

```text
ARCHIVED
```

Archive가 가장 높은 우선순위다.

---

# 99. DB-HARDEN-001 — Production Write Hardening

**필수 Migration.**

```sql
revoke insert, update, delete
on table public.profiles
from authenticated;

revoke insert, update, delete
on table public.management_items
from authenticated;

revoke insert, update, delete
on table public.activity_records
from authenticated;

revoke insert, update, delete
on table public.item_aliases
from authenticated;

revoke insert, update, delete
on table public.notification_settings
from authenticated;

revoke insert, update, delete
on table public.ai_parse_logs
from authenticated;

revoke insert, update, delete
on table public.ai_parse_segments
from authenticated;

revoke insert, update, delete
on table public.push_subscriptions
from authenticated;

revoke insert, update, delete
on table public.notification_deliveries
from authenticated;
```

이 Migration은 Release 전에 실제 적용 여부를 확인한다.

---

# 100. DB-HARDEN-001 추가 검증

Production-like DB에서 authenticated User로 직접 다음을 시도한다.

```text
management_items INSERT
activity_records INSERT
activity_records UPDATE
activity_records DELETE
notification_settings UPDATE
```

모두 실패해야 한다.

Application API를 통한 정상 Write는 성공해야 한다.

---

# 101. API/BFF Write 원칙

Server는 사용자 JWT/Session을 검증한 후 실제 Auth User를 식별한다.

그 다음:

- Ownership
- Business Rule
- Duplicate
- Future Date
- Confirmation State
- Idempotency
- Transaction

을 검증하고 Service Role로 DB Write한다.

Service Role이 Business Rule을 우회하는 편의 수단이 되어서는 안 된다.

---

# 102. Service Role 보안

MUST NOT:

- Browser Bundle
- Client Environment Variable
- HTML
- Source Map
- Public Repository
- Network Response

에 Service Role Secret을 노출한다.

---

# 103. Item Matching Query

기본 후보는:

```text
current user
AND archived_at IS NULL
```

대상.

우선순위:

1. Item Name Exact
2. Alias Exact
3. Optional Fuzzy Candidate
4. 없음

Fuzzy는 DB 자동 연결이 아니라 Application Candidate 생성용이다.

---

# 104. Exact Item Name Index

`lower(name)` Index를 지원하지만 한국어에서는 Case Folding보다 Trim/정규화 Application Logic이 더 중요할 수 있다.

Canonical 비교 문자열은 API에서 정규화한 뒤 Query한다.

---

# 105. Alias Exact Match

Alias를 통해 여러 후보가 나올 수 있다.

DB는 Ambiguity를 허용하고 UI가 Target 선택을 한다.

---

# 106. Record Create Transaction

단일 새 Item + Activity 예:

```text
BEGIN

1. Auth/Ownership 확인
2. Item Matching 결과 확인
3. 신규 Item이면 INSERT
4. Duplicate Guard
5. Activity INSERT
6. 필요 Alias INSERT
7. Notification/Lifecycle Side Effect 준비

COMMIT
```

실패 시 부분 신규 Item만 남지 않게 한다.

---

# 107. Multiple Record Transaction

사용자가 한 입력의 2~5 Record를 동시에 저장:

```text
BEGIN
모든 Entry 재검증
모든 Duplicate 상태 확인
모든 Item 연결/생성
모든 Activity INSERT
COMMIT
```

하나가 실패하면 전체 Rollback.

---

# 108. Item Merge Transaction [SHOULD]

```text
BEGIN

1. 같은 user인지 확인
2. 대표 Item 결정
3. Cycle 충돌 결정값 확인
4. Activity item_id 이동
5. Alias 통합
6. Notification Setting/Delivery 정리
7. Source Item archived_at 설정
8. 대표 Item Lifecycle 재평가

COMMIT
```

History 손실 금지.

---

# 109. Record Move Transaction

Activity를 Item A → B:

- 같은 사용자 B만 허용
- Future Date 재검증
- Duplicate 가능성 재검증
- Snapshot은 유지
- Lifecycle은 View에서 자동 재계산

Notification Side Effect는 Application Layer에서 양쪽 Item 기준으로 조정한다.

---

# 110. Record Delete

Core Delete:

```sql
update public.activity_records
set deleted_at = now()
where id = :record_id
  and user_id = :user_id
  and deleted_at is null;
```

실제 실행은 Server API에서 한다.

---

# 111. Record Restore [SHOULD]

```sql
update public.activity_records
set deleted_at = null
where id = :record_id
  and user_id = :user_id
  and deleted_at is not null;
```

Restore 전 Server는:

- Future Date
- Item 상태
- Duplicate
- Ownership

을 다시 확인한다.

---

# 112. Item Archive [SHOULD]

```sql
update public.management_items
set archived_at = now()
where id = :item_id
  and user_id = :user_id
  and archived_at is null;
```

Activity History를 삭제하지 않는다.

---

# 113. Item Restore [SHOULD]

```sql
update public.management_items
set archived_at = null
where id = :item_id
  and user_id = :user_id
  and archived_at is not null;
```

복원 후 Lifecycle은 현재 History/Cycle로 계산된다.

---

# 114. Cycle Set

```sql
update public.management_items
set cycle_days = :cycle_days
where id = :item_id
  and user_id = :user_id;
```

`:cycle_days >= 1`.

---

# 115. Cycle Remove

```sql
update public.management_items
set cycle_days = null
where id = :item_id
  and user_id = :user_id;
```

Activity History는 불변.

---

# 116. Notification Setting Upsert

Item-level Setting [SHOULD UI]:

```sql
insert into public.notification_settings (
  item_id,
  user_id,
  enabled,
  remind_local_time
)
values (
  :item_id,
  :user_id,
  :enabled,
  :remind_local_time
)
on conflict (item_id)
do update set
  enabled = excluded.enabled,
  remind_local_time = excluded.remind_local_time,
  updated_at = now();
```

서버가 Item Ownership을 먼저 확인한다.

---

# 117. Push Subscription Upsert

Application API는 Web Push Subscription을 받은 뒤:

- 현재 Auth User와 연결
- 동일 endpoint_hash 중복 방지
- 재등록 시 active=true
- Key 최신화

한다.

Browser가 Table을 직접 수정하지 않는다.

---

# 118. Logout Push 처리

로그아웃 시 현재 Device Subscription을:

```text
active = false
```

로 비활성화할 수 있다.

다른 Device Subscription까지 모두 끄지 않는다.

---

# 119. Notification 대상 기본조건

Worker가 Due 알림 후보를 만들기 전에 최소 다음을 확인한다.

```text
status = DUE
archived_at is null
cycle_days is not null
last_performed_date is not null
notification enabled
active push subscription exists
```

---

# 120. Stale Delivery Validation

전송 직전과 Notification Landing 시 현재 Lifecycle을 다시 확인한다.

새 Activity로 Due가 해소됐다면 기존 Delivery를:

```text
OBSOLETE
```

처리할 수 있다.

---

# 121. Snooze Delivery

Snooze 1/3/7일 선택:

- Activity 변경 X
- Item cycle_days 변경 X
- due_date 변경 X
- 새 `scheduled_for`을 갖는 PENDING Delivery 생성 또는 재예약
- idempotency_key로 중복 방지

---

# 122. Notification Payload 최소화

DB에 개인 상세가 있어도 Push Payload에는 모두 넣지 않는다.

권장:

```text
delivery_id
generic title/body
```

상세는 인증된 Landing API에서 조회한다.

---

# 123. AI Parse Segment와 Activity 연결

AI 기반 Activity가 생성된 경우:

```text
source_parse_segment_id
```

로 기술 추적 가능.

동일 Segment Retry로 두 Activity가 생성되지 않도록 Unique Partial Index를 사용한다.

---

# 124. Manual/Quick/Notification Activity

AI Segment가 없으므로:

```text
source_parse_segment_id = null
```

`idempotency_key`로 Retry를 방어한다.

---

# 125. AI Parse Log Retention

Prototype에서 자동 Hard Delete를 Core 기능으로 요구하지 않는다.

향후 Retention 정책을 적용할 경우:

- Activity 자체는 보존
- AI Log 원문 Nulling/Masking 고려
- FK 영향 검토
- QA 후 Migration

순서로 진행한다.

---

# 126. Account Delete

계정 삭제가 MVP Core UI 범위가 아니라면 별도 Flow로 구현하지 않을 수 있다.

하지만 `auth.users` Hard Delete가 발생하면 User-owned Row는 FK Cascade로 정리될 수 있도록 설계한다.

실제 개인정보 삭제정책은 배포/서비스 정책 단계에서 별도 확정한다.

---

# 127. Direct SQL 변경 금지 원칙

Production Data 수정은:

```text
임시 Dashboard 수동 편집
SQL Editor 수동 변경
```

을 정상 운영 Flow로 사용하지 않는다.

긴급 수정이 필요하면 Issue/Backup/기록을 남긴다.

---

# 128. Migration Discipline

MUST:

- Schema 변경은 Migration File로 관리
- 이미 배포된 Migration 임의 수정 금지
- 새 변경은 새 Migration 추가
- Local/Dev 먼저 실행
- Production-like 적용 전 Backup
- 적용 결과 기록

---

# 129. Seed Data

자동 사용자 Seed 금지.

개발 Test Fixture는 별도 Seed Script에서만 생성한다.

Production User 계정에 예시 Item을 자동 삽입하지 않는다.

---

# 130. Test Users

DB/RLS 테스트용 최소:

```text
tester_a
tester_b
```

각자 독립 Item/Activity를 가진다.

---

# 131. 2-User Isolation Test

User A Session으로:

- B Item SELECT 실패
- B Activity SELECT 실패
- B Item ID를 API에 넣은 Write 실패
- B Activity 수정/삭제 실패
- B Alias 미노출
- B Lifecycle Row 미노출

반대 방향도 동일.

---

# 132. Direct Browser Write Attack Test

authenticated Client로 Supabase Table API 직접 호출:

```text
INSERT management_items
INSERT activity_records
UPDATE activity_records
DELETE activity_records
UPDATE notification_settings
```

Production-like 환경에서 실패해야 한다.

---

# 133. Future Date DB Test

Profile:

```text
timezone = Asia/Seoul
```

User Today보다 하루 뒤 `performed_date` INSERT 시:

```text
FUTURE_PERFORMED_DATE_NOT_ALLOWED
```

로 실패해야 한다.

---

# 134. NO_HISTORY Test

유일한 Active Activity를 Soft Delete.

Expected Lifecycle:

```text
last_performed_date = null
next_due_date = null
status = NO_HISTORY
```

Cycle 값이 남아 있어도 NO_HISTORY가 우선이다.

---

# 135. NO_CYCLE Test

Active Activity 존재 + `cycle_days = null`.

Expected:

```text
status = NO_CYCLE
```

---

# 136. DUE Boundary Test

```text
User Today == next_due_date
→ DUE
```

---

# 137. UPCOMING Test

Cycle 28일:

```text
upcoming_days = 5
```

Next Due 5일 이내이고 아직 Due 전이면 UPCOMING.

---

# 138. NORMAL Test

Upcoming Window보다 이전이면 NORMAL.

---

# 139. ARCHIVED Test [SHOULD]

`archived_at != null`이면 Activity/Cycle 존재 여부와 관계없이:

```text
ARCHIVED
```

---

# 140. Activity Latest Delete Test

History:

```text
2026-06-01
2026-07-01
2026-08-01
```

8월 Record 삭제:

```text
last_performed_date = 2026-07-01
```

---

# 141. Older Activity Insert Test

현재 Last:

```text
2026-08-01
```

새로 과거:

```text
2026-06-15
```

추가:

- History Count 증가
- Last는 2026-08-01 유지
- Next Due 불변

---

# 142. Same-day Duplicate Test

같은 Item/Date Activity 2건은 DB Constraint로 Hard Block하지 않는다.

첫 번째 요청 Retry는 idempotency로 막고, 실제 두 번째 수행은 사용자 명시적 승인 후 다른 idempotency key로 저장 가능해야 한다.

---

# 143. Parse Segment Retry Test

같은 `source_parse_segment_id`로 두 번째 Activity INSERT 시 Unique Partial Index가 실패해야 한다.

---

# 144. Multi-save Rollback Test

3개 Activity 중 1개가 DB/Domain Validation 실패하면 전체 Transaction Rollback.

2개만 남아서는 안 된다.

---

# 145. Merge Rollback Test [SHOULD]

Merge 중 Alias/Activity 이동 실패 시 Source Item을 미리 Archive한 상태로 남기지 않는다.

전체 Rollback.

---

# 146. RLS View Test

authenticated User A가:

```sql
select * from public.management_item_lifecycle_v;
```

했을 때 A Item만 반환되어야 한다.

---

# 147. Server-managed Table Test

authenticated Browser가:

```text
ai_parse_logs
ai_parse_segments
push_subscriptions
notification_deliveries
```

직접 SELECT 시 Data를 볼 수 없어야 한다.

---

# 148. Schema Verification Query — Tables

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'management_items',
    'activity_records',
    'item_aliases',
    'notification_settings',
    'ai_parse_logs',
    'ai_parse_segments',
    'push_subscriptions',
    'notification_deliveries'
  )
order by table_name;
```

Expected:

```text
9 rows
```

---

# 149. Schema Verification Query — RLS

```sql
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'management_items',
    'activity_records',
    'item_aliases',
    'notification_settings',
    'ai_parse_logs',
    'ai_parse_segments',
    'push_subscriptions',
    'notification_deliveries'
  )
order by tablename;
```

모두 `rowsecurity = true`.

---

# 150. Schema Verification Query — Policies

```sql
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Production Baseline에서 authenticated Browser용 Core Write Policy가 없어야 한다.

---

# 151. Schema Verification Query — Grants

```sql
select
  table_name,
  privilege_type,
  grantee
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
order by table_name, privilege_type;
```

authenticated의 Core Table `INSERT / UPDATE / DELETE`가 없어야 한다.

---

# 152. Schema Verification Query — Indexes

```sql
select
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;
```

특히 확인:

- active Activity date index
- Record idempotency unique
- Parse segment unique
- Alias index
- Pending Notification index

---

# 153. Schema Verification Query — Triggers

```sql
select
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table, trigger_name;
```

---

# 154. Lifecycle Verification Query

```sql
select
  item_id,
  name,
  last_performed_date,
  cycle_days,
  next_due_date,
  upcoming_days,
  status
from public.management_item_lifecycle_v
order by name;
```

---

# 155. Security Verification — Service Role

Repository/Frontend Bundle에서 다음 문자열이 없어야 한다.

- Supabase Service Role Secret
- Server-only Database Secret
- Push Private Key
- AI/STT Secret

DB 구조가 안전해도 Secret 노출 시 Release 불가.

---

# 156. Database Error Surface

DB Exception Code/문자열을 사용자 UI에 그대로 보여주지 않는다.

Application API가 안전한 Domain Error로 변환한다.

예:

```text
FUTURE_PERFORMED_DATE_NOT_ALLOWED
→ 미래 날짜는 완료기록으로 저장할 수 없어요.
```

---

# 157. DB와 AI 책임 분리

DB는 다음을 판단하지 않는다.

- 자연어 Intent
- Scope
- Action 의미
- Query Type

AI Parser/Application Layer의 책임이다.

DB는 최종 구조와 무결성을 보장한다.

---

# 158. DB와 UI 책임 분리

DB는 다음 Visual 개념을 저장하지 않는다.

- Color
- Icon
- Status Label Korean Copy
- Bottom Navigation State
- Loading State

UI가 Derived Status를 사용자 문구로 변환한다.

---

# 159. DB와 Notification Worker 책임 분리

DB는 Delivery State를 보존한다.

Worker는:

- 언제 확인할지
- 몇 번 Retry할지
- Provider 전송
- 실패 분류

를 담당한다.

Worker Schedule은 본 DB Spec에서 고정하지 않는다.

---

# 160. DB와 API 책임 분리

Database Constraint가 있다고 API Validation을 생략하지 않는다.

Application API는 사용자에게 설명 가능한 Domain Error를 먼저 만들고, DB는 최종 방어층으로 사용한다.

---

# 161. MUST 데이터 Traceability

| MVP MUST | DB 지원 |
|---|---|
| Text/Voice | activity input_method / original_text |
| Intent/Action/Date | ai_parse_logs / ai_parse_segments |
| Confirmation 후 Save | activity_records |
| Item Matching | management_items / item_aliases |
| New Item | management_items |
| Last Performed | lifecycle view |
| All Management | management_items + lifecycle view |
| History | activity_records |
| Edit/Delete | activity_records |
| Cycle | management_items.cycle_days |
| Next Due | lifecycle view |
| Status | lifecycle view |
| Dashboard | lifecycle view |
| Due Notification | settings/subscriptions/deliveries |
| Today Complete | activity_records |
| Auth | auth.users + profiles |
| User Isolation | user_id + RLS + composite FK |
| Persistent DB | PostgreSQL |
| External Deployment | Production Migration / RLS / Hardening |

---

# 162. SHOULD 데이터 Traceability

| SHOULD | DB 지원 |
|---|---|
| Record Restore | activity_records.deleted_at |
| Item Archive | management_items.archived_at |
| Item Restore | archived_at = null |
| Item Merge | reassign Activity/Alias + archive source |
| Item-level Notification | notification_settings |

SHOULD는 Schema에 준비되어 있어도 UI/API 구현 우선순위는 별도다.

---

# 163. Codex 구현 절대 규칙

Codex는 다음을 임의 변경하지 않는다.

1. `last_performed_date`를 Management Item authoritative column으로 추가
2. `next_due_date`를 수동 관리 column으로 추가
3. `status`를 mutable source-of-truth column으로 추가
4. `NO_HISTORY`를 제거
5. `is_active`와 `archived_at`을 동시에 사용
6. `is_deleted`와 `deleted_at`을 동시에 사용
7. 동일 Item/Date UNIQUE Constraint 추가
8. TARGET을 AI Clarification Enum에 추가
9. Browser authenticated Core Write 권한 복구
10. Service Role Secret을 Frontend에 노출
11. Cross-user Composite FK 제거
12. Future Date Trigger 제거
13. Activity History를 최신 한 건으로 덮어씀
14. Production에서 DB-HARDEN-001 생략

문서와 실제 Supabase 제약이 충돌하면 임의 우회하지 않고 보고한다.

---

# 164. Migration 실행 전 Checklist

- 적용 Project 확인
- Backup
- Migration 순서 확인
- Dev 먼저 실행
- 기존 Migration 수정 금지
- Environment Secret 확인
- 현재 Schema Drift 확인

---

# 165. Migration 실행 후 Checklist

- 9 Table 생성
- Enum 생성
- FK 생성
- Trigger 생성
- Index 생성
- RLS Enabled
- Read Policy 확인
- Browser Write Revoked
- Lifecycle View 생성
- security_invoker 확인
- Future Date Test
- 2-User Isolation Test
- Application API 정상 Write Test

---

# 166. Runtime 검증과 Static 검증 구분

본 문서 자체에서 가능한 검증:

- SQL 구조 정합성 검토
- Table/Enum/Constraint 이름 대조
- 상위 문서와 계약 대조
- RLS/Grant 설계 대조
- Migration 순서 대조

실제 Supabase에서만 가능한 검증:

- SQL Migration 실행 성공
- Trigger Runtime
- RLS Runtime
- Auth Trigger Runtime
- Query Plan
- 2-User Isolation
- API Service Role Write
- Web Push Worker 연계

현재 문서 완성만으로 Runtime PASS를 주장하지 않는다.

---

# 167. Final Sync 검증 기준

본 v1.1은 다음과 동기화되어야 한다.

- PRD v1.1 MUST/SHOULD
- BRS v1.1 `NO_HISTORY`
- UFS v1.1 Record Delete → NO_HISTORY
- UI/UX v1.1 Snapshot Edit 금지
- AI Parser v1.1 Schema 1.0
- UNKNOWN Intent
- Scope 3종
- IMPLICIT_TODAY
- TARGET 책임 분리
- Device Notification
- Stale Notification
- Snooze
- Record Idempotency
- Multi-save Atomicity
- Production Browser Write Hardening

---

# 168. Development Baseline 완료

본 문서를 LASTLY Prototype의 Supabase/PostgreSQL 구현 기준선으로 사용한다.

핵심 원칙:

> **수행 사실은 Activity History에 누적하고, Lifecycle은 그 History에서 계산하며, Production Browser는 Business Rule을 우회해 Core Table을 직접 수정하지 못하게 한다.**

---

## DB-ERD Spec v1.1 Final Sync 상태

**상위 문서 Final Sync:** 완료  
**Table:** 9개 확정  
**Activity History Source of Truth:** 확정  
**NO_HISTORY:** 반영  
**NO_CYCLE / NORMAL / UPCOMING / DUE / ARCHIVED:** 반영  
**Snapshot 불변:** 반영  
**Soft Delete:** 반영  
**Archive/Merge:** SHOULD 지원  
**AI Schema v1.0 호환:** 유지  
**Cross-user Composite FK:** 반영  
**Future Date DB Guard:** 반영  
**Idempotency:** 반영  
**Lifecycle Security-invoker View:** 반영  
**RLS:** 반영  
**DB-HARDEN-001:** Production 필수 편입  
**Browser Direct Core Write:** 금지  
**실제 Migration SQL:** 포함  
**Codex 구현 기준:** 사용 가능  
