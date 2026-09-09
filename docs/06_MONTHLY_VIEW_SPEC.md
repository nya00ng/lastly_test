# LASTLY — Monthly View Functional Specification

## 문서 목적

이 문서는 LASTLY HOME 내부의 월간 보기(Monthly View)를 정의한다.

R7의 목적은 일반적인 일정 캘린더를 만드는 것이 아니다.

LASTLY의 핵심은:

- 언제 마지막으로 했는지
- 이번 달에 어떤 생활 관리가 있었는지
- 다음 관리 시점이 언제인지
- 어떤 항목이 밀렸는지

를 월 단위로 한눈에 확인하게 하는 것이다.

이 문서는 **R7 — Monthly View 구현의 Source of Truth**다.

기존 문서와 충돌하는 경우 우선순위는 다음과 같다.

1. `docs/00_CHANGE_REQUEST.md`
2. `docs/01_UPDATED_IA.md`
3. `docs/02_HOME_UI_UX_SPEC.md`
4. `docs/03_VOICE_QUERY_RECORD_SPEC.md`
5. `docs/04_TAG_NOTE_SPEC.md`
6. `docs/05_CYCLE_SPEC.md`
7. `docs/06_MONTHLY_VIEW_SPEC.md`

---

# 1. 핵심 원칙

R7 Monthly View는:

```text
일정 관리 캘린더
````

가 아니다.

다음 두 종류의 정보를 한 달 안에서 보여주는 화면이다.

```text
과거 Activity
+
다음 관리 예정일
```

즉:

```text
한 기록
+
앞으로 관리할 기억
```

을 동시에 보여준다.

---

# 2. HOME 내부 View

Monthly View는 별도 Calendar route를 만들지 않는다.

HOME 안에서:

```text
List
Month
```

두 View를 전환한다.

예:

```text
[ 목록 ] [ 월간 ]
```

기본값은:

```text
List
```

---

# 3. 별도 Calendar 페이지 금지

R7에서 다음 route를 새로 만들지 않는다.

```text
/calendar
/month
/schedule
```

HOME이 계속 제품의 중심 workspace다.

---

# 4. 월간 화면 목적

사용자가 월간 화면을 열었을 때 다음 질문에 답할 수 있어야 한다.

```text
이번 달에 내가 뭘 했지?

이번 달에 뭘 해야 하지?

어떤 관리가 이미 밀렸지?

어떤 관리가 곧 돌아오지?
```

---

# 5. Monthly View 데이터

Monthly View는 최소 다음 데이터를 사용한다.

```text
Activity History
Item nextDue
Item lifecycle
Item name
Item tags
```

---

# 6. Source of Truth

과거 수행 기록:

```text
Activity History
```

다음 관리 예정:

```text
R6 Cycle Engine에서 파생된 nextDue
```

Month View가 별도로 due 계산 로직을 다시 만들면 안 된다.

---

# 7. Calendar Event 종류

월간 화면의 표시 항목은 두 종류다.

```text
ACTIVITY
DUE
```

---

# 8. ACTIVITY

사용자가 실제 수행한 기록이다.

예:

```text
9월 2일
이불 세탁 완료
```

Source:

```text
Activity History
```

---

# 9. DUE

Cycle에 의해 계산된 다음 관리일이다.

예:

```text
9월 15일
정수기 필터 관리 예정
```

Source:

```text
item.nextDue
```

---

# 10. ACTIVITY와 DUE를 혼동하지 않는다

ACTIVITY는:

```text
실제로 한 것
```

DUE는:

```text
앞으로 해야 할 시점
```

이다.

둘을 같은 색, 같은 dot, 같은 라벨로 표시하지 않는다.

---

# 11. visual distinction

권장:

ACTIVITY:

```text
●
```

또는:

```text
완료 marker
```

DUE:

```text
○
```

또는:

```text
예정 marker
```

다만 과도한 색상 사용은 피한다.

---

# 12. Lifecycle color 사용

Lifecycle 색상은 기존 정책을 유지한다.

예:

* DUE
* UPCOMING
* NORMAL

색상은 D-Day/상태 cue에만 제한적으로 사용.

Calendar 자체를 색색의 일정표처럼 만들지 않는다.

---

# 13. Calendar Grid

기본 월간 달력 구조:

```text
일 월 화 수 목 금 토

 1  2  3  4  5  6  7
 8  9 10 11 12 13 14
