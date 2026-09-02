# LASTLY UI/UX Functional Specification
## AI 생활주기 기억 웹앱
**UIUX-FS v1.1 — Final Sync Baseline**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 문서 | UI/UX Functional Specification |
| 기준 문서 | 01 LASTLY PRD v1.1 FINAL / 02 LASTLY BRS v1.1 FINAL / 03 LASTLY UFS v1.1 FINAL |
| 제품 형태 | Mobile-first Web App / PWA |
| 적용 범위 | 외부 사용자가 실제 테스트 가능한 Prototype Core MUST + 명시적 SHOULD |
| 기준일 | 2026.08.31 |
| 문서 상태 | **Development Baseline — Final Sync** |

---

# 1. 문서 목적

이 문서는 LASTLY의 각 화면이 실제 제품에서 어떻게 보이고 어떻게 동작해야 하는지 기능 단위로 정의한다.

고정 범위:

- Screen 목적/진입조건/주요 Action
- Loading / Empty / Error / Success 상태
- AI 분석 결과의 표시/수정
- Item Matching과 Target 선택
- `NO_HISTORY / NO_CYCLE / NORMAL / UPCOMING / DUE / ARCHIVED` 표시
- Record Edit/Delete 및 Snapshot 불변
- Notification Permission과 Device Notification
- MUST / SHOULD 기능 구분
- Mobile-first Responsive
- Accessibility 최소 기준
- Codex 구현 금지 UX

최종 시각 디자인의 색상, 그래픽, 브랜드 스타일은 별도 디자인 단계에서 결정한다.

---

# 2. 문서 우선순위

```text
01 PRD
↓
02 BRS
↓
03 UFS
↓
04 UI/UX FS
```

화면 편의보다 상위 제품 규칙을 우선한다.

---

# 3. UX 핵심 원칙

1. 기록 시작은 짧아야 한다.
2. AI가 무엇을 이해했는지 저장 전에 보여줘야 한다.
3. 잘못된 Action/Date/Item 연결을 사용자가 쉽게 수정할 수 있어야 한다.
4. AI/STT/Network 오류가 입력 손실로 이어지면 안 된다.
5. False Completion 위험이 있으면 자동화보다 확인을 우선한다.
6. Dashboard와 전체 관리의 목적을 분리한다.
7. 상태는 색상만으로 표현하지 않는다.
8. 360/390/430px 모바일 폭을 우선 검증한다.
9. SHOULD 기능은 Core UI Flow를 막지 않는다.

---

# 4. Screen ID

논리 Screen ID는 24개다.

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
S41 Notification Permission / Device Setting

