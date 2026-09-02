# LASTLY User Flow Specification
## AI 생활주기 기억 웹앱
**UFS v1.0**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 문서 | User Flow Specification |
| 기준 문서 | LASTLY PRD v1.0 / LASTLY BRS v1.0 |
| 제품 형태 | Mobile-first Web App / PWA |
| 개발 형태 | 1인 단계별 개발 |
| 문서 목적 | 사용자 행동, 화면 이동, 분기, 예외 흐름 정의 |
| 적용 범위 | 시제품 MVP 전체 |
| 기준일 | 2026.08.30 |
| 문서 상태 | Development Baseline 후보 |

---

# 1. 문서 목적

이 문서는 LASTLY 사용자가 서비스에 진입한 순간부터 생활 행동을 기록하고, 기록을 확인·관리하고, 관리주기와 다음 관리시점을 설정하고, 알림을 통해 다시 기록하는 전체 흐름을 정의한다.

이 문서에서는 다음을 명확히 한다.

- 사용자가 어떤 화면에서 무엇을 할 수 있는가
- 각 사용자 행동 뒤에 어떤 화면 또는 상태로 이동하는가
- AI 분석 결과가 명확하거나 모호할 때 어떻게 분기되는가
- 음성 인식 실패, 날짜 불확실, 대상 모호, 중복 기록 등 예외 상황을 어떻게 처리하는가
- 기록 이후 마지막 수행일·다음 관리일·상태·알림이 어떻게 연결되는가
- 잘못된 기록을 수정하거나 삭제했을 때 사용자가 어떤 결과를 보게 되는가
- 전체 MVP Core Loop가 어떤 사용자 흐름으로 완성되는가

이 문서는 화면 디자인 자체를 확정하는 문서가 아니다. 실제 레이아웃, 컴포넌트 크기, 컬러, 타이포그래피는 후속 UI/UX Specification에서 정의한다.

---

# 2. 사용자 흐름 설계 원칙

## UF-P01. 핵심 시작점은 “이미 한 행동”이다

LASTLY의 기본 흐름은 미래 할 일 생성이 아니라 완료된 생활 행동의 기록에서 시작한다.

```text
사용자가 실제 행동 수행
↓
LASTLY에 기록
↓
LASTLY가 기억
↓
다음 관리로 연결
```

## UF-P02. 가장 짧은 기록 흐름을 우선한다

정상적인 완료 행동은 가능한 한 다음 흐름 안에서 끝나야 한다.

```text
기록하기
↓
자연어 입력
↓
AI 분석
↓
확인
↓
저장 완료
```

사용자가 매번 카테고리, 날짜, 주기, 대상 등을 긴 폼으로 입력하도록 강제하지 않는다.

## UF-P03. 불확실할 때만 추가 단계를 만든다

정상적인 입력에는 최소 단계만 사용하고 다음 상황에서만 확인 단계를 추가한다.

- 행동이 모호함
- 날짜가 모호함
- 기존 항목 후보가 여러 개임
- 동일 날짜 중복 기록 가능성이 있음
- 한 문장에 여러 행동이 있음

## UF-P04. AI 실패가 사용자 흐름을 막지 않는다

AI, STT, 네트워크 일부 기능이 실패하더라도 사용자가 직접 수정하거나 수동 입력하여 기록을 완료할 수 있어야 한다.

## UF-P05. 기록 완료 후 사용자의 다음 행동을 강제하지 않는다

기록 직후 관리주기 설정을 반드시 완료하도록 강제하지 않는다.

```text
기록 완료
↓
관리주기 설정하기
또는
나중에 하기
```

을 허용한다.

## UF-P06. Dashboard와 전체 관리는 목적을 분리한다

Dashboard:

> 지금 무엇을 관리해야 하는가?

전체 관리:

> 내가 무엇을 관리하고 있는가?

두 화면의 역할을 혼합하지 않는다.

---

# 3. 전체 Information Architecture

MVP 기준 주요 화면은 다음과 같다.

```text
S00 Splash / App Entry
S01 Login / Sign Up
S02 Onboarding / Empty State

S10 Dashboard
S11 Record Input
S12 Voice Listening
S13 STT Result
S14 AI Processing
S15 AI Confirmation
S16 Clarification
S17 Record Saved

S20 All Management Items
S21 Management Item Detail
S22 Activity History
S23 Record Edit
S24 Item Edit
S25 Cycle Setting

S30 Notification Landing
S31 Complete Today
S32 Complete Other Date
S33 Snooze

S40 Settings
S41 Notification Permission / Setting

S50 Generic Error / Recovery
```