15 16 17 18 19 20 21
...
```

---

# 14. Week start

한국 사용자 기준:

```text
일요일 시작
```

을 기본으로 한다.

즉:

```text
일 월 화 수 목 금 토
```

---

# 15. 월 navigation

상단에:

```text
< 2026년 9월 >
```

형태의 이전/다음 월 이동 제공.

---

# 16. 오늘로 이동

선택적으로:

```text
오늘
```

버튼 제공 가능.

R7 필수 조건은 아니지만 권장.

---

# 17. Month state

HOME Month View는 최소 다음 상태를 가진다.

```ts
selectedMonth
selectedDate
```

---

# 18. 초기 Month

처음 Month View 진입 시:

```text
현재 월
```

을 보여준다.

기준 timezone:

```text
Asia/Seoul
```

---

# 19. selectedDate

사용자가 특정 날짜를 누르면:

```text
그 날짜의 Activity / Due 상세 목록
```

을 아래에 표시한다.

---

# 20. 날짜 선택 전

날짜 선택 전에는:

```text
오늘
```

을 기본 선택하거나,

```text
선택 없음
```

으로 둘 수 있다.

권장:

```text
오늘 자동 선택
```

---

# 21. 날짜 cell 구성

각 날짜 cell은 최소:

```text
날짜 숫자
marker
```

를 가진다.

예:

```text
15
● ○
```

---

# 22. Marker 개수

한 날짜에 Activity/Due가 여러 개 있을 수 있다.

Cell에 모든 이름을 적지 않는다.

권장:

```text
●●○
```

또는:

```text
● +2
```

---

# 23. Cell 정보 과밀 금지

금지:

```text
15
이불 세탁
칫솔 교체
필터 교체
에어컨 청소
```

Calendar cell은 overview용이다.

상세는 selected date list에서 보여준다.

---

# 24. Marker 최대 표시

권장:

```text
최대 3개
```

초과:

```text
+N
```

---

# 25. Activity marker priority

동일 날짜에 Activity와 Due가 같이 있다면
두 종류가 있다는 것을 알 수 있어야 한다.

예:

```text
● ○
```

---

# 26. selected date 상세

예:

```text
9월 15일

한 기록
이불 세탁
아이 이불 · 아빠 이불

관리 예정
정수기 필터
D-Day
```

---

# 27. 상세 section

선택 날짜 아래:

```text
한 기록
관리 예정
```

두 영역으로 분리 가능.

---

# 28. Activity section

예:

```text
한 기록

이불 세탁
아이 이불 · 아빠 이불
```

클릭:

```text
/items/[itemId]
```

---

# 29. Due section

예:

```text
관리 예정

정수기 필터
주방 정수기
D-2
```

클릭:

```text
/items/[itemId]
```

---

# 30. 같은 Item Activity + Due

같은 날짜에 같은 Item의 Activity와 Due가 동시에 존재할 수도 있다.

예:

Cycle 설정 직후 또는 fixture 조건.

이 경우 두 의미를 분리해서 보여준다.

---

# 31. Activity는 과거뿐만 아니다

사용자는 오늘 Activity를 기록할 수 있다.

따라서 ACTIVITY date는:

```text
과거
오늘
```

모두 가능.

미래 Activity는 R4 규칙상 금지.

---

# 32. Due는 미래만이 아니다

이미 기한이 지난 Item은:

```text
nextDue < today
```

상태일 수 있다.

Month View에서 지난 월 날짜에 DUE marker가 존재할 수 있다.

---

# 33. Overdue 표시

DUE가 지난 경우:

```text
D+N
```

또는 기존 lifecycle cue를 상세 목록에서 보여준다.

Calendar cell 자체에 큰 경고 표시를 남발하지 않는다.

---

# 34. Current Month

현재 월의 오늘 날짜는 시각적으로 구분한다.

권장:

```text
얇은 outline
또는
작은 filled circle
```

과도한 강조 금지.

---

# 35. Selected Date

선택한 날짜는 오늘과 구분되는 selected state를 가진다.

selected가 오늘이면 한 상태로 결합 가능.

---

# 36. Other Month Dates

달력 앞뒤의 이전/다음 월 날짜를 filler cell로 보여줄 경우:

* muted
* 클릭 가능 여부는 선택

MVP 권장:

```text
비활성 또는 muted
```

---

# 37. Month View Header

HOME 상단 구조를 유지한다.

예:

```text
LASTLY
[알림] [설정]

