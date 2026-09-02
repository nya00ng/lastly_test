# LASTLY Business Rule Specification
## AI 생활주기 기억 웹앱
**BRS v1.1 — Final Sync Baseline**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 문서 | Business Rule Specification |
| 기준 문서 | 01 LASTLY PRD v1.1 FINAL |
| 하위 문서 정합성 | 03 UFS v1.1 FINAL / AI Parser v1.0 / DB·ERD v1.0 / API v1.0 / Validation Dataset v1.0 / QA v1.0 |
| 제품 형태 | Mobile-first Web App / PWA |
| 적용 범위 | 외부 사용자가 실제 테스트 가능한 Prototype |
| 기준일 | 2026.08.30 |
| 문서 상태 | **Development Baseline — Final Sync** |

---

# 1. 문서 목적

이 문서는 LASTLY의 제품 요구사항을 실제 구현 가능한 비즈니스 규칙으로 고정한다.

PRD가 “무엇을 만들 것인가”를 정의한다면 BRS는 다음을 정의한다.

- 어떤 자연어 입력을 수행기록으로 인정하는가
- 어떤 입력은 절대 Activity로 만들면 안 되는가
- AI가 불확실할 때 무엇을 확인해야 하는가
- AI Parser와 Item Matching의 책임은 어디까지인가
- Management Item과 Activity Record를 어떻게 생성하고 연결하는가
- 중복·복수 행동·수정·삭제·복원 시 기록을 어떻게 보호하는가
- 관리주기, 다음 관리일, 상태를 어떻게 계산하는가
- `NO_HISTORY / NO_CYCLE / NORMAL / UPCOMING / DUE / ARCHIVED`를 어떻게 구분하는가
- Due Notification, Today Complete, Other Date, Snooze를 어떻게 처리하는가
- 어떤 기능이 Core MUST이고 어떤 기능이 SHOULD인가
- 사용자별 데이터와 실제 수행 사실을 어떻게 안전하게 보존하는가

이 문서는 특정 Framework, SQL 문법, HTTP Status Code, Provider SDK, UI Pixel 값을 정의하지 않는다.

---

# 2. 문서 우선순위

문서 충돌 시 기본 우선순위:

```text
01 PRD
↓
02 BRS
↓
03 User Flow / 04 UI·UX
↓
05 AI / 06 DB / 07 API
↓
08 Validation / 09 QA / 10~12 운영 문서
```

기술 구현에서 발견된 실제 보안·데이터 무결성 문제가 상위 규칙 변경을 요구하면 상위 문서를 먼저 수정한 뒤 구현한다.

Codex 또는 구현 Agent가 문서 충돌을 임의로 해석하여 제품 규칙을 변경해서는 안 된다.

---

# 3. 규범 용어

- **MUST**: Core Prototype 완료에 반드시 필요하다.
- **MUST NOT**: 절대 허용하지 않는다.
- **SHOULD**: 유용하지만 Core Prototype 완료와 분리한다.
- **MAY**: 선택 구현 가능하다.
- **Record Candidate**: 아직 Activity가 아니며 사용자 Confirmation에 제시 가능한 저장 후보.
- **Active Activity**: 삭제되지 않은 유효 Activity.
- **Active Item**: Archive되지 않은 Item.
- **User Today**: 사용자 Timezone 기준 오늘 날짜.

---

# 4. 제품 불변 규칙

## BR-GEN-001 — 제품 시작점

LASTLY의 기본 기록은 앞으로 할 일이 아니라 **이미 수행한 반복 생활관리 행동**이다.

## BR-GEN-002 — Core Loop

```text
기록
→ 기억
→ 관리
→ 알림
→ 재기록
```

## BR-GEN-003 — 범용 To-do 금지

LASTLY를 일반 To-do, Calendar, Habit Checklist로 확장하지 않는다.

## BR-GEN-004 — 사용자 사실 우선

사용자가 실제로 했는지에 대한 사실은 AI 판단보다 우선한다.

## BR-GEN-005 — AI 자동저장 금지

AI 해석만으로 Activity를 생성해서는 안 된다.

## BR-GEN-006 — History 누적

새 수행은 이전 수행을 덮어쓰지 않고 새 Activity로 추가한다.

## BR-GEN-007 — 파생값 원칙

`last_performed`, `next_due`, `status`, `elapsed`는 Activity History와 Cycle에서 파생한다.

## BR-GEN-008 — 신뢰 우선

편의성 때문에 False Completion 위험을 높이는 자동화를 도입하지 않는다.

---

# 5. 입력 채널 규칙

## BR-IN-001 — Text

사용자는 자연어 Text로 기록할 수 있어야 한다.

## BR-IN-002 — Voice

사용자는 Voice로 기록할 수 있어야 한다.

## BR-IN-003 — Voice Pipeline

```text
Voice
→ STT
→ Transcript
→ 사용자 확인/수정
→ 동일 AI Parser
```

## BR-IN-004 — Transcript 확인

STT 결과는 AI 분석 전에 사용자가 확인·수정할 수 있어야 한다.

## BR-IN-005 — STT Fallback

STT 실패 시 Text Input으로 Core Loop를 계속할 수 있어야 한다.

## BR-IN-006 — 입력 보존

STT, AI, Network, Save 오류가 발생해도 사용자의 입력은 가능한 한 보존한다.

## BR-IN-007 — 최대 의미 행동

한 입력에서 처리하는 의미 행동은 최대 5개다.

## BR-IN-008 — 5개 초과

5개를 초과하면 일부만 조용히 Parse/Save하지 않는다. 입력을 나누도록 안내한다.

---

# 6. Intent 모델

공식 Intent:

```text
COMPLETED
PLANNED
NOT_COMPLETED
UNCERTAIN
QUERY
UNKNOWN
```

