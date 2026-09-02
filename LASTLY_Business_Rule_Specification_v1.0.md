# LASTLY Business Rule Specification
## AI 생활주기 기억 웹앱
**BRS v1.0 — Reconciled Final Baseline**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 문서 | Business Rule Specification |
| 기준 문서 | LASTLY PRD v1.0 |
| 하위 문서 정합성 검토 | UFS / UI·UX FS / AI Parser / DB·ERD / API / Validation Dataset / QA / Development Plan / Deployment Checklist / Registration Document |
| 제품 형태 | Mobile-first Web App / PWA |
| 개발 형태 | 1인 단계별 개발 |
| 적용 범위 | 외부 사용자가 실제 테스트 가능한 Prototype MVP |
| 기준일 | 2026.08.30 |
| 문서 상태 | **Development Baseline — Final** |

---

# 1. 문서 목적

이 문서는 LASTLY의 제품 요구사항을 **구현 가능한 비즈니스 규칙**으로 고정한다.

PRD가 “무엇을 만들 것인가”를 정의한다면, BRS는 다음을 정의한다.

- 어떤 입력을 수행기록으로 인정하는가
- 어떤 입력을 절대 기록하면 안 되는가
- AI가 불확실할 때 무엇을 확인해야 하는가
- Management Item과 Activity Record가 어떻게 생성되고 연결되는가
- 날짜, 관리주기, 다음 관리일, 관리상태를 어떻게 계산하는가
- 기록 수정·삭제·복원·병합 시 어떤 파생 상태가 달라지는가
- 알림과 Snooze가 수행기록과 어떻게 구분되는가
- 사용자별 데이터가 어떤 원칙으로 분리되는가
- 오류가 발생해도 어떤 사실 데이터를 보존해야 하는가

이 문서는 SQL, HTTP Endpoint, 특정 UI Component, 특정 AI Provider를 정의하지 않는다.  
기술 구현은 05~07번 문서가 담당하며, 그 구현은 본 비즈니스 규칙을 변경해서는 안 된다.

---

# 2. 검토 및 재작성 원칙

기존 BRS 초안을 그대로 파일화하지 않고, 이후 작성된 03~12번 문서에서 발견된 보완사항을 역으로 대조하여 본 최종본에 반영했다.

이번 재검토에서 반영한 주요 보완은 다음과 같다.

1. AI 안전 fallback인 `UNKNOWN` Intent를 공식화했다.
2. Scope의 `UNCERTAIN` 상태를 공식화했다.
3. 날짜 없는 명확한 완료형의 `IMPLICIT_TODAY` 규칙을 공식화했다.
4. 모든 Activity가 삭제된 Item을 위한 `NO_HISTORY` 상태를 추가했다.
5. 5개 초과 행동 입력을 부분 저장하지 않는 규칙을 추가했다.
6. AI Parser와 Item Matching의 책임을 명확히 분리했다.
7. `PLANNED / NOT_COMPLETED / QUERY / UNKNOWN / OUT_OF_SCOPE`를 AI 결과에서 직접 완료기록으로 승격하지 못하게 했다.
8. `UNCERTAIN`만 사용자의 명시적 완료 확인을 거쳐 기록 가능하도록 예외를 명시했다.
9. 복수 기록 저장은 기본적으로 All-or-Nothing으로 처리하도록 했다.
10. Record Soft Delete / Restore / Item Archive / Merge의 이력 보존 규칙을 명확히 했다.
11. Notification의 Stale 재검증, Snooze 1/3/7일, 새 수행 후 기존 알림 무효화 규칙을 반영했다.
12. 파생값의 Source of Truth를 Activity History + Cycle로 명확히 했다.
13. AI 숫자 Confidence를 저장 가능 여부의 기준으로 사용하지 않도록 명시했다.
14. 새 Management Item을 미래 설정용으로 독립 생성하지 않고, 실제 완료기록과 함께 생성하는 정책을 확정했다.

반대로 API Status Code, SQL Trigger, Index, Provider Timeout 등 **기술 문서에서만 필요한 세부사항은 BRS에서 제거하거나 다루지 않는다.**

---

# 3. 규범 용어

- **MUST**: 반드시 지켜야 한다.
- **MUST NOT**: 절대 해서는 안 된다.
- **SHOULD**: 특별한 이유가 없다면 지켜야 한다.
- **MAY**: 선택 적용 가능하다.
- **Activity Record**: 사용자가 실제 수행한 한 번의 생활관리 사건.
- **Management Item**: 여러 Activity가 누적되는 반복 관리 단위.
- **Record Candidate**: 아직 저장된 사실은 아니며, 사용자 Confirmation에 제시할 수 있는 저장 후보.
- **User Today**: 사용자 Timezone 기준의 현재 날짜.
- **Active Activity**: 삭제되지 않은 유효 Activity.
- **Active Item**: Archive되지 않은 Management Item.

---

# 4. 제품 불변 규칙

## BR-GEN-001 — 제품의 시작점

LASTLY의 기본 입력은 **앞으로 할 일**이 아니라 **이미 수행한 생활관리 행동**이어야 한다.

## BR-GEN-002 — Core Loop

MVP의 핵심 Loop는 다음과 같다.

```text
기록
→ 기억
→ 관리
→ 알림
→ 재기록
```

## BR-GEN-003 — 범용 To-do 금지

LASTLY는 일반 To-do, Calendar, Habit Checklist로 확장하지 않는다.

## BR-GEN-004 — 사실 우선

사용자가 실제로 수행했다는 사실은 AI 추론보다 우선한다.

## BR-GEN-005 — AI 자동저장 금지

AI 해석만으로 Activity Record를 생성해서는 안 된다.

## BR-GEN-006 — History 보존

새 수행은 이전 수행을 덮어쓰지 않고 새 Activity로 누적한다.

## BR-GEN-007 — 파생값 원칙

`last_performed`, `next_due`, `status`, `elapsed`는 사용자의 직접 입력값이 아니라 유효 Activity와 Cycle에서 파생된다.

## BR-GEN-008 — 신뢰 우선

편의성 때문에 False Completion 위험을 증가시키는 자동화를 도입해서는 안 된다.

---

# 5. 입력 채널

## BR-IN-001 — 텍스트 지원

사용자는 자연어 텍스트로 기록할 수 있어야 한다.

## BR-IN-002 — 음성 지원

사용자는 음성으로 기록할 수 있어야 한다.

## BR-IN-003 — 음성의 역할

음성은 별도의 기록 로직이 아니라 텍스트로 변환되는 입력 채널이다.

```text
Voice
→ STT
→ Text
→ 동일 AI Pipeline
```

## BR-IN-004 — STT 결과 확인

STT 결과는 AI 분석 전에 사용자가 확인하거나 수정할 수 있어야 한다.