[목록] [월간]

< 2026년 9월 >
```

---

# 38. Action Dock 유지

Month View에서도 HOME의 Action Dock을 유지한다.

사용자는 월간 화면을 보다가도:

```text
마이크
직접 입력
```

으로 바로 기록/조회할 수 있어야 한다.

---

# 39. Bottom Navigation 추가 금지

R1에서 제거한 bottom 3-nav를 Month View 때문에 다시 만들지 않는다.

---

# 40. Filter와 Month View

R2의:

```text
ALL
DUE
UPCOMING
NORMAL
```

filter는 List View 중심 기능이다.

R7에서는 Month View에 동일 필터를 강제로 적용하지 않아도 된다.

---

# 41. 권장 filter 정책

Month View에서는 전체 관리 기억을 보여준다.

단:

```text
ARCHIVED 제외
```

---

# 42. NO_HISTORY

History가 없는 Item은 ACTIVITY marker가 없다.

Cycle이 있고 nextDue가 계산 불가하므로:

```text
DUE marker도 없음
```

---

# 43. NO_CYCLE

Cycle 없는 Item은 Activity marker만 존재할 수 있다.

DUE marker 없음.

---

# 44. ARCHIVED

ARCHIVED Item:

```text
Month View 기본 제외
```

---

# 45. Month View의 Due Source

반드시:

```text
현재 item.nextDue
```

만 사용한다.

---

# 46. Recurring Future Due 생성 범위

R7 MVP에서는 다음 due 이후의 반복 예정일을
월 전체에 무한 생성하지 않는다.

예:

```text
9월 10일 nextDue
10월 10일 future
```

현재 Month에서 실제 `nextDue` 한 건만 표시.

---

# 47. 반복 Schedule 전체 생성 금지

R7에서:

```text
향후 12개월 recurrence expansion
```

구현하지 않는다.

R6는 nextDue engine이지 full recurrence scheduler가 아니다.

---

# 48. 왜 nextDue 하나만 표시하는가

LASTLY는 일반 일정 앱이 아니라:

```text
다음 관리 시점
```

을 기억하는 서비스다.

따라서 R7 MVP에서도:

```text
현재 다음 1회
```

를 중심으로 한다.

---

# 49. 과거 Due History

지난 Due가 실제 Activity로 수행되지 않았더라도
별도 due history를 저장하지 않는다.

즉 Month View에서 과거 DUE는:

```text
현재 nextDue가 그 날짜인 경우
```

에만 존재한다.

과거 due occurrence history를 새로 만들지 않는다.

---

# 50. Activity History는 모두 표시 가능

선택된 월에 존재하는 Activity는
해당 월 전체에서 marker로 보여준다.

---

# 51. Activity 중복

같은 Item이 같은 날짜에 Activity 여러 개를 가질 수 있다.

R4 multi-action 또는 반복 기록 가능.

Cell에서는 count 처리.

상세에서는 각각 표시 가능.

---

# 52. Activity Sorting

selected date 상세의 Activity는:

```text
최신 생성 순
```

또는 기존 History 정렬 정책 유지.

---

# 53. Due Sorting

Due item은:

```text
D-Day urgency
```

또는 Item name 순.

권장:

```text
DUE
→ UPCOMING
→ NORMAL
```

---

# 54. 같은 날짜 Due

같은 날짜에 여러 Item due 가능.

모두 표시.

---

# 55. 날짜 click behavior

Date click:

```text
selectedDate 변경
```

페이지 이동하지 않는다.

---

# 56. Item click behavior

selected date 상세의 Item row click:

```text
/items/[itemId]
```

---

# 57. Today button

Today 클릭:

```text
selectedMonth = current month
selectedDate = today
```

---

# 58. Month previous

이전 월 버튼:

```text
selectedMonth - 1 month
```

selectedDate 정책:

권장:

```text
선택 해제
```

또는 해당 월의 1일.

---

# 59. Month next

다음 월도 동일.

---

# 60. 날짜 계산

Month Grid 역시 date-only helper를 사용한다.

R6 cycle helper와 동일하게
timezone-sensitive JS local mutation에 의존하지 않는다.

---

# 61. Month Grid helper

권장 pure helper:

```text
buildMonthGrid(year, month)
```

출력:

```ts
{
  date: "2026-09-01",
  day: 1,
  inCurrentMonth: true,
  weekday: 2
}
```

---

# 62. Calendar weeks

한 달은:

```text
5주 또는 6주
```

일 수 있다.

Grid 높이가 달마다 급격히 깨지지 않도록 설계한다.

---

# 63. 권장 6-row fixed grid

MVP에서는:

```text
6주 × 7일
```

고정 grid도 가능.

장점:

Month 전환 시 layout shift 감소.

---

# 64. 5-row adaptive grid

adaptive도 가능하지만
HOME 전체 높이가 달마다 크게 바뀔 수 있다.

Codex 분석에서 현재 layout에 맞는 방식을 제안.

---

# 65. Sunday / Saturday

주말을 강한 빨강/파랑으로 칠하지 않는다.

필요하면 typography tone만 약간 구분.

---

# 66. 디자인 방향

R7은 기존 Soft Utility UI 유지.

* neutral background
* 1px line
* minimal shadow
* whitespace
* small radius
* readable numbers

---

# 67. 캘린더 카드 과도화 금지

각 날짜를:

```text
독립된 rounded shadow card
```

로 만들지 않는다.

Calendar 전체 하나의 구조 안에서 grid line 중심.

---

# 68. 모바일 우선

Month View는 모바일 360px에서도
7열이 보여야 한다.

따라서 날짜 cell 폭이 작다.

---

# 69. Cell typography

권장:

```text
날짜 숫자 12~14px
marker 4~6px
```

실제 디자인 시스템에 맞춰 조정.

---

# 70. 긴 Item 이름

Calendar Cell에는 Item 이름을 표시하지 않으므로
overflow 문제가 없다.

상세 list에서 ellipsis 가능.

---

# 71. Month label

예:

```text
2026년 9월
```

---

# 72. Locale

한국어 기준.

요일:

```text
일 월 화 수 목 금 토
```

---

# 73. Accessibility

날짜 button:

```text
aria-label="2026년 9월 15일"
```

marker가 있으면:

```text
기록 2개, 관리 예정 1개
```

등의 정보 포함 가능.

---

# 74. Selected state

날짜 버튼:

```text
aria-pressed
```

또는:

```text
aria-current="date"
```

적절히 사용.

---

# 75. Month navigation

이전/다음 버튼:

```text
aria-label="이전 달"
aria-label="다음 달"
```

---

# 76. Activity marker accessibility

marker 색만으로 의미를 전달하지 않는다.

screen reader label 또는 상세 count 제공.

---

# 77. Month View Empty Month

해당 월 Activity/Due가 하나도 없으면
Calendar는 그대로 표시한다.

아래 상세 영역:

```text
이 달에는 기록이나 관리 예정이 없어요.
```

정도 가능.

---

# 78. Selected Date Empty

선택한 날짜에 아무 것도 없으면:

```text
이날의 기록이나 관리 예정이 없어요.
```

---

# 79. Copy tone

마케팅 문구처럼 길게 쓰지 않는다.

간단하고 기능적인 문구 사용.

---

# 80. HOME status summary

Month View에서도 상단 status summary를 유지할지 여부는
구현 전 분석한다.

---

# 81. 권장 정책

List / Month 전환 위에 status summary가 이미 있다면
Month에서도 유지 가능.

단 Month View에서 status filter 기능까지 동일하게 연결할 필요는 없다.

---

# 82. View Switch 위치

권장:

```text
Status Summary
↓
[List | Month]
↓
View Content
```

또는:

```text
[List | Month]
↓
Status Summary
↓
View
```

현재 HomeDemo 구조를 최소 변경하는 방향.

---

# 83. URL state

R7 MVP에서 View를 URL query에 저장할 필요는 없다.

예:

```text
?view=month
```

필수 아님.

Local state로 충분.

---

# 84. 새 route 금지

다시 명시:

```text
/month
/calendar
```

추가하지 않는다.

---

# 85. Persistence

새로고침 후 Month View 상태를 저장하는 기능은 필수 아님.

기본 List로 돌아가도 된다.

---

# 86. Monthly View와 Query

Month View에서 Action Dock Query 사용 가능.

예:

```text
이불 언제 빨았지?
```

기존 R4 Query Result 사용.

Month View가 별도 Query UI를 만들지 않는다.

---

# 87. Monthly View와 Record

Month View에서:

```text
오늘 이불 빨았어
```

기록하면 Activity Store 갱신 후
현재 월 Calendar marker가 즉시 증가해야 한다.

---

# 88. Activity Save Sync

Record save 성공:

```text
Activity History
→ HOME List
→ Month marker
→ selected date detail
```

동일 Store에서 즉시 동기화.

---

# 89. Cycle Change Sync

Item Detail에서 cycle 수정:

```text
nextDue 변경
→ Month Due marker 이동
```

즉시 반영.

---

# 90. Tag Change Sync

Tag 변경:

selected date detail subtitle 즉시 반영.

Calendar marker 자체 변화 없음.

---

# 91. Note Change

Note는 Calendar cell에 표시하지 않는다.

selected date 상세에서도 기본적으로 표시하지 않아도 된다.

Detail에서 확인.

---

# 92. Item Rename

Item 이름 변경 후 Month 상세 row에도 즉시 반영.

---

# 93. Item Archive

ARCHIVED 처리 기능이 현재 있다면
archive된 순간 Month View에서 제거.

Activity History 자체 삭제 금지.

---

# 94. Activity 삭제/수정

R7에서 Activity 삭제 또는 수정 기능을 새로 만들지 않는다.

---

# 95. Due click

Due row를 클릭하면 Item Detail로 이동.

Due 자체를 "완료" 처리하는 버튼은 Month View에 추가하지 않는다.

완료 기록은 기존 Composer 흐름을 사용.

---

# 96. Calendar quick-complete 금지

날짜 cell에서:

```text
체크 버튼
완료 버튼
```

추가하지 않는다.

False Completion safety 유지.

---

# 97. Drag & Drop 금지

R7 MVP에서 Calendar Event drag/drop 금지.

---

# 98. 일정 생성 금지

Calendar 날짜 클릭으로 새 일정을 생성하지 않는다.

LASTLY는 캘린더 앱이 아니다.

---

# 99. External Calendar 연동 금지

Google Calendar / Apple Calendar sync는 R7 범위 아님.

---

# 100. Notification 연동

Month View가 Notification 상태를 직접 수정하지 않는다.

---

# 101. Activity count

Month Cell에서:

```text
ACTIVITY count
DUE count
```

계산 helper 가능.

---

# 102. Month event model

권장 derived 구조:

```ts
type MonthEvent = {
  date: string;
  type: "ACTIVITY" | "DUE";
  itemId: string;
  activityId?: string;
};
```

실제 canonical store에 저장하지 않는다.

Month View용 derived data다.

---

# 103. Derived Month Events

권장:

```text
buildMonthEvents(items, activities, selectedMonth)
```

pure function.

---

# 104. Activity events

Activity History에서:

```text
performedDate
```

기준으로 생성.

---

# 105. Due events

Item의:

```text
nextDue
```

가 selected month 안에 있으면 생성.

---

# 106. nextDue null

다음은 Due event 없음.

```text
NO_HISTORY
NO_CYCLE
```

---

# 107. archived

archived Item에서 due event 생성 금지.

Activity event 표시 여부는 정책 선택 가능하지만
R7 MVP 기본은 archived item 전체 제외를 권장.

---

# 108. 권장 archived 정책

Month View 기본:

```text
Archived Activity도 제외
```

Product active workspace 일관성 때문.

과거 archive 기록 조회는 후속.

---

# 109. Current Filter와 archived

List ALL과 동일하게:

```text
ARCHIVED 제외
```

---

# 110. Date detail model

선택 날짜 상세에서:

```ts
{
  activities: MonthEvent[];
  dues: MonthEvent[];
}
```

로 분리.

---

# 111. Sorting selected date Activity

권장:

```text
activity created order
```

또는 현재 history order 그대로.

---

# 112. Sorting selected date Due

권장:

```text
DUE
UPCOMING
NORMAL
```

같은 날짜라면 name secondary sort 가능.

---

# 113. Selected date heading

예:

```text
9월 15일 화요일
```

---

# 114. Relative label

필요하면:

```text
오늘
어제
내일
```

을 추가할 수 있지만 필수 아님.

---

# 115. 한 달 전체 요약

R7에서:

```text
이번 달 12번 기록했어요
```

같은 통계는 필수 아님.

---

# 116. Chart 금지

R7에서:

* bar chart
* pie chart
* heatmap

추가하지 않는다.

---

# 117. Heatmap 후순위

장기 리포트 단계에서 고려.

---

# 118. Month View 초기 focus

현재 날짜를 기본 selected.

예:

```text
2026-09-08
```

---

# 119. 다른 월 이동

다른 월로 이동 시:

```text
selectedDate = null
```

권장.

사용자가 날짜를 다시 선택.

---

# 120. 현재 월 복귀

Today 클릭 시 오늘 선택.

---

# 121. Month range calculation

UTC/local 혼선 없이:

```text
YYYY-MM
```

기준 pure date 계산.

---

# 122. Month Grid verification

필수 테스트:

* 2026-09
* 일요일 시작 월
* 토요일 시작 월
* 28일 2월
* 29일 2월
* 30일 월
* 31일 월

---

# 123. Leap year

2028년 2월 Grid:

```text
29일
```

정확히 포함.

---

# 124. Year boundary

2026년 12월:

다음 월 → 2027년 1월

2027년 1월:

이전 월 → 2026년 12월

PASS 필요.

---

# 125. Activity month filter

Activity:

```text
2026-08-31
```

은 9월 Month에 marker 없음.

---

# 126. Due month filter

nextDue:

```text
2026-10-01
```

은 9월 Month에 marker 없음.

---

# 127. Month boundary filler

Grid filler로 8월31일을 보여도
9월 event로 계산하면 안 된다.

---

# 128. Today timezone

오늘 계산은:

```text
Asia/Seoul
```

기준.

---

# 129. R6 date helper reuse

가능하면 R6에서 만든 date-only helper를 재사용한다.

Month View 전용으로 다른 date parsing 방식 만들지 않는다.

---

# 130. Activity Store

R4/R5/R6의 DemoActivityProvider를 그대로 사용.

별도 Calendar Store 만들지 않는다.

---

# 131. Derived state

Month events는:

```text
useMemo
또는 pure selector
```

가능.

canonical 저장 금지.

---

# 132. Performance

Demo Item 10개 규모에서는 성능 이슈가 없지만
render마다 불필요한 중첩 계산을 피한다.

---

# 133. Month event dedupe

Activity와 Due는 서로 다른 event이므로
같은 item/date라도 자동 dedupe하지 않는다.

---

# 134. Activity id

Activity event는 activityId를 유지하면
향후 detail 확장에 유리.

---

# 135. Due event id

Due는 실제 entity가 아니므로
derived key:

```text
due-${itemId}-${date}
```

형태 가능.

---

# 136. Design consistency

R3 Flat List 톤과 연결한다.

Calendar 밑 selected-date list 역시
과도한 card stack 대신:

```text
flat row + divider
```

권장.

---

# 137. Detail row

예:

```text
한 기록