`UNKNOWN`은 제품 기능이 아니라 안전 fallback이다.

## BR-INT-001 — COMPLETED

실제 행동 완료가 명확하다.

예:

```text
오늘 이불 빨았어
어제 칫솔 바꿨어
```

## BR-INT-002 — PLANNED

앞으로 수행할 계획이다.

Activity를 생성하지 않는다.

## BR-INT-003 — NOT_COMPLETED

하지 않았거나 완료하지 못했다.

Activity를 생성하지 않는다.

## BR-INT-004 — UNCERTAIN

사용자 자신도 실제 완료 여부를 확신하지 못한다.

자동 Record Candidate가 아니다.

## BR-INT-005 — QUERY

기존 기억에 대한 질문이다.

새 Activity를 만들지 않는다.

## BR-INT-006 — UNKNOWN

의미를 안전하게 분류할 수 없다.

Activity를 만들지 않는다.

## BR-INT-007 — 문장 전체 의미 우선

단일 키워드가 아니라 문장 전체 의미를 본다.

예:

```text
오늘 이불 빨려고 했는데 못 했어
→ NOT_COMPLETED
```

## BR-INT-008 — False Completion 최우선 방지

다음 상태를 COMPLETED로 잘못 넘기는 오류는 Critical이다.

```text
PLANNED
NOT_COMPLETED
UNCERTAIN
QUERY
UNKNOWN
```

## BR-INT-009 — Intent 직접 승격 금지

AI가 `PLANNED / NOT_COMPLETED / QUERY / UNKNOWN`으로 판정했는데 사용자가 AI 판정이 틀렸다고 말하는 경우, 기존 AI Segment를 조용히 COMPLETED로 승격하지 않는다.

**Manual Record Flow**에서 Action/Date를 사용자에게 다시 확정받는다.

## BR-INT-010 — UNCERTAIN 완료 예외

`UNCERTAIN`만 사용자가 “실제로 했다”고 명시적으로 확인하고 Action과 정확한 Date를 확정하면 Record Flow로 진행할 수 있다.

---

# 7. Scope 모델

공식 Scope:

```text
IN_SCOPE
OUT_OF_SCOPE
UNCERTAIN
```

## BR-SCP-001 — IN_SCOPE

다음 질문에 YES인 행동:

> “마지막으로 언제 수행했는지를 기억하는 것이 이후 반복 생활관리에 의미가 있는가?”

## BR-SCP-002 — OUT_OF_SCOPE

일반 일기, 사회활동, 업무, 오락 등 반복 생활관리 목적이 아닌 행동.

예:

```text
친구 만났어
영화 봤어
보고서 제출했어
```

## BR-SCP-003 — 범용 Lifelog 금지

OUT_OF_SCOPE를 일반 생활기록으로 저장하지 않는다.

## BR-SCP-004 — UNCERTAIN

범위를 안전하게 판단할 수 없으면 사용자에게 확인한다.

## BR-SCP-005 — Scope 직접 승격 금지

OUT_OF_SCOPE 판정이 잘못됐다고 사용자가 수정하는 경우 기존 AI Segment를 직접 IN_SCOPE 완료로 승격하지 않고 Manual Record Flow로 전환한다.

---

# 8. Record Candidate 규칙

## BR-RC-001 — 기본 Record Candidate 조건

다음을 모두 만족해야 한다.

```text
intent = COMPLETED
AND scope = IN_SCOPE
AND normalized_action 존재
AND date_precision = EXACT
AND resolved_date 존재
AND resolved_date <= User Today
AND unresolved clarification 없음
```

## BR-RC-002 — Candidate ≠ Activity

Record Candidate는 실제 저장된 Activity가 아니다.

## BR-RC-003 — 사용자 Confirmation 필수

Core Prototype에서 실제 Activity 생성 전 사용자 Confirmation을 반드시 거친다.

## BR-RC-004 — UNCERTAIN 예외

사용자가 실제 완료를 명시적으로 확인하고 Action/Date까지 확정한 경우만 저장 가능하다.

## BR-RC-005 — 금지 Intent

`PLANNED / NOT_COMPLETED / QUERY / UNKNOWN`은 AI_PARSE Record Candidate로 직접 승격할 수 없다.

## BR-RC-006 — OUT_OF_SCOPE 금지

OUT_OF_SCOPE는 AI_PARSE Record Candidate로 직접 승격할 수 없다.

## BR-RC-007 — 숫자 Confidence 금지

LLM Self-confidence 점수는 저장 가능 여부의 Business Rule로 사용하지 않는다.

---

# 9. Action 규칙

## BR-ACT-001 — 정규화 형식

권장:

```text
[대상] + [행위]
```

## BR-ACT-002 — 원문 보존

사용자 Original Text와 Normalized Action을 분리한다.

## BR-ACT-003 — 의미 변경 금지

```text
청소 ≠ 교체
교체 ≠ 점검
세탁 ≠ 소독
```

## BR-ACT-004 — 정보 환각 금지

입력에 없는 위치, 사람, 제품 종류를 임의로 추가하지 않는다.

## BR-ACT-005 — Action Clarification

```text
청소했어
갈았어
바꿨어
```

처럼 대상이 불명확하면 사용자에게 확인한다.

## BR-ACT-006 — 유사 표현

의미가 같은 표현은 동일 Item 후보로 연결할 수 있다.

## BR-ACT-007 — Alias 후보

사용자가 확정한 간결한 표현은 향후 Alias 후보로 사용할 수 있다.

## BR-ACT-008 — Raw Sentence Alias 금지

날짜를 포함한 전체 원문을 그대로 Item Alias로 사용하지 않는다.

---

# 10. 날짜 규칙

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

## BR-DATE-001 — User Today

날짜 계산은 사용자 Timezone 기준으로 한다.