## BR-IN-005 — STT 실패 Fallback

STT가 실패해도 사용자는 직접 텍스트를 입력하여 Core Loop를 끝까지 진행할 수 있어야 한다.

## BR-IN-006 — 입력 보존

STT, AI, Network 또는 Save 오류가 발생해도 사용자가 입력한 원문은 가능한 한 유지한다.

## BR-IN-007 — 처리 행동 수

한 번의 자연어 입력에서 처리 가능한 의미 행동은 최대 5개다.

## BR-IN-008 — 5개 초과

5개를 초과하는 의미 행동이 감지되면 일부만 선택하여 반환하거나 저장해서는 안 된다. 사용자가 입력을 나누도록 안내한다.

---

# 6. Intent 규칙

AI Parser의 공식 Intent는 다음 6개다.

```text
COMPLETED
PLANNED
NOT_COMPLETED
UNCERTAIN
QUERY
UNKNOWN
```

## BR-INT-001 — COMPLETED

사용자가 실제로 행동을 완료했다고 명확히 말한 경우다.

예:

```text
오늘 이불 빨았어.
어제 칫솔 바꿨어.
필터 청소 끝냈어.
```

기본적으로 Record Candidate가 될 수 있다.

## BR-INT-002 — PLANNED

앞으로 수행할 계획이다.

예:

```text
내일 이불 빨 거야.
주말에 필터 바꿀 예정이야.
```

Activity를 생성하지 않는다.

## BR-INT-003 — NOT_COMPLETED

하지 않았거나 완료하지 못했다.

예:

```text
오늘 이불 못 빨았어.
필터 아직 안 갈았어.
```

Activity를 생성하지 않는다.

## BR-INT-004 — UNCERTAIN

사용자 자신도 실제 완료 여부를 확신하지 못한다.

예:

```text
필터 갈았었나?
이불 빨았던 것 같아.
```

자동 Record Candidate가 될 수 없다.

## BR-INT-005 — QUERY

기존 기록에 대한 질문이다.

예:

```text
이불 언제 빨았지?
칫솔 바꾼 지 얼마나 됐어?
```

새 Activity를 생성하지 않는다.

## BR-INT-006 — UNKNOWN

의미를 안전하게 분류할 수 없는 경우다.

Activity를 생성하지 않는다.

## BR-INT-007 — False Completion 최우선 방지

다음 오분류는 MVP에서 가장 심각한 오류다.

```text
PLANNED
NOT_COMPLETED
UNCERTAIN
QUERY
UNKNOWN
→ COMPLETED
```

## BR-INT-008 — 복합 부정

단어 하나가 아니라 문장 전체 의미를 기준으로 Intent를 판단한다.

예:

```text
오늘 이불 빨려고 했는데 못 했어.
→ NOT_COMPLETED
```

## BR-INT-009 — 완료와 미완료가 함께 있는 문장

서로 다른 실제 사건이 존재하면 의미 Segment로 분리한다.

예:

```text
오늘은 안 했고 어제 했어.
```

실제 저장 후보는 “어제 완료” Segment다.

## BR-INT-010 — AI 판정 수정

AI가 `PLANNED / NOT_COMPLETED / QUERY / UNKNOWN`으로 판정했지만 사용자가 AI 해석 자체가 틀렸다고 주장하는 경우, 해당 AI Segment를 직접 `COMPLETED`로 조용히 승격하지 않는다.

사용자가 완료 Action과 정확한 Date를 직접 확정하는 **Manual Record Flow**로 전환한다.

---

# 7. Scope 규칙

Scope는 다음 3개다.

```text
IN_SCOPE
OUT_OF_SCOPE
UNCERTAIN
```

## BR-SCP-001 — IN_SCOPE 기준

다음 질문에 YES인 생활 행동을 기본 IN_SCOPE로 본다.

> “마지막으로 언제 수행했는지를 기억하는 것이 이후 반복 생활관리에 의미가 있는가?”

예:

- 이불 세탁
- 칫솔 교체
- 세탁조 청소
- 에어컨 필터 청소
- 공기청정기 필터 교체
- 수세미 교체

## BR-SCP-002 — OUT_OF_SCOPE

일반 일기, 사회활동, 업무 완료, 오락 기록 등 LASTLY의 반복 생활관리 목적과 직접 관계없는 행동은 OUT_OF_SCOPE다.

예:

```text
오늘 친구 만났어.
영화 봤어.
보고서 제출했어.
카페 갔어.
```

## BR-SCP-003 — 단순 반복 가능성만으로 포함 금지

어떤 행동이 반복될 수 있다는 이유만으로 IN_SCOPE로 분류해서는 안 된다.

## BR-SCP-004 — Scope UNCERTAIN

문맥이 부족해 관리행동인지 판단할 수 없으면 UNCERTAIN으로 처리한다.

## BR-SCP-005 — OUT_OF_SCOPE 저장 금지

AI_PARSE 흐름에서 OUT_OF_SCOPE는 Activity Record로 저장하지 않는다.

## BR-SCP-006 — Scope 확인 예외

Scope가 `UNCERTAIN`인 경우에만 사용자가 “생활관리 항목이 맞다”고 명시적으로 확인하고 Action/Date도 확정하면 Record Candidate가 될 수 있다.

## BR-SCP-007 — OUT_OF_SCOPE 판정이 틀린 경우

사용자가 OUT_OF_SCOPE AI 판정 자체가 틀렸다고 수정하려면 해당 AI Segment를 직접 승격하지 않고 Manual Record Flow에서 다시 확정한다.

---

# 8. Record Candidate 규칙

## BR-RC-001 — 기본 조건

다음 조건을 모두 만족한 Segment만 기본 Record Candidate가 될 수 있다.

```text
intent = COMPLETED
AND scope = IN_SCOPE
AND normalized_action 존재
AND date_precision = EXACT
AND resolved_date 존재
AND resolved_date <= User Today
AND unresolved clarification 없음
```

## BR-RC-002 — Candidate는 저장이 아니다

Record Candidate가 되더라도 사용자 Confirmation 전에는 Activity가 아니다.

## BR-RC-003 — UNCERTAIN 완료 예외

Intent가 `UNCERTAIN`이어도 사용자가 실제 완료를 명시적으로 확정하고, Action과 정확한 수행일을 확정하면 Activity 생성이 가능하다.

## BR-RC-004 — UNCERTAIN 예외의 필수조건

UNCERTAIN을 저장할 때는 “완료했다고 사용자가 명시적으로 확인했다”는 사실이 있어야 한다.

## BR-RC-005 — 금지 Intent 직접 승격

`PLANNED / NOT_COMPLETED / QUERY / UNKNOWN`은 AI_PARSE Record Candidate로 직접 승격할 수 없다.