실제 구현에서는 일부 화면을 Modal, Bottom Sheet 또는 동일 페이지의 상태 변화로 처리할 수 있다. 이 문서의 Screen ID는 논리적 사용자 상태를 구분하기 위한 식별자다.

---

# 4. 최상위 Navigation

로그인 이후 MVP의 기본 Navigation은 다음 세 영역을 중심으로 한다.

```text
홈
기록하기
전체 관리
```

보조 접근:

```text
설정
```

모바일에서는 `기록하기`가 가장 빠르게 접근 가능한 Primary Action이어야 한다.

---

# 5. 전체 Core Flow

```text
서비스 진입
↓
로그인
↓
Dashboard 또는 Empty State
↓
기록하기
↓
텍스트 / 음성 입력
↓
AI Intent / Action / Date 분석
↓
필요 시 Clarification
↓
사용자 확인·수정
↓
Activity Record 저장
↓
Management Item 연결/생성
↓
마지막 수행일 갱신
↓
관리주기 설정 또는 유지
↓
다음 관리일 계산
↓
Dashboard 상태 반영
↓
시간 경과
↓
관리 알림
↓
오늘 했어요 / 다른 날 했어요 / 나중에 알려줘
↓
새 Activity Record
↓
새 관리 Cycle
```

---

# 6. FLOW A — 최초 진입

비로그인 사용자는 로그인/가입으로 이동한다. 인증 성공 후 데이터가 있으면 Dashboard, 없으면 Empty State로 이동한다. 인증 실패 시 입력값을 가능한 한 유지하고 오류를 표시한다.

---

# 7. FLOW B — 첫 사용자 Empty State

기록이 없는 사용자에게 다음 행동을 제안한다.

```text
아직 생활기록이 없어요.

오늘 한 생활관리를
한 문장으로 남겨보세요.

예)
“오늘 이불 빨았어”

[첫 기록 남기기]
```

예시 항목은 안내용이며 사용자 데이터로 자동 생성하지 않는다.

---

# 8. FLOW C — 기존 사용자 Dashboard 진입

사용자에게 기록이 존재하면 Dashboard로 이동한다. Dashboard는 관리주기가 설정된 활성 Item의 `last_performed_date`, `next_due_date`, `status`를 기준으로 `DUE → UPCOMING → NORMAL` 순으로 표시한다.

---

# 9. FLOW D — 기록 시작

사용자는 Dashboard CTA, Empty State, 전체 관리, Item Detail, Notification 등에서 기록을 시작할 수 있다. 일반 입력 흐름은 `S11 Record Input`으로 통합한다.

---

# 10. FLOW E — 텍스트 자연어 기록

사용자가 텍스트를 입력하고 분석하기를 누른다. 빈 입력은 AI에 보내지 않는다. 정상 입력은 AI Processing으로 이동한다.

---

# 11. FLOW F — 음성 자연어 기록

마이크를 누르면 Voice Listening 상태로 이동한다. 음성 종료 후 STT를 실행하고 결과 텍스트를 사용자에게 보여준다.

---

# 12. FLOW G — STT 정상 성공

변환된 텍스트를 보여주고 사용자가 수정 또는 분석할 수 있게 한다.

```text
이렇게 들었어요.

[오늘 에어컨 필터 청소했어.]

[수정]
[분석하기]
```

---

# 13. FLOW H — STT 오인식

STT 결과가 틀리면 사용자가 직접 수정한다. AI가 문맥으로 수정된 의미를 추론하더라도 최종 Confirmation에서 원문과 정규화 결과를 확인할 수 있어야 한다.

---

# 14. FLOW I — STT 실패

```text
음성을 정확히 인식하지 못했어요.

[다시 말하기]
[직접 입력하기]
```

음성 실패가 전체 기록 실패가 되지 않도록 텍스트 fallback을 제공한다.

---

# 15. FLOW J — AI Processing

AI는 최소 다음을 판단한다.

```text
Intent
Scope
Action
Date
기존 Item 후보
Clarification 필요 여부
```

분석 결과에 따라 다음 Flow로 분기한다.

---

# 16. FLOW K — COMPLETED + 명확한 입력

예:

> 오늘 이불 빨았어.

