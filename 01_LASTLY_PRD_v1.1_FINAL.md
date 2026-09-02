# LASTLY Product Requirements Document
## AI 생활주기 기억 웹앱
**PRD v1.1 — Final Sync Baseline**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 문서 | Product Requirements Document |
| 제품 형태 | Mobile-first Web App / PWA |
| 개발 형태 | 1인 단계별 개발 |
| 개발 목표 | 외부 사용자가 직접 가입·기록·관리·알림까지 테스트할 수 있는 배포형 Prototype |
| 기준일 | 2026.08.30 |
| 문서 상태 | **Development Baseline — Final Sync** |
| 변경 기준 | 기존 PRD v1.0 + 최종 BRS/AI Parser/DB/API 검토사항 역반영 |

---

# 1. 제품 개요

## 1.1 제품 한 줄 정의

> **LASTLY는 사용자가 마지막으로 한 반복 생활 행동을 기억하고, 다음 관리 시점까지 연결하는 AI 생활관리 서비스다.**

## 1.2 제품의 핵심 질문

> **“이거 마지막으로 언제 했지?”**

LASTLY는 이 질문에 답할 수 있는 실제 수행 이력을 만들고, 그 이력을 다음 관리로 연결한다.

---

# 2. Product Vision

사람들은 중요한 약속이나 미래 일정은 캘린더에 기록한다.

하지만 다음과 같은 생활 행동은 자주 기록하지 않는다.

- 이불 세탁
- 칫솔 교체
- 세탁조 청소
- 에어컨 필터 청소
- 공기청정기 필터 교체
- 생활용품 교체

이 행동들은 중요하지만 작고 반복적이어서 기록 자체가 빠지기 쉽다.

시간이 지나면 사용자는 해야 할 일을 모르는 것이 아니라 **마지막으로 언제 했는지를 기억하지 못하는 문제**를 겪는다.

LASTLY의 Vision은 사용자가 이미 한 생활 행동을 자연스럽게 남기면 그 수행 이력을 안전하게 기억하고, 이후의 관리 시점까지 연결하는 것이다.

---

# 3. 핵심 제품 메시지

> **캘린더는 앞으로 할 일을 기억합니다.  
> LASTLY는 마지막으로 한 일을 기억합니다.**

이 메시지는 제품 정체성의 기준선이며 개발 편의나 기능 확장 때문에 변경하지 않는다.

---

# 4. 핵심 Problem Statement

> **사용자는 반복되는 생활관리 행동을 매번 기록하지 않기 때문에, 시간이 지나면 마지막으로 언제 수행했는지 기억하기 어렵다.**

이 문제로 인해:

- 관리 시점을 놓칠 수 있고
- 이미 한 일을 불필요하게 다시 할 수 있고
- 언제 했는지 다시 떠올리는 데 인지 부담이 생기고
- 가족·집안의 여러 생활관리 항목을 기억에 의존하게 된다.

---

# 5. 기존 방식의 한계

## 5.1 Calendar

```text
앞으로 해야 할 일
→ 일정 등록
→ 날짜가 되면 알림
```

미래 일정 등록이 출발점이다.

## 5.2 To-do

```text
해야 할 일 생성
→ 완료 체크
```

작은 생활 행동까지 사전에 항목을 만들어야 한다.

## 5.3 Habit Tracker

```text
반복 습관 등록
→ 매일/매주 체크
```

정기 체크가 중심이며, “마지막으로 언제 실제 수행했는가”와 불규칙한 생활관리 간격이 중심은 아니다.

## 5.4 Memo

```text
기록
→ 저장
```

기록은 남지만 수행이력, 다음 관리일, 상태, 알림, 재기록으로 자동 연결되지 않는다.

## 5.5 LASTLY

```text
이미 한 행동
↓
자연어로 기록
↓
실제 수행이력 누적
↓
마지막 수행일 기억
↓
다음 관리시점 계산
↓
알림
↓
재기록
```

출발점과 데이터 구조가 다르다.

---

# 6. Product Principles

## P01. 과거 행동이 시작점이다

LASTLY의 기본 기록 입력은 “해야 해”가 아니라 **“했어”**다.

## P02. 기록의 마찰을 최소화한다

복잡한 폼보다 한 문장 자연어 입력을 기본 경험으로 한다.

## P03. AI보다 사용자 사실이 우선한다

AI는 사용자의 사실을 대신 결정하지 않는다.

## P04. 잘못 기억하는 것보다 확인하는 것이 낫다

```text
AI 해석
↓
사용자 확인/수정
↓
기록 확정
```