S50 Generic Error / Recovery
```

실제 구현에서는 Modal, Bottom Sheet, Inline State로 병합 가능하다.

---

# 5. Global Navigation

로그인 후 기본 Navigation:

```text
홈
기록하기
전체 관리
```

설정은 보조 진입점으로 둔다.

기록하기는 항상 빠르게 접근 가능해야 한다.

---

# 6. Header 규칙

기본 요소:

- Screen Title
- Back
- 필요 시 Secondary Action
- Settings 진입

기록 Flow 중 뒤로가기 시 입력 보존을 우선한다.

---

# 7. 공통 Button 규칙

Primary:
- 현재 화면의 핵심 다음 단계
- 가능하면 한 화면 1개

Secondary:
- 수정
- 다시 입력
- 나중에

Destructive:
- 기록 삭제
- Archive [SHOULD]

Loading 중 중복 Tap을 차단한다.

---

# 8. 공통 Loading

필수 Loading 대상:

```text
App Entry
Auth
STT
AI Parsing
Record Save
Dashboard
All Management
Item Detail
Notification State
```

무한 Spinner만 남기지 않는다.

---

# 9. 공통 Error

Error State는 가능한 한 다음을 포함한다.

- 무엇이 실패했는지
- 입력이 유지됐는지
- 다시 할 수 있는 Action

기술 Stack Trace를 사용자에게 노출하지 않는다.

---

# 10. 공통 Empty State

- 첫 사용자 → 첫 기록
- 검색 없음 → 검색 수정
- History 없음 → 기록 추가
- NO_HISTORY → 기록 추가
- Dashboard 관리대상 없음 → 전체관리/기록하기

---

# 11. 공통 Success Feedback

나쁜 예:

```text
완료되었습니다.
```

권장:

```text
이불 세탁을 8월 31일 기록했어요.
```

---

# 12. Status UI

```text
NO_HISTORY → 수행기록 없음
NO_CYCLE   → 주기 없음
NORMAL     → 아직 괜찮아요
UPCOMING   → 곧 관리해요
DUE        → 관리 필요
ARCHIVED   → 보관됨 [SHOULD]
```

Text는 항상 표시한다.

---

# 13. Touch / Responsive

- 주요 Touch Target 약 44px 이상을 권장
- 360 / 390 / 430px 필수 검증
- Desktop에서는 Content Max Width 적용
- Bottom Navigation Safe Area 대응

---

# 14. S00 — Splash / App Entry

목적:

- Session 복구
- 사용자 초기 상태 결정

분기:

```text
Session 유효 + 데이터 있음 → S10
Session 유효 + 기록 없음 → S02
Session 없음 → S01
Session 오류 → S01 또는 S50
```

---

# 15. S01 — Login / Sign Up

주요 요소:

- Email/ID
- Password
- Login
- Sign Up
- Validation/Error

규칙:

- Auth Loading 중 중복 Submit 금지
- 로그인 성공 직후 다른 사용자 데이터가 잠깐이라도 보여서는 안 됨

---

# 16. S02 — Onboarding / Empty

권장 Copy:

```text
아직 생활기록이 없어요.

오늘 한 생활관리를
한 문장으로 남겨보세요.