## BR-RC-006 — OUT_OF_SCOPE 직접 승격 금지

OUT_OF_SCOPE는 AI_PARSE Record Candidate로 직접 승격할 수 없다.

## BR-RC-007 — Confidence 금지

LLM이 반환하는 숫자 Confidence 값은 Record Candidate 또는 자동저장 여부를 결정하는 비즈니스 기준으로 사용하지 않는다.

---

# 9. Action 규칙

## BR-ACT-001 — 정규화 목적

사용자 표현을 간결한 반복 관리 행동명으로 정규화한다.

권장 형식:

```text
[대상] + [행위]
```

## BR-ACT-002 — 원문 보존

정규화된 Action과 별도로 사용자의 원문을 보존한다.

## BR-ACT-003 — 의미 보존

정규화 과정에서 행위 의미를 변경해서는 안 된다.

예:

```text
청소 ≠ 교체
교체 ≠ 점검
세탁 ≠ 소독
```

## BR-ACT-004 — 존재하지 않는 정보 추정 금지

입력에 없는 위치, 사람, 제품 종류를 임의로 추가하지 않는다.

## BR-ACT-005 — 대상 없는 Action

```text
청소했어.
갈았어.
바꿨어.
```

처럼 관리 대상을 알 수 없으면 Action Clarification이 필요하다.

## BR-ACT-006 — 유사 표현

다음처럼 의미가 같은 사용자 표현은 동일 Item 후보로 연결할 수 있다.

```text
이불 빨았어
이불 빨래했어
이불 세탁했어
```

## BR-ACT-007 — Alias

사용자가 확정한 짧은 Action 표현은 향후 Item Matching을 위한 Alias 후보로 사용할 수 있다.

## BR-ACT-008 — Raw Sentence Alias 금지

날짜와 전체 문장을 포함한 원문 전체를 Item Alias로 사용하지 않는다.

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

날짜 계산은 사용자 Timezone 기준의 현재 날짜를 사용한다.

초기 기본 Timezone은 `Asia/Seoul`이다.

## BR-DATE-002 — 명확한 날짜

오늘, 어제, 그제, 특정 달력 날짜처럼 하루가 확정되면 `EXACT`다.

## BR-DATE-003 — 날짜 없는 완료형

명확한 COMPLETED 문장에 날짜 표현과 과거/미래 표현이 전혀 없으면 User Today를 기본 제안한다.

이 경우:

```text
date_precision = EXACT
date_resolution_source = IMPLICIT_TODAY
```

로 구분하여 사용자가 Confirmation 화면에서 확인할 수 있게 한다.

## BR-DATE-004 — APPROXIMATE

```text
지난주쯤
며칠 전에
최근에
```

처럼 하루를 특정할 수 없으면 `APPROXIMATE`다.

정확한 날짜를 임의 생성해서는 안 된다.

## BR-DATE-005 — UNKNOWN

```text
전에
예전에
언젠가
```

처럼 날짜를 특정할 수 없으면 `UNKNOWN`이다.

정확한 날짜를 임의 생성해서는 안 된다.

## BR-DATE-006 — QUERY

조회 질문에서 수행일 파싱 자체가 의미 없으면 `NOT_APPLICABLE`을 사용할 수 있다.

## BR-DATE-007 — 미래 수행일 금지

완료 Activity의 `performed_date`는 User Today보다 미래일 수 없다.

## BR-DATE-008 — 미래 COMPLETED 충돌

문법상 완료형인데 해석 날짜가 미래이면 그대로 Record Candidate로 만들지 않고 날짜 확인을 요구한다.

## BR-DATE-009 — 저장 전 정확한 날짜

MVP의 실제 Activity는 확정된 정확한 `performed_date`를 가져야 한다.

## BR-DATE-010 — AI 날짜 환각 금지

APPROXIMATE/UNKNOWN 표현을 AI가 임의의 EXACT 날짜로 바꾸는 것은 Release Blocker다.

---

# 11. Clarification 규칙

AI Parser의 의미 Clarification Type:

```text
COMPLETION
ACTION
DATE
SCOPE
```

## BR-CLR-001 — 필요한 질문만

명확한 입력에 불필요한 추가 질문을 하지 않는다.

## BR-CLR-002 — COMPLETION

완료 여부가 불확실하면 사용자가 실제 수행 여부를 확인한다.

## BR-CLR-003 — ACTION

Action 자체가 불명확하면 어떤 행동인지 확인한다.

## BR-CLR-004 — DATE

날짜가 APPROXIMATE, UNKNOWN 또는 미래 충돌이면 정확한 수행일을 확인한다.

## BR-CLR-005 — SCOPE

생활관리 범위인지 판단이 불확실하면 사용자가 관리대상인지 확인한다.

## BR-CLR-006 — 미해결 Clarification 저장 금지

필수 Clarification이 하나라도 해결되지 않았으면 Activity를 저장하지 않는다.

## BR-CLR-007 — Target Clarification 책임

기존 Item 후보 중 어느 Item인지 선택하는 `TARGET` 문제는 AI Parser Clarification Enum이 아니라 Item Matching 단계의 사용자 선택 문제다.

---

# 12. Multiple Actions 규칙

## BR-MUL-001 — Segment 분리

한 입력에 서로 다른 의미 행동이 여러 개 있으면 개별 Segment로 분리한다.

## BR-MUL-002 — 각 Segment Intent 유지

완료, 계획, 미완료가 섞여 있어도 각 Segment의 Intent를 독립적으로 유지한다.

## BR-MUL-003 — 저장 대상 선택

Record Candidate 조건을 만족한 Segment만 저장 후보가 될 수 있다.

## BR-MUL-004 — 사용자 제외

사용자는 저장 후보 중 특정 Segment를 제외할 수 있어야 한다.

## BR-MUL-005 — 복수 저장 원자성

사용자가 한 번에 여러 Record를 최종 저장하는 경우, 기본적으로 **전체 성공 또는 전체 실패**로 처리한다.

한 Entry의 중복/검증 오류 때문에 나머지만 조용히 저장해서는 안 된다.

---

# 13. Management Item 규칙

## BR-ITEM-001 — Item 정의

Management Item은 반복 관리되는 생활 행동/대상 단위다.

## BR-ITEM-002 — Activity와 분리

Item 자체와 실제 수행 사건(Activity)은 분리한다.

```text
Management Item 1
→ Activity Record N
```

## BR-ITEM-003 — 기존 Item 우선

새 완료기록을 저장하기 전에 사용자의 기존 Active Item과 매칭을 시도한다.

## BR-ITEM-004 — 후보 하나

충분히 명확한 기존 Item 후보가 하나라면 해당 Item 연결을 제안한다.