을 Prototype의 기본 정책으로 사용한다.

## P05. 수행이력은 누적한다

마지막 날짜 하나만 덮어쓰지 않는다. 과거 수행은 Activity History로 유지한다.

## P06. 기록을 다음 관리로 연결한다

```text
기록
→ 마지막 수행
→ 관리주기
→ 다음 관리일
→ 상태
→ 알림
→ 재기록
```

으로 이어져야 한다.

## P07. To-do 서비스로 확장하지 않는다

업무, 프로젝트, 미래 할 일 목록을 제품 중심으로 추가하지 않는다.

## P08. AI는 목적이 아니라 기록 마찰을 줄이는 수단이다

AI 기능의 존재 자체보다 실제 기록 편의성과 신뢰를 우선한다.

## P09. 안전한 실패가 잘못된 자동화보다 낫다

모호한 경우 임의로 저장하지 않고 확인·수정·수동 입력으로 복구한다.

---

# 7. Primary User

Primary User는 **직장과 집안일을 병행하며 여러 반복 생활관리 항목을 함께 챙기는 30~40대 사용자**다.

대표 특성:

- 본인뿐 아니라 가족의 생활관리까지 챙김
- 집안일·소모품·가전 관리 항목이 많음
- 작은 행동까지 별도 앱에 기록하는 습관은 약함
- “한 것 같은데 언제 했는지”를 자주 기억에 의존함
- 캘린더에 넣기에는 사소하지만 완전히 잊으면 불편한 일이 많음

대표 Pain Point:

> **“한 것 같은데 언제 했는지 기억이 안 난다.”**

---

# 8. Secondary User

Core Loop가 검증된 이후 다음 사용자로 확장할 수 있다.

- 1인 가구
- 맞벌이 가구
- 주부
- 자취생
- 반복 생활관리 항목이 많은 사용자

초기 UX와 제품 판단은 Primary User를 우선한다.

---

# 9. 핵심 Job To Be Done

> **반복 생활관리 행동을 복잡하게 기록하지 않고도 마지막 수행 시점과 다음 관리 시점을 알고 싶다.**

---

# 10. 핵심 사용자 Scenario

사용자가 이불을 세탁했다.

```text
사용자
“오늘 이불 빨았어”
↓
AI Parser
완료 여부 / 생활관리 범위 / 행동 / 날짜 해석
↓
Item Matching
기존 ‘이불 세탁’ 항목 연결 또는 신규 항목 제안
↓
사용자 확인
↓
Activity Record 저장
↓
마지막 수행일 = 오늘
↓
사용자 관리주기 설정
↓
다음 관리일 계산
↓
관리일 도달
↓
알림
↓
“오늘 했어요”
↓
새 Activity Record
↓
History 유지 + 새 관리주기 시작
```

---

# 11. Core Product Loop

```text
기록
↓
기억
↓
관리
↓
알림
↓
재기록
↓
기억
```

이 Loop가 실제 외부 배포 환경에서 처음부터 끝까지 동작해야 한다.

---

# 12. 자연어 입력

사용자는 일상적인 표현으로 기록할 수 있어야 한다.

예:

```text
오늘 이불 빨았어.
어제 칫솔 바꿨어.
지난 토요일 세탁조 청소했어.
정수기 필터 어제 갈았어.
```

텍스트와 음성을 모두 지원한다.

---

# 13. 자연어 해석의 핵심 구조

사용자에게 직접 중요한 핵심 해석값은:

```text
Intent
+
Action
+
Date
```

다.

여기에 안전한 저장 판단을 위해 AI Parser는 다음을 함께 판단한다.

```text
Scope
+
Date Precision
+
Clarification 필요 여부
```

Category는 MVP 기록 필수값이 아니다.

---

# 14. Intent 모델

제품 의미 Intent:

- `COMPLETED`: 실제 수행 완료
- `PLANNED`: 향후 수행 계획
- `NOT_COMPLETED`: 하지 않았거나 완료하지 못함
- `UNCERTAIN`: 사용자 본인도 완료 여부를 확신하지 못함
- `QUERY`: 기존 기억에 대한 조회 질문

AI Parser의 안전 fallback:

- `UNKNOWN`: 의미를 안전하게 분류할 수 없는 기술적 fallback

`UNKNOWN`은 새로운 사용자 기능이 아니라 **잘못된 완료 판정을 막기 위한 안전 상태**다.

---

# 15. Intent별 기본 저장 정책