초기 기본 Timezone:

```text
Asia/Seoul
```

## BR-DATE-002 — EXACT

오늘/어제/그제/명시 날짜처럼 하루가 확정되면 EXACT다.

## BR-DATE-003 — IMPLICIT_TODAY

명확한 COMPLETED이고 날짜 표현과 과거/미래 Marker가 없다면 User Today를 기본 제안할 수 있다.

예:

```text
칫솔 바꿨어
```

이 경우에도 자동저장하지 않는다.

## BR-DATE-004 — APPROXIMATE

```text
지난주쯤
며칠 전에
최근에
```

정확한 날짜를 임의 생성하지 않는다.

## BR-DATE-005 — UNKNOWN

```text
전에
예전에
언젠가
```

정확한 날짜를 임의 생성하지 않는다.

## BR-DATE-006 — QUERY Date

조회 질문에서 수행일 해석이 필요 없으면 `NOT_APPLICABLE`을 사용할 수 있다.

## BR-DATE-007 — 미래 Activity 금지

`performed_date > User Today`인 완료 Activity를 저장하지 않는다.

## BR-DATE-008 — 미래 완료 충돌

완료형 + 미래 날짜가 충돌하면 Date Clarification을 요구한다.

## BR-DATE-009 — 저장 전 EXACT

MVP 실제 Activity는 정확한 수행일을 가져야 한다.

## BR-DATE-010 — 날짜 환각 Critical

APPROXIMATE/UNKNOWN을 AI가 임의 EXACT 날짜로 바꾸는 것은 Release Blocker다.

---

# 11. Clarification 규칙

AI Parser Clarification:

```text
COMPLETION
ACTION
DATE
SCOPE
```

## BR-CLR-001 — 불필요 질문 금지

명확한 입력에 추가 질문을 남발하지 않는다.

## BR-CLR-002 — COMPLETION

완료 여부 불확실 시 실제 수행 여부를 묻는다.

## BR-CLR-003 — ACTION

무엇을 했는지 불명확하면 Action을 묻는다.

## BR-CLR-004 — DATE

APPROXIMATE/UNKNOWN/미래 충돌이면 Date를 묻는다.

## BR-CLR-005 — SCOPE

생활관리 범위인지 불확실하면 Scope를 묻는다.

## BR-CLR-006 — 미해결 저장 금지

필수 Clarification이 남아 있으면 저장 Confirmation으로 이동하지 않는다.

## BR-CLR-007 — TARGET 책임 분리

기존 Item 후보 중 어느 Item인지 선택하는 `TARGET`은 AI Parser Clarification Enum이 아니다.

Item Matching의 사용자 선택 문제다.

---

# 12. Multiple Actions 규칙

## BR-MUL-001 — Segment 분리

여러 의미 행동은 개별 Segment로 분리한다.

## BR-MUL-002 — Intent 독립

각 Segment의 Intent를 독립적으로 유지한다.

## BR-MUL-003 — 저장 가능 Segment만

Record Candidate 조건을 만족한 Segment만 저장 후보가 된다.

## BR-MUL-004 — 사용자 제외

사용자는 특정 Segment를 저장 대상에서 제외할 수 있다.

## BR-MUL-005 — Atomic Save

여러 Record를 한 번에 최종 저장하는 경우 기본적으로:

```text
전체 성공
또는
전체 실패
```

로 처리한다.

## BR-MUL-006 — 부분 저장 금지

한 Segment 검증 실패 때문에 나머지만 조용히 저장하지 않는다.

---

# 13. Management Item 규칙

## BR-ITEM-001 — 정의

Management Item은 반복 관리 단위다.

## BR-ITEM-002 — Activity와 분리

```text
Management Item 1
→ Activity N
```

## BR-ITEM-003 — Existing Item Matching

새 완료기록 저장 전 현재 사용자의 Active Item과 매칭을 시도한다.

## BR-ITEM-004 — 후보 1개

충분히 명확한 후보가 1개면 기존 Item 연결을 제안한다.

## BR-ITEM-005 — 후보 여러 개

여러 후보면 사용자가 Target을 선택한다.

AI가 임의 선택하지 않는다.

## BR-ITEM-006 — 후보 없음

신규 Item 생성을 제안한다.

## BR-ITEM-007 — 신규 Item 생성 시점

Core MVP의 새 Item은 기본적으로 실제 완료 Activity와 함께 생성한다.

## BR-ITEM-008 — Empty Item Setup 금지

미래 할 일 준비용 빈 Item 생성 Flow를 기본 Core로 제공하지 않는다.

## BR-ITEM-009 — 사용자별 Matching

현재 사용자 Item만 후보로 사용한다.

## BR-ITEM-010 — Archived 기본 제외

Archived Item은 기본 Item Matching 후보에서 제외한다.

## BR-ITEM-011 — Category

Category는 Optional Metadata이며 기록 필수값이 아니다.

## BR-ITEM-012 — Owner/Location

MVP에서 별도 필수 Field로 강제하지 않는다.

---

# 14. Activity Record 규칙

## BR-REC-001 — 정의

Activity는 사용자가 실제 수행한 한 번의 사건이다.

## BR-REC-002 — 누적

재수행은 새 Activity를 만든다.

## BR-REC-003 — 정확한 수행일

유효 Activity는 EXACT performed_date를 가진다.

## BR-REC-004 — Original Text

자연어 기반 기록은 사용자가 최종 확정한 원문을 보존한다.

## BR-REC-005 — Action Snapshot

생성 당시 확정 Action 의미를 보존한다.

## BR-REC-006 — Quick Complete

Item Detail 또는 Notification의 `오늘 했어요`는 AI Parser 없이 새 Activity를 생성할 수 있다.

## BR-REC-007 — Other Date

정확한 과거 수행일로 새 Activity를 추가할 수 있다.