## BR-ITEM-005 — 후보 여러 개

여러 기존 Item 후보가 존재하면 자동 선택하지 않고 사용자가 선택한다.

## BR-ITEM-006 — 후보 없음

적절한 기존 Item이 없으면 새 Item 생성을 제안한다.

## BR-ITEM-007 — 신규 Item 생성 시점

MVP에서 새 Item은 기본적으로 **실제 완료 Activity와 함께** 생성한다.

미래 To-do를 준비하기 위한 빈 Item 생성 Flow를 기본 제공하지 않는다.

## BR-ITEM-008 — 사용자별 Matching

Item Matching 후보에는 현재 사용자 소유 Item만 포함한다.

## BR-ITEM-009 — Archive Item

Archive된 Item은 기본 신규 매칭 후보에서 제외한다. 필요 시 사용자가 명시적으로 복원 후 사용한다.

## BR-ITEM-010 — Category

Category는 Optional Metadata이며 Record 생성 필수값이 아니다.

## BR-ITEM-011 — Owner / Location

MVP에서는 별도 필수 Field로 강제하지 않는다.

필요한 구분은 Item Name에 포함할 수 있다.

예:

```text
첫째 칫솔 교체
거실 에어컨 필터 청소
```

---

# 14. Activity Record 규칙

## BR-REC-001 — Activity 정의

Activity Record는 사용자가 실제 수행한 한 번의 사건이다.

## BR-REC-002 — 누적

같은 Item을 다시 수행하면 기존 Activity를 수정하지 않고 새로운 Activity를 추가한다.

## BR-REC-003 — 수행일 필수

유효 Activity에는 정확한 `performed_date`가 있어야 한다.

## BR-REC-004 — 원문

자연어 기반 기록은 사용자가 실제로 입력/확정한 원문을 보존한다.

## BR-REC-005 — Action Snapshot

Activity 생성 당시의 확정 Action 의미를 보존한다.

나중에 Item 이름이 변경되어도 과거 기록의 생성 당시 의미를 추적할 수 있어야 한다.

## BR-REC-006 — Quick Complete

Item Detail/알림의 “오늘 했어요”는 AI Parser 없이 새 Activity를 생성하는 빠른 기록 Flow다.

## BR-REC-007 — 다른 날 했어요

사용자가 알림보다 이전에 실제 수행했다면 선택한 정확한 과거 날짜로 새 Activity를 생성한다.

## BR-REC-008 — 과거 Record 추가

기존 마지막 수행일보다 오래된 날짜의 Activity를 추가해도 History에는 추가되지만 Last Performed는 더 최신 Activity를 유지한다.

---

# 15. 중복 Record 규칙

## BR-DUP-001 — 기본 중복 기준

다음 조건이 모두 같으면 중복 후보로 본다.

```text
same user
same active Management Item
same performed_date
Activity not deleted
```

## BR-DUP-002 — 조용한 중복 금지

중복 후보가 있으면 자동으로 추가하지 않는다.

## BR-DUP-003 — 사용자 확인 후 허용

실제로 같은 날 여러 번 수행한 경우 사용자가 명시적으로 “그래도 추가”를 선택하면 중복 Activity를 허용할 수 있다.

## BR-DUP-004 — 더블클릭/재시도

더블클릭, Network Retry, 동일 AI Segment 재전송 때문에 사용자가 원하지 않은 중복 Activity가 생겨서는 안 된다.

## BR-DUP-005 — 복수 저장 중복

복수 저장 중 한 Entry가 중복 충돌하면 기본적으로 전체 저장을 중단하고 사용자가 다시 확인한다.

---

# 16. Last Performed 규칙

## BR-LAST-001 — Source of Truth

Last Performed는 해당 Item의 삭제되지 않은 Activity 중 가장 최신 `performed_date`다.

## BR-LAST-002 — 동률

동일 `performed_date`가 여러 건이어도 마지막 수행 날짜 의미는 동일 날짜다.

## BR-LAST-003 — 저장 Column 아님

Last Performed는 사용자가 수정하는 독립 사실값으로 관리하지 않는다.

## BR-LAST-004 — 최신 Record 삭제

가장 최신 Activity가 삭제되면 그 이전의 가장 최신 유효 Activity가 Last Performed가 된다.

## BR-LAST-005 — Active Activity 없음

유효 Activity가 하나도 남지 않으면 Last Performed는 없다.

---

# 17. Record 수정 규칙

## BR-EDIT-001 — 수행일 수정

사용자는 잘못된 수행 날짜를 수정할 수 있다.

## BR-EDIT-002 — Item 이동

사용자는 Record를 자신의 다른 Active Item으로 이동할 수 있다.

## BR-EDIT-003 — 불변 데이터

원문과 생성 당시 입력 방식 등 감사/추적 목적의 원본 정보는 일반 Record Edit에서 임의 변경하지 않는다.

## BR-EDIT-004 — 파생 재계산

수행일 또는 연결 Item이 바뀌면 영향받는 Item의 Last, Next Due, Status, Notification Plan을 다시 계산한다.

## BR-EDIT-005 — 양쪽 Item 영향

Record를 Item A에서 B로 이동하면 A와 B 모두 재계산한다.

## BR-EDIT-006 — 미래 수정 금지

수정 후 performed_date도 User Today보다 미래일 수 없다.

---

# 18. Record 삭제·복원·Undo 규칙

## BR-DEL-001 — 기본 Soft Delete

MVP 일반 UI에서 Activity 삭제는 이력 복구 가능성을 위해 Soft Delete를 기본으로 한다.

## BR-DEL-002 — 삭제된 Activity 제외

Soft-deleted Activity는 Last Performed 및 Lifecycle 계산에서 제외한다.

## BR-DEL-003 — 삭제 후 재계산

삭제 후 Item의 Last, Next Due, Status, Notification Plan을 다시 계산한다.

## BR-DEL-004 — Restore

삭제 Row가 보존되어 있는 동안 복원 기능을 제공할 수 있다.

## BR-DEL-005 — Restore 재검증

복원 시에도 미래 날짜, Item 상태, 소유권, Duplicate Rule을 다시 적용한다.

## BR-DEL-006 — Undo UX

기록 직후 약 10초의 Undo UX를 기본값으로 사용한다.

이 시간은 UI 노출 기준이며, Backend 복원 가능 시간과 반드시 같을 필요는 없다.

---

# 19. Item Edit / Archive 규칙

## BR-ARC-001 — Item 이름 수정

사용자는 Management Item 이름을 수정할 수 있다.

## BR-ARC-002 — 이름 수정과 History

Item 이름을 바꿔도 기존 Activity History를 삭제하거나 재작성하지 않는다.

## BR-ARC-003 — 일반 Item Hard Delete 금지