| Intent | Activity 자동 생성 | 기본 처리 |
|---|---:|---|
| COMPLETED | 금지 | 저장 후보 → 사용자 확인 |
| PLANNED | 금지 | 수행기록 생성하지 않음 |
| NOT_COMPLETED | 금지 | 수행기록 생성하지 않음 |
| UNCERTAIN | 금지 | 완료 여부 확인 |
| QUERY | 금지 | 수행기록 생성하지 않음 |
| UNKNOWN | 금지 | Clarification 또는 수동 입력 |

어떤 Intent도 **AI 결과만으로 Activity를 자동 저장하지 않는다.**

---

# 16. Scope 모델

AI Parser는 해당 행동이 LASTLY의 반복 생활관리 범위인지 판단한다.

- `IN_SCOPE`
- `OUT_OF_SCOPE`
- `UNCERTAIN`

기본 판단 질문:

> **“마지막으로 언제 수행했는지를 기억하는 것이 이후 반복 생활관리에 의미가 있는가?”**

예:

```text
이불 세탁 → IN_SCOPE
칫솔 교체 → IN_SCOPE
친구 만남 → OUT_OF_SCOPE
영화 관람 → OUT_OF_SCOPE
대상 없는 ‘갈았어’ → UNCERTAIN 가능
```

LASTLY가 일반 Lifelog로 확장되지 않도록 OUT_OF_SCOPE를 구분한다.

---

# 17. False Completion

가장 위험한 AI 오류는:

> **사용자가 하지 않은 행동을 LASTLY가 완료했다고 기억하는 것**

이다.

이를 `False Completion`으로 정의한다.

특히 다음이 COMPLETED Record Candidate로 잘못 넘어가서는 안 된다.

```text
오늘 이불 못 빨았어.
오늘 이불 빨려고 해.
필터 청소 중이야.
필터 갈았었나?
이불 언제 빨았지?
```

False Completion은 일반 평균 정확도보다 우선하는 Release Safety Gate다.

---

# 18. 날짜 모델

Date Precision:

- `EXACT`
- `APPROXIMATE`
- `UNKNOWN`
- `NOT_APPLICABLE`

명확한 날짜는 저장 후보가 될 수 있다.

불확실한 날짜는 AI가 임의로 특정 날짜를 만들지 않는다.

---

# 19. 날짜 없는 명확한 완료형

다음처럼 완료가 명확하지만 날짜 표현이 없는 경우:

```text
칫솔 바꿨어.
이불 빨았어.
```

사용자 Timezone 기준 **오늘**을 기본 제안할 수 있다.

이 경우 AI 내부적으로:

```text
date_resolution_source = IMPLICIT_TODAY
```

로 구분하고 사용자가 Confirmation에서 날짜를 확인·수정할 수 있어야 한다.

이는 자동 저장이 아니다.

---

# 20. 모호한 날짜

다음은 정확한 날짜로 임의 변환하지 않는다.

```text
지난주쯤
며칠 전에
최근에
전에
예전에
```

사용자에게 실제 수행일 확인을 요청한다.

---

# 21. 미래 완료 날짜

완료 Activity의 수행일은 사용자 Timezone 기준 오늘보다 미래일 수 없다.

예:

```text
내일 이불 빨았어.
```

처럼 문법상 완료와 미래 날짜가 충돌하면 그대로 저장하지 않고 확인한다.

---

# 22. AI Confirmation 정책

초기 Prototype에서는 AI 결과를 반드시 사용자에게 보여준다.

최소 확인 대상:

```text
Action
Performed Date
Original Text
기존 Item / 신규 Item 여부
```

필요하면 사용자가 Action, Date, Item 선택을 수정한다.

AI 해석이 저장 가능한 상태여도 Confirmation 전에는 Activity가 아니다.

---

# 23. 음성 입력 원칙

음성은 자연어 입력 채널이다.

```text
Voice
↓
STT
↓
Transcript
↓
사용자 확인/수정
↓
동일 AI Parser
```

음성 전용 별도 Business Logic을 만들지 않는다.

---

# 24. 음성 실패 대응

STT가 잘못 들었거나 실패하면:

```text
Transcript 수정
다시 말하기
직접 텍스트 입력
```

으로 복구할 수 있어야 한다.

음성 실패가 Core Loop 전체 실패가 되어서는 안 된다.

---

# 25. 행동명 정규화

사용자의 원문 전체를 그대로 관리항목명으로 사용하지 않는다.

예:

```text
오늘 이불 빨았어
이불 빨래했어
이불 세탁했어
```

→

```text
이불 세탁
```

원문과 정규화된 행동 의미는 분리하여 보존한다.

---

# 26. AI Parser와 Item Matching의 책임 분리

