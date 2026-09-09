# LASTLY — Cycle Functional Specification

## 문서 목적

이 문서는 LASTLY의 관리 주기 모델을 기존 단일 `cycleDays` 중심 구조에서
사용자가 이해하기 쉬운 다음 구조로 확장하기 위한 명세다.

- none
- day
- week
- month

이 문서는 **R6 — Cycle 구현의 Source of Truth**다.

기존 문서와 충돌하는 경우 우선순위는 다음과 같다.

1. `docs/00_CHANGE_REQUEST.md`
2. `docs/01_UPDATED_IA.md`
3. `docs/02_HOME_UI_UX_SPEC.md`
4. `docs/03_VOICE_QUERY_RECORD_SPEC.md`
5. `docs/04_TAG_NOTE_SPEC.md`
6. `docs/05_CYCLE_SPEC.md`
7. 기존 G0 Freeze 문서

---

# 1. 핵심 목표

사용자는 관리 항목의 반복 주기를 다음 형태로 설정할 수 있어야 한다.

```text
주기 없음
N일마다
N주마다
N개월마다

필요한 경우 주 단위에서는 특정 요일을 추가로 지정할 수 있다.

예:

2주마다
매주 토요일
2주마다 월요일 · 목요일
2. 기존 문제

현재 Demo 모델은 다음 구조를 중심으로 한다.

cycleDays: number | null
cycleLabel: string

이 구조는 다음 표현에는 적합하다.

14일마다
30일마다

하지만 다음 의미를 정확히 표현하지 못한다.

2주마다
매주 토요일
1개월마다
매월 말일

특히:

30일마다

와:

1개월마다

는 같은 의미가 아니다.

따라서 R6에서는 단순 숫자 day interval과
calendar-based week/month를 구분해야 한다.

3. 새 Cycle 개념 모델

권장 타입:

type Cycle =
  | null
  | {
      unit: "day" | "week" | "month";
      interval: number;
      weekdays?: number[];
    };
4. NONE

주기가 없는 Item:

cycle: null

상태:

NO_CYCLE

표시:

주기 없음
5. DAY

예:

3일마다
14일마다
30일마다

구조:

{
  unit: "day",
  interval: 14
}

DAY에서는 weekdays를 사용하지 않는다.

6. WEEK

기본 구조:

{
  unit: "week",
  interval: 2
}

표시:

2주마다
7. WEEK + weekdays

특정 요일을 추가로 지정할 수 있다.

예:

{
  unit: "week",
  interval: 1,
  weekdays: [6]
}

표시:

매주 토요일

또는:

{
  unit: "week",
  interval: 2,
  weekdays: [1, 4]
}

표시:

2주마다 월요일 · 목요일
8. weekday 정의

요일 값은 다음으로 통일한다.

0 = 일요일
1 = 월요일
2 = 화요일
3 = 수요일
4 = 목요일
5 = 금요일
6 = 토요일

JS Date.getDay()와 동일한 convention 사용을 권장한다.

9. MONTH

예:

1개월마다
2개월마다
3개월마다

구조:

{
  unit: "month",
  interval: 1
}
10. MONTH는 day interval이 아니다

중요:

1개월마다

를 내부적으로:

30일마다

로 변환하지 않는다.

Calendar Month 기준으로 계산한다.

예:

1월 31일 + 1개월

은 단순 +30일 계산이 아니다.

11. Cycle 값 제약

권장:

interval >= 1

Hard Limit 권장:

day: 1 ~ 365
week: 1 ~ 52
month: 1 ~ 24

MVP에서 너무 큰 값을 허용하지 않는다.

12. 기존 cycleDays Migration

기존 Demo fixture는 R6에서 명시적으로 migration한다.

원칙:

기존 숫자의 의미를 임의로 month로 바꾸지 않는다.

예:

cycleDays = 14

→

{
  unit: "day",
  interval: 14
}
13. 기존 30일도 day 유지

기존:

30일마다

는:

{
  unit: "day",
  interval: 30
}

으로 migration한다.

자동으로:

1개월마다

로 바꾸지 않는다.

14. 사용자 변경 이후

사용자가 직접:

1개월마다

를 선택했을 때만:

{
  unit: "month",
  interval: 1
}

로 저장한다.

15. 기존 cycleLabel

R6 이후 cycleLabel은 canonical state가 아니다.

canonical:

cycle

표시용:

formatCycle(cycle)

등의 derived function으로 생성한다.

16. 기존 cycleDays

R6 이후 Product canonical state에서는 사용을 종료한다.

다만:

Fixture compatibility
Legacy Screen
regression

때문에 임시 field 유지가 필요하면
compatibility 용도로만 둘 수 있다.

17. Source of Truth

Cycle Source of Truth:

item.cycle

D-Day / next due 계산은 cycle에서 파생한다.

18. Next Due 기준

기본 기준일은 최근 Activity 수행일이다.

예:

마지막 수행일:
9월 1일

주기:
14일마다

→ 다음 관리일:

9월 15일
19. History가 없는 경우

Activity History가 없는 Item은:

NO_HISTORY

주기가 있어도 마지막 수행일이 없기 때문에
nextDue를 확정하지 않는다.

20. NO_HISTORY와 NO_CYCLE 차이
NO_HISTORY
= 주기는 있을 수 있지만 수행 기록이 없음

NO_CYCLE
= 수행 기록은 있을 수 있지만 주기가 없음

두 상태를 혼동하지 않는다.

21. DAY 계산

예:

last = 2026-09-01
cycle = 14일

→

nextDue = 2026-09-15
22. WEEK 기본 계산

weekdays가 없는 경우:

last = 2026-09-01
cycle = 2주마다

→

nextDue = 2026-09-15

즉:

interval * 7 days
23. WEEK + weekday 계산

예:

last = 2026-09-01 화요일
cycle = 매주 토요일

→ nextDue:

2026-09-05 토요일
24. 복수 weekday

예:

cycle = 매주 월요일 · 목요일

최근 수행:

월요일

→ 다음:

목요일

최근 수행:

목요일

→ 다음:

다음 주 월요일
25. interval > 1 + weekday

예:

2주마다 월요일 · 목요일

이 경우 의미는:

활성 주기가 2주 간격
해당 활성 주 내 지정 요일

로 정의한다.

단, R6 구현 전 현재 구조에서 이 semantics가 너무 복잡하면
MVP에서는 interval > 1 + multiple weekdays 조합을 제한할 수 있다.

26. R6 MVP 권장 제한

안전한 MVP 옵션:

허용
N주마다
매주 특정 요일
매주 복수 요일
후순위
2주마다 월/목
3주마다 화/금

즉 복잡 recurrence engine까지 확대하지 않는다.

27. 권장 MVP WEEK 정책

R6에서는 다음만 필수로 해도 된다.

1. N주마다
2. 매주 특정 요일
3. 매주 복수 요일

interval > 1과 weekdays를 동시에 사용하는 조합은
후순위로 둘 수 있다.

Codex는 구현 전 현재 구조 기준으로
어느 범위가 가장 안전한지 보고해야 한다.

28. MONTH 계산

예:

last = 2026-09-10
cycle = 1개월마다

→

nextDue = 2026-10-10
29. 월말 규칙

중요.

예:

last = 2026-01-31
cycle = 1개월마다

2월에는 31일이 없다.

R6 정책:

해당 월의 마지막 날로 clamp한다.

→

2026-02-28

윤년:

2028-02-29
30. Clamp 이후 Anchor

중요:

1월 31일
→ 2월 28일

다음 달 계산에서 28일을 새 anchor로 사용하면:

3월 28일

이 되어 원래 의미가 깨진다.

따라서 MONTH recurrence는
원래 수행일의 day-of-month 의미를 유지할 수 있어야 한다.

31. R6 MVP Month Anchor

MVP에서는 Activity의 최근 실제 수행일을 새로운 기준으로 잡는다.

즉 사용자가 실제로 2월 28일에 수행했다면
그 수행일을 기준으로 다음 due를 계산할 수 있다.

그러나 단순 preview 계산에서
1월 31일 → 2월 28일 → 3월 28일로 drift시키지 않도록 주의한다.

32. 권장 Month helper

별도 date helper에서:

addCalendarMonths(date, interval)

을 사용한다.

단순 milliseconds 또는 +30일 금지.

33. D-Day

기존 표현 유지:

D-3
D-Day
D+2

Cycle 구조만 바뀌고 D-Day UI 개념은 유지한다.

34. Lifecycle

기존 lifecycle:

ARCHIVED
NO_HISTORY
NO_CYCLE
NORMAL
UPCOMING
DUE

유지.

35. Lifecycle 계산

기본:

cycle = null
→ NO_CYCLE

history 없음
→ NO_HISTORY

nextDue 계산 가능
→ NORMAL / UPCOMING / DUE
36. 우선순위

NO_HISTORY와 NO_CYCLE이 동시에 가능한 경우
정책을 명확히 한다.

권장:

ARCHIVED
→ NO_HISTORY
→ NO_CYCLE
→ lifecycle

즉 수행 History가 없으면 먼저 NO_HISTORY.

37. UPCOMING Window

현재 기존 계산 로직을 가능한 한 유지한다.

예:

upcomingWindow =
max(1, min(5, ceil(cycleDays * 0.2)))

하지만 month/week 구조에서는 단순 cycleDays가 없다.

38. R6 UPCOMING 정책

가능한 방법:

cycle을 days equivalent로 환산해
upcoming window 계산에만 사용.

예:

day
→ interval

week
→ interval * 7

month
→ 실제 nextDue - lastPerformed days
39. Month Upcoming

Month는 28~31일로 변할 수 있으므로
실제 계산된 interval days를 사용한다.

예:

lastPerformed
→ nextDue

의 실제 일수 차이를 기준으로
upcoming window 계산.

40. Cycle Label

표시 함수 예:

null
→ 주기 없음

day 14
→ 14일마다

week 2
→ 2주마다

week 1 + [6]
→ 매주 토요일

week 1 + [1,4]
→ 매주 월요일 · 목요일

month 1
→ 매월

month 2
→ 2개월마다
41. "1개월마다" vs "매월"

UI copy는 둘 중 하나로 통일한다.

권장:

매월

또는:

1개월마다

둘 다 섞지 않는다.

R6에서 현재 디자인 톤에 맞춰 하나로 확정.

42. Cycle Edit UX

Item Detail에서 기존 숫자 하나 입력하는:

30 [일마다]

구조를 변경한다.

43. 권장 Cycle UI
관리 주기

[ 주기 없음 ]
[ 일 ]
[ 주 ]
[ 월 ]

선택 후:

일
[ 14 ] 일마다
주
[ 2 ] 주마다
월
[ 1 ] 개월마다
44. WEEK 요일 UI

week unit 선택 시:

요일 지정
[월] [화] [수] [목] [금] [토] [일]

선택 가능.

45. 요일 optional

weekday 선택 없이:

2주마다

가능.

weekday 선택 시:

매주 토요일

등으로 표현.

46. Cycle None

주기 없음 선택 시:

cycle = null

적용.

47. 사용자 최종 결정

AI가 cycle을 제안할 수는 있어도
사용자 동의 없이 자동 변경 금지.

R6 MVP에서는 AI Cycle Suggestion이 필수 아님.

48. R4 Record Confirmation과 Cycle

R4 Confirmation에 기존 cycle 관련 proposal이 없거나 최소 상태라면
R6에서 cycle edit를 억지로 Record Flow에 넣지 않아도 된다.

R6 핵심은:

Item metadata cycle
+
next due
+
D-Day

이다.

49. R5 Tag/Note 영향 없음

Cycle 변경은:

tags
note
alias

를 수정하지 않는다.

50. Activity History 영향 없음

Cycle 변경은 과거 Activity를 수정하면 안 된다.

예:

기존:

8월 1일
8월 15일
9월 1일

History 그대로.

Cycle만:

14일마다
→ 매월

변경 가능.

51. Cycle 변경 후 nextDue

Cycle 변경 즉시:

nextDue
D-Day
lifecycle

재계산.

52. Cycle 변경 후 HOME

HOME의:

상태 count
item D-Day
filter 결과

가 즉시 갱신되어야 한다.

53. Cycle 변경 예

기존:

이불 세탁
lastPerformed = 9월 1일
cycle = 14일

→ nextDue = 9월 15일

사용자가:

1개월마다

로 변경.

→ nextDue:

10월 1일

HOME 상태 즉시 갱신.

54. Cycle 제거 예

기존:

cycle = 14일

사용자:

주기 없음

→

status = NO_CYCLE
dDayLabel = 주기 없음
nextDue = null

History는 유지.

55. Cycle 추가 예

기존:

NO_CYCLE
lastPerformed = 9월 1일

사용자:

30일마다

→ nextDue 계산
→ lifecycle NORMAL/UPCOMING/DUE 재진입.

56. History 없는 Item에 Cycle 추가

기존:

NO_HISTORY
history=[]

cycle 추가해도:

NO_HISTORY

유지.

nextDue 없음.

57. Demo Store

R4/R5에서 사용하는 DemoActivityProvider를 재사용한다.

권장 Store API:

updateItemCycle(itemId, cycle)

또는:

updateItemMetadata({
  ...
  cycle
})

현재 architecture에 맞게 결정.

58. Immutable Update

기존 규칙 유지.

Fixture 직접 mutation 금지.

59. Derived Fields

현재 DemoItem에:

cycleLabel
dDayLabel
dueLabel
nextDueDateLabel
status

같은 derived field가 있다면,
R6에서는 canonical cycle 변경 후
일관되게 재계산해야 한다.

60. Canonical vs Derived

권장:

Canonical:

cycle
history

Derived:

cycleLabel
lastPerformed
nextDue
dDay
status
dueLabel
61. Derived State 중복 위험

가능하면 Store에 여러 derived value를
각각 따로 수동 수정하지 않는다.

공통 helper:

deriveLifecycle(...)

같은 함수로 계산한다.

62. 기존 deriveTrackedItem

R4에서 deriveTrackedItem() 같은 함수가 있다면
R6에서 확장/공통화 가능하다.

복사 구현하지 않는다.

63. Date Helper

권장 분리:

addDays
addWeeks
addCalendarMonths
getNextWeekday
calculateNextDue
calculateLifecycle
formatCycle

실제 파일 구조는 코드베이스에 맞게 결정.

64. Timezone

기존 기준 유지:

Asia/Seoul

날짜 계산에서 UTC 변환 때문에 하루가 밀리지 않도록 주의한다.

65. Date-only

Cycle 계산은 시간 없는 local date 기준이다.

예:

2026-09-01
66. DST

초기 서비스 기준 Asia/Seoul은 DST가 없지만
date-only 계산을 사용해 timezone side effect를 줄인다.

67. Notification 영향

Notification은 nextDue에 의존할 수 있다.

R6에서 Cycle 계산을 바꾸면 Notification preview와
향후 scheduler에 영향이 있다.

68. Notification R6 범위

현재 Demo Notification UI가 nextDue/status를 표시한다면
새 derived state를 사용하도록 연결한다.

실제 Push scheduler 구현은 하지 않는다.

69. Notification 금지

R6에서:

Push API
실제 scheduler
Notification Service Worker

를 새로 구현하지 않는다.

70. HOME

HOME에서 Cycle Label 자체를 기본적으로 표시하지 않는다.

R3 방향 유지:

Item Name
Tags
D-Day

Cycle 상세는 Item Detail.

71. /items

기존 카드에 Cycle Label이 표시된다면
새 formatCycle 결과를 사용할 수 있다.

하지만 /items 전체 리디자인은 하지 않는다.

72. Item Detail

R6에서 가장 중요한 UI 변경 영역이다.

기존:

관리 주기
30일마다

편집 panel을:

주기 없음 / 일 / 주 / 월

형태로 확장한다.

73. Item Detail 최소 구성
관리 주기
매월 >

다음 관리일
10월 1일

또는 기존 구조와 동등.

74. 월/주/일 UI 과도화 금지

Calendar recurrence builder처럼 복잡하게 만들지 않는다.

MVP는 직관적인 설정이 우선.

75. Year Unit

R6에서:

year

추가하지 않는다.

필요하면 month interval 12로 표현 가능하지만
UI에서 12개월마다 사용 여부는 후속.

76. Custom cron 금지

금지:

매월 첫 번째 월요일
평일만
격주 특정 요일 복합
마지막 영업일
cron expression

MVP 범위를 넘는다.

77. Monthly View와 Cycle

R7 Monthly View는 R6의:

nextDue

를 읽어서 예정 marker를 표시한다.

따라서 R6 nextDue 계산이 안정되어야 R7로 갈 수 있다.

78. R7 선행 금지

R6에서 Calendar UI를 만들지 않는다.

79. Parser Cycle Candidate

R6에서 Parser가 cycle candidate를 제안하는 기능은 필수 아님.

예:

두 달마다 필터 갈아

를 Parser가 cycle로 해석하는 기능은 후순위 가능.

80. R6 Parser 원칙

기존 R4/R5 Parser Contract를 깨지 않는다.

Cycle 구조 때문에 Parser intent/action/tag contract를 수정하지 않는다.

81. Mock AI

Cycle 관련 Mock fixture 추가는 필수가 아니다.

단 기존 completed/query/tag 테스트가 회귀하지 않아야 한다.

82. Backward Compatibility

기존 Demo Item에 cycleDays, cycleLabel이 남아 있다면
R6 migration 동안 compatibility를 신중히 처리한다.

83. 권장 Migration 전략
cycle 추가
기존 fixture를 명시적으로 cycle로 변환
Product 계산 로직을 cycle 기준으로 전환
UI를 formatCycle(cycle) 사용
기존 cycleDays/cycleLabel 참조 검색
Product 참조 제거
Fixture 호환 필요 시 legacy field만 임시 유지
84. cycleDays 자동 삭제 금지

/screens/* 또는 fixture에서 사용 중인지 확인 전
타입에서 바로 제거하지 않는다.

85. Data Migration 예

기존:

{
  cycleDays: 14,
  cycleLabel: "14일마다"
}

변경:

{
  cycle: {
    unit: "day",
    interval: 14
  }
}
86. None Migration

기존:

cycleDays: null

→

cycle: null
87. R6 핵심 테스트 — Day
lastPerformed:
2026-09-01

cycle:
14일마다

Expected:

nextDue:
2026-09-15
88. Day Overdue

오늘:

2026-09-20

nextDue:

2026-09-15

Expected:

D+5
DUE
89. Week Test
last:
2026-09-01

cycle:
2주마다

Expected:

2026-09-15
90. Weekly Saturday
last:
2026-09-01

cycle:
매주 토요일

Expected:

2026-09-05
91. Weekly Multiple
cycle:
매주 월요일 · 목요일

최근 월요일 수행:

Expected:

다음 목요일

최근 목요일 수행:

Expected:

다음 월요일
92. Month Test
last:
2026-09-10

cycle:
매월

Expected:

2026-10-10
93. Month End Test
last:
2026-01-31

cycle:
매월

Expected:

2026-02-28
94. Leap Year
last:
2028-01-31

cycle:
매월

Expected:

2028-02-29
95. Cycle Removal Test

기존 cycle 있음.

주기 없음 선택.

Expected:

cycle = null
status = NO_CYCLE
history unchanged
96. Cycle Add Test

기존:

NO_CYCLE
history 있음

14일마다 추가.

Expected:

nextDue 계산
D-Day 계산
lifecycle 재계산
97. NO_HISTORY Test

history 없음.

cycle 설정.

Expected:

NO_HISTORY
nextDue 없음
98. Store Sync Test

Item Detail에서 Cycle 수정 후:

HOME D-Day 즉시 변경
HOME count 즉시 변경 가능
/items cycle label 반영
Detail next due 반영

새로고침 없는 동일 Demo Session 기준.

99. History Immutability

Cycle 변경 전:

history count = X

Cycle 변경 후:

history count = X

반드시 동일.

100. Tag/Note Immutability

Cycle 변경 전후:

tags 동일
note 동일
101. Query Regression

다음 계속 PASS:

이불 세탁 언제 했지?
이불 빨래 언제 했지?
아빠 이불 언제 빨았지?

Activity mutation 0.

102. Record Regression

다음 계속 PASS:

오늘 이불 빨았어
오늘 아빠 이불 빨았어

Confirmation 이후만 저장.

103. False Completion Regression
오늘 아빠 이불 안 빨았어

저장 없음.

104. Multi Segment Regression

기존 3-action save:

PASS 유지.

Atomic update 유지.

105. Exact Name / Alias / Tag Matching

R5 Final Gate에서 확정한 순서 유지:

Exact Item Name
→ Exact Alias
→ Exact Tag
→ Note
→ Fuzzy

Cycle 변경 과정에서 Matching 코드를 건드리지 않는다.

106. Fixture

/screens/* 24개 유지.

Fixture용 legacy cycle 표현이 있다면
Product와 분리해 보존한다.

107. Production DB

R6에서 Supabase migration을 실행하지 않는다.

108. 향후 DB 개념

미래 DB는 개념적으로 다음을 지원해야 한다.

예:

cycle_unit
cycle_interval
cycle_weekdays

또는 JSON 구조.

하지만 R6 Demo 구현에서 production schema를 확정하지 않는다.

109. Legacy cycle_days 문서 충돌

기존 DB 명세의:

cycle_days
별도 cycle_type 금지

규칙은 새 Change Request와 충돌한다.

새 Rebaseline 문서가 우선한다.

단 Production DB 명세 수정은 Phase 2에서 수행.

110. R6 구현 범위

R6에서 구현할 것:

Cycle canonical model
existing fixture migration
formatCycle
nextDue calculation
day
week
month
optional weekly weekdays
month-end clamp
lifecycle recalculation
D-Day recalculation
Item Detail Cycle UI
Product Store cycle update
HOME sync
/items sync
Notification Demo sync if affected
legacy field compatibility
regression tests
111. R6에서 하지 않을 것
Monthly Calendar
Calendar marker
Activity tag snapshot
Auth
Supabase
DB migration
Push scheduler
complex recurrence
cron
year unit
AI automatic cycle decision
R7
R8 redesign
112. R6 Acceptance — Model
 cycle canonical
 none/day/week/month 지원
 interval >=1
 weekdays optional
 legacy cycleDays Product canonical 사용 종료
113. R6 Acceptance — Day
 N일마다
 nextDue 정확
 D-Day 정확
114. R6 Acceptance — Week
 N주마다
 매주 특정 요일
 요일 여러 개 가능 여부 정책 명확
 unsupported 복합 조합은 UI에서 막거나 명확히 제한
115. R6 Acceptance — Month
 N개월마다
 +30일 방식 아님
 월말 clamp
 leap year
116. R6 Acceptance — State
 NO_CYCLE
 NO_HISTORY
 NORMAL
 UPCOMING
 DUE
 ARCHIVED

회귀 없음.

117. R6 Acceptance — Store
 immutable cycle update
 History 변경 없음
 Tags 변경 없음
 Note 변경 없음
 HOME 즉시 sync
 Detail 즉시 sync
 /items 즉시 sync
118. R6 Acceptance — Regression
 R1 유지
 R2 Filter 유지
 R3 Flat List 유지
 R4 Composer 유지
 R5 Tags/Note 유지
 Query no mutation
 False Completion 유지
 Matching precedence 유지
 Multi Segment 유지
 Atomic Save 유지
 /record 유지
 /record?item= 유지
 /items 유지
 /items/[itemId] 유지
 /screens/* 24 유지
119. Quality Gate

반드시:

npm run typecheck
npm run lint
npm run build

PASS.

120. Responsive

확인:

360px
390px
430px

특히:

Cycle selector
interval input
weekday chips
bottom sheet
mobile keyboard
long cycle label
horizontal overflow
121. Accessibility

Cycle unit buttons:

button semantics
selected state
aria-pressed 가능

Weekday:

button
aria-pressed

Interval input:

visible label

주기 없음:

명확한 선택 상태
122. R6 구현 전 Codex 분석

이 문서를 저장했다고 바로 R6를 시작하지 않는다.

먼저 현재 코드의 Cycle 사용처를 전부 분석한다.

123. 반드시 분석할 항목
cycleDays 정의 위치
cycleLabel 정의 위치
모든 fixture cycle 값
DemoActivityProvider의 cycle 계산
deriveTrackedItem 구조
HOME의 cycle 직접/간접 의존
/items cycle 표시
Item Detail cycle 표시/편집
Notification cycle 의존
D-Day 계산 위치
lifecycle 계산 위치
upcoming window 계산 위치
nextDueDateLabel 생성 위치
History 없는 Item 처리
NO_CYCLE 처리
/screens/* cycle 의존
legacy cycleDays를 즉시 제거 가능한지
Cycle 모델 도입 시 Type 영향
day/week/month 계산 helper 위치
monthly clamp 구현 전략
weekly weekday 구현 전략
interval >1 + weekdays MVP 지원 여부
timezone/date-only 위험
R5 Tag/Note 영향
R4 Record save 후 cycle recalculation 영향
Notification 영향
예상 변경 파일
R6 blocker
R6 착수 가능 여부
124. 특히 결정할 것

Codex는 구현 전에 다음을 명확히 제안해야 한다.

A. R6 MVP에서
   interval > 1 + weekdays
   조합까지 지원할 것인가

또는:

B. MVP에서는
   N주마다
   또는
   매주 요일 지정
   두 형태만 허용할 것인가

안전성과 복잡도를 근거로 결정한다.

125. Month Anchor 결정

Codex는 현재 데이터 구조에서:

1월 31일 → 2월 28일

후 다음 due가 어떻게 계산되는지
drift 위험을 분석해야 한다.

단순 Date.setMonth() 사용 시
브라우저 overflow 동작도 확인한다.

126. Legacy Fixture 정책

Product는 새 Cycle model로 전환하되
Fixture 24개가 legacy cycleDays에 의존한다면
adapter 또는 compatibility field 사용.

Fixture를 대량 수정하지 않는다.

127. 분석 보고 형식
05_CYCLE_SPEC 검증

1. Current cycleDays/cycleLabel 구조
2. Demo fixture cycle 분포
3. Store calculation
4. Lifecycle / D-Day 계산
5. Item Detail 영향
6. /items / Notification 영향
7. Fixture 영향
8. Legacy migration 전략
9. Day 계산 전략
10. Week 계산 전략
11. Weekday 범위 결정
12. Month 계산 및 month-end 전략
13. Upcoming window 전략
14. Timezone 위험
15. 예상 변경 파일
16. R6 시작 가능 여부

Status:
PASS / PARTIAL / BLOCKED
128. STOP RULE

이 문서를 읽었다고 R6를 자동 시작하지 않는다.

Codex는 분석 후 멈춘다.

사용자가 명시적으로:

R6 진행해

라고 하기 전까지 코드 수정 금지.

R6 완료 후 R7 자동 시작 금지.

129. R6 완료 보고 필수 항목

반드시 보고:

변경 파일
Cycle type
legacy cycleDays 처리
fixture migration
formatCycle
Day 계산
Week 계산
weekday 정책
Month 계산
month-end clamp
leap year
nextDue
D-Day
lifecycle
upcoming window
Store update
Item Detail UI
HOME sync
/items sync
Notification 영향
History unchanged
Tags unchanged
Note unchanged
R4 Record regression
R5 Query/Tag regression
Matching precedence
Multi Segment
Atomic Save
/record
/record?item=
/items
/items/[itemId]
/screens/* 24
typecheck
lint
build
360/390/430
git diff
unexpected changes
R7 NOT STARTED

최종 판정:

PASS
PARTIAL
BLOCKED