정상적으로 `COMPLETED / IN_SCOPE / 이불 세탁 / 오늘(EXACT)`이 추출되면 AI Confirmation으로 이동한다.

---

# 17. FLOW L — AI Confirmation 정상 화면

최소 다음을 표시한다.

```text
AI가 이렇게 이해했어요.

이불 세탁

수행일
2026.08.30

말한 내용
“오늘 이불 빨았어”

[수정하기]
[기록하기]
```

기존 Item에 추가되는지 새 Item을 만드는지도 사용자에게 구분 가능해야 한다.

---

# 18. FLOW M — AI 결과 수정

사용자는 Action, Date, 연결 Item을 수정할 수 있다. 사용자 수정값이 최종 저장값이다.

---

# 19. FLOW N — PLANNED

예:

> 내일 이불 빨 거야.

수행기록을 생성하지 않는다. To-do로 자동 변환하지 않는다.

---

# 20. FLOW O — NOT_COMPLETED

예:

> 오늘 이불 빨려고 했는데 못 했어.

수행기록을 생성하지 않는다.

---

# 21. FLOW P — UNCERTAIN 완료 여부

예:

> 필터 갈았었나?

완료로 가정하지 않는다. 사용자가 실제로 수행했는지 확인한다. 확정하지 못하면 기록을 생성하지 않는다.

---

# 22. FLOW Q — UNCERTAIN 날짜

예:

> 지난주쯤 이불 빨았어.

날짜 선택을 요청한다. MVP에서 관리주기 계산에 사용되는 Activity는 최종적으로 정확한 날짜를 가져야 한다.

---

# 23. FLOW R — 날짜 UNKNOWN

예:

> 전에 세탁조 청소했어.

날짜를 알 수 없으면 직접 날짜를 선택하거나 기록을 취소한다. AI가 임의의 날짜를 넣지 않는다.

---

# 24. FLOW S — 미래 날짜 오류

COMPLETED인데 수행일이 미래라면 저장을 차단하고 날짜 수정으로 이동한다.

---

# 25. FLOW T — QUERY

예:

> 이불 언제 빨았지?

새 Activity를 만들지 않는다. 조회 기능을 구현하기 전에도 QUERY를 기록으로 잘못 저장하면 안 된다.

---

# 26. FLOW U — OUT_OF_SCOPE

예:

> 오늘 친구 만났어.

LASTLY의 반복 생활관리 범위가 아니므로 기본적으로 Item과 Activity를 만들지 않는다.

---

# 27. FLOW V — Action 모호

예:

> 청소했어.

관리 대상을 특정할 수 없으면 무엇을 청소했는지 확인한다.

---

# 28. FLOW W — 기존 Item 후보가 하나

기존 `이불 세탁`이 있고 사용자가 `이불 빨았어`라고 입력한 경우, 기존 Item에 기록이 추가된다는 사실을 Confirmation에서 보여준다.

---

# 29. FLOW X — 기존 Item 후보가 여러 개

기존:

```text
거실 에어컨 필터 청소
안방 에어컨 필터 청소
공기청정기 필터 청소
```

입력:

> 필터 청소했어.

사용자에게 후보를 보여주고 직접 선택하게 한다.

---

# 30. FLOW Y — 기존 Item 후보 없음

새 행동은 새 Management Item 후보가 된다. 사용자는 AI가 제안한 이름을 수정할 수 있다. 저장하면 새 Item과 첫 Activity가 함께 생성된다.

---

# 31. FLOW Z — 한 문장에 여러 완료 행동

예:

> 오늘 이불 빨고 세탁조도 청소했어.

두 개의 기록 후보로 분리하고 각각 별도 Activity Record로 저장한다.

---

# 32. FLOW AA — 복합 문장에서 완료 + 예정

예:

> 오늘 필터 청소했고 다음 달에 또 해야겠다.

오늘의 완료 행동만 수행기록 후보로 만든다. 다음 달 계획은 To-do로 만들지 않는다.

---

# 33. FLOW AB — 동일 날짜 중복 Record

동일 Item + 동일 날짜 Record가 존재하면:

```text
오늘 같은 기록이 이미 있어요.
그래도 추가할까요?

[추가 기록]
[취소]
```

사용자 확인 없이 중복 저장하지 않는다.

---

# 34. FLOW AC — 최종 저장