AI Parser는:

```text
Intent
Scope
Action
Date
Clarification
```

을 해석한다.

AI Parser가 사용자 DB의 기존 Management Item ID를 직접 결정해서는 안 된다.

기존 Item 연결은 **Item Matching Service**가 별도로 수행한다.

---

# 27. 기존 관리항목 연결

기존 `이불 세탁` Item이 있고 사용자가 다시 이불을 세탁하면:

```text
새 자연어 입력
↓
AI Action = 이불 세탁
↓
Item Matching
↓
기존 Item 연결
↓
새 Activity 추가
```

한다.

---

# 28. 비슷한 관리항목

기존 Item이:

```text
거실 에어컨 필터 청소
안방 에어컨 필터 청소
공기청정기 필터 청소
```

인 상태에서 사용자가:

```text
필터 청소했어.
```

라고 하면 AI가 임의의 기존 Item을 선택하지 않는다.

사용자가 실제 대상을 선택한다.

---

# 29. 신규 Management Item

적절한 기존 후보가 없으면 새로운 Management Item 생성을 제안한다.

MVP에서 새 Item은 기본적으로 **실제 완료 Activity와 함께 생성**한다.

미래에 할 일을 미리 설정하기 위한 빈 Item 생성 기능을 제품 기본 Flow로 만들지 않는다.

---

# 30. 관리 대상 확장성

향후 같은 행동이 여러 사람·공간·대상에 존재할 수 있다.

예:

```text
첫째 칫솔 교체
거실 에어컨 필터 청소
안방 에어컨 필터 청소
```

Owner / Location / Target은 확장 가능하지만 MVP에서 별도 필수 입력으로 강제하지 않는다.

---

# 31. 수행 이력

LASTLY는 마지막 날짜 하나만 저장하지 않는다.

예:

```text
이불 세탁
2026.05.04
2026.06.02
2026.07.01
2026.07.31
2026.08.30
```

각 수행은 독립 Activity Record로 누적된다.

---

# 32. Last Performed

해당 Item의 삭제되지 않은 유효 Activity 중 가장 최신 수행일을 Last Performed로 사용한다.

최신 기록을 삭제하면 그 이전의 최신 유효 기록이 Last Performed가 된다.

유효 Activity가 하나도 없으면 Last Performed는 존재하지 않는다.

---

# 33. Management Item

Management Item은 반복 관리 단위다.

최소 연결 정보:

- 이름
- Activity History
- Last Performed
- 관리주기
- Next Due
- Status

Last Performed, Next Due, Status는 History와 Cycle에서 파생되는 값이다.

---

# 34. 관리주기

MVP에서 사용자가 직접 설정한다.

기본 형태:

```text
N일마다
또는
관리주기 없음
```

AI가 건강·위생·제품 안전 주기를 사용자의 확정값처럼 자동 결정하지 않는다.

---

# 35. 다음 관리시점

기본 개념:

```text
Last Performed
+
Cycle
=
Next Due
```

새 수행이 발생하면 이전 예정일이 아니라 **실제 최신 수행일을 기준으로 새로운 Cycle을 시작**한다.

세부 계산식과 경계값은 BRS에서 정의한다.

---

# 36. 관리 상태 모델

Active Item에서 사용할 Lifecycle 상태:

- `NO_HISTORY`: 유효 수행기록 없음
- `NO_CYCLE`: 수행기록은 있으나 관리주기 없음
- `NORMAL`: 아직 관리시점까지 여유 있음
- `UPCOMING`: 관리시점이 가까움
- `DUE`: 관리 필요

비활성 운영 상태:

- `ARCHIVED`: 관리에서 제외된 Item

상태의 정확한 계산 우선순위와 경계는 BRS에서 정의한다.

---

# 37. Dashboard 목적

Dashboard는 다음 질문에 답한다.

> **“지금 무엇을 관리해야 하지?”**

기본 관리영역은:

```text
DUE
↓
UPCOMING
↓
NORMAL
```

순으로 보여준다.

`NO_CYCLE`, `NO_HISTORY`, `ARCHIVED`는 기본 Due Dashboard에서 제외한다.

---

# 38. 전체 관리 페이지 목적

전체 관리 페이지는 다음 질문에 답한다.

> **“나는 무엇을 관리하고 있지?”**

MVP MUST:

- Active Item 전체 조회
- 검색
- Item 상세
- Activity History
- 관리주기 확인/설정
- `NO_CYCLE` 표시
- `NO_HISTORY` 표시

Archive/Restore/Merge는 별도 SHOULD 기능으로 분리한다.