MVP 일반 UI에서는 Item Hard Delete보다 Archive를 기본으로 한다.

## BR-ARC-004 — Archive 영향

Archive 시:

- Activity History 유지
- Alias 유지
- Active Dashboard에서 제외
- Active Item 목록 기본 조회에서 제외
- 미래 관리 알림 중단

## BR-ARC-005 — Restore

Archive된 Item은 복원할 수 있다.

복원 시 현재 History와 Cycle을 기준으로 상태를 다시 계산한다.

---

# 20. Item Merge 규칙

## BR-MRG-001 — 목적

중복 생성된 Management Item을 하나의 대표 Item으로 합칠 수 있다.

## BR-MRG-002 — 같은 사용자만

서로 다른 사용자의 Item은 병합할 수 없다.

## BR-MRG-003 — History 보존

Merge 전 모든 유효 Activity는 Merge 후에도 보존되어야 한다.

## BR-MRG-004 — Alias 보존

유효한 Alias는 대표 Item에 통합하되 중복 Alias는 정리한다.

## BR-MRG-005 — Cycle 충돌

두 Item의 관리주기가 다르면 시스템이 임의 선택하지 않고 사용자가 대표 Cycle을 선택한다.

## BR-MRG-006 — 알림 충돌

병합 대상의 오래된 알림은 정리하고 대표 Item의 최종 Lifecycle 기준으로 다시 관리한다.

## BR-MRG-007 — 원자성

Merge는 중간 상태가 노출되지 않도록 전체 성공 또는 전체 실패로 처리한다.

## BR-MRG-008 — Source Item

성공한 Merge 후 원본 중복 Item은 History를 잃지 않는 방식으로 Archive/비활성화한다.

---

# 21. 관리주기 규칙

MVP Cycle Type:

```text
NONE
INTERVAL_DAYS
```

## BR-CYC-001 — 사용자 결정

초기 Prototype에서 관리주기는 사용자가 직접 설정한다.

## BR-CYC-002 — AI 권위적 결정 금지

AI가 건강, 위생, 안전 또는 제품 수명과 관련된 주기를 사용자의 확정값처럼 자동 결정해서는 안 된다.

## BR-CYC-003 — INTERVAL_DAYS

MVP의 실제 계산 단위는 `N일마다`다.

## BR-CYC-004 — 유효값

Cycle Day는 1 이상의 정수여야 한다.

구현 안전 한도는 API/DB 문서에서 더 좁게 제한할 수 있다.

## BR-CYC-005 — NONE

사용자는 관리주기를 설정하지 않을 수 있다.

## BR-CYC-006 — Cycle 설정 선택성

첫 기록 저장 직후 Cycle 설정을 제안할 수 있지만 강제하지 않는다.

## BR-CYC-007 — Cycle 변경과 History

관리주기 설정, 수정, 제거는 과거 Activity History를 변경하지 않는다.

## BR-CYC-008 — Cycle 제거

Cycle을 제거하면 Next Due가 없어지고 해당 Item은 알림 대상이 아니다.

## BR-CYC-009 — 새 수행 기준

사용자가 예정일보다 일찍 또는 늦게 수행해도 다음 Cycle은 **실제 최신 수행일**에서 다시 시작한다.

---

# 22. Next Due 규칙

## BR-DUE-001 — 공식

```text
next_due_date = last_performed_date + cycle_days
```

## BR-DUE-002 — 계산 가능 조건

다음이 모두 있어야 Next Due가 존재한다.

```text
유효 Last Performed
+
INTERVAL_DAYS Cycle
+
유효 cycle_days
```

## BR-DUE-003 — 과거 Activity 추가

현재 Last보다 오래된 과거 Activity를 새로 추가해도 Next Due는 바뀌지 않는다.

## BR-DUE-004 — 사용자 직접 수정 금지

Next Due 자체를 독립된 수행 사실처럼 사용자가 직접 수정하지 않는다.

---

# 23. Upcoming Threshold 규칙

## BR-UP-001 — 공식

```text
upcoming_days
= min(5, ceil(cycle_days × 0.20))
단, 최소 1일
```

## BR-UP-002 — 예시

```text
7일 → 2일
28일 → 5일
90일 → 5일
1일 → 1일
```

---

# 24. Management Status 규칙

공식 상태:

```text
ARCHIVED
NO_HISTORY
NO_CYCLE
NORMAL
UPCOMING
DUE
```

`NO_HISTORY`와 `ARCHIVED`는 이후 DB 검토에서 발견된 실제 Edge Case를 안전하게 표현하기 위해 본 최종 BRS에 공식 반영한다.

## BR-STS-001 — ARCHIVED

Item이 Archive 상태면 `ARCHIVED`.

## BR-STS-002 — NO_HISTORY

Item에 유효 Activity가 하나도 없으면 `NO_HISTORY`.

대표 사례:

- 유일한 Activity를 삭제함
- 기존 Activity가 모두 Soft Delete됨

## BR-STS-003 — NO_CYCLE

유효 Activity는 있으나 Cycle이 없으면 `NO_CYCLE`.

## BR-STS-004 — DUE

```text
User Today >= next_due_date
```

이면 `DUE`.

## BR-STS-005 — UPCOMING

DUE는 아니고:

```text
next_due_date <= User Today + upcoming_days
```

이면 `UPCOMING`.

## BR-STS-006 — NORMAL

위 상태에 해당하지 않는 Cycle Item은 `NORMAL`.

## BR-STS-007 — 상태 우선순위

```text
ARCHIVED
→ NO_HISTORY
→ NO_CYCLE
→ DUE
→ UPCOMING
→ NORMAL
```

순으로 판정한다.

---

# 25. Dashboard 규칙

## BR-DASH-001 — 목적

Dashboard는 다음 질문에 답한다.

> “지금 무엇을 관리해야 하지?”

## BR-DASH-002 — 기본 포함 상태

기본 관리 영역에는:

```text
DUE
UPCOMING
NORMAL
```

을 표시한다.

## BR-DASH-003 — 기본 제외 상태

```text
NO_CYCLE
NO_HISTORY
ARCHIVED
```

는 기본 관리상태 Dashboard에서 제외한다.

## BR-DASH-004 — DUE 정렬

DUE는 가장 오래 지연된 Item부터 보여준다.

## BR-DASH-005 — UPCOMING/NORMAL 정렬

UPCOMING/NORMAL은 Next Due가 가까운 Item부터 보여준다.

---

# 26. 전체 관리 규칙

## BR-LIST-001 — 목적

전체 관리 페이지는 다음 질문에 답한다.

> “나는 무엇을 관리하고 있지?”

## BR-LIST-002 — Active Item

기본적으로 사용자의 Active Item을 모두 확인할 수 있어야 한다.