사용자가 기록하기를 누르면 Saving 상태로 전환한다. 중복 클릭을 차단하고 Backend 저장 성공 이후에만 성공 화면으로 이동한다.

---

# 35. FLOW AD — 저장 성공

```text
✓ 이불 세탁을 기록했어요.

마지막 수행
오늘

[실행 취소]
[관리주기 설정]
[완료]
```

기존 관리주기가 있다면 다음 관리정보를 바로 표시할 수 있다.

---

# 36. FLOW AE — 저장 실패

입력값을 유지한 채 다시 저장 또는 수정할 수 있게 한다. 실패했는데 성공 메시지를 보여주지 않는다.

---

# 37. FLOW AF — Undo

저장 직후 일정 시간 동안 실행 취소를 제공한다. Undo 시 Activity를 취소하고 마지막 수행일, 다음 관리일, 상태, 알림을 모두 재계산한다.

---

# 38. FLOW AG — 기록 완료 후 관리주기 미설정

새 Item에 cycle이 없으면:

```text
이 기록을 주기적으로 관리할까요?

[관리주기 설정]
[나중에]
```

나중에를 선택하면 `NO_CYCLE` 상태로 저장된다.

---

# 39. FLOW AH — 관리주기 설정

MVP 기본은 `N일마다`다. 1 이상의 정수만 허용한다. 저장 시 다음 관리일과 상태를 계산한다.

---

# 40. FLOW AI — 기존 관리주기 변경

주기를 수정하면 과거 Activity는 유지하고 다음 관리일, 상태, 알림만 재계산한다.

---

# 41. FLOW AJ — 관리주기 해제

주기를 없애면 `NO_CYCLE`로 바뀌고 예약 알림을 취소한다. 수행이력은 유지한다.

---

# 42. FLOW AK — Dashboard 상태

예:

```text
관리 필요
🔴 세탁조 청소
마지막 42일 전

곧 관리해요
🟡 에어컨 필터
4일 남음

아직 괜찮아요
🟢 이불 세탁
22일 남음
```

Item을 선택하면 상세로 이동한다.

---

# 43. FLOW AL — Dashboard Empty Management State

기록은 있지만 관리주기가 하나도 없으면 관리주기가 설정된 항목이 없음을 안내하고 전체 관리 또는 새 기록으로 이동할 수 있게 한다.

---

# 44. FLOW AM — 전체 관리 목록

전체 활성 Item을 검색·조회한다. 각 Item에서 최소 항목명, 마지막 수행일, 주기 유무, 현재 상태를 확인할 수 있어야 한다.

---

# 45. FLOW AN — 전체 관리 검색

Item name과 Alias를 검색 대상으로 사용할 수 있다. 결과가 없으면 새 기록 CTA를 제공한다.

---

# 46. FLOW AO — Management Item Detail

최소 정보:

```text
이불 세탁

마지막 수행
2026.08.30

경과
0일

관리주기
28일

다음 관리
2026.09.27

상태
아직 괜찮아요
```

Actions:

```text
오늘 했어요
기록 추가
관리주기 수정
수행이력
항목 수정
```

---

# 47. FLOW AP — 수행이력 보기

최신순으로 Activity History를 보여준다. Record 선택 시 수정/삭제로 이동할 수 있다.

---

# 48. FLOW AQ — Record 날짜 수정

날짜 수정 후 Item의 마지막 수행일, 다음 관리일, 상태, 알림을 재계산한다.

---

# 49. FLOW AR — Record Item 변경

잘못 연결한 Item을 변경하면 이전 Item과 새 Item 양쪽의 계산을 다시 수행한다.

---

# 50. FLOW AS — Record 삭제

삭제 확인 후 Record를 삭제/soft delete하고 관련 상태와 알림을 재계산한다.

---

# 51. FLOW AT — 최신 기록 삭제

최신 기록이 삭제되면 이전 최신 Activity가 새로운 마지막 수행일이 된다.

---

# 52. FLOW AU — Item 이름 수정

Item 이름 변경은 과거 Activity의 수행일과 원문을 변경하지 않는다.

---

# 53. FLOW AV — Item 보관/비활성화

보관된 Item은 활성 Dashboard와 기본 목록에서 제외하고 알림을 중단한다. Activity History는 유지한다.

---

# 54. FLOW AW — 중복 Item 감지 및 병합

중복 Item을 병합할 때 Activity를 모두 유지한다. Cycle 값이 충돌하면 자동 결정하지 않고 사용자 확인을 받는다.