## BR-REC-008 — 오래된 과거 Activity

현재 Last보다 오래된 Activity를 추가해도 History에는 추가하되 Last는 더 최신 Activity를 유지한다.

---

# 15. Duplicate 규칙

## BR-DUP-001 — 중복 후보

기본 기준:

```text
same user
same active Management Item
same performed_date
Activity not deleted
```

## BR-DUP-002 — 자동 중복 금지

중복 후보가 있으면 조용히 추가하지 않는다.

## BR-DUP-003 — 명시적 추가 허용

실제로 같은 날 여러 번 수행했다면 사용자가 명시적으로 추가할 수 있다.

## BR-DUP-004 — 기술 재시도 중복 금지

더블클릭, Network Retry, 동일 Segment 재전송으로 중복 Activity가 생겨서는 안 된다.

## BR-DUP-005 — 복수 저장 중복 충돌

복수 저장 중 하나가 중복 충돌이면 전체 저장을 멈추고 다시 확인한다.

---

# 16. Last Performed 규칙

## BR-LAST-001 — Source of Truth

삭제되지 않은 Activity 중 가장 최신 performed_date다.

## BR-LAST-002 — 동일 날짜 복수

같은 날짜에 여러 Activity가 있어도 Last Date는 해당 날짜다.

## BR-LAST-003 — 독립 입력 금지

사용자가 Last Performed를 별도 사실값으로 직접 수정하지 않는다.

## BR-LAST-004 — 최신 삭제

최신 Activity 삭제 후 그 이전 최신 Activity가 Last가 된다.

## BR-LAST-005 — Activity 없음

유효 Activity가 0건이면 Last Performed는 없다.

---

# 17. Record Edit 규칙

## BR-EDIT-001 — 수행일 수정

사용자는 잘못된 수행일을 수정할 수 있다.

## BR-EDIT-002 — Item 이동

사용자는 자신의 다른 Active Item으로 Record를 이동할 수 있다.

## BR-EDIT-003 — Snapshot 편집 제외

Original Text/Action Snapshot 같은 생성 당시 추적 정보는 Core 일반 Edit 대상이 아니다.

## BR-EDIT-004 — 재계산

수정 후 영향 Item의 Last, Next Due, Status, Notification Plan을 다시 계산한다.

## BR-EDIT-005 — 양쪽 Item

Item A → B 이동 시 양쪽을 재계산한다.

## BR-EDIT-006 — 미래 수정 금지

수정 후 performed_date도 User Today 이하만 허용한다.

---

# 18. Record Delete 규칙

## BR-DEL-001 — Core Delete

Record Delete는 Core MUST다.

## BR-DEL-002 — Soft Delete 기본

일반 UI에서는 복구 가능성을 위해 Soft Delete 방식이 기본이다.

## BR-DEL-003 — 삭제된 Activity 제외

삭제된 Activity는 Last/Lifecycle 계산에서 제외한다.

## BR-DEL-004 — 삭제 후 재계산

Last, Next Due, Status, Notification Plan을 다시 계산한다.

## BR-DEL-005 — 유일 Activity 삭제

유일한 Activity를 삭제하면:

```text
Last 없음
Next Due 없음
Status = NO_HISTORY
```

## BR-DEL-006 — Undo

신규 Activity 생성 직후 약 10초의 Undo UX를 기본으로 사용할 수 있다.

---

# 19. Record Restore [SHOULD]

## BR-RST-001 — 우선순위

삭제 Activity 복원은 SHOULD 기능이다.

Core 25 MUST의 Release Blocker가 아니다.

## BR-RST-002 — 복원 시 검증

구현할 경우:

- 소유권
- 미래 날짜
- Duplicate
- Item 상태

를 다시 검증한다.

## BR-RST-003 — 복원 후 재계산

Lifecycle과 Notification Plan을 다시 계산한다.

---

# 20. Item Edit 규칙

## BR-IEDIT-001 — 이름 수정

Item Name 수정은 Core에서 허용할 수 있다.

## BR-IEDIT-002 — History 불변

Item 이름을 바꿔도 Activity History를 변경하지 않는다.

## BR-IEDIT-003 — 빈 이름 금지

빈 Item 이름을 허용하지 않는다.

---

# 21. Item Archive / Restore [SHOULD]

## BR-ARC-001 — 우선순위

Item Archive/Restore는 SHOULD 기능이다.

Core 25 MUST와 분리한다.

## BR-ARC-002 — Archive 영향

구현된 경우:

- History 유지
- Active Dashboard 제외
- Active 목록 기본 제외
- 관리 알림 중단

## BR-ARC-003 — Restore

Restore 시 현재 History와 Cycle을 기준으로 Lifecycle을 다시 계산한다.

---

# 22. Item Merge [SHOULD]

## BR-MRG-001 — 우선순위

Duplicate Item Merge는 SHOULD 기능이다.

## BR-MRG-002 — 동일 사용자만

다른 사용자의 Item과 Merge할 수 없다.

## BR-MRG-003 — History 보존

모든 Activity History를 보존한다.

## BR-MRG-004 — Cycle 충돌

Cycle이 다르면 사용자가 대표 Cycle을 선택한다.

## BR-MRG-005 — Alias

유효 Alias를 대표 Item에 통합한다.

## BR-MRG-006 — 원자성

Merge는 전체 성공 또는 전체 실패로 처리한다.

## BR-MRG-007 — 원본 Item

성공 후 Source Item은 History 손실 없이 Archive/비활성 처리한다.

---

# 23. Cycle 규칙

MVP Cycle:

```text
NONE
INTERVAL_DAYS
```

## BR-CYC-001 — 사용자 결정

사용자가 직접 설정한다.

## BR-CYC-002 — AI 자동결정 금지