## BR-LIST-003 — NO_CYCLE 포함

Cycle이 없는 Active Item도 전체 관리에서 확인할 수 있다.

## BR-LIST-004 — NO_HISTORY 포함

모든 Activity가 삭제되어 NO_HISTORY가 된 Active Item도 전체 관리에서 확인하고 정리할 수 있어야 한다.

## BR-LIST-005 — Archive 기본 제외

Archived Item은 기본 목록에서 제외하되 별도 조회/복원 경로를 제공할 수 있다.

## BR-LIST-006 — 검색

Item 이름과 유효 Alias를 기준으로 검색할 수 있어야 한다.

## BR-LIST-007 — 정렬 비고

Dashboard와 달리 전체 관리의 기본 정렬은 핵심 Business Rule이 아니다. 실제 기본 정렬은 API/UI 문서에서 정의한다.

---

# 27. 알림 기본 규칙

## BR-NOTI-001 — Cycle 필요

Cycle이 없는 Item에는 관리시점 알림을 생성하지 않는다.

## BR-NOTI-002 — History 필요

유효 Activity가 없어 Next Due를 계산할 수 없으면 관리시점 알림을 생성하지 않는다.

## BR-NOTI-003 — Archive 제외

Archived Item에는 관리시점 알림을 보내지 않는다.

## BR-NOTI-004 — MVP 기본 시점

MVP 기본 알림은 Due Date 기준이다.

선행 Pre-notification은 MVP 필수 기능이 아니다.

## BR-NOTI-005 — 알림 OFF

알림이 비활성화되거나 Browser Permission이 거부되어도 기록, History, Cycle, Dashboard 기능은 정상 동작해야 한다.

## BR-NOTI-006 — 권한 요청 시점

첫 진입 즉시 Browser Notification Permission을 강제하지 않는다.

Cycle을 설정한 뒤처럼 사용자가 알림의 가치를 이해할 수 있는 맥락에서 요청한다.

## BR-NOTI-007 — 기본 알림 설정

Item에 Cycle을 처음 설정했으나 별도 설정이 없다면 MVP의 Effective Default는:

```text
enabled = true
remind_local_time = 09:00 (사용자 local time)
```

로 둘 수 있다.

단, Browser Permission/Subscription이 없으면 실제 Push는 발생하지 않는다.

## BR-NOTI-008 — 최신 상태 재검증

사용자가 Notification을 클릭했을 때 과거 Push Payload를 그대로 사실로 신뢰하지 않고 Item의 현재 상태를 다시 확인한다.

## BR-NOTI-009 — Stale Notification

알림 이후 사용자가 다른 경로에서 이미 새 수행을 기록하여 기존 Due가 무효가 되었다면 오래된 알림을 완료하도록 강요하지 않는다.

## BR-NOTI-010 — 새 Activity 영향

어떤 입력 경로에서든 새 최신 Activity가 생성되면 기존 Snooze와 더 이상 유효하지 않은 Pending Notification을 무효화하고 새 Lifecycle을 기준으로 다시 조정한다.

## BR-NOTI-011 — 알림 처리 실패와 수행기록

Activity 저장 자체가 성공했다면 Notification 후처리 실패 때문에 그 Activity를 없애거나 Rollback하지 않는다.

수행 사실의 Source of Truth는 Activity다.

---

# 28. 알림 Action 규칙

## BR-NACT-001 — 오늘 했어요

`오늘 했어요`는 User Today 날짜로 새로운 Activity를 생성한다.

## BR-NACT-002 — 다른 날 했어요

사용자가 실제 수행한 정확한 과거 날짜를 선택하여 새 Activity를 생성한다.

## BR-NACT-003 — 다른 날 미래 금지

`다른 날 했어요`에서도 미래 날짜는 허용하지 않는다.

## BR-NACT-004 — 나중에 알려줘

`나중에 알려줘`는 수행 완료가 아니다.

```text
Activity 생성 X
next_due 변경 X
status = DUE 유지
```

알림 시점만 연기한다.

## BR-NACT-005 — Snooze 대상

Snooze는 현재 상태가 DUE인 Item에만 적용한다.

## BR-NACT-006 — Snooze 옵션

MVP Snooze 옵션은:

```text
1일
3일
7일
```

이다.

## BR-NACT-007 — Snooze 시간 의미

Snooze는 사용자 지역 시각 기준으로 선택한 Calendar Day만큼 연기하는 의미를 가진다.

---

# 29. Query 규칙

## BR-QRY-001 — QUERY 식별

자연어 조회는 처음부터 QUERY로 식별하여 Activity로 잘못 저장되지 않게 한다.

## BR-QRY-002 — MVP 저장 금지

QUERY는 Activity를 생성하지 않는다.

## BR-QRY-003 — 실제 대화형 조회 범위

자연어 기억 조회 기능 자체는 MVP Core MUST가 아니라 NEXT 우선순위다.

Parser/API 구조는 향후 조회 확장을 방해하지 않도록 설계한다.

---

# 30. Empty State 규칙

## BR-EMP-001 — 자동 Seed 금지

신규 사용자의 계정에 수십 개의 추천 Management Item을 자동 생성하지 않는다.

## BR-EMP-002 — 첫 행동 유도

첫 사용자는 실제 완료 행동을 한 문장으로 기록하도록 안내한다.

예:

```text
오늘 이불 빨았어
```

## BR-EMP-003 — 예시 데이터

Onboarding의 예시는 안내용이며 사용자 실제 데이터로 저장하지 않는다.

---

# 31. 사용자 인증·소유권 규칙

## BR-AUTH-001 — 인증 필요

외부 사용자가 테스트하는 Prototype이므로 개인 데이터 기능에는 사용자 인증이 필요하다.

## BR-AUTH-002 — 사용자별 소유권

각 개인 Management Item과 Activity는 정확히 한 사용자에게 속한다.

## BR-AUTH-003 — 타 사용자 접근 금지

사용자는 다른 사용자의 Item, Activity, Alias, 알림 정보를 조회·수정·삭제할 수 없다.

## BR-AUTH-004 — Client user_id 불신

사용자 소유권은 Client가 전달한 임의 `user_id`로 결정하지 않는다.

## BR-AUTH-005 — 재로그인 영속성

로그아웃 후 다시 로그인해도 사용자의 Activity History와 Item 데이터는 유지되어야 한다.

## BR-AUTH-006 — 로그아웃 표시

로그아웃 후 이전 사용자의 개인 데이터가 화면에 남아 있어서는 안 된다.

---

# 32. Timezone 규칙

## BR-TZ-001 — 기본

초기 기본 Timezone은 `Asia/Seoul`.

## BR-TZ-002 — 사용자 날짜 기준