---

# 55. FLOW AX — 관리시점 도달

`today >= next_due_date`가 되면 Item을 DUE 상태로 변경한다. 알림 권한이 있다면 Push 대상이 된다.

---

# 56. FLOW AY — Notification 수신

알림을 누르면 Notification Landing으로 이동한다.

---

# 57. FLOW AZ — Notification Landing

```text
이불 세탁

마지막 수행
8월 30일

관리주기
28일

오늘 하셨나요?

[오늘 했어요]
[다른 날 했어요]
[나중에 알려줘]
```

---

# 58. FLOW BA — 오늘 했어요

오늘 날짜의 새 Activity를 생성하고 마지막 수행일, 다음 관리일, 상태, 다음 알림을 갱신한다.

---

# 59. FLOW BB — 다른 날 했어요

실제 수행한 과거 날짜를 선택해 새 Activity를 만든다. 더 최근 Record가 이미 있다면 마지막 수행일은 여전히 가장 최근 날짜를 사용한다.

---

# 60. FLOW BC — 나중에 알려줘

MVP 단순 옵션 예:

```text
1일 뒤
3일 뒤
7일 뒤
```

Activity를 만들지 않고, next_due_date도 변경하지 않으며, DUE 상태를 유지한 채 알림 시점만 연기한다.

---

# 61. FLOW BD — 알림 권한 거부

Push를 허용하지 않아도 기록과 Dashboard는 계속 사용할 수 있다. 설정에서 알림이 꺼져 있음을 안내한다.

---

# 62. FLOW BE — 새 수행 후 기존 알림 처리

관리일 전에 새 수행기록을 추가하면 기존 예약 알림을 취소하고 새 next_due_date 기준으로 다시 설정한다.

---

# 63. FLOW BF — Notification에서 같은 날 Record가 이미 존재

오늘 같은 Item Record가 이미 있다면 기본적으로 추가 생성하지 않고 중복 여부를 확인한다.

---

# 64. FLOW BG — Generic AI Error

AI API가 실패해도 원문을 보존하고 Action/Date를 직접 입력해 기록할 수 있는 fallback을 제공한다.

---

# 65. FLOW BH — 네트워크 오류

분석 또는 저장 중 네트워크가 끊기면 입력값을 보존하고 재시도할 수 있게 한다.

---

# 66. FLOW BI — Session 만료

인증이 만료되어도 가능하면 작성 중인 입력을 유지하고 재로그인 후 흐름을 재개할 수 있게 설계한다.

---

# 67. FLOW BJ — Item 데이터 없음

삭제되었거나 접근할 수 없는 Item이면 오류를 표시하고 전체 관리로 돌아가는 CTA를 제공한다.

---

# 68. FLOW BK — 첫 기록부터 Core Loop 연결

```text
Empty State
↓
“오늘 이불 빨았어”
↓
AI 확인
↓
첫 Activity 저장
↓
새 ‘이불 세탁’ Item 생성
↓
관리주기 28일 설정
↓
next_due 계산
↓
Dashboard NORMAL
```

---

# 69. FLOW BL — 두 번째 Cycle

```text
NORMAL
↓
UPCOMING
↓
DUE
↓
알림
↓
오늘 했어요
↓
두 번째 Activity 생성
↓
last_performed 갱신
↓
새 next_due 계산
↓
NORMAL
```

이 순간 LASTLY Core Product Loop가 한 바퀴 완성된다.

---

# 70. 핵심 사용자 상태 모델

Management Item 상태:

```text
NO_CYCLE
NORMAL
UPCOMING
DUE
ARCHIVED
```

대표 전이:

```text
첫 Record
↓
NO_CYCLE
↓ 관리주기 설정
NORMAL
↓ 시간 경과
UPCOMING
↓ 시간 경과
DUE
↓ 새 수행
NORMAL
```

---

# 71. 기록 Flow 상태 모델

```text
IDLE
↓
INPUTTING
↓
TRANSCRIBING (voice only)
↓
ANALYZING
↓
CLARIFICATION (optional)
↓
CONFIRMATION
↓
SAVING
↓
SUCCESS
```

오류 전이:

```text
TRANSCRIBING → STT_ERROR → INPUTTING
ANALYZING → AI_ERROR → MANUAL_CONFIRMATION
SAVING → SAVE_ERROR → CONFIRMATION
```