---

# 39. 관리항목 상세

MVP에서 최소 표시:

- Item Name
- Last Performed
- 경과 정보
- Cycle
- Next Due
- Status
- Activity History
- 오늘 했어요

---

# 40. 기록 수정 및 삭제

사용자는 잘못된 Activity에 대해:

- 수행일 수정
- 자신의 다른 Item으로 이동
- Record 삭제

를 할 수 있어야 한다.

수정·삭제 후 관련 Item의 Last Performed, Next Due, Status가 다시 계산되어야 한다.

Activity 생성 당시의 원문/추적 정보까지 일반 편집으로 임의 변경하는 기능은 핵심 요구가 아니다.

---

# 41. Undo

새 Activity를 저장한 직후 짧은 시간 동안 실행 취소 UX를 제공하는 것을 기본 방향으로 한다.

정확한 노출 시간과 구현 방식은 BRS/UI/API에서 정의한다.

---

# 42. 알림

Cycle과 유효 Last Performed가 있는 Item은 관리시점에 알림 대상이 될 수 있다.

MVP 기본 알림 시점은 **Due Date**다.

Browser 알림 권한을 거부해도 앱의 기록·History·Dashboard 기능은 사용할 수 있어야 한다.

---

# 43. 알림 후 사용자 행동

### 오늘 했어요

오늘 날짜로 새로운 Activity를 생성한다.

### 다른 날 했어요

사용자가 실제 수행한 정확한 과거 날짜로 새 Activity를 생성한다.

### 나중에 알려줘

완료로 처리하지 않는다.

```text
Activity 생성 X
Next Due 변경 X
DUE 유지
알림만 연기
```

---

# 44. Stale Notification

알림이 발송된 이후 사용자가 다른 경로에서 이미 새 Activity를 기록했을 수 있다.

따라서 Notification 클릭 시 과거 Push 내용을 그대로 사실로 사용하지 않고 현재 Item 상태를 다시 확인한다.

---

# 45. 재기록

사용자가 동일 행동을 다시 수행하면 기존 Activity를 덮어쓰지 않고 새 Activity를 생성한다.

이 과정으로 History가 누적되어야 한다.

---

# 46. Authentication

외부 사용자가 직접 테스트하는 Prototype이므로 최소 인증을 포함한다.

필요:

- Sign Up
- Login
- Session 유지
- Logout
- Re-login 후 데이터 유지

---

# 47. 사용자 데이터 분리

모든 개인 Management Item과 Activity는 한 사용자에게 속한다.

사용자 A가 사용자 B의 개인 기록을 조회·수정·삭제할 수 없어야 한다.

사용자 데이터 분리는 Prototype 완료의 Release Gate다.

---

# 48. 실제 데이터 영속성

핵심 데이터는 LocalStorage에만 존재해서는 안 된다.

다음 후에도 유지되어야 한다.

```text
새로고침
로그아웃
재로그인
다른 세션 재접속
```

---

# 49. Empty State

신규 사용자의 계정에 추천 관리항목을 자동으로 대량 생성하지 않는다.

첫 경험:

> **“오늘 한 일을 한 문장으로 남겨보세요. 예: 오늘 이불 빨았어.”**

예시 문장은 안내용이며 실제 사용자 데이터로 저장하지 않는다.

---

# 50. Multiple Actions

한 입력에 여러 실제 행동이 포함되면 의미 단위로 분리할 수 있다.

예:

```text
오늘 이불 빨았고 칫솔도 바꿨어.
```

각 행동은 별도 Activity 후보가 된다.

한 번에 처리 가능한 의미 행동은 최대 5개로 제한한다.

5개를 초과하면 일부만 몰래 처리하지 않고 사용자가 입력을 나누도록 안내한다.

---

# 51. Duplicate Protection

동일 사용자, 동일 Item, 동일 수행일의 Activity가 이미 있으면 중복 가능성을 안내한다.

실제로 같은 날 여러 번 수행한 경우 사용자가 명시적으로 추가할 수 있지만:

- Double click
- Network Retry
- 동일 요청 재전송

때문에 의도하지 않은 중복이 생겨서는 안 된다.

---

# 52. Error / Fallback

### AI 실패

원문 유지 + 수동 Action/Date 입력.

### STT 실패

다시 말하기 또는 Text Fallback.

### Network 실패

입력 유지 + Retry.

### DB Save 실패

실제 성공이 확인되기 전에 Success UI 표시 금지.

### Date 오류

전체 입력을 다시 시작하지 않고 Date를 수정할 수 있게 한다.

### Item Matching 실패