Today, Future Date Validation, Lifecycle Status, Snooze는 사용자 Timezone을 기준으로 계산한다.

## BR-TZ-003 — 시스템 UTC와 구분

서버의 UTC Calendar Date를 사용자 Today로 그대로 사용해서는 안 된다.

---

# 33. 데이터 무결성 규칙

## BR-DATA-001 — Activity Source of Truth

실제 수행 사실의 원본은 Activity History다.

## BR-DATA-002 — AI Log와 사실 분리

AI 해석 결과는 Activity 사실 데이터와 분리한다.

## BR-DATA-003 — Client 파생값 불신

Client가 계산한 Last, Next Due, Status를 사실의 Source of Truth로 저장하지 않는다.

## BR-DATA-004 — Transaction 필요 작업

여러 Item/Activity/설정이 함께 변경되는 작업은 중간 부분 성공 상태가 사용자에게 노출되지 않도록 원자적으로 처리해야 한다.

대표:

- 복수 Activity 저장
- Item Merge

## BR-DATA-005 — 오류 시 성공 표시 금지

실제 저장이 확정되지 않았는데 UI가 “기록했어요”라고 표시해서는 안 된다.

## BR-DATA-006 — 데이터 손실보다 기능 실패

오류 상황에서는 조용히 잘못된 데이터를 저장하는 것보다 작업을 실패시키고 사용자에게 재시도/수정을 제공하는 것을 우선한다.

---

# 34. 오류/Fallback 규칙

## BR-ERR-001 — AI 실패

AI 분석 실패 시 원문을 유지하고 사용자가 직접 Action과 Date를 확정할 수 있는 Manual Fallback을 제공한다.

## BR-ERR-002 — STT 실패

음성 실패 시 다시 말하기 또는 직접 입력을 제공한다.

## BR-ERR-003 — Network 실패

네트워크 오류 시 사용자의 입력을 가능한 한 유지하고 재시도를 제공한다.

## BR-ERR-004 — DB 실패

DB 저장 실패 시 실제 성공으로 처리하지 않는다.

## BR-ERR-005 — Date 오류

날짜 오류는 전체 기록을 처음부터 다시 입력하게 하기보다 해당 날짜를 수정할 수 있게 한다.

## BR-ERR-006 — Matching 실패

기존 Item 매칭이 실패해도 실제 완료기록이면 사용자가 새 Item을 확정할 수 있어야 한다.

---

# 35. Lifecycle 재계산 Matrix

다음 이벤트가 발생하면 영향받는 Item의 Lifecycle을 다시 평가한다.

| Event | Last | Next Due | Status | Notification |
|---|---:|---:|---:|---:|
| Activity Create | 재계산 | 재계산 | 재계산 | 조정 |
| Activity Date Edit | 재계산 | 재계산 | 재계산 | 조정 |
| Activity Item Move | 양쪽 재계산 | 양쪽 재계산 | 양쪽 재계산 | 양쪽 조정 |
| Activity Delete | 재계산 | 재계산 | 재계산 | 조정 |
| Activity Restore | 재계산 | 재계산 | 재계산 | 조정 |
| Undo | 재계산 | 재계산 | 재계산 | 조정 |
| Cycle Set | 불변 | 재계산 | 재계산 | 조정 |
| Cycle Change | 불변 | 재계산 | 재계산 | 조정 |
| Cycle Remove | 불변 | null | NO_CYCLE 또는 NO_HISTORY | 취소 |
| Item Merge | 재계산 | 재계산 | 재계산 | 조정 |
| Archive | History 유지 | 계산 의미 비활성 | ARCHIVED | 취소 |
| Restore Item | 재계산 | 재계산 | 재계산 | 조정 |
| Today Complete | 재계산 | 재계산 | 재계산 | 새 Cycle |
| Snooze | 불변 | 불변 | DUE 유지 | 재예약 |

---

# 36. 상태 판정 예시

기준:

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

# 37. 핵심 Negative Rules

다음은 반드시 발생하지 않아야 한다.

## BR-NEG-001

```text
“오늘 이불 못 빨았어”
→ Activity 생성
```

금지.

## BR-NEG-002

```text
“내일 이불 빨 거야”
→ Activity 생성
```

금지.

## BR-NEG-003

```text
“이불 언제 빨았지?”
→ 새 Activity 생성
```

금지.

## BR-NEG-004

```text
“지난주쯤 이불 빨았어”
→ AI가 임의 특정 날짜 저장
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

MVP에서 금지.

## BR-NEG-007

```text
비슷한 Item 여러 개
→ AI가 임의 Item 선택
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

---

# 38. MVP Non-goal 규칙

## BR-NG-001

일반 To-do 기능은 MVP 범위가 아니다.

## BR-NG-002

Calendar 기능은 MVP 범위가 아니다.

## BR-NG-003

Habit Checklist는 MVP 범위가 아니다.

## BR-NG-004

가족 공유는 MVP 범위가 아니다.

## BR-NG-005

사진 행동인식과 IoT는 MVP 범위가 아니다.

## BR-NG-006

외부 Calendar 연동은 MVP 범위가 아니다.

## BR-NG-007

Siri/Bixby 연동은 MVP 범위가 아니다.

## BR-NG-008

AI 자동 Cycle 결정은 MVP 범위가 아니다.

## BR-NG-009

개인화 AI Cycle 학습은 MVP 범위가 아니다.

## BR-NG-010

고급 생활관리 리포트와 범용 AI Agent는 MVP 범위가 아니다.

---

# 39. 구현 책임 경계

본 BRS를 구현하면서 책임을 다음처럼 나눈다.

| 책임 | 담당 계층 |
|---|---|
| 자연어 Intent/Scope/Action/Date 해석 | AI Parser |
| Parser Schema/Semantic 안전검증 | Application Layer |
| 기존 Item 후보 탐색 | Item Matching |
| 모호한 Item 선택 | 사용자 |
| 최종 Action/Date 확정 | 사용자 |
| 저장 가능 여부 최종검증 | Application/Domain Layer |
| Activity 영속 저장 | Database |
| Last/Next Due/Status | Lifecycle Read Model/Domain |
| 알림 대상 재검증 | Notification Service |
| 사용자별 데이터 격리 | Auth + Application Ownership + DB Policy |

AI Parser 하나에 위 책임을 몰아넣지 않는다.

---

# 40. 규칙 우선순위

규칙이 충돌하는 것처럼 보이면 다음 우선순위를 따른다.

```text
1. 사용자의 실제 사실
2. 사용자 데이터 보안
3. Activity History 무결성
4. False Completion 방지
5. 본 BRS의 Business Rule
6. AI Parser / DB / API Contract
7. UX 편의
8. Visual Detail
```

하위 기술 구현이 상위 Business Rule을 조용히 변경해서는 안 된다.