---

# 72. Back 행동 원칙

기록 도중 이전 화면으로 이동해도 자연어 원문과 수정 가능한 입력값을 가능한 한 유지한다. 기록 Flow 전체 종료 시 작성 내용이 있으면 취소 여부를 확인할 수 있다.

---

# 73. Loading 원칙

STT, AI 분석, 저장, Item 병합 같은 비동기 작업은 현재 무엇을 처리하는지 보여준다.

예:

```text
음성을 글로 바꾸고 있어요…
내용을 이해하고 있어요…
기록을 저장하고 있어요…
```

중복 실행은 차단한다.

---

# 74. Empty / Error / Success 상태

주요 화면은 최소 `Loading / Success / Empty / Error` 상태를 고려한다.

---

# 75. 주요 화면 진입 경로

| 화면 | 주요 진입 경로 |
|---|---|
| Dashboard | 로그인 후 / 기록 완료 후 |
| Record Input | Dashboard CTA / Empty State / 전체관리 CTA |
| AI Confirmation | AI 정상 분석 후 |
| Clarification | 날짜/행동/대상 모호 |
| Record Saved | 저장 성공 후 |
| All Management | Navigation / Dashboard |
| Item Detail | Dashboard Item / 전체관리 Item |
| Activity History | Item Detail |
| Record Edit | Activity History |
| Cycle Setting | Item Detail / 첫 Record 완료 후 |
| Notification Landing | Push 클릭 / Dashboard DUE Item |
| Settings | Navigation/Menu |

---

# 76. 카테고리의 위치

카테고리는 초기 기록 성공의 필수 조건이 아니다. Action/Date 확정 및 저장을 방해하지 않으며, 목록 정리나 리포트 단계에서 보조 정보로 사용한다.

---

# 77. Owner / Location의 위치

owner/location은 초기 필수 입력이 아니다. 자연어에서 명시되면 Item 이름에 반영할 수 있고, 동일 후보가 여러 개일 때만 Clarification에서 구분한다.

---

# 78. 자연어 조회 확장 Flow — NEXT

```text
“이불 언제 빨았지?”
↓
QUERY intent
↓
Item Matching
↓
최근 Activity 조회
↓
응답
```

새 Activity를 생성하지 않는다.

---

# 79. 생활관리 리포트 확장 Flow — NEXT/LATER

누적 Activity 기반으로 수행 횟수, 평균 수행 간격, 항목별 이력 등을 보여주는 흐름으로 확장한다. MVP에는 포함하지 않는다.

---

# 80. Siri / Bixby 확장 Flow — LATER

향후 Siri/Bixby를 외부 Input Channel로 추가하더라도 동일 AI Parser와 Record Engine을 재사용하는 방향을 유지한다.

---

# 81. MVP Golden Path

시제품에서 반드시 가장 안정적으로 동작해야 하는 대표 Flow:

```text
1. 로그인
2. Dashboard / Empty State
3. 기록하기
4. “오늘 이불 빨았어”
5. AI 분석
6. COMPLETED
7. 이불 세탁
8. 오늘
9. 사용자 확인
10. 저장
11. 이불 세탁 Item 생성/연결
12. 마지막 수행일 표시
13. 관리주기 28일 설정
14. 다음 관리일 계산
15. Dashboard NORMAL
16. 시간 경과
17. DUE
18. 알림
19. 오늘 했어요
20. 두 번째 Activity 생성
21. 마지막 수행일 갱신
22. 다음 관리일 재계산
```

---

# 82. MVP Critical Exception Paths

## CE-01
`오늘 이불 못 빨았어 → NOT_COMPLETED → 저장 X`

## CE-02
`내일 이불 빨 거야 → PLANNED → 저장 X`

## CE-03
`지난주쯤 이불 빨았어 → 날짜 확인 → 사용자 선택 → 저장`

## CE-04
`필터 청소했어 → 대상 후보 여러 개 → 사용자 선택 → 저장`

## CE-05
`음성 인식 실패 → 텍스트 fallback → 기록 계속`

## CE-06
`AI 실패 → 수동 Action/Date → 기록 가능`

## CE-07
`저장 실패 → 입력 유지 → 재시도`

## CE-08
`같은 날 동일 Item 기록 존재 → 중복 확인`

## CE-09
`최신 Record 삭제 → 마지막 수행/관리일/상태 재계산`