이불 세탁
아이 이불 · 아빠 이불
──────────────────

관리 예정

정수기 필터               D-2
주방 정수기
──────────────────
```

---

# 138. Empty subtitle

Tag가 없으면 subtitle 생략.

Note 사용 금지.

---

# 139. D-Day

Due 상세에서 기존 `dDayLabel` 재사용.

---

# 140. Activity D-Day 금지

Activity row에 D-Day를 표시하지 않는다.

---

# 141. Activity date

selected date 자체가 이미 날짜이므로
row에 날짜 반복 표시 불필요.

---

# 142. Status icon

neutral icon 사용 가능.

과도한 illustration 금지.

---

# 143. 월 View의 시각적 위계

우선순위:

```text
월
→ 날짜
→ marker
→ 선택 날짜 상세
```

---

# 144. CTA hierarchy

Action Dock이 계속 가장 중요한 입력 CTA.

Calendar navigation보다 마이크/입력을 더 강하게 만들 수 있다.

---

# 145. Month View height

모바일에서 Calendar가 화면을 거의 전부 차지하지 않도록 한다.

selected date detail까지 첫 화면 또는 약간의 scroll로 접근 가능해야 한다.

---

# 146. 360px

7열 cell이 찌그러지지 않는지 반드시 검증.

---

# 147. 390px

기준 모바일.

---

# 148. 430px

넓은 모바일.

---

# 149. Desktop

desktop에서도 Calendar 폭을 무한 확장하지 않는다.

기존 app content max-width 유지.

---

# 150. Tablet

중앙 app shell 유지.

---

# 151. Month switch animation

R7 MVP에서 복잡한 slide transition 필수 아님.

간단한 opacity/position transition 가능.

---

# 152. Motion accessibility

prefers-reduced-motion 고려 가능.

필수 blocker 아님.

---

# 153. Skeleton

Demo Track에서는 loading skeleton 불필요.

---

# 154. Server API

R7 Month View를 위해 새 API 만들지 않는다.

현재 Demo Store 사용.

---

# 155. Supabase

금지.

---

# 156. Auth

금지.

---

# 157. Calendar DB

금지.

---

# 158. Recurrence DB

금지.

---

# 159. Push

금지.

---

# 160. R8 선행 금지

Item Detail 전체 redesign 또는 추가 기능을 R7에서 시작하지 않는다.

---

# 161. R7 Acceptance — View Switch

* [ ] HOME에 List / Month 전환
* [ ] 기본 List
* [ ] Month 별도 route 없음
* [ ] Action Dock 유지

---

# 162. R7 Acceptance — Grid

* [ ] 일~토 7열
* [ ] 현재 월 이동
* [ ] 이전/다음 월
* [ ] 오늘 표시
* [ ] selected date
* [ ] month boundary 정확

---

# 163. R7 Acceptance — Activity

* [ ] Activity History 기반
* [ ] performedDate 기준
* [ ] 미래 Activity 없음
* [ ] 현재 월 Activity marker
* [ ] selected date 상세

---

# 164. R7 Acceptance — Due

* [ ] R6 nextDue 재사용
* [ ] 별도 recurrence 계산 없음
* [ ] nextDue 1건만 표시
* [ ] NO_HISTORY due 없음
* [ ] NO_CYCLE due 없음
* [ ] ARCHIVED 제외

---

# 165. R7 Acceptance — Visual distinction

* [ ] Activity / Due 구분
* [ ] 색만으로 의미 전달하지 않음
* [ ] marker 과밀 방지
* [ ] +N 처리 가능

---

# 166. R7 Acceptance — Detail

* [ ] Activity / Due section 분리
* [ ] item click → detail
* [ ] tags subtitle
* [ ] note 미노출
* [ ] flat row

---

# 167. R7 Acceptance — Sync

* [ ] Record 후 Activity marker 즉시 갱신
* [ ] Cycle 변경 후 Due marker 즉시 이동
* [ ] Item rename 즉시 반영
* [ ] Tag 변경 즉시 반영

---

# 168. R7 Acceptance — Regression

* [ ] R1 IA 유지
* [ ] R2 filter 유지
* [ ] R3 flat list 유지
* [ ] R4 Composer 유지
* [ ] Voice 유지
* [ ] Query mutation 0
* [ ] False Completion 유지
* [ ] Multi Segment 유지
* [ ] Atomic Save 유지
* [ ] R5 Tag/Note 유지
* [ ] Matching precedence 유지
* [ ] R6 Cycle 유지
* [ ] Month clamp 유지
* [ ] `/record` 유지
* [ ] `/record?item=` 유지
* [ ] `/items` 유지
* [ ] `/items/[itemId]` 유지
* [ ] `/screens/*` 24 유지

---

# 169. Quality Gate

반드시:

```text
npm run typecheck
npm run lint
npm run build
```

PASS.

---

# 170. Responsive Gate

필수:

```text
360px
390px
430px
```

확인:

* 7-column grid
* month navigation
* marker
* selected state
* detail rows
* Action Dock
* horizontal overflow

---

# 171. Accessibility Gate

* [ ] 날짜 button
* [ ] 이전/다음 달 label
* [ ] selected state
* [ ] 오늘 state
* [ ] marker count screen reader 정보
* [ ] item row keyboard accessible

---

# 172. R7 구현 전 Codex 분석

이 문서를 저장했다고 R7을 바로 시작하지 않는다.

현재 HOME / Store / Activity / Cycle 구조를 분석한다.

---

# 173. 반드시 분석할 항목

1. 현재 HomeDemo 구조
2. R2 status summary 위치
3. R3 flat list 구조
4. Action Dock 위치
5. Month View switch를 넣을 가장 안전한 위치
6. 현재 Product Store items 구조
7. Activity History 접근 방식
8. Activity performedDate field
9. nextDue canonical/derived 위치
10. lifecycle field
11. ARCHIVED 판별
12. NO_HISTORY 처리
13. NO_CYCLE 처리
14. Item tags 접근
15. Month event derived helper 위치
16. Month grid helper 위치
17. R6 date helper 재사용 가능 여부
18. today Asia/Seoul 처리
19. current selected month state
20. selected date state
21. 6-row fixed vs adaptive grid
22. Activity/Due marker UI 전략
23. +N overflow 전략
24. selected date detail 구조
25. Activity/Due sorting
26. Item click routing
27. Record save 후 Month sync
28. Cycle edit 후 Due sync
29. Item edit 후 Month sync
30. Archived Item Month 처리
31. `/screens/*` 영향
32. 예상 변경 파일
33. R7 blocker
34. R7 착수 가능 여부

---

# 174. 정책 A — Grid Row

Codex는 구현 전 다음 중 하나를 제안한다.

```text
A. 6주 고정 grid
```

또는:

```text
B. 5/6주 adaptive grid
```

모바일 layout 안정성을 기준으로 근거 제시.

---

# 175. 정책 B — Status Summary

Month View에서도 HOME status summary를 유지할지 분석한다.

권장:

```text
유지
```

단 Month View의 날짜 event filtering에는
직접 적용하지 않아도 된다.

---

# 176. 정책 C — selectedDate

권장:

현재 월 진입:

```text
today
```

다른 월 이동:

```text
null
```

Today 버튼:

```text
today
```

Codex는 현재 UX 구조와 충돌 없는지 검증한다.

---

# 177. 정책 D — Archived Activity

R7 MVP 기본:

```text
Archived Item의 Activity/Due 모두 Month View에서 제외
```

다른 정책이 필요하면 근거 제시.

---

# 178. 분석 보고 형식

```text
06_MONTHLY_VIEW_SPEC 검증

1. Current Home structure
2. View switch 위치
3. Store / Activity source
4. Cycle nextDue source
5. Month event model
6. Grid calculation
7. 6-row vs adaptive 정책
8. Activity marker 전략
9. Due marker 전략
10. selected date 상세
11. status summary 정책
12. archived 정책
13. sync 전략
14. responsive 위험
15. accessibility
16. 예상 변경 파일
17. R7 시작 가능 여부

Status:
PASS / PARTIAL / BLOCKED
```

---

# 179. STOP RULE

이 문서를 읽었다고 R7을 자동 시작하지 않는다.

Codex는 분석 후 멈춘다.

사용자가 명시적으로:

```text
R7 진행해
```

라고 하기 전까지 코드 수정 금지.

R7 완료 후 다음 단계 자동 시작 금지.

---

# 180. R7 완료 보고 필수 항목

반드시 보고:

1. 변경 파일
2. List/Month switch
3. 기본 View
4. Month grid helper
5. current month
6. prev/next month
7. Today
8. selectedDate
9. Activity event derivation
10. Due event derivation
11. R6 nextDue 재사용
12. Activity/Due visual distinction
13. marker overflow
14. selected date Activity section
15. selected date Due section
16. Item routing
17. Tag subtitle
18. Note 미노출
19. Archived 제외
20. NO_HISTORY
21. NO_CYCLE
22. Record save Month sync
23. Cycle edit Due sync
24. Item rename sync
25. Tag edit sync
26. status summary 정책
27. Action Dock 유지
28. 별도 Calendar route 없음
29. recurrence expansion 없음
30. Activity History 구조 변경 없음
31. R4 regression
32. R5 regression
33. R6 regression
34. `/record`
35. `/record?item=`
36. `/items`
37. `/items/[itemId]`
38. `/screens/*` 24
39. typecheck
40. lint
41. build
42. 360/390/430
43. horizontal overflow
44. accessibility
45. git diff
46. unexpected changes
47. 다음 단계 NOT STARTED

최종 판정:

PASS
PARTIAL
BLOCKED

.