실제 완료기록이면 신규 Item 생성으로 복구할 수 있다.

---

# 53. MVP MUST

외부 테스트 가능한 Prototype 완료에 필요한 Core MUST는 다음 25개다.

1. 자연어 텍스트 입력
2. 음성 입력
3. Voice → Text
4. Intent 분류
5. Action 추출
6. Date 추출
7. AI 결과 Confirmation
8. AI 결과 수정
9. 실제 Persistent Record 저장
10. 기존 Item Matching
11. 신규 Item 생성
12. Last Performed 표시
13. All Management
14. Item History
15. Record Edit/Delete
16. User-defined Cycle
17. Next Due 계산
18. Status 계산
19. Dashboard
20. Due Notification
21. 오늘 했어요 재기록
22. Authentication
23. User Data Isolation
24. Persistent DB
25. External Deployment

이 25개는 Prototype Completion Gate의 Core MUST다.

---

# 54. MVP SHOULD

다음 기능은 제품 품질과 운영 편의에 유용하지만 **Core 25 MUST 완료 여부와 분리하여 관리**한다.

- 삭제 Activity Restore
- Management Item Archive
- Archived Item Restore
- Duplicate Item Merge
- 세부 Item별 Notification Setting UI
- 추가 관리 편의 기능

SHOULD 기능은 별도 문서에서 구현 우선순위를 정하며, 명시적으로 MUST로 승격하지 않는 한 Core Prototype Release Blocker로 사용하지 않는다.

---

# 55. MVP NON-GOALS

초기 Prototype에서는 다음을 구현 목표로 하지 않는다.

- 일반 To-do
- Calendar
- Habit Checklist
- 가족 공유
- 사진 기반 행동 인식
- IoT / Smart Appliance
- 외부 Calendar Integration
- Siri / Bixby
- AI의 권위적 Cycle 자동 결정
- 개인별 Cycle AI 자동학습
- 고급 생활관리 Report
- 생활점수
- 범용 AI Assistant
- 복잡한 AI Agent

---

# 56. 자연어 조회 — NEXT

다음 조회는 LASTLY의 방향성과 매우 잘 맞는다.

```text
이불 언제 빨았지?
칫솔 바꾼 지 얼마나 됐어?
```

Parser는 초기부터 QUERY를 안전하게 식별해야 하지만, 실제 대화형 조회 기능은 MVP Core MUST가 아니라 NEXT다.

---

# 57. 생활관리 리포트 — NEXT

Activity History가 누적되면 다음을 제공할 수 있다.

- 최근 기간 수행 횟수
- 평균 수행 간격
- Item별 History
- 수행 간격 변화

근거 없는 생활점수보다 실제 Activity 데이터를 사용한다.

---

# 58. 개인화 — LATER

장기적으로 사용자의 실제 수행이력을 분석하여:

```text
현재 사용자 설정 Cycle
vs
실제 평균 수행간격
```

을 비교하고 주기 조정을 **제안**할 수 있다.

AI가 자동으로 변경하지 않는다.

---

# 59. Siri / Bixby — LATER

향후 기록 마찰을 더 줄이는 외부 입력 채널로 고려한다.

Web/PWA의 Record Pipeline이 먼저 안정적으로 검증되어야 한다.

외부 Voice Assistant는 동일 Record API를 사용하는 입력 채널로 확장하는 방향을 유지한다.

---

# 60. Feature Prioritization

신규 기능은 다음 순서로 판단한다.

1. “마지막으로 언제 했지?”라는 기억 부담을 직접 줄이는가?
2. 기록 → 기억 → 관리 → 알림 → 재기록 Loop를 강화하는가?
3. Core Prototype Acceptance Scenario에 반드시 필요한가?
4. 기존 Business Rule과 충돌하지 않는가?

분류:

```text
MUST
SHOULD
NEXT
LATER
REJECT
```

---

# 61. 제품 우선순위

## MUST

Core 25 기능과 사용자의 실제 수행 사실·데이터 안전성.

## SHOULD

Archive/Restore/Merge 등 Core Loop를 보조하는 관리 편의 기능.

## NEXT

자연어 기억 조회, 기본 실제 데이터 리포트, 빠른 기록 UX.

## LATER

가족 공동관리, Siri/Bixby, 개인화, IoT, 사진인식 등.

---

# 62. 핵심 품질 요구사항

Prototype이라도 다음은 타협하지 않는다.

- 기록 신뢰성
- False Completion 방지
- Activity History 무결성
- 실제 DB 영속성
- User Data Isolation
- 모바일 사용성
- STT/AI 실패 복구
- 중복 기록 방지
- 사용자 입력 보존
- 저장 실패의 정확한 표시