## CE-10
`나중에 알려줘 → Activity 생성 X → DUE 유지 → 알림만 연기`

---

# 83. 1인 개발 시 User Flow 구현 순서

## STEP 1 — Static Flow
Dummy Data로 주요 화면 연결.

## STEP 2 — Text Golden Path
`텍스트 → AI → Confirmation → DB 저장`

## STEP 3 — Intent Exception
`PLANNED / NOT_COMPLETED / UNCERTAIN / QUERY`

## STEP 4 — Item Matching
`기존 Item / 새 Item / 모호한 Item / 중복 Record`

## STEP 5 — Voice
`Voice → STT → 기존 Text Pipeline`

## STEP 6 — Management
`전체관리 / 이력 / 수정 / 삭제 / 주기`

## STEP 7 — Lifecycle
`next_due / status / Dashboard`

## STEP 8 — Notification Loop
`DUE → 알림 → 오늘 했어요 → 새 Record`

## STEP 9 — Exceptions / QA
Critical Exception Path 전체 테스트.

---

# 84. User Flow Acceptance Criteria

### 기록
- 텍스트로 기록할 수 있다.
- 음성으로 기록할 수 있다.
- AI 결과를 확인·수정할 수 있다.

### 신뢰성
- 미완료 행동이 자동 저장되지 않는다.
- 예정 행동이 자동 저장되지 않는다.
- 불확실한 날짜는 확인한다.
- 모호한 Item은 확인한다.

### 데이터
- 새로고침 후에도 기록이 유지된다.
- 기존 Item에 Activity가 누적된다.
- 과거 Activity가 보존된다.

### 관리
- 마지막 수행일을 볼 수 있다.
- 전체 관리 목록과 수행이력을 볼 수 있다.
- 관리주기를 설정할 수 있다.
- 다음 관리일과 상태가 계산된다.

### 재기록
- 관리일 도달 시 DUE 상태가 된다.
- 알림에서 오늘 했어요를 처리할 수 있다.
- 새 Activity가 생성되고 새 Cycle이 시작된다.

---

# 85. User Flow 최종 원칙

LASTLY의 UX는 사용자가 복잡한 생활관리 시스템을 먼저 구성하게 만드는 것이 아니라 다음 경험을 만들어야 한다.

> **“그냥 한 일을 말했을 뿐인데, LASTLY가 기억하고 다음 관리까지 이어준다.”**

정상 흐름은 최대한 짧게 유지하고 추가 질문은 기록 신뢰성을 위해 꼭 필요한 경우에만 발생시킨다.

---

# 86. UFS v1.0 최종 Flow

```text
사용자 생활 행동
↓
텍스트 또는 음성
↓
자연어 입력
↓
AI Intent 판단
├─ PLANNED → 저장하지 않음
├─ NOT_COMPLETED → 저장하지 않음
├─ QUERY → 기록하지 않음
├─ UNCERTAIN → 사용자 확인
└─ COMPLETED
       ↓
   Scope 확인
       ↓
   Action 추출
       ↓
   Date 추출
       ↓
   기존 Item Matching
       ↓
   모호성 존재?
   ├─ YES → Clarification
   └─ NO
       ↓
   사용자 최종 확인/수정
       ↓
   Activity Record 저장
       ↓
   Management Item 연결
       ↓
   마지막 수행일 계산
       ↓
   관리주기
       ↓
   다음 관리일
       ↓
   Dashboard 상태
       ↓
   관리시점 도달
       ↓
   알림
       ↓
   오늘 했어요 / 다른 날 / 나중에
       ↓
   새 Activity Record
       ↓
   새 관리 Cycle
```

---

# 87. 다음 문서와의 연결

다음 문서:

**04. LASTLY UI/UX Functional Specification**

다음 항목을 화면별로 확정한다.

- 화면 목적
- 표시 데이터
- UI 요소
- 버튼 및 Action
- 입력 필드
- Validation
- Loading
- Empty
- Error
- Success
- Modal / Bottom Sheet
- Navigation
- 모바일 UX
- 접근성
- 각 화면 Acceptance Criteria

---

## UFS v1.0 상태

**제품 방향:** PRD 기준 유지  
**Business Rule:** BRS 기준 반영  
**Golden Path:** 정의 완료  
**Critical Exception Path:** 정의 완료  
**알림 재기록 Loop:** 정의 완료  
**후속 작업:** UI/UX Functional Specification