AI가 관리주기를 권위적으로 자동 확정하지 않는다.

## BR-CYC-003 — INTERVAL_DAYS

MVP 계산 단위는 N일마다.

## BR-CYC-004 — 유효값

1 이상의 정수다.

## BR-CYC-005 — NONE

주기를 설정하지 않을 수 있다.

## BR-CYC-006 — 저장 직후 선택

새 Record 후 Cycle 설정을 제안할 수 있지만 강제하지 않는다.

## BR-CYC-007 — History 불변

Cycle 변경/제거는 Activity History를 변경하지 않는다.

## BR-CYC-008 — Cycle 제거

Next Due가 사라지고 관리 알림 대상에서 제외한다.

## BR-CYC-009 — 실제 수행 기준 재시작

Early/Late Completion 모두 실제 최신 수행일에서 다음 Cycle을 다시 시작한다.

---

# 24. Next Due 규칙

## BR-DUE-001 — 공식

```text
next_due_date = last_performed_date + cycle_days
```

## BR-DUE-002 — 계산 조건

다음이 모두 있어야 한다.

```text
Last Performed
+
INTERVAL_DAYS
+
유효 cycle_days
```

## BR-DUE-003 — 과거 Activity 추가

현재 Last보다 오래된 과거 Activity 추가는 Next Due를 바꾸지 않는다.

## BR-DUE-004 — 직접 수정 금지

Next Due를 독립 입력값으로 직접 수정하지 않는다.

---

# 25. Upcoming Threshold 규칙

## BR-UP-001 — 공식

```text
upcoming_days = min(5, ceil(cycle_days × 0.20))
최소 1일
```

## BR-UP-002 — 예시

```text
1일 → 1일
7일 → 2일
28일 → 5일
90일 → 5일
```

---

# 26. Lifecycle Status 규칙

공식 상태:

```text
ARCHIVED
NO_HISTORY
NO_CYCLE
NORMAL
UPCOMING
DUE
```

## BR-STS-001 — ARCHIVED

Archive된 Item.

## BR-STS-002 — NO_HISTORY

Active Item에 유효 Activity가 0건.

## BR-STS-003 — NO_CYCLE

유효 Activity는 있지만 Cycle이 없음.

## BR-STS-004 — DUE

```text
User Today >= next_due_date
```

## BR-STS-005 — UPCOMING

DUE는 아니며:

```text
next_due_date <= User Today + upcoming_days
```

## BR-STS-006 — NORMAL

위 상태에 해당하지 않는 Cycle Item.

## BR-STS-007 — 판정 우선순위

```text
ARCHIVED
→ NO_HISTORY
→ NO_CYCLE
→ DUE
→ UPCOMING
→ NORMAL
```

---

# 27. Dashboard 규칙

## BR-DASH-001 — 목적

> “지금 무엇을 관리해야 하지?”

## BR-DASH-002 — 포함

```text
DUE
UPCOMING
NORMAL
```

## BR-DASH-003 — 기본 제외

```text
NO_CYCLE
NO_HISTORY
ARCHIVED
```

## BR-DASH-004 — DUE 정렬

가장 오래 지연된 Item 우선.

## BR-DASH-005 — UPCOMING/NORMAL 정렬

Next Due가 가까운 Item 우선.

---

# 28. All Management 규칙

## BR-LIST-001 — 목적

> “나는 무엇을 관리하고 있지?”

## BR-LIST-002 — Active Item 전체

현재 사용자의 Active Item을 모두 확인할 수 있어야 한다.

## BR-LIST-003 — NO_CYCLE

표시한다.

## BR-LIST-004 — NO_HISTORY

표시한다.

## BR-LIST-005 — ARCHIVED

기본 목록에서는 제외한다.

## BR-LIST-006 — 검색

Item Name + Alias 검색을 지원한다.

## BR-LIST-007 — 정렬

All Management의 기본 정렬은 핵심 Business Rule이 아니다.

UI/API에서 구체화한다.

---

# 29. Notification 기본 규칙

## BR-NOTI-001 — Cycle 필요

Cycle이 없는 Item에는 Due Notification을 만들지 않는다.

## BR-NOTI-002 — History 필요

Last가 없으면 Due Notification을 만들지 않는다.

## BR-NOTI-003 — Archived 제외

Archived Item에는 보내지 않는다.

## BR-NOTI-004 — 기본 시점

MVP 기본 알림은 Due Date다.

## BR-NOTI-005 — 권한 거부

Push Permission이 없어도 기록/History/Dashboard는 사용할 수 있어야 한다.

## BR-NOTI-006 — Permission 요청 시점

첫 앱 진입 즉시 강제하지 않는다.

Cycle 설정 후처럼 맥락 있는 시점을 사용한다.

## BR-NOTI-007 — Device 중심

MVP Notification 설정의 핵심은 **현재 기기에서 알림을 받을 수 있는가**다.

전역 서비스 Boolean과 혼동하지 않는다.

## BR-NOTI-008 — Stale 재검증

Notification 클릭 시 현재 Item 상태를 다시 조회한다.

## BR-NOTI-009 — Stale 완료 금지

이미 새 Activity가 있어 기존 Due가 무효라면 오래된 알림을 완료하도록 강요하지 않는다.

## BR-NOTI-010 — 새 Activity 영향

어떤 경로든 새 최신 Activity가 생성되면 기존 Snooze/Pending Due를 무효화하고 새 Lifecycle 기준으로 다시 조정한다.

## BR-NOTI-011 — Activity 우선

Activity 저장이 성공했다면 Notification 후처리 실패 때문에 수행기록 자체를 삭제하지 않는다.

실제 수행 사실은 Activity가 Source of Truth다.

---

# 30. Notification Action 규칙

## BR-NACT-001 — 오늘 했어요

