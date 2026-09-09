# LASTLY — Voice / Query / Record Functional Specification

## 문서 목적

이 문서는 LASTLY의 HOME 중심 Rebaseline 이후,
사용자가 하나의 입력 진입점에서 음성 또는 텍스트로:

- 한 일을 기록하고
- 과거 기록을 조회하고
- 필요한 경우 수정한 뒤
- 안전하게 저장하거나
- 저장 없이 조회 결과만 확인하는

통합 입력 흐름을 정의한다.

이 문서는 **R4 — Unified Record / Query 구현의 Source of Truth**다.

기존 문서와 충돌하는 경우 우선순위는 다음과 같다.

1. `docs/00_CHANGE_REQUEST.md`
2. `docs/01_UPDATED_IA.md`
3. `docs/02_HOME_UI_UX_SPEC.md`
4. `docs/03_VOICE_QUERY_RECORD_SPEC.md`
5. 기존 G0 Freeze 문서

---

# 1. 제품 관점 정의

LASTLY의 입력 경험은 다음 문장으로 설명할 수 있어야 한다.

```text
LASTLY에게 말하면,
한 일을 기록하고 지난 기억을 다시 찾을 수 있다.

사용자는 먼저:

기록
검색
조회

중 하나를 선택하지 않는다.

사용자는 자연스럽게 말하거나 입력한다.

LASTLY가 입력 Intent를 판별한다.

2. 핵심 Flow

통합 Flow:

HOME
→ Voice 또는 Text 입력
→ Transcript / Text 확인
→ AI Parser
→ Intent 판별
→ COMPLETED 또는 QUERY 분기

이후:

COMPLETED
→ Item Matching
→ Confirmation
→ User Confirm
→ Commit
→ Activity History 생성

또는:

QUERY
→ Item Matching
→ Activity History 조회
→ Query Result
→ 저장 없음
3. R4 핵심 원칙

R4에서 반드시 지켜야 하는 원칙:

Record와 Query 입력 진입점은 하나다.
음성 입력과 텍스트 입력은 동일 Parser를 사용한다.
AI는 자동 저장하지 않는다.
COMPLETED만 저장 후보가 될 수 있다.
QUERY는 절대 Activity를 생성하지 않는다.
NOT_COMPLETED는 저장하지 않는다.
PLANNED는 저장하지 않는다.
UNCERTAIN은 자동 저장하지 않는다.
Parser는 item_id를 직접 선택하지 않는다.
Item Matching은 Parser와 별도 책임이다.
Activity History는 Source of Truth다.
기존 D2/D3 구현을 최대한 재사용한다.
Fake voice / fake transcript 금지.
기존 /record 기능을 기능 손실 없이 HOME으로 통합한다.
4. HOME Action Dock

R1에서 추가된 HOME Action Dock을 R4에서 실제 Unified Input 진입점으로 전환한다.

현재 구조:

        🎙

    직접 입력

R4 이후 역할:

        🎙
말해서 기록하거나 물어보세요

    직접 입력
5. Voice Entry

사용자가 HOME 중앙 Mic 버튼을 누르면 음성 입력이 시작된다.

정상 지원 환경에서는:

Mic Tap
→ permission 확인
→ SpeechRecognition 시작
→ transcript 생성
→ transcript 표시
6. Voice UI 상태

Voice 입력은 최소 다음 상태를 갖는다.

type VoiceInputState =
  | "idle"
  | "requesting_permission"
  | "listening"
  | "transcribing"
  | "ready"
  | "error";
7. Voice 상태별 UX
IDLE
🎙
말해서 기록하거나 물어보세요
REQUESTING_PERMISSION
마이크 권한을 확인하고 있어요.

불필요한 Spinner animation을 과도하게 사용하지 않는다.

LISTENING
듣고 있어요...

Mic button의 listening 상태가 시각적으로 구분되어야 한다.

단:

flashing red
강한 pulse
과도한 animation

은 피한다.

TRANSCRIBING
말한 내용을 정리하고 있어요...
READY

Transcript를 사용자에게 보여준다.

예:

오늘 이불 빨았어

사용자는 Parser 실행 전에 또는 Parser 결과 단계에서 transcript를 수정할 수 있어야 한다.

ERROR

예:

음성을 듣지 못했어요.
다시 말하거나 직접 입력해보세요.
8. SpeechRecognition

R4에서는 기존 D3 Browser SpeechRecognition 구현을 재사용한다.

기본 언어:

ko-KR

지원 여부를 감지한다.

예:

SpeechRecognition
webkitSpeechRecognition

중 브라우저에서 지원되는 API 사용.

9. Unsupported Browser

SpeechRecognition 미지원 시:

fake voice simulation 금지
fake transcript 금지
Mic을 동작하는 것처럼 보이게 하지 않는다.

대신:

이 브라우저에서는 음성 입력을 사용할 수 없어요.
직접 입력해주세요.

그리고 Text Input을 즉시 제공한다.

10. Permission Denied

마이크 권한 거부 시:

마이크 권한이 필요해요.
브라우저 설정에서 권한을 허용하거나 직접 입력해주세요.

필수:

Text fallback
retry 가능
앱 자체 오류처럼 표시하지 않음
11. Direct Text Input

Action Dock의 직접 입력을 누르면 HOME context에서 Text Composer가 열린다.

예:

┌────────────────────────────┐
│ 말해서 기록하거나 물어보세요 │
│                            │
│ 오늘 이불 빨았어            │
└────────────────────────────┘

                 [ 확인 ]
12. Text Input 원칙

Text Input은:

Record 전용이 아님
Query 전용이 아님

동일한 Unified Input이다.

예:

오늘 이불 빨았어

→ COMPLETED

이불 언제 빨았지?

→ QUERY

13. Composer 표현 방식

권장 우선순위:

1순위

HOME 위에서 Bottom Sheet 또는 Drawer 형태

2순위

HOME 내부 Inline Composer

금지
별도 Record page 이동을 필수로 만드는 UX
별도 Search page
Record/Search segmented control
14. 기존 /record와의 관계

R4 구현 과정에서 기존 /record의:

SpeechRecognition
transcript edit
AI parse
confirmation
error handling

등을 그대로 복사해서 중복 구현하지 않는다.

공통 로직으로 추출하거나 재사용하는 것을 우선한다.

15. /record Compatibility

R4 완료 후에도 /record route를 즉시 삭제하지 않는다.

권장 상태:

/record
→ HOME Unified Composer를 여는 compatibility entry

예:

/?composer=open

또는 현재 architecture에 더 안전한 방식.

16. /record?item=...

기존 item context가 존재한다면 기능을 보존한다.

예:

/record?item=bedding

향후 HOME에서:

composerContext.itemId = "bedding"

또는 이에 준하는 형태로 전달 가능하다.

기능 손실 금지.

17. Parser Call

Voice transcript 또는 Text Input은 동일 API를 사용한다.

현재 기존:

/api/ai/parse

를 유지한다.

18. Parser 책임

Parser는 다음을 판별한다.

예:

intent:
  | "COMPLETED"
  | "PLANNED"
  | "NOT_COMPLETED"
  | "UNCERTAIN"
  | "QUERY"
  | "UNKNOWN"

또한 기존 Schema에 정의된:

action
date
scope
confidence
clarification

등을 유지한다.

19. Parser가 하지 않는 것

Parser는 다음을 직접 결정하면 안 된다.

item_id

즉:

Parser
→ "이불 세탁"이라는 action 추출

까지만 수행.

그 다음:

Matching Layer
→ existing Item 후보 계산
20. Record Candidate

기존 서버 Record Candidate 계산을 유지한다.

원칙:

COMPLETED
→ candidate 가능

QUERY
→ candidate false

NOT_COMPLETED
→ candidate false

PLANNED
→ candidate false

UNCERTAIN
→ candidate false

Client가 임의로 candidate를 true로 바꾸면 안 된다.

21. COMPLETED Flow

예:

오늘 이불 빨았어

처리:

Input
→ Parser
→ COMPLETED
→ Matching
→ Confirmation
→ Save
22. Confirmation은 필수

COMPLETED 입력은 AI 해석 직후 자동 저장하지 않는다.

반드시 사용자 확인 단계가 있다.

예:

이렇게 기록할까요?

이불 세탁
오늘

[취소]        [기록하기]
23. Confirmation 위치

권장:

HOME context의 Bottom Sheet.

예:

HOME
──────────────
[ Confirmation Sheet ]

별도 full page 이동은 기본이 아니다.

24. Confirmation 필수 정보

최소 표시:

Item / Action
수행 날짜
optional tag candidate
optional cycle proposal

현재 R4에서는 Tag/Cycle 실제 신규 모델을 선행 구현하지 않는다.

따라서 R4 기본 Confirmation은:

Action
Date

중심으로 구현한다.

25. Confirmation 수정

사용자는 저장 전에 해석 결과를 수정할 수 있어야 한다.

최소 수정 가능:

Action name
Date

향후 R5/R6 추가:

Tags
Note
Cycle
26. Date 규칙

기존 Date Guard를 유지한다.

미래 완료일 저장 금지.

예:

오늘이 9월 7일인데:

내일 이불 빨았어

COMPLETED Activity로 저장 금지.

27. Date Precision

기존 구분을 유지한다.

EXACT
APPROXIMATE
UNKNOWN
NOT_APPLICABLE

Date Source:

EXPLICIT
IMPLICIT_TODAY
NONE
28. 오늘 처리

예:

오늘 이불 빨았어

→ 오늘 날짜

이는 EXPLICIT로 취급한다.

29. 날짜 없는 완료 표현

예:

칫솔 바꿨어

Parser가 IMPLICIT_TODAY 후보를 제안할 수 있다.

하지만 사용자 확인 단계에서 오늘 날짜로 보여주고 확인받는다.

자동 확정 저장 금지.

30. False Completion

가장 중요한 Safety Rule 중 하나다.

예:

오늘 이불 안 빨았어

→ NOT_COMPLETED

저장 금지.

31. False Completion 예

다음은 Activity 생성 금지:

이불 못 빨았어
칫솔 안 바꿨어
아직 필터 안 갈았어
세탁 못 했어
32. Planned

예:

내일 이불 빨 거야

→ PLANNED

MVP에서는 완료 기록으로 저장하지 않는다.

33. Uncertain

예:

이불 빨았던 것 같아

→ UNCERTAIN

자동 저장 금지.

필요 시 Clarification.

34. Query Flow

예:

이불 언제 빨았지?

처리:

Input
→ Parser
→ QUERY
→ Matching
→ Activity History Read
→ Result
35. Query는 저장하지 않는다

QUERY에서 금지:

Activity 생성
Confirmation "기록하기"
candidate true
자동 기록
오늘 했어요 처리
36. Query Result UI

권장:

HOME context Bottom Sheet.

예:

아빠 이불은
9월 1일에 기록했어요.

[이불 세탁 보기]
37. Query Result 정보

최소:

matched Item
last activity date

선택:

최근 2~3개 이력
D-Day
다음 관리 예정

단, R4에서는 과도한 정보 표시보다 핵심 조회 결과를 우선한다.

38. Exact Match

Matching 결과가 1개로 충분히 명확하면:

이불 세탁
마지막 기록: 9월 1일

형태로 결과 표시.

39. Ambiguous Match

예:

입력:

이불 언제 빨았지?

후보:

이불 세탁
아기 이불 세탁

명확하지 않다면:

어떤 기억을 찾을까요?

[이불 세탁]
[아기 이불 세탁]

사용자가 선택한다.

40. No Match

Matching 결과가 없으면:

관련된 기억을 찾지 못했어요.

선택 CTA:

[새 기억으로 기록하기]

가능.

단, Query 입력을 자동으로 COMPLETED로 바꾸면 안 된다.

41. Matching Source

Matching은 다음 정보를 활용할 수 있다.

현재 R4:

item name
alias
현재 memo text

R5 이후:

tags
note
42. Alias

Alias는 기존 Matching 기능을 유지한다.

예:

Item:
이불 세탁

Alias:
이불 빨래
이불 빨기

Alias는 Tag가 아니다.

43. Query + Tag 미래 확장

R5 이후:

아빠 이불 언제 빨았지?

와 같은 Query는:

Item = 이불 세탁
Tag = 아빠 이불

형태로 좁힐 수 있다.

R4에서는 Tag model을 선행 구현하지 않는다.

44. Multi Action

기존 Rule 유지.

최대 semantic actions:

5

예:

이불 빨고
칫솔 바꾸고
정수기 필터 갈았어

→ 3 actions

45. 5개 초과

5개 초과 시:

TOO_MANY_ACTIONS

또는 기존 정의된 error.

부분 저장 금지.

46. Atomic Save

Multi Action 저장은 atomic.

예:

3개 중 2개만 저장되고 1개 실패하는 구조 금지.

all success
or
all fail
47. Clarification

Clarification 허용 범위는 기존 Rule 유지.

허용:

COMPLETION
ACTION
DATE
SCOPE

금지:

TARGET
48. Clarification UX

예:

언제 한 일인지 알려주세요.

[오늘]
[어제]
[직접 입력]

또는 텍스트 입력.

49. Transcript 수정

Voice transcript는 사용자가 수정 가능하다.

예:

SpeechRecognition:

오늘 이불 빨았어

사용자가:

어제 이불 빨았어

로 수정.

이 경우 반드시 수정된 text를 기준으로 다시 parse한다.

50. 수정 후 재사용 금지

Transcript가 변경됐는데 이전 Parser 결과를 그대로 사용하는 것 금지.

항상:

edited text
→ reparse
51. Submit State

Parser 요청 중:

중복 submit 금지
Mic 재시작 금지
저장 버튼 중복 클릭 방지
52. Loading UX

Parser 요청 중:

기록을 이해하고 있어요...

또는:

내용을 확인하고 있어요...

과 같이 짧은 상태만 제공.

과도한 AI animation 금지.

53. Parser Error

AI Parse 실패 시:

내용을 이해하지 못했어요.
다시 입력해주세요.

가능한 행동:

텍스트 수정
다시 분석
음성 다시 입력
54. Network Error

네트워크 오류를 "기록 없음"으로 표시하면 안 된다.

예:

연결이 원활하지 않아요.
잠시 후 다시 시도해주세요.
55. Query Data Error

Activity History 조회 실패 시:

기록을 불러오지 못했어요.
다시 시도해주세요.

Query not found와 구분한다.

56. HOME 상태 유지

Composer / Query Result / Confirmation이 닫히면 HOME으로 돌아온다.

기존 HOME:

filter state
scroll position
list context

는 가능하면 유지한다.

57. 저장 성공 후

Activity 저장 성공 시:

Confirmation 닫기
HOME 데이터 refresh
D-Day 재계산
상태 count 재계산
필요 시 filter 결과 갱신
58. 저장 성공 Feedback

예:

기록했어요.

짧은 feedback 가능.

대형 success screen 금지.

59. Query Result 이후

Query는 저장하지 않으므로:

Result Sheet 닫기
→ HOME 그대로

HOME count나 list 상태가 변경되면 안 된다.

60. Query Result → Item Detail

Query 결과에서:

[이불 세탁 보기]

선택 시:

/items/[itemId]

로 이동.

61. Item Detail → Record

기존 Item Detail의:

오늘 했어요

또는 record CTA가 있다면 유지.

향후 Unified Composer를 item context로 열 수 있다.

62. UI Container

R4 입력 UI는 HOME에 자연스럽게 연결되어야 한다.

권장:

HOME
↓
Bottom Sheet

상태:

Composer
Listening
Transcript
Confirmation
Query Result
Error

모두 반드시 각각 별도 page일 필요는 없다.

63. Sheet 원칙

Sheet:

mobile first
safe bottom
keyboard 대응
dismiss 가능
중요한 입력 중 accidental dismiss 방지 고려
64. Keyboard

Text input 시 모바일 keyboard가 Action Dock / Sheet를 가리지 않아야 한다.

확인:

360px
390px
430px
65. Autofocus

Direct Input 열기:

text field autofocus 가능

Voice Result:

자동 keyboard open은 피한다.
수정 선택 시 keyboard open.
66. Accessibility

Mic:

aria-label="음성으로 기록하거나 물어보기"

Listening 상태:

aria-pressed

또는 동등한 상태 제공 가능.

67. Dialog Accessibility

Bottom Sheet가 modal 역할을 한다면:

dialog semantics
title
focus management
Escape dismiss desktop
background focus trap

검토.

68. Transcript Field

Accessible label 필수.

예:

말한 내용

placeholder만으로 label을 대체하지 않는다.

69. Query Result Accessibility

결과가 async로 표시되는 경우:

aria-live

또는 적절한 status semantics 사용 가능.

70. R4 Component 전략

기존 /record의 기능을 HOME에서 재사용하기 위해 공통 기능을 분리할 수 있다.

예시 개념:

UnifiedComposer
VoiceInput
TranscriptEditor
ParseResultRouter
RecordConfirmation
QueryResult

실제 파일명은 현재 코드베이스에 맞게 Codex가 결정한다.

71. 금지: 복사 구현

기존 RecordDemo.tsx 전체를 복사해:

HomeRecordDemo.tsx

같이 중복 구현하는 방식은 피한다.

공통 hook / component 추출 우선.

72. 상태 머신 권장

개념적으로:

IDLE
→ LISTENING
→ TRANSCRIPT_READY
→ PARSING
→ COMPLETED_CONFIRM
→ SAVING
→ SUCCESS

또는:

IDLE
→ TEXT_READY
→ PARSING
→ QUERY_RESULT
73. Intent Routing

Parser 성공 이후:

switch(intent) {
  case "COMPLETED":
    // confirmation
    break;

  case "QUERY":
    // query result
    break;

  case "NOT_COMPLETED":
    // no save
    break;

  case "PLANNED":
    // no save
    break;

  case "UNCERTAIN":
    // clarification
    break;
}

기존 Contract에 맞춰 구현한다.

74. NOT_COMPLETED UX

예:

아직 하지 않은 일로 이해했어요.
기록하지 않았습니다.

큰 경고 UI 불필요.

75. PLANNED UX

예:

앞으로 할 일로 이해했어요.
LASTLY는 완료한 기억만 기록해요.
76. UNCERTAIN UX

예:

실제로 한 일인지 조금 더 알려주세요.

Clarification으로 연결.

77. UNKNOWN UX

예:

무슨 기억인지 잘 이해하지 못했어요.
다시 말하거나 입력해주세요.
78. QUERY의 Record CTA

Query Result에서:

새로 기록하기

CTA를 제공할 수 있다.

하지만 누른 뒤 새 Composer Flow로 이동해야 한다.

QUERY 자체를 자동 Record Candidate로 변환하면 안 된다.

79. Demo Data 환경

현재 Runtime DB가 없는 Demo Track에서는:

existing fixture
Activity History demo data
Mock AI

를 사용 가능.

단:

사용자에게 실제 영구 DB 저장이 완료된 것처럼 표현하면 안 된다.

80. Real AI 상태

현재 D2:

Mock AI Demo PASS
Real AI Live Verification 미완료

따라서 R4에서도 Mock 상태를 실제 Production AI처럼 표현하지 않는다.

81. Real Voice 상태

D3 Browser SpeechRecognition이 실제 지원되는 환경에서만 real voice로 동작한다.

미지원 환경에서는 fallback.

Fake speech simulation 금지.

82. Query Mock

Mock AI가 이미 QUERY를 반환하는 case가 있다면 그대로 활용한다.

예:

이불 언제 빨았지?

→ QUERY

R4에서는 이를 blocked flow가 아니라 실제 Query Result로 연결한다.

83. Query Result Data Source

Query Result는:

Parser result
+
Matching result
+
Activity History

를 조합한다.

Parser response만으로 last date를 만들어내지 않는다.

84. Source of Truth

다시 명시:

Activity History = 수행 기록 Source of Truth

Query에서:

last performed

를 답할 때 Activity History를 조회한다.

85. Date Formatting

사용자 표시 예:

9월 1일

필요 시:

2026년 9월 1일

최근 연도는 간략 표시 가능.

DB / internal format과 UI format을 분리한다.

86. Query Sentence

예:

이불 세탁은 9월 1일에 기록했어요.

Target Tag가 있는 경우 R5 이후:

아빠 이불은 9월 1일에 기록했어요.
87. HOME Action Dock Copy

기본 문구:

말해서 기록하거나 물어보세요

이 문구를 기본 Unified Input Copy로 사용한다.

88. 금지 문구
AI에게 물어보세요
AI 기록 도우미
스마트 AI 분석
당신의 AI 생활 비서

MVP 핵심 행동보다 AI 기술을 앞세우지 않는다.

89. Action Dock Mic

Mic은 HOME의 가장 강한 action이다.

권장:

중앙
60~68px
primary green
neutral surrounding UI
90. Direct Input

Mic보다 secondary action.

하지만 명확하게 보여야 한다.

예:

직접 입력
91. Voice / Text 동등성

기능적으로:

Voice transcript
Text input

둘 다 동일 Flow.

Voice만 가능한 기능을 만들지 않는다.

92. Query / Record 동등성

입력 단계에서 사용자가 선택하지 않는다.

Intent가 결과를 결정한다.

93. R4 구현 범위

R4에서 구현할 것:

HOME Mic 실제 Voice input 연결
HOME Direct Input 실제 composer 연결
기존 D3 SpeechRecognition 재사용
Transcript 수정
/api/ai/parse 연결
COMPLETED routing
QUERY routing
NOT_COMPLETED no-save
PLANNED no-save
UNCERTAIN safe handling
Matching 연결
COMPLETED Confirmation UI
QUERY Result UI
Query no-save 검증
Confirmation 이후 기존 Demo Activity save flow 연결
HOME 결과 refresh
error fallback
unsupported voice fallback
/record compatibility 유지 또는 안전한 통합
기존 D2/D3 회귀 검증
94. R4에서 하지 않을 것

R4에서는 다음 작업을 선행하지 않는다.

tags[] 실제 데이터 구조
note 실제 구조
tag candidate 실제 저장
cycle day/week/month 구조
Monthly View
Item Detail 전체 개편
Auth
Supabase Runtime DB
Push Notification 실제 구현
Whisper fallback 신규 구현
PWA 확장
alias 학습 DB
embedding matching
recurrence schema migration
95. R4 Acceptance — Voice
 HOME Mic에서 실제 SpeechRecognition 시작 가능
 ko-KR 사용
 unsupported fallback 있음
 permission denied fallback 있음
 fake transcript 없음
 transcript 수정 가능
 수정 후 reparse
96. R4 Acceptance — Text
 HOME Direct Input 가능
 same parser 사용
 Record/Search 선택 UI 없음
 text edit 가능
 submit 중 duplicate request 방지
97. R4 Acceptance — COMPLETED
 COMPLETED 인식
 server candidate true
 Matching 실행
 Confirmation 표시
 자동 저장 없음
 사용자 confirm 후 Activity 생성
 HOME refresh
98. R4 Acceptance — QUERY
 QUERY 인식
 candidate false
 Matching 실행
 Activity History 조회
 Query Result 표시
 Activity 생성 없음
 Confirmation record UI 없음
99. R4 Acceptance — Safety
 NOT_COMPLETED 저장 안 함
 PLANNED 저장 안 함
 UNCERTAIN 자동 저장 안 함
 future completed 저장 안 함
 max 5 actions
 >5 partial save 없음
 multi action atomic
 Parser item_id 직접 선택 안 함
100. R4 Acceptance — Routes
 /record 기능 손실 없음
 /record?item=... 호환 검토
 /items 유지
 /items/[itemId] 유지
 /settings 유지
 /notification 유지
101. R4 Acceptance — HOME
 R2 Filter 유지
 R3 Flat List 유지
 Action Dock 실제 Unified Input으로 작동
 저장 후 count/list 갱신
 Query 후 HOME 데이터 변경 없음
 중복 HOME section 재도입 없음
102. R4 Acceptance — Regression
 Mock AI 유지
 Golden 10 유지
 Parser contract 유지
 Record Candidate 유지
 Matching 책임 분리 유지
 Activity History 유지
 D3 Voice 유지
 /screens/* 24개 유지
 fixture AppShell 유지
103. R4 Quality Gate

필수:

npm run typecheck
npm run lint
npm run build

모두 PASS.

104. Responsive Gate

확인:

360px
390px
430px

검증:

Composer overflow 없음
keyboard overlap 없음
Sheet safe bottom
Mic 위치 정상
transcript field 잘림 없음
Query Result overflow 없음
Confirmation button 잘림 없음
105. Manual Voice Test

Voice 기능은 build PASS만으로 실제 검증 완료로 보지 않는다.

지원 브라우저에서 실제 Mic 테스트 필요.

확인:

permission prompt
allow
speech
transcript
edit
parse
result

실제 Mic 테스트가 수행되지 않았다면 R4 Voice 판정은:

PARTIAL

로 기록할 수 있다.

106. Query Test Cases

최소:

이불 언제 빨았지?

Expected:

QUERY
candidate false
Activity 생성 없음
Query Result 표시
정수기 필터 언제 갈았어?

Expected:

QUERY
candidate false
107. COMPLETED Test Cases
오늘 이불 빨았어

Expected:

COMPLETED
candidate true
Confirmation
어제 칫솔 바꿨어

Expected:

COMPLETED
candidate true
108. False Completion Test
오늘 이불 안 빨았어

Expected:

NOT_COMPLETED
candidate false
Activity 생성 없음
칫솔 못 바꿨어

Expected:

NOT_COMPLETED
candidate false
109. Planned Test
내일 정수기 필터 갈 거야

Expected:

PLANNED
candidate false
Activity 생성 없음
110. Uncertain Test
이불 빨았던 것 같아

Expected:

UNCERTAIN
자동 저장 없음
111. Edited Transcript Test

Voice transcript:

오늘 이불 빨았어

User edit:

어제 이불 빨았어

Expected:

edited text로 reparse
Date = 어제

이전 Parser 결과 재사용 금지.

112. Query No Mutation Test

Before:

HOME count = X
History count = Y

Query 수행 후:

HOME count = X
History count = Y

변화 없어야 한다.

113. Record Mutation Test

COMPLETED + Confirm 후:

History count = Y + 1

그리고 해당 Item의:

lastDoneOn
D-Day
lifecycle

이 Demo 환경에서 지원되는 범위 내 갱신.

114. R4 구현 전 Codex 검증

이 문서를 추가한 직후 R4를 바로 시작하지 않는다.

먼저 현재 R3 코드와 기존 D2/D3 구현을 분석한다.

115. Codex 분석 항목

반드시 확인:

현재 HOME Action Dock 구조
현재 /record 전체 기능
SpeechRecognition 구현 위치
transcript edit 구현 위치
/api/ai/parse 호출 위치
Parser result handling
COMPLETED Confirmation 구조
existing Demo save 구조
QUERY가 현재 blocked되는 위치
Matching service 위치
Activity History fixture 구조
/record?item=... 지원 여부
HOME에서 재사용 가능한 component/hook
중복 구현 위험
R4 최소 변경 파일
Fixture 영향
R4 착수 blocker
116. Codex 분석 보고 형식
03_VOICE_QUERY_RECORD_SPEC 검증

1. Existing /record Flow
2. Existing Voice / STT
3. Parser / API 연결
4. COMPLETED Flow
5. QUERY 현재 처리
6. Matching / History 연결
7. HOME 통합 전략
8. /record compatibility 전략
9. 예상 변경 파일
10. 회귀 위험
11. R4 시작 가능 여부

Status:
PASS / PARTIAL / BLOCKED
117. R4 구현 원칙

Codex는 기존 기능을 제거하고 새로 쓰는 것보다:

reuse
extract
compose

를 우선한다.

특히:

SpeechRecognition
Parser call
validation
Matching
confirmation

을 중복 구현하지 않는다.

118. STOP RULE

본 문서를 읽었다고 R4를 자동 시작하지 않는다.

Codex는 분석 후 멈춘다.

사용자가 명시적으로:

R4 진행해

라고 하기 전까지 코드 수정 금지.

R4 완료 후에도 R5를 자동 시작하지 않는다.

각 Task 종료 후 반드시:

PASS
PARTIAL
BLOCKED

중 하나로 보고한다.

119. R4 완료 보고 필수 항목

R4 완료 후 반드시 보고:

변경 파일 목록
HOME Mic 구현 방식
HOME Direct Input 구현 방식
SpeechRecognition 재사용 방식
transcript edit
reparse
/api/ai/parse 연결
COMPLETED routing
QUERY routing
NOT_COMPLETED 처리
PLANNED 처리
UNCERTAIN 처리
Matching
Confirmation
Query Result
Query no-save 검증
Record save 검증
Activity History 영향
/record 상태
/record?item=... 상태
/items 상태
/items/[itemId] 상태
/screens/* 24개 상태
Mock AI 영향
D3 Voice 영향
typecheck
lint
build
360/390/430
실제 Mic 수동 테스트 수행 여부
git diff
예상 밖 변경 여부

최종 판정:

PASS
PARTIAL
BLOCKED

중 하나.