예: “오늘 이불 빨았어”
```

Primary:

```text
[첫 기록 남기기]
```

예시를 자동 사용자 데이터로 저장하지 않는다.

---

# 17. S10 — Dashboard 목적

질문:

> **“지금 무엇을 관리해야 하지?”**

표시:

```text
DUE
UPCOMING
NORMAL
```

기본 제외:

```text
NO_CYCLE
NO_HISTORY
ARCHIVED
```

---

# 18. S10 — Dashboard 정렬

DUE:
- 가장 오래 지난 Item 우선

UPCOMING/NORMAL:
- Next Due 가까운 Item 우선

---

# 19. S10 — Item Card

최소 표시:

- Item Name
- Status Text
- Last Performed
- Next Due
- 필요 시 경과/남은 기간

Tap → S21

---

# 20. S10 — Empty

관리상태 표시 대상이 없을 때:

```text
지금 관리가 필요한 항목이 없어요.
```

Actions:

```text
[전체 관리 보기]
[기록하기]
```

NO_CYCLE/NO_HISTORY Item이 있을 수 있으므로 “관리항목이 없음”이라고 단정하지 않는다.

---

# 21. S11 — Record Input

목적:

Text/Voice 공통 기록 시작.

요소:

- Textarea
- Microphone
- Example Chip
- Analyze CTA
- Length Feedback

권장 Copy:

```text
오늘 한 일을 알려주세요.
```

Placeholder:

```text
예: 오늘 이불 빨았어
```

---

# 22. S11 — Analyze State

빈 입력이면 Disabled.

입력 있으면:

```text
[AI로 이해하기]
```

오류/뒤로가기 후 원문을 가능한 한 유지한다.

---

# 23. S11 — Too Many Actions

5개 초과 의미 행동:

```text
한 번에 최대 5개까지 기록할 수 있어요.
입력을 나눠주세요.
```

부분 저장 Flow로 보내지 않는다.

---

# 24. S12 — Voice Listening

요소:

- Recording Indicator
- 경과시간
- Stop
- Cancel
- Permission 상태

---

# 25. S12 — Permission Denied

```text
마이크를 사용할 수 없어요.
```

Actions:

```text
[직접 입력하기]
[설정 방법 보기]
```

---

# 26. S13 — STT Result

핵심 Copy:

```text
이렇게 들었어요.
```

요소:

- Editable Transcript
- 다시 말하기
- 분석하기

사용자가 수정한 Transcript를 AI 입력으로 사용한다.

---

# 27. S13 — STT Error

```text
음성을 텍스트로 바꾸지 못했어요.
```

Actions:

```text
[다시 말하기]
[직접 입력하기]
```

---

# 28. S14 — AI Processing

목적:

AI Parser 처리 상태.

표시 책임:

```text
Intent
Scope
Action
Date
Clarification 필요 여부
```

**기존 Item 탐색은 AI Parser 처리 단계가 아니다. Item Matching은 Parser 뒤에서 별도 수행한다.**

권장 Loading:

```text
내용을 이해하고 있어요.
```

---

# 29. S14 — AI Error

```text
내용을 이해하지 못했어요.
```

Actions:

```text
[다시 시도]
[직접 기록하기]
```

원문 유지.

---

# 30. S15 — AI Confirmation

Core Trust Gate.

권장 Title:

```text
AI가 이렇게 이해했어요.
```

필수 표시:

- Original Text
- Normalized Action
- Performed Date
- 기존 Item / 신규 Item 여부

---

# 31. S15 — Existing Item

예:

```text
기존 관리항목에 기록해요
이불 세탁
```

---

# 32. S15 — New Item

예:

```text
새 관리항목으로 만들어요
욕실 환풍기 청소
```

---

# 33. S15 — IMPLICIT_TODAY

날짜 없는 완료형:

```text
칫솔 바꿨어
```

표시 예:

```text
수행일
오늘 · 8월 31일
```

필요 시:

```text
날짜 표현이 없어 오늘로 이해했어요.
```

자동저장이 아님을 유지한다.

---

# 34. S15 — 수정 가능 항목

사용자 수정 가능:

```text
Action
Date
Item 연결
```

Action 변경 시 Item Matching을 다시 평가할 수 있어야 한다.

---

# 35. S15 — Save

Primary:

```text
[기록하기]
```

Secondary:

```text
[수정]
[취소]
```

Save 성공 전 S17로 이동하지 않는다.

---

# 36. S15 — Multiple Actions

2~5개 Segment:

각 Card에:

- Source Text
- Action
- Date
- Item
- Include/Exclude
- 수정

Mixed Intent에서는 저장되는 Segment와 저장되지 않는 Segment를 명확히 구분한다.

---

# 37. S16 — Clarification

목적:

AI 또는 Item Matching에서 필요한 최소 확인.

Variant:

```text
COMPLETION
ACTION
DATE
SCOPE
TARGET
UNKNOWN
OUT_OF_SCOPE
PLANNED
NOT_COMPLETED
QUERY
DUPLICATE
TOO_MANY_ACTIONS
```

---

# 38. S16 — Completion

예:

```text
필터를 실제로 교체한 게 맞나요?
```

Actions:

```text
[했어요]
[안 했어요]
[확실하지 않아요]
```

---

# 39. S16 — Action

```text
무엇을 청소했나요?
```

직접 입력 + 계속.

---

# 40. S16 — Date

```text
언제 했나요?
```

Date Picker.

미래 날짜 선택 금지.

---

# 41. S16 — Scope

```text
LASTLY에서 반복 관리할 생활항목인가요?
```

Actions:

```text
[맞아요]
[아니에요]
```

---

# 42. S16 — Target

기존 Item 후보가 여러 개면:

```text
어떤 항목을 말한 건가요?
```

Candidate List + 신규 Item 선택.

`TARGET`은 AI Parser Clarification Enum이 아니라 Item Matching UI다.

---

# 43. S16 — UNKNOWN

```text
정확히 이해하지 못했어요.
```

Actions:

```text
[직접 기록하기]
[다시 입력하기]
[취소]
```

UNKNOWN을 자동 COMPLETED로 변경하지 않는다.

---

# 44. S16 — OUT_OF_SCOPE

```text
이 내용은 LASTLY의 반복 생활관리 기록으로 저장하지 않았어요.
```

Action:

```text
[다른 기록 입력]
```

일반 메모 저장 기능을 추가하지 않는다.

---

# 45. S16 — PLANNED

```text
앞으로 할 일로 이해했어요.
LASTLY는 실제로 한 일을 기록해요.
```

To-do 생성 CTA 없음.

---

# 46. S16 — NOT_COMPLETED

```text
아직 완료하지 않은 것으로 이해했어요.
수행기록으로 저장하지 않았어요.
```

---

# 47. S16 — QUERY

Core MVP:

```text
기억 조회 질문으로 이해했어요.
```

Activity Save CTA 없음.

실제 대화형 기억 조회는 NEXT.

---

# 48. S16 — Approximate / Unknown Date

```text
정확한 날짜를 알려주세요.
```

AI가 임의 날짜를 만들지 않는다.

---

# 49. S16 — Future Date

```text
미래 날짜는 완료기록으로 저장할 수 없어요.
```

User Today 이하 Date 선택.

---

# 50. S16 — Duplicate

```text
오늘 이미 같은 기록이 있어요.
추가로 기록할까요?
```

Actions:

```text
[기존 기록 보기]
[그래도 추가]
[취소]
```

---

# 51. S17 — Record Saved

실제 Server Save 성공 이후만 표시한다.

필수:

- Item Name
- Performed Date
- Last Performed
- Cycle 상태
- 가능하면 Next Due

---

# 52. S17 — NO_CYCLE

신규 Item 또는 주기 없음:

```text
[관리주기 설정]
[나중에]
```

Cycle 설정을 강제하지 않는다.

---

# 53. S17 — Existing Cycle

예:

```text
다음 관리일
9월 28일
```

---

# 54. S17 — Undo

신규 Record 저장 직후 Undo UX 제공 가능.

기본 권장:

```text
약 10초
```

실제 DB 상태와 동기화되어야 한다.

---

# 55. S20 — All Management

질문:

> **“나는 무엇을 관리하고 있지?”**

포함:

```text
NO_HISTORY
NO_CYCLE
NORMAL
UPCOMING
DUE
```

기본 제외:

```text
ARCHIVED
```

---

# 56. S20 — Search

검색:

- Item Name
- Alias

Search Empty:

```text
검색 결과가 없어요.
```

---

# 57. S20 — Item Row

최소:

- Item Name
- Status
- Last Performed 또는 수행기록 없음
- Next Due 또는 주기 없음
- Detail Arrow

---

# 58. S20 — NO_HISTORY

```text
수행기록 없음
```

CTA:

```text
[기록 추가]
```

NO_CYCLE과 구분한다.

---

# 59. S20 — NO_CYCLE

```text
마지막 수행 8월 31일
주기 없음
```

---

# 60. S21 — Item Detail

Core 정보:

- Item Name
- Status
- Last Performed
- Elapsed
- Cycle
- Next Due
- 최근 Activity

---

# 61. S21 — NO_HISTORY

```text
아직 수행기록이 없어요.
```

Actions:

```text
[기록 추가]
[항목 수정]
```

Last/Next Due는 `—` 또는 숨김.

---

# 62. S21 — NO_CYCLE

```text
주기 없음
```

CTA:

```text
[주기 설정]
```

---

# 63. S21 — DUE

Primary:

```text
[오늘 했어요]
```

Secondary:

```text
[다른 날짜로 기록]
```

---

# 64. S21 — Core Actions

- 오늘 했어요
- 기록 추가
- 수행이력
- 주기 설정/수정
- Item 이름 수정

SHOULD:

- Archive
- Restore
- Merge

---

# 65. S22 — Activity History

기본 최신순.

각 Activity:

- Performed Date
- 입력 방식
- Original Text 요약 가능
- 수정
- 삭제

History를 Last 하나로 축약하지 않는다.

---

# 66. S22 — Empty

NO_HISTORY:

```text
수행기록이 없어요.
```

CTA:

```text
[기록 추가]
```

---

# 67. S23 — Record Edit

Core Editable:

```text
Performed Date
Management Item 연결
```

---

# 68. S23 — Snapshot 불변

일반 Record Edit에서 직접 수정하지 않는다.

```text
Original Text
normalized_action_snapshot
input_method
AI Parse 원본
```

Item 이름은 S24에서 수정한다.

---

# 69. S23 — Date Validation

미래 날짜 선택 금지.

수정 후:

- Last 재계산
- Next Due 재계산
- Status 재계산
- Notification 조정

---

# 70. S23 — Move Item

자신의 Active Item만 대상 후보로 표시한다.

Cross-user Item 노출 금지.

---

# 71. S23 — Delete

Destructive:

```text
[기록 삭제]
```

권장 Confirmation:

```text
이 기록을 삭제할까요?
삭제하면 마지막 수행일과 다음 관리일이 다시 계산돼요.
```

---

# 72. S23 — Delete Only Activity

삭제 후:

```text
NO_HISTORY
```

상태로 UI를 갱신한다.

`NO_CYCLE`로 잘못 표시하지 않는다.

---

# 73. S24 — Item Edit

Core:

```text
Item Name
```

Category/Owner/Location은 필수로 강제하지 않는다.

---

# 74. S24 — SHOULD Actions

- Archive
- Restore
- Merge

Core Release와 분리한다.

---

# 75. S25 — Cycle Setting

Core:

```text
N일마다
주기 없음
```

유효:

```text
1 이상의 정수
```

무효:

```text
0
음수
비정수
```

---

# 76. S25 — Save Result

Last 존재:

```text
Next Due 계산
Status 계산
```

Last 없음:

```text
NO_HISTORY
Next Due 없음
```

---

# 77. S25 — Notification CTA

Cycle 설정 후 맥락 있는 Permission CTA를 제시할 수 있다.

```text
관리일에 알려드릴까요?
[이 기기에서 알림 받기]
```

---

# 78. S30 — Notification Landing

Push 클릭 후 최신 Item 상태를 다시 조회한다.

과거 Payload를 Source of Truth로 사용하지 않는다.

---

# 79. S30 — Active DUE

Actions:

```text
[오늘 했어요]
[다른 날 했어요]
[나중에 알려줘]
```

---

# 80. S30 — Stale Notification

이미 새 Activity가 있어 Due가 해소됐다면:

```text
이미 최신 기록이 있어요.
```

Actions:

```text
[항목 보기]
[홈으로]
```

---

# 81. S31 — Complete Today

Flow:

```text
오늘 했어요
↓
Duplicate Guard
↓
Save
↓
Lifecycle 재계산
```

---

# 82. S32 — Complete Other Date

- Date Picker
- 미래 날짜 Disabled
- Save

현재 Last보다 오래된 날짜면 History만 추가되고 최신 Last는 유지한다.

---

# 83. S33 — Snooze

옵션:

```text
1일 뒤
3일 뒤
7일 뒤
```

설명:

```text
완료로 기록되지 않아요.
관리 필요 상태는 그대로 유지돼요.
```

결과:

```text
Activity 변화 없음
Next Due 변화 없음
DUE 유지
Notification만 연기
```

---

# 84. S40 — Settings

Core 최소:

- Logout
- Notification Setting 진입

---

# 85. S41 — Notification Permission / Device Setting

목적:

**현재 기기**의 Notification 상태 관리.

권장 Label:

```text
이 기기에서 알림 받기
```

---

# 86. S41 — 상태

```text
허용됨
거부됨
아직 요청하지 않음
지원하지 않음
```

---

# 87. S41 — Permission Denied

```text
알림은 꺼져 있어요.
앱 안에서는 관리 필요 상태를 계속 확인할 수 있어요.
```

---

# 88. S41 — 전역 Toggle 금지

DB/API에 존재하지 않는 단순 전역 서비스 상태처럼:

```text
관리 알림 ON/OFF
```

만 표시하지 않는다.

현재 기기 권한/구독 상태를 명확히 한다.

---

# 89. S41 — Item-level Notification [SHOULD]

세부 Item별 Notification Setting UI는 SHOULD.

Core MUST와 분리한다.

---

# 90. S50 — Generic Error / Recovery

대상:

- Auth
- STT
- AI
- Network
- Save
- Item Not Found
- Session Expired
- Permission

가능한 Action:

```text
[다시 시도]
[직접 입력]
[로그인]
[홈으로]
```

---

# 91. Manual Record UI

AI 실패 또는 AI 판정 거부 시:

필드:

```text
Action
Performed Date
생활관리 기록 확인
```

다음:

```text
Item Matching
→ Confirmation
→ Save
```

---

# 92. Manual Record Validation

Manual Flow도 우회 불가:

- Future Date
- Ownership
- Duplicate
- Item Matching
- Confirmation
- Save 성공 확인

---

# 93. Multiple Action UI

2~5개 Segment를 Card/List로 표시.

각 Segment:

- Source Text
- Action
- Date
- Item
- Include/Exclude

---

# 94. Multiple Mixed Intent

저장 대상과 비저장 대상을 시각적으로 분리한다.

예:

```text
이불 세탁 — 기록함
세탁조 청소 예정 — 기록 안 함
```

---

# 95. Multiple Atomic Save UX

하나의 Segment가 검증 실패하면:

```text
나머지만 조용히 저장
```

하지 않는다.

문제 Segment를 표시하고 전체 저장을 다시 확인한다.

---

# 96. Item Matching UI

상태:

```text
NEW
MATCHED
AMBIGUOUS
```

사용자에게 내부 Matching Score를 노출할 필요는 없다.

---

# 97. Fuzzy Match

유사 후보는 제안할 수 있으나 자동 확정 금지.

```text
혹시 이 항목인가요?
```

---

# 98. Archived Matching [SHOULD]

Archived Item을 자동 Match 대상으로 사용하지 않는다.

Restore 구현 시 명시적 복원 후 사용한다.

---

# 99. Item Archive UX [SHOULD]

권장:

```text
이 항목을 보관할까요?
과거 수행기록은 유지돼요.
```

---

# 100. Item Merge UX [SHOULD]

병합 전 표시:

- 대표 Item
- Source Item
- Activity Count
- Cycle 충돌
- 보존 정보

중간 실패 상태를 사용자에게 노출하지 않는다.

---

# 101. Notification Privacy UX

잠금화면 노출을 고려해 Push Content에 불필요한 생활 세부정보를 최소화한다.

상세는 로그인된 앱에서 확인하는 방향을 우선한다.

---

# 102. AI/STT Timeout UX

오래 걸리면:

- 무한 Loading 금지
- Retry
- Manual/Text Fallback

정확한 Timeout 값은 API/Provider 문서에서 정한다.

---

# 103. Offline UX

```text
인터넷 연결을 확인해주세요.
입력한 내용은 유지했어요.
```

가능한 경우 Retry.

---

# 104. Session Expired UX

```text
로그인이 만료됐어요.
다시 로그인하면 작성 중인 내용을 이어갈게요.
```

가능한 범위에서 입력 State 보존.

---

# 105. Accessibility — Form

- Label
- Error 연결
- Keyboard 접근
- Required 상태
- Screen Reader Name

---

# 106. Accessibility — Button / Focus

- Icon-only Button Accessible Name
- Focus Indicator
- Modal Open 시 Focus 이동
- Close 후 Trigger 복귀

---

# 107. Accessibility — Status

Status를 Color만으로 표현하지 않는다.

Text 필수.

---

# 108. Mobile Keyboard

Textarea/Date Input 사용 시 Keyboard가 Primary CTA를 완전히 가리지 않도록 한다.

---

# 109. Bottom Sheet

Clarification/Target 선택에 사용 가능.

조건:

- 내부 Scroll
- CTA 접근 가능
- 화면 밖 Overflow 없음

---

# 110. Date Picker

Future Completed Date Disabled.

User Timezone 기준 Today 사용.

---

# 111. Long Item Name

2줄 이상 Wrap 가능.

핵심 정보가 잘리지 않도록 한다.

---

# 112. Long Original Text

Confirmation에서는 Action/Date가 우선.

긴 원문은 접기/펼치기 가능.

---

# 113. Copy Tone

- 간단
- 비기술적
- 판단적이지 않음
- AI 확신을 과장하지 않음

---

# 114. 금지 Copy

```text
AI가 확실히 판단했어요.
완벽하게 이해했어요.
자동으로 저장했어요.
```

---

# 115. 권장 Copy

```text
AI가 이렇게 이해했어요.
확인하고 기록해주세요.
정확한 날짜를 알려주세요.
이 내용은 수행기록으로 저장하지 않았어요.
```

---

# 116. Core MUST UI Traceability

| # | MUST | UI |
|---:|---|---|
| 1 | 자연어 Text | S11 |
| 2 | Voice | S12 |
| 3 | Voice → Text | S13 |
| 4 | Intent | S14/S16 |
| 5 | Action | S15/S16 |
| 6 | Date | S15/S16 |
| 7 | AI Confirmation | S15 |
| 8 | AI 결과 수정 | S15 |
| 9 | Persistent Save | S17 |
| 10 | Item Matching | S15/S16 |
| 11 | New Item | S15 |
| 12 | Last Performed | S17/S21 |
| 13 | All Management | S20 |
| 14 | Item History | S22 |
| 15 | Record Edit/Delete | S23 |
| 16 | User Cycle | S25 |
| 17 | Next Due | S17/S21 |
| 18 | Status | S10/S20/S21 |
| 19 | Dashboard | S10 |
| 20 | Due Notification | S30 |
| 21 | 오늘 했어요 | S31 |
| 22 | Authentication | S01 |
| 23 | User Data Isolation | 전체 사용자 데이터 UI |
| 24 | Persistent DB | Refresh/Re-login 결과 |
| 25 | External Deployment | 실제 Browser/Mobile Smoke |

---

# 117. SHOULD UI Traceability

| SHOULD | UI |
|---|---|
| Record Restore | S22/S23 선택 구현 |
| Item Archive | S24 |
| Archived Restore | S24/별도 목록 |
| Item Merge | S24 또는 별도 Sheet |
| Item-level Notification | S21/S41 |

SHOULD 미구현만으로 Core UI Prototype을 실패로 판정하지 않는다.

---

# 118. Screen Coverage

| Screen | Loading | Empty | Error | Primary |
|---|---:|---:|---:|---|
| S00 | O | - | O | - |
| S01 | O | - | O | Login |
| S02 | - | O | - | First Record |
| S10 | O | O | O | Record |
| S11 | - | - | O | Analyze |
| S12 | O | - | O | Stop |
| S13 | O | - | O | Analyze |
| S14 | O | - | O | - |
| S15 | O | - | O | Save |
| S16 | - | - | O | Resolve |
| S17 | - | - | O | Cycle/Done |
| S20 | O | O | O | Item |
| S21 | O | O | O | Today |
| S22 | O | O | O | Record |
| S23 | O | - | O | Save |
| S24 | O | - | O | Save |
| S25 | O | - | O | Save |
| S30 | O | - | O | Today |
| S31 | O | - | O | Save |
| S32 | O | - | O | Save |
| S33 | O | - | O | Snooze |
| S40 | O | - | O | Settings |
| S41 | O | - | O | Device Alert |
| S50 | - | - | O | Recover |

---

# 119. Critical UX Acceptance — False Completion

```text
오늘 이불 못 빨았어
```

- 완료 Confirmation으로 이동 금지
- NOT_COMPLETED 안내
- Activity Save CTA 없음

---

# 120. Critical UX Acceptance — Planned

```text
내일 이불 빨 거야
```

To-do 생성 CTA 없음.

---

# 121. Critical UX Acceptance — Query

```text
이불 언제 빨았지?
```

새 Activity Save CTA 없음.

---

# 122. Critical UX Acceptance — Approximate Date

```text
지난주쯤 이불 빨았어
```

정확한 날짜 확인 전 Save 불가.

---

# 123. Critical UX Acceptance — Ambiguous Target

후보 여러 개:

- 자동 선택 금지
- Target 선택 UI 제공

---

# 124. Critical UX Acceptance — NO_HISTORY

유일 Activity 삭제 후:

```text
수행기록 없음
```

표시.

`주기 없음`으로 표시하지 않는다.

---

# 125. Critical UX Acceptance — Snapshot

S23에서 `normalized_action_snapshot` 직접 편집 Field를 제공하지 않는다.

---

# 126. Critical UX Acceptance — Device Notification

S41은 전역 서비스 Boolean이 아니라 **현재 기기** 상태임을 명확히 한다.

---

# 127. Critical UX Acceptance — Stale Push

오래된 Push 클릭 후 이미 새 Activity가 있으면 Today Complete를 강제하지 않는다.

---

# 128. Critical UX Acceptance — Save Failure

DB 실패 시 S17 성공 화면을 표시하지 않는다.

---

# 129. Codex 구현 금지 UX

Codex는 다음을 임의 추가하지 않는다.

1. AI Confidence 기반 자동저장
2. PLANNED To-do 자동 생성
3. QUERY 일반 메모 저장
4. OUT_OF_SCOPE Lifelog 저장
5. Target 자동 선택
6. NO_HISTORY를 NO_CYCLE로 표시
7. Snapshot 직접 편집
8. Snooze 완료 표시
9. 실제 데이터 모델과 다른 전역 Notification Boolean
10. SHOULD 기능을 Core Navigation 필수 단계로 삽입
11. 5개 초과 행동 부분 저장
12. Save 성공 전 Success UI

---

# 130. UI 구현 완료 기준

Core UI는 다음을 만족한다.

- 24 Screen ID Coverage
- 360/390/430 Responsive
- Text/Voice
- STT Review
- AI Confirmation
- Clarification
- Item Matching
- Manual Fallback
- NO_HISTORY/NO_CYCLE 구분
- Record Edit/Delete
- Cycle
- Dashboard
- Notification Landing
- Today Complete
- Other Date
- Snooze
- Loading/Error/Empty
- Accessibility 기본
- MUST/SHOULD 분리

---

# 131. Final UI Flow

```text
S01
↓
S10 / S02
↓
S11
↓
S12/S13 또는 Text
↓
S14
↓
S16 필요 시
↓
Item Matching
↓
S16 Target 필요 시
↓
S15
↓
S17
↓
S25 선택
↓
S10
↓
S21/S22
↓
S30
↓
S31/S32/S33
```

---

# 132. Final Sync 검증 기준

본 문서는 다음을 반영했다.

- PRD v1.1 MUST/SHOULD
- BRS v1.1 Intent 6종
- Scope 3종
- UFS v1.1 책임 경계
- AI Parser와 Item Matching 분리
- UNKNOWN
- IMPLICIT_TODAY
- NO_HISTORY
- Multiple >5
- Atomic Multi Save UX
- Manual Record
- Snapshot Edit 금지
- Device Notification
- Stale Notification
- Snooze 1/3/7
- Archive/Restore/Merge SHOULD
- Cross-user UI 차단
- Save Success 정확성

---

# 133. Development Baseline 완료

본 문서를 LASTLY Core Prototype의 화면 기능 기준선으로 사용한다.

Visual Style이 변경되어도 다음은 유지한다.

```text
사용자 사실 우선
AI Confirmation
Activity History
Lifecycle
User Data Isolation
Error Recovery
MUST/SHOULD Scope
```

---

## UIUX-FS v1.1 Final Sync 상태

**PRD v1.1 정합성:** 완료  
**BRS v1.1 정합성:** 완료  
**UFS v1.1 정합성:** 완료  
**Screen ID 24개:** 완료  
**MVP 25/25 UI Traceability:** 완료  
**UNKNOWN / IMPLICIT_TODAY / NO_HISTORY:** 반영  
**AI Parser ↔ Item Matching:** 반영  
**Manual Record:** 반영  
**Snapshot Edit 금지:** 반영  
**Device Notification:** 반영  
**Stale Notification:** 반영  
**Snooze 1/3/7:** 반영  
**MUST/SHOULD:** 분리  
**Codex 구현 기준:** 사용 가능