---

# 63. 제품 검증 질문

- 실제로 “마지막으로 언제 했는지 기억하기 어렵다”는 문제가 존재하는가?
- 자연어 입력이 수동 폼보다 기록하기 편한가?
- AI Confirmation을 사용자가 이해하고 신뢰할 수 있는가?
- LASTLY를 사용하면 마지막 수행을 직접 기억해야 하는 부담이 줄어드는가?
- 관리시점 알림이 실제로 도움이 되는가?
- 사용자는 다음 수행에서도 다시 기록하고 싶은가?

---

# 64. AI Parser 검증 지표

AI Parser 자체는 다음을 본다.

- Intent Accuracy
- Scope Accuracy
- Action Extraction / Normalization Accuracy
- Date Interpretation Accuracy
- False Completion Rate
- False Exact Date Rate
- 사용자 AI 결과 수정률

`False Completion Rate`는 Critical Safety Metric이다.

---

# 65. Item Matching 검증 지표

Item Matching은 AI Parser 품질과 분리해 측정한다.

- 기존 Item 정확 매칭률
- 신규 Item 필요 판별률
- Ambiguous Target에서 사용자 선택 유도율
- 잘못된 기존 Item 자동 연결률

AI Parser와 Item Matching의 오류를 하나의 “AI 정확도”로 합쳐 원인을 숨기지 않는다.

---

# 66. STT 검증 지표

- Transcript 성공률
- Transcript 사용자 수정률
- STT 실패 후 Text Fallback 성공률
- 실제 모바일 환경에서 Voice Record 완료율

STT 오류와 AI Parser 오류를 분리한다.

---

# 67. 제품 사용성 지표

- 첫 기록 성공률
- 기록 완료 시간
- Input → Confirmation → Save 완료율
- AI 결과 수정률
- 자연어 입력 편의성 인식
- Cycle 설정률
- 두 번째 Activity 재기록률

---

# 68. Security / Integrity 검증 지표

- Cross-user Data Leak = 0
- 의도하지 않은 Duplicate Activity = 0
- 저장 실패 Success 오표시 = 0
- 최신 Record 삭제 후 Last 재계산 정확성
- Item History 손실 = 0

---

# 69. 최종 Prototype Acceptance Scenario

외부 사용자가:

1. 가입/로그인한다.
2. “오늘 이불 빨았어”라고 입력하거나 말한다.
3. 음성이라면 실제 STT로 Transcript가 생성된다.
4. AI Parser가 COMPLETED / IN_SCOPE / 이불 세탁 / 오늘로 해석한다.
5. Item Matching이 기존 Item을 찾거나 신규 Item을 제안한다.
6. 사용자가 AI 결과와 Item을 확인·수정한다.
7. 실제 DB에 Activity Record가 저장된다.
8. History와 Last Performed를 확인한다.
9. 관리주기를 설정한다.
10. Next Due와 Status가 계산된다.
11. Dashboard에서 상태를 확인한다.
12. Due Date에 실제 Notification을 받는다.
13. “오늘 했어요”를 선택한다.
14. 새 Activity가 추가된다.
15. 이전 History는 유지된다.
16. Last Performed, Next Due, Status가 새 수행 기준으로 갱신된다.
17. 로그아웃/재로그인 후 데이터가 유지된다.
18. 다른 사용자에게 해당 데이터가 노출되지 않는다.

**위 Core Flow가 외부 배포 환경에서 실제로 동작해야 Prototype 완료다.**

---

# 70. Prototype이 아닌 것

다음은 완료된 Prototype으로 인정하지 않는다.

- UI만 존재
- Dummy Data만 사용
- AI 결과가 미리 정해진 Demo
- STT 버튼만 있고 실제 변환 없음
- DB 없이 화면 State만 변경
- LocalStorage에만 핵심 데이터 저장
- 새로고침 후 기록 소실
- 가짜 Notification 화면
- 사용자별 데이터 분리 없음
- Local 개발환경에서만 동작

---

# 71. Prototype Completion Definition

> **외부 사용자가 모바일 환경에서 LASTLY에 접속하여 실제 완료 생활행동을 텍스트 또는 음성으로 기록하고, AI 해석을 확인한 뒤 실제 DB에 수행이력을 누적하며, 관리주기와 다음 관리시점이 계산되고, 실제 알림을 통해 새로운 수행기록으로 다시 연결되는 상태.**

Core MUST 25개가 충족되어야 한다.