---

# 41. BRS → 하위 문서 Traceability

| BRS 영역 | 주요 하위 문서 |
|---|---|
| Intent/Scope/Date/Clarification | 05 AI Parser / 08 Dataset |
| Item/Activity/History | 06 DB / 07 API |
| Confirmation/Exception UX | 03 UFS / 04 UI·UX |
| Cycle/Status/Dashboard | 06 DB / 07 API / 09 QA |
| Notification/Snooze | 04 UI·UX / 06 DB / 07 API / 09 QA |
| Auth/User Isolation | 06 DB / 07 API / 09 QA |
| Error/Fallback | 03 UFS / 04 UI·UX / 07 API / 09 QA |
| Release Safety | 08 Dataset / 09 QA / 11 Checklist |

---

# 42. Codex 구현 시 절대 준수 규칙

Codex 또는 다른 구현 Agent는 다음을 임의 변경해서는 안 된다.

1. AI 결과 자동저장 금지
2. False Completion 금지
3. 미래 완료 Activity 금지
4. 불확실 날짜 임의 확정 금지
5. Item 후보 임의 선택 금지
6. Activity History 덮어쓰기 금지
7. Snooze 완료처리 금지
8. Cross-user 데이터 접근 금지
9. 새 Item을 일반 To-do Setup처럼 남발 금지
10. 다음 Phase 편의를 위해 Business Rule 생략 금지

문서와 구현 사이에 충돌을 발견하면 코드를 임의로 맞추지 말고 충돌을 보고하고 상위 문서 결정을 먼저 확인한다.

---

# 43. Acceptance Rule Set

본 BRS는 최소 다음 시나리오를 설명할 수 있어야 한다.

### 정상 완료

```text
오늘 이불 빨았어
→ COMPLETED
→ IN_SCOPE
→ 이불 세탁
→ 오늘
→ 사용자 확인
→ Activity 생성
```

### 날짜 없는 완료

```text
칫솔 바꿨어
→ COMPLETED
→ IMPLICIT_TODAY
→ 사용자 확인
→ Activity 생성
```

### 미완료

```text
오늘 이불 못 빨았어
→ NOT_COMPLETED
→ Activity 0
```

### 예정

```text
내일 이불 빨 거야
→ PLANNED
→ Activity 0
```

### 완료 불확실

```text
필터 갈았었나?
→ UNCERTAIN
→ 완료 확인 전 Activity 0
```

### 날짜 불확실

```text
지난주쯤 이불 빨았어
→ DATE Clarification
→ 정확한 날짜 확인 전 Activity 0
```

### 조회

```text
이불 언제 빨았지?
→ QUERY
→ Activity 0
```

### Target 모호

```text
필터 청소했어
→ 기존 필터 Item 여러 개
→ 사용자 Item 선택
```

### 중복

```text
동일 Item + 동일 날짜
→ Warning
→ 사용자 명시적 확인 전 추가 Activity 0
```

### Snooze

```text
DUE
→ 나중에 알려줘
→ Activity 0
→ DUE 유지
→ 알림만 연기
```

### 최신 기록 삭제

```text
Activity A < B < C
→ C 삭제
→ B가 Last
→ Next Due 재계산
```

### Item Merge

```text
Item A History 3건
+
Item B History 2건
→ Merge
→ 대표 Item History 5건
```

---

# 44. 본 최종본에서 의도적으로 제외한 내용

다음은 Business Rule이 아니라 기술구현 세부사항이므로 본 문서에 고정하지 않는다.

- HTTP Status Code
- URL/Endpoint 이름
- DB Table Column 전체 목록
- SQL/Trigger/RLS Policy 문법
- Index 종류
- 특정 LLM 모델명
- 특정 STT Provider
- Framework Version
- 실제 Hosting Provider
- UI Pixel/Color/Typography
- Worker Cron 주기
- Provider Timeout의 구체 ms
- Log Storage 기술

해당 정보는 04~07, 10~11번 문서 또는 실제 ADR에서 관리한다.

---

# 45. 재검증 결과

본 파일 생성 전 다음 항목을 다시 대조했다.

- PRD의 Core Loop와 MVP 25개 요구사항
- UFS의 주요 정상/예외 Flow
- UI/UX의 Confirmation, Snooze, Duplicate, Edit/Delete 행동
- AI Parser의 Intent/Scope/Date/Clarification Enum
- AI Parser의 `UNKNOWN`, `IMPLICIT_TODAY`, 5개 초과 행동 규칙
- DB 문서의 Activity Source of Truth
- DB 문서의 `NO_HISTORY / ARCHIVED` 상태
- DB 문서의 Soft Delete / Archive / Merge
- API 문서의 Record Candidate / Manual Override 규칙
- API 문서의 Duplicate / Idempotency / Multi-record 원자성
- API 문서의 Snooze / Stale Notification / Notification Default
- Validation Dataset의 안전 Gate
- QA 문서의 False Completion / User Isolation / Notification Case
- Deployment Checklist의 최종 MUST Traceability

검토 결과 본 문서는 이후 03~12번 문서에서 사용된 Business Rule과 모순되지 않도록 재정리되었다.

---

# 46. Development Baseline 완료 조건

BRS v1.0은 다음 조건을 만족한다.

- 제품 정체성 고정
- Intent 규칙 고정
- Scope 규칙 고정
- Record Candidate 규칙 고정
- Date 규칙 고정
- Clarification 규칙 고정
- Item/Activity 책임 고정
- History 보존 규칙 고정
- Duplicate 규칙 고정
- Edit/Delete/Restore 규칙 고정
- Archive/Merge 규칙 고정
- Cycle/Next Due/Status 규칙 고정
- Dashboard/전체관리 규칙 고정
- Notification/Snooze 규칙 고정
- Auth/User Isolation 규칙 고정
- Error/Fallback 규칙 고정
- Non-goal 고정
- 하위 기술문서와 책임 경계 고정

따라서 본 문서를 **LASTLY 개발용 Business Rule 최종 기준선**으로 사용한다.

---

## BRS v1.0 상태

**PRD 정합성:** 검증 완료  
**03~12 하위 문서 역대조:** 검증 완료  
**불필요 기술 세부사항:** 분리 완료  
**UNKNOWN Intent:** 반영  
**Scope UNCERTAIN:** 반영  
**IMPLICIT_TODAY:** 반영  
**NO_HISTORY:** 반영  
**False Completion:** 강화  
**Record Candidate:** 확정  
**Manual Override:** 확정  
**History / Soft Delete / Archive / Merge:** 확정  
**Cycle / Lifecycle:** 확정  
**Notification / Snooze:** 확정  
**Auth / Isolation:** 확정  
**Codex 구현 기준:** 사용 가능  