User Today로 새 Activity를 생성한다.

## BR-NACT-002 — 다른 날 했어요

정확한 과거 날짜로 Activity를 생성한다.

## BR-NACT-003 — 미래 금지

Other Date에서도 미래일은 금지한다.

## BR-NACT-004 — Snooze

```text
Activity 생성 X
Last 변화 X
Next Due 변화 X
Status = DUE 유지
Notification만 연기
```

## BR-NACT-005 — Snooze 상태

DUE Item에서만 적용한다.

## BR-NACT-006 — Snooze 옵션

MVP:

```text
1일
3일
7일
```

## BR-NACT-007 — Calendar Day 의미

사용자 지역 날짜 기준 Calendar Day만큼 연기한다.

---

# 31. Query 규칙

## BR-QRY-001 — 식별

QUERY를 초기에 식별하여 Activity로 잘못 저장하지 않는다.

## BR-QRY-002 — 저장 금지

QUERY는 Activity를 생성하지 않는다.

## BR-QRY-003 — 실제 조회는 NEXT

자연어 기억 조회는 Parser 안전분류는 MVP에 포함하지만 실제 대화형 조회 기능은 NEXT다.

---

# 32. Empty State 규칙

## BR-EMP-001 — 자동 Seed 금지

신규 사용자 계정에 추천 Item을 자동 대량 생성하지 않는다.

## BR-EMP-002 — 첫 행동 유도

실제 완료 행동을 한 문장으로 기록하도록 안내한다.

## BR-EMP-003 — 예시 데이터

예시는 사용자 실제 데이터로 저장하지 않는다.

---

# 33. Authentication / Ownership 규칙

## BR-AUTH-001 — 인증

개인 데이터 사용에는 인증이 필요하다.

## BR-AUTH-002 — 단일 소유자

개인 Item/Activity는 정확히 한 사용자에게 속한다.

## BR-AUTH-003 — Cross-user 금지

다른 사용자의 Item/Activity/Alias/Notification Data를 조회·수정·삭제할 수 없다.

## BR-AUTH-004 — Client user_id 불신

Client가 보낸 `user_id`만으로 Ownership을 결정하지 않는다.

## BR-AUTH-005 — Re-login Persistence

로그아웃/재로그인 후 데이터는 유지된다.

## BR-AUTH-006 — Logout Privacy

로그아웃 후 이전 사용자의 개인 데이터가 화면에 남지 않는다.

---

# 34. Timezone 규칙

## BR-TZ-001 — 기본

초기 기본 Timezone:

```text
Asia/Seoul
```

## BR-TZ-002 — User-local 계산

Today/Future Validation/Lifecycle/Snooze는 사용자 Timezone 기준.

## BR-TZ-003 — UTC Date 직접 사용 금지

서버 UTC Calendar Date를 사용자 Today로 그대로 사용하지 않는다.

---

# 35. Data Integrity 규칙

## BR-DATA-001 — Activity Source of Truth

실제 수행 사실의 Source of Truth는 Activity History다.

## BR-DATA-002 — AI Log 분리

AI Parse Log와 실제 Activity 사실 데이터를 분리한다.

## BR-DATA-003 — Client 파생값 불신

Client가 계산한 Last/Next Due/Status를 사실의 최종 기준으로 저장하지 않는다.

## BR-DATA-004 — Atomic Operation

다음은 원자적으로 처리해야 한다.

Core MUST:

- 복수 Activity 저장

SHOULD:

- Item Merge

## BR-DATA-005 — Save 성공 확인

실제 저장이 확인되기 전에 Success UI를 표시하지 않는다.

## BR-DATA-006 — 안전한 실패

잘못된 데이터를 조용히 저장하는 것보다 실패시키고 수정/재시도를 제공하는 것을 우선한다.

---

# 36. Error / Fallback 규칙

## BR-ERR-001 — AI 실패

원문 유지 + Manual Record Flow.

## BR-ERR-002 — STT 실패

다시 말하기 또는 Text Fallback.

## BR-ERR-003 — Network 실패

입력 유지 + Retry.

## BR-ERR-004 — DB 실패

Success 처리 금지.

## BR-ERR-005 — Date 오류

날짜만 수정 가능하게 한다.

## BR-ERR-006 — Item Matching 실패

실제 완료기록이면 새 Item으로 복구 가능하다.

## BR-ERR-007 — Session 만료

개인 DB Write를 중단하고 재인증 후 가능한 경우 입력을 복구한다.

---

# 37. Lifecycle 재계산 Matrix

| Event | Last | Next Due | Status | Notification |
|---|---:|---:|---:|---:|
| Activity Create | 재계산 | 재계산 | 재계산 | 조정 |
| Activity Date Edit | 재계산 | 재계산 | 재계산 | 조정 |
| Activity Item Move | 양쪽 재계산 | 양쪽 재계산 | 양쪽 재계산 | 양쪽 조정 |
| Activity Delete | 재계산 | 재계산 | 재계산 | 조정 |
| Activity Restore [SHOULD] | 재계산 | 재계산 | 재계산 | 조정 |
| Undo | 재계산 | 재계산 | 재계산 | 조정 |
| Cycle Set | 불변 | 재계산 | 재계산 | 조정 |
| Cycle Change | 불변 | 재계산 | 재계산 | 조정 |
| Cycle Remove | 불변 | null | NO_CYCLE 또는 NO_HISTORY | 취소 |
| Item Merge [SHOULD] | 재계산 | 재계산 | 재계산 | 조정 |
| Archive [SHOULD] | History 유지 | 비활성 | ARCHIVED | 취소 |
| Restore Item [SHOULD] | 재계산 | 재계산 | 재계산 | 조정 |
| Today Complete | 재계산 | 재계산 | 재계산 | 새 Cycle |
| Other Date | 재계산 | 재계산 | 재계산 | 조정 |
| Snooze | 불변 | 불변 | DUE 유지 | 재예약 |