SHOULD 기능의 미구현만으로 Core Prototype을 실패로 판정하지 않는다.

---

# 72. 개발 단계와 MVP의 구분

```text
MVP
= 최종 Prototype 범위

Phase
= 그 MVP를 만드는 구현 순서
```

예를 들어 개발 초기에 UI만 먼저 만든다고 해서 AI, DB, 알림이 MVP에서 빠지는 것은 아니다.

---

# 73. 개발 전 확정사항

본 PRD에서 다음을 고정한다.

- 제품 정의
- 핵심 문제
- Primary User
- Product Principles
- Core Loop
- 자연어 기록
- AI 역할의 상한
- Intent 모델
- Scope 필요성
- False Completion Safety
- Confirmation 정책
- Activity History
- Item Matching 책임 분리
- 사용자 정의 Cycle
- Lifecycle 방향
- Notification/Re-record
- Authentication/User Isolation
- Core MUST 25
- SHOULD
- Non-goals
- Prototype Completion Definition

---

# 74. 후속 문서에서 결정할 사항

다음은 하위 문서의 책임이다.

### BRS

정확한 Business Rule, 상태 경계, 날짜·Cycle·Snooze 규칙.

### User Flow

화면 이동, 분기, 예외 Flow.

### UI/UX Specification

화면별 Component, 상태, Interaction.

### AI Parser Specification

Prompt, JSON Schema, Semantic Validation.

### Database Specification

ERD, SQL, RLS, Migration, Index.

### API Specification

Endpoint, Request/Response, Transaction, Idempotency.

### Validation / QA

정답 Dataset, Test Case, Release Gate.

PRD는 이 구현 세부사항을 중복 정의하지 않는다.

---

# 75. 문서 우선순위

개발 중 문서 사이에 충돌이 발견되면 다음 순서로 판단한다.

```text
PRD
↓
BRS
↓
User Flow / UI·UX
↓
AI / DB / API Contract
↓
QA / Execution / Deployment
```

다만 기술 문서에서 발견된 실제 데이터 무결성·보안 문제로 상위 문서 변경이 필요하면 **상위 문서를 먼저 수정한 뒤** 구현한다.

Codex가 문서 충돌을 임의로 해석하여 기능을 추가·삭제해서는 안 된다.

---

# 76. Codex 구현 금지사항

Codex 또는 다른 구현 Agent는 다음을 임의로 수행해서는 안 된다.

- AI Confidence가 높다는 이유로 Confirmation 생략
- PLANNED/NOT_COMPLETED/QUERY를 완료 Activity로 저장
- 불확실한 날짜를 임의 날짜로 확정
- 유사 Item 여러 개 중 임의 선택
- History를 Last Date 하나로 덮어쓰기
- Snooze를 완료로 처리
- Cross-user 데이터 접근 허용
- 일반 To-do/Calendar 기능 추가
- SHOULD 기능을 임의로 Core MUST로 승격
- NEXT/LATER 기능을 MVP Release Blocker로 변경

문서와 실제 구현에 충돌이 있으면 중단하고 보고한다.

---

# 77. PRD Final Summary

LASTLY는:

> **“내가 마지막으로 언제 했지?”를 대신 기억하고, 그 기억을 다음 생활관리까지 연결하는 서비스다.**

사용자는:

> **이미 한 일을 자연어로 말한다.**

LASTLY는:

```text
안전하게 해석
→ 사용자 확인
→ Activity로 기억
→ 다음 관리일 계산
→ 알림
→ 재기록
```

한다.

Prototype의 목표는 기능 수를 늘리는 것이 아니라:

> **기록 → 기억 → 관리 → 알림 → 재기록**

Core Loop가 실제 사용자·실제 AI·실제 DB·실제 알림으로 안전하게 동작하는지 검증하는 것이다.

---

## PRD v1.1 Final Sync 상태

**제품 방향:** 확정  
**Primary User:** 확정  
**Core Loop:** 확정  
**Intent 5종 + UNKNOWN 안전 fallback:** 반영 완료  
**Scope 3종:** 반영 완료  
**IMPLICIT_TODAY:** 반영 완료  
**AI Parser / Item Matching 책임 분리:** 반영 완료  
**NO_HISTORY / NO_CYCLE / ARCHIVED 상태:** 반영 완료  
**False Completion Safety:** 반영 완료  
**MVP MUST 25:** 확정  
**MVP SHOULD:** 별도 분리 완료  
**Non-goals / NEXT / LATER:** 확정  
**Prototype Completion Definition:** 확정  
**Codex 구현 기준:** 사용 가능  