---

# 38. Lifecycle 예시

```text
Last = 2026-08-30
Cycle = 28일
Next Due = 2026-09-27
Upcoming = 5일
```

결과:

```text
2026-09-21 → NORMAL
2026-09-22 → UPCOMING
2026-09-26 → UPCOMING
2026-09-27 → DUE
2026-09-28 → DUE
```

---

# 39. Critical Negative Rules

## BR-NEG-001

```text
오늘 이불 못 빨았어
→ Activity 생성
```

금지.

## BR-NEG-002

```text
내일 이불 빨 거야
→ Activity 생성
```

금지.

## BR-NEG-003

```text
이불 언제 빨았지?
→ Activity 생성
```

금지.

## BR-NEG-004

```text
지난주쯤 이불 빨았어
→ 임의 날짜 저장
```

금지.

## BR-NEG-005

```text
미래 performed_date
→ 완료 Activity 저장
```

금지.

## BR-NEG-006

```text
AI Confidence 높음
→ Confirmation 생략
```

금지.

## BR-NEG-007

```text
기존 Item 여러 개
→ AI 임의 Target 선택
```

금지.

## BR-NEG-008

```text
Snooze
→ Activity 생성
```

금지.

## BR-NEG-009

```text
새 수행
→ 이전 Activity 덮어쓰기
```

금지.

## BR-NEG-010

```text
다른 사용자 Item ID 조작
→ 조회/수정 성공
```

금지.

## BR-NEG-011

```text
5개 초과 행동
→ 일부만 조용히 저장
```

금지.

## BR-NEG-012

```text
DB 실패
→ 성공 화면 표시
```

금지.

---

# 40. Core MVP MUST 25

1. 자연어 텍스트 입력
2. 음성 입력
3. Voice → Text
4. Intent 분류
5. Action 추출
6. Date 추출
7. AI Confirmation
8. AI 결과 수정
9. Persistent Record Save
10. 기존 Item Matching
11. 신규 Item 생성
12. Last Performed
13. All Management
14. Item History
15. Record Edit/Delete
16. User Cycle
17. Next Due
18. Status
19. Dashboard
20. Due Notification
21. 오늘 했어요
22. Authentication
23. User Data Isolation
24. Persistent DB
25. External Deployment

Core Prototype 완료에는 25/25가 필요하다.

---

# 41. MVP SHOULD

다음은 Core 25 MUST와 분리한다.

- Record Restore
- Item Archive
- Archived Item Restore
- Item Merge
- 세부 Item Notification Setting UI
- 기타 관리 편의 기능

SHOULD 미구현만으로 `prototype-v1` Core Release를 실패로 판정하지 않는다.

SHOULD를 MUST로 승격하려면 PRD/BRS를 먼저 변경한다.

---

# 42. Non-goals

- Generic To-do
- Calendar
- Habit Checklist
- 가족 공유
- 사진 행동인식
- IoT
- 외부 Calendar 연동
- Siri/Bixby
- AI 자동 Cycle 결정
- 개인화 AI Cycle 학습
- 고급 생활관리 Report
- 생활점수
- 범용 AI Assistant/Agent

---

# 43. NEXT

- 자연어 기억 조회
- 실제 Activity 기반 기본 Report
- 평균 수행간격
- Item별 수행 Pattern

---

# 44. LATER

- 개인화 Cycle 제안
- Siri/Bixby
- 가족/공간 공동관리
- 외부 입력 채널
- 고급 Report
- IoT/사진인식

---

# 45. 구현 책임 경계

| 책임 | 담당 |
|---|---|
| Intent/Scope/Action/Date 해석 | AI Parser |
| Schema/Semantic Validation | Application Layer |
| Existing Item 후보 탐색 | Item Matching |
| Ambiguous Target 선택 | 사용자 |
| 최종 Action/Date 확정 | 사용자 |
| 저장 가능 여부 최종검증 | Domain/Application |
| Activity 영속 저장 | Database |
| Last/Next Due/Status | Lifecycle Domain/Read Model |
| Notification 최신 상태 검증 | Notification Service |
| 사용자 데이터 격리 | Auth + Ownership + DB Policy |

AI Parser 하나에 위 책임을 몰아넣지 않는다.

---

# 46. Manual Record Flow

AI가 실패했거나 사용자가 AI 판정을 거부하면:

```text
Action 직접 입력
↓
Performed Date 직접 선택
↓
생활관리 기록 여부 확정
↓
Item Matching
↓
Confirmation
↓
Save
```

Manual Flow도 다음 규칙을 우회하지 않는다.

- Future Date 금지
- Ownership
- Duplicate
- History 누적
- Confirmation
- Save 성공 확인

---

# 47. BRS → User Flow 정합성

03 UFS v1.1 FINAL은 다음을 본 BRS 기준으로 사용한다.

- AI Parser 뒤에 Item Matching 실행
- UNKNOWN Flow
- Scope UNCERTAIN Flow
- IMPLICIT_TODAY
- NO_HISTORY
- 5개 초과 행동 처리
- Manual Record Flow
- Multiple Atomic Save
- Stale Notification
- Snooze 1/3/7
- Device Notification
- MUST/SHOULD 분리

---

# 48. BRS → AI Parser 정합성

AI Parser는 다음 값을 사용한다.

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

Clarification:

```text
COMPLETION
ACTION
DATE
SCOPE
```

`TARGET`은 Parser Clarification Enum에 추가하지 않는다.

---

# 49. BRS → Database 정합성

Database는 최소 다음 불변을 보장할 수 있어야 한다.

- User Ownership
- Item ↔ Activity 관계
- Activity History 누적
- Soft Delete
- NO_HISTORY 파생 가능
- Cycle 저장
- Notification 연계 데이터
- Cross-user 연결 차단

Production Browser가 Business Rule을 우회해 Core Table을 직접 Write하지 못하도록 최종 DB/API 정책을 적용한다.

---

# 50. BRS → API 정합성

API는 최소 다음을 보장한다.

- Auth
- Ownership
- Parser Validation
- Item Matching
- Confirmation 이후 Save
- Future Date 차단
- Duplicate Guard
- Idempotency
- Atomic Multi Save
- Lifecycle Recalculation
- Notification 최신 상태 재검증

SHOULD Endpoint는 Core MUST Endpoint와 분리한다.

---

# 51. Acceptance Scenarios

## 완료

```text
오늘 이불 빨았어
→ COMPLETED
→ IN_SCOPE
→ 이불 세탁
→ 오늘
→ Item Matching
→ 사용자 확인
→ Activity 생성
```

## 날짜 없는 완료

```text
칫솔 바꿨어
→ COMPLETED
→ IMPLICIT_TODAY
→ 사용자 확인
→ Activity 생성
```

## 미완료

```text
오늘 이불 못 빨았어
→ NOT_COMPLETED
→ Activity 0
```

## 예정

```text
내일 이불 빨 거야
→ PLANNED
→ Activity 0
```

## 완료 불확실

```text
필터 갈았었나?
→ UNCERTAIN
→ 완료 확인 전 Activity 0
```

## 날짜 불확실

```text
지난주쯤 이불 빨았어
→ DATE Clarification
→ 정확한 날짜 전 Activity 0
```

## 조회

```text
이불 언제 빨았지?
→ QUERY
→ Activity 0
```

## Target Ambiguous

```text
필터 청소했어
→ 기존 필터 Item 여러 개
→ 사용자 Target 선택
```

## Duplicate

```text
same Item + same Date
→ Warning
→ 사용자 확인 전 추가 Activity 0
```

## NO_HISTORY

```text
유일 Activity 삭제
→ Last 없음
→ Next Due 없음
→ NO_HISTORY
```

## Snooze

```text
DUE
→ 나중에 알려줘
→ Activity 0
→ DUE 유지
→ Push만 연기
```

## Merge [SHOULD]

```text
Item A 3건
+
Item B 2건
→ Merge
→ 대표 Item 5건
```

---

# 52. Codex 구현 절대 규칙

Codex 또는 다른 구현 Agent는 다음을 임의 변경하지 않는다.

1. AI 결과 자동저장 금지
2. Confirmation 생략 금지
3. False Completion 금지
4. Future Activity 금지
5. APPROXIMATE/UNKNOWN 날짜 임의 확정 금지
6. Ambiguous Item 임의선택 금지
7. History 덮어쓰기 금지
8. Snooze 완료처리 금지
9. Cross-user 접근 금지
10. 5개 초과 행동 부분 저장 금지
11. SHOULD를 Core MUST로 임의 승격 금지
12. QUERY/PLANNED/NOT_COMPLETED를 완료 Activity로 직접 승격 금지

충돌 발견 시 구현을 중단하고 상위 문서 확인을 요구한다.

---

# 53. 본 문서에서 제외하는 기술 세부사항

Business Rule이 아니므로 이 문서에 고정하지 않는다.

- HTTP Status Code
- Endpoint URL
- SQL Column 전체 목록
- RLS SQL 문법
- Trigger SQL
- Index 종류
- Framework Version
- 특정 LLM/STT Provider
- Hosting Provider
- UI Pixel/Color/Typography
- Worker Cron 주기
- Provider Timeout ms
- Logging Backend

---

# 54. Final Sync 검증 기준

본 최종본은 다음을 확인했다.

- PRD v1.1의 Core 25 MUST와 일치
- MUST / SHOULD 분리
- Intent 6종
- Scope 3종
- UNKNOWN 안전 fallback
- IMPLICIT_TODAY
- NO_HISTORY
- AI Parser / Item Matching 책임 분리
- Manual Record Flow
- 5개 초과 행동 부분 저장 금지
- Multiple Atomic Save
- Duplicate Guard
- Record Edit/Delete
- Restore / Archive / Merge의 SHOULD 분리
- Cycle / Next Due / Upcoming / Status
- Device Notification
- Stale Notification
- Snooze 1/3/7
- User Isolation
- History Integrity
- Codex 구현 금지사항

---

# 55. Development Baseline 완료

BRS v1.1은 다음 기준을 최종 고정한다.

```text
제품 불변 원칙
Intent
Scope
Record Candidate
Action
Date
Clarification
Item Matching
Activity History
Duplicate
Edit/Delete
MUST/SHOULD
Cycle
Lifecycle
Dashboard
Notification
Snooze
Auth
Data Integrity
Error/Fallback
```

따라서 본 문서를 **LASTLY 개발용 Business Rule 최종 기준선**으로 사용한다.

---

## BRS v1.1 Final Sync 상태

**PRD v1.1 정합성:** 완료  
**UFS v1.1 정합성:** 완료  
**Intent 6종:** 완료  
**Scope 3종:** 완료  
**UNKNOWN:** 반영  
**IMPLICIT_TODAY:** 반영  
**NO_HISTORY:** 반영  
**MUST 25:** 고정  
**SHOULD:** 분리  
**AI Parser ↔ Item Matching:** 분리  
**Manual Record Flow:** 반영  
**False Completion:** 강화  
**Multiple Atomic Save:** 반영  
**Record Edit/Delete:** Core 반영  
**Restore/Archive/Merge:** SHOULD 반영  
**Cycle/Lifecycle:** 확정  
**Device Notification / Stale / Snooze:** 확정  
**Auth/User Isolation:** 확정  
**Codex 구현 기준:** 사용 가능  
