# LASTLY — Home UI/UX Functional Specification

## 문서 목적

이 문서는 `docs/00_CHANGE_REQUEST.md`와 `docs/01_UPDATED_IA.md`에서 확정된 Rebaseline 방향을 실제 HOME 화면 UI/UX 구조로 구체화하기 위한 명세다.

이 문서는 **R2 완료 이후 HOME 화면의 UI/UX Source of Truth**로 사용한다.

기존 문서와 충돌하는 경우 우선순위는 다음과 같다.

1. `docs/00_CHANGE_REQUEST.md`
2. `docs/01_UPDATED_IA.md`
3. `docs/02_HOME_UI_UX_SPEC.md`
4. 기존 G0 Freeze 문서

---

# 1. HOME의 역할

HOME은 단순한 상태 요약 화면이 아니다.

사용자가 앱을 열었을 때 다음 행동을 가장 빠르게 수행할 수 있는 **Single Workspace**여야 한다.

- 지금 챙겨야 할 기억 확인
- 전체 관리 항목 확인
- 상태별 필터
- 리스트 탐색
- 월별 보기 진입
- 음성 입력
- 텍스트 입력
- 기록
- 조회
- 항목 상세 진입
- 설정 진입

HOME은 기능 홍보용 화면이 아니라 **실제 관리와 입력이 일어나는 화면**이다.

---

# 2. HOME 전체 정보 계층

권장 구조:

```text
LASTLY                         🔔 ⚙

[ ! 2 ]   [ ◷ 2 ]   [ ✓ 3 ]

[ 리스트 ] [ 월별 ]

전체 기억                     10

이불 세탁                       D+2
아이 이불 · 아빠 이불
────────────────────────────

정수기 필터                     D-3
주방 정수기
────────────────────────────

칫솔 교체                       D-10
아이 칫솔 · 엄마 칫솔
────────────────────────────

...

              🎙

     말해서 기록하거나 물어보세요

          [ 직접 입력 ]

          3. Header
3.1 필수 요소
LASTLY
알림 진입
설정 진입

기존 상단 우측의 /notification, /settings 진입 구조는 유지 가능하다.

3.2 삭제 대상

HOME에는 다음과 같은 감성/마케팅 문구를 표시하지 않는다.

오늘도 잘하고 있어요
기억을 정리하고 더 편한 오늘을 만들어요
작은 기록이 더 편한 일상을 만들어요
기록이 쌓일수록 더 편한 하루가...
기타 서비스 소개용 배너

HOME의 첫 화면은 관리 정보와 행동 진입이 우선이다.

4. Status Summary
4.1 상태

HOME 상단 상태는 다음 3개다.

DUE
UPCOMING
NORMAL

사용자 의미:

관리 필요
곧 관리
괜찮아요
4.2 R2 구현 유지

R2에서 구현된 다음 구조를 유지한다.

각 상태는 실제 <button>
aria-pressed
선택된 상태를 다시 누르면 ALL
ALL | DUE | UPCOMING | NORMAL
실제 count 연동
NO_HISTORY / NO_CYCLE은 ALL에 포함
ARCHIVED 제외

R3에서 이 기능을 깨지 않는다.

5. Status Summary 시각 규칙
5.1 기본 스타일

상태 버튼 3개는 하나의 그룹으로 인식되어야 한다.

권장:

┌────────┬────────┬────────┐
│   !    │   ◷    │   ✓    │
│   2    │   2    │   3    │
└────────┴────────┴────────┘

각 버튼은 독립적으로 클릭 가능해야 한다.

5.2 색상

강한 빨강/노랑/초록 원색을 사용하지 않는다.

권장:

DUE → pastel red
UPCOMING → pastel yellow
NORMAL → pastel green

아이콘은 중립색.

예:

--icon-line

또는 이에 준하는 dark sage / charcoal tone.

상태색 사용 가능 영역:

숫자
선택 배경
선택 border
D-Day

금지:

아이콘 전체를 빨강/노랑/초록으로 반복
row background 전체를 상태색으로 채움
상태색이 화면의 주된 시각 요소가 되는 구조
6. Status Summary 라벨

R2에서 선택됨 같은 보조 텍스트가 추가된 경우 접근성을 위해 유지 가능하다.

다만 시각적으로 지나치게 크게 강조하지 않는다.

우선순위:

아이콘
숫자
선택 상태
보조 라벨

상태 이름을 항상 크게 반복 표시할 필요는 없다.

7. HOME Section 구조 재정의

기존 HOME에 존재하는:

지금 챙길 기억
최근 저장한 기억

두 개의 독립적인 목록 구조는 R3에서 통합하는 것을 기본 방향으로 한다.

8. 지금 챙길 기억 섹션
기존 문제

R2 이후 Status Summary 버튼이 이미 DUE / UPCOMING / NORMAL 필터 역할을 한다.

따라서 별도로:

지금 챙길 기억

섹션을 유지하면서 DUE/UPCOMING 일부만 다시 보여주면 정보 구조가 중복된다.

변경

HOME의 메인 목록은 현재 Filter 결과 자체가 된다.

즉:

filter = ALL

→ 전체 Active Item

filter = DUE

→ 관리 필요 Item

filter = UPCOMING

→ 곧 관리 Item

filter = NORMAL

→ 괜찮은 Item

별도의 지금 챙길 기억 우선 목록은 제거한다.

9. 최근 저장한 기억 섹션
기존 문제

최근 저장 목록은 동일 Item이 위의 관리 목록에도 다시 나타날 수 있어 중복을 만든다.

R2에서 ALL 상태가 Active 10개 전체를 보여주므로 최근 저장한 기억까지 유지하면 한 HOME에서 동일 Item이 두 번 노출될 가능성이 높다.

변경

R3에서는 기존 최근 저장한 기억 섹션을 HOME 메인 영역에서 제거한다.

삭제 대상:

최근 저장한 기억 제목
최근순 label
recentMemoryOrder 기반 별도 목록
recentLabel 표시
별도 recent card container
향후

최근 기록 자체가 필요하다면:

Item Detail Activity History
Monthly View
Query Result
향후 별도 최근 활동 영역

에서 제공할 수 있다.

MVP HOME에서는 중복 노출보다 단일 리스트 구조를 우선한다.

10. HOME 목록 제목

Filter에 따라 제목을 변경할 수 있다.

권장 예:

ALL
전체 기억
DUE
관리 필요
UPCOMING
곧 관리
NORMAL
괜찮은 기억

오른쪽에는 현재 표시 개수를 제공할 수 있다.

예:

전체 기억                         10
11. List View 기본 구조

R3에서 기존 DemoItemCard 기반 카드형 목록을 flat row 형태로 변경한다.

각 row는 다음 정보를 가진다.

Item Name
Tag Summary
D-Day

예:

이불 세탁                       D+2
아이 이불 · 아빠 이불
────────────────────────────

정수기 필터                     D-3
주방 정수기
────────────────────────────
12. Row 전체 클릭

각 Item row 전체가 Item Detail 진입점이다.

예:

/items/[itemId]

Touch target은 최소 44px 이상 확보한다.

13. Card 스타일 제거

R3에서 제거하거나 최소화할 것:

큰 rounded rectangle 반복
강한 shadow
상태마다 다른 card fill
두꺼운 border 반복
card 안에 또 card
과도한 chevron 반복

권장:

flat surface
border-bottom
spacing
typography hierarchy
subtle D-Day
14. Row Typography

권장 계층:

Item Name
16px
semibold
foreground
Tag Summary
13~14px
muted
single line
ellipsis 가능
D-Day
14~15px
semibold
tabular number 권장
상태색 제한적 사용
15. D-Day 규칙

HOME에서는 D-Day가 시간 정보의 우선 표현이다.

표현:

D-3
D-Day
D+2

정의:

D-3 = 관리일까지 3일 남음
D-Day = 오늘 관리 예정
D+2 = 관리 예정일이 2일 지남
16. D-Day 색상

권장:

overdue / DUE → pastel red
upcoming → pastel yellow/amber
normal → pastel green

NO_HISTORY / NO_CYCLE은 상태색을 억지로 사용하지 않는다.

중립색 사용 가능.

17. 마지막 N일 전 제거

HOME에서는 다음 문구를 기본적으로 사용하지 않는다.

마지막 32일 전

또는:

최근 8일 전

또는 기존 recentLabel

이유:

HOME의 목적은 지난 경과일보다 다음 관리 시점을 빠르게 보여주는 것이기 때문이다.

실제 수행일/History는 Item Detail에서 확인한다.

18. Tag Summary

R5 전까지 실제 데이터 모델을 변경하지 않는다.

현재 memo가 사실상 tag summary처럼 사용되고 있는 fixture가 존재한다면 R3에서는 표시 용도로만 임시 재사용 가능하다.

예:

memo = "아이 이불 · 아빠 이불"

R3에서는:

아이 이불 · 아빠 이불

형태로 row subtitle에 표시 가능.

중요

R3에서 memo를 tags[]로 실제 migration하지 않는다.

실제 구조 변경은 R5에서 한다.

R3는 UI 구조 변경만 수행한다.

19. NO_HISTORY 표시

NO_HISTORY Item은 ALL 상태에서 반드시 접근 가능해야 한다.

예:

냉장고 정리
기록 없음                         —

또는:

냉장고 정리
아직 기록 없음

D-Day가 없으면 — 또는 상태에 적합한 neutral 표시 사용.

20. NO_CYCLE 표시

NO_CYCLE Item도 ALL 상태에서 반드시 접근 가능해야 한다.

예:

신발 세탁
아이 신발 · 엄마 신발             주기 없음

또는 D-Day 대신:

주기 없음

표시 가능.

21. NORMAL 표시

NORMAL이라고 해서 row 전체를 초록으로 칠하지 않는다.

예:

칫솔 교체                       D-10
아이 칫솔 · 엄마 칫솔

D-Day만 pastel green 계열 사용 가능.

22. Empty State

Filter 결과가 0개일 경우 빈 화면이 아니라 간단한 상태를 보여준다.

예:

DUE 0
지금 관리가 필요한 기억이 없어요.
UPCOMING 0
곧 관리할 기억이 없어요.
NORMAL 0
여유 있는 기억이 없어요.
ALL 0
아직 기록한 기억이 없어요.

말해서 기록하거나 직접 입력해보세요.
23. Empty State 금지

금지:

큰 일러스트
3D 이미지
긴 마케팅 카피
화면 대부분을 차지하는 empty hero

단순한 text + Action Dock 유지.

24. List / Monthly Toggle 위치

HOME에는 최종적으로:

[ 리스트 ] [ 월별 ]

View Toggle이 필요하다.

하지만 실제 Monthly View 구현은 R7 범위다.

25. R3에서 View Toggle 처리

R3에서는 다음 중 하나만 허용한다.

Option A — 자리만 확보

View Toggle UI shell은 보여주되:

list 활성
month disabled 또는 non-interactive
Option B — 아직 표시하지 않음

R7에서 실제 기능과 함께 추가

권장

R3에서는 View Toggle을 실제 기능처럼 보이게 만들지 않는다.

사용자가 누를 수 있는데 동작하지 않는 UI는 금지한다.

따라서:

기능이 없으면 숨김
또는 disabled 상태가 명확해야 함

가 원칙이다.

26. Action Dock

R1에서 추가된 HOME Action Dock 구조를 유지한다.

현재:

중앙 음성 진입
직접 입력 진입
/record 연결

이 구조는 R3에서 기능 변경하지 않는다.

27. Action Dock 시각 방향

권장:

              🎙

     말해서 기록하거나 물어보세요

          [ 직접 입력 ]

현재 /record 링크 구조를 유지해도 된다.

R4에서 Unified Voice/Query 실제 기능을 HOME에 연결한다.

28. Action Dock 금지

R3에서 하지 않을 것:

SpeechRecognition HOME 직접 연결
QUERY flow 구현
Record state machine 이동
/record redirect
마이크 자동 시작

이 모두 R4 범위다.

29. 전체 항목 링크

현재 HOME에 /items로 이동하는 전체 항목 링크가 존재한다.

R3에서는 HOME ALL 목록 자체가 전체 Active Item을 보여주기 때문에 이 링크의 기능적 필요성이 크게 줄어든다.

R3 권장

HOME ALL이 실제 Active 전체를 표시하고 NO_HISTORY / NO_CYCLE까지 접근 가능하다는 것이 검증되면:

전체 항목 링크는 제거 가능하다.

단:

/items route 자체는 삭제하지 않는다.
/items redirect도 아직 하지 않는다.
호환 route로 유지한다.
30. Item Row 정렬

ALL 상태의 기본 정렬은 다음 우선순위를 권장한다.

DUE
→ UPCOMING
→ NORMAL
→ NO_CYCLE
→ NO_HISTORY

같은 상태 안에서는 기존 fixture order 또는 기존 business sort를 유지할 수 있다.

31. Filter 상태에서 정렬

DUE:

overdue가 심한 항목 우선 가능

UPCOMING:

due date가 가까운 순

NORMAL:

due date가 가까운 순 또는 기존 순서

R3에서 새 도메인 sorting rule을 만들 필요는 없다.

기존 데이터가 제공하는 순서를 유지하는 것이 안전하다.

32. Search

R3에서 별도 search input을 추가하지 않는다.

자연어 조회는 R4에서 Unified Input으로 처리한다.

필요 시 기존 /items 검색은 호환 route에 유지한다.

33. Alias

R3에서 Alias UI를 추가하지 않는다.

Alias는 Matching domain 기능으로 유지.

R5에서 Tag와 Alias의 관계를 실제 UI/Data Model 기준으로 확정한다.

34. Note

R3에서 자유 note 편집 기능을 추가하지 않는다.

현재 memo가 row subtitle 역할을 하고 있다면 표시만 유지 가능.

실제 note 분리는 R5.

35. Lifecycle 상태별 Row 처리
DUE
이불 세탁                         D+2
아이 이불 · 아빠 이불
UPCOMING
정수기 필터                       D-3
주방 정수기
NORMAL
칫솔 교체                         D-10
아이 칫솔 · 엄마 칫솔
NO_CYCLE
신발 세탁                     주기 없음
아이 신발 · 엄마 신발
NO_HISTORY
냉장고 정리                   기록 없음
36. Icon 정책

List Row에서 의미 없는 Item Icon을 반복하지 않는다.

필요한 경우:

chevron
status
action

등 기능적 의미가 있는 icon만 사용.

상태별 빨/노/초 아이콘 반복 금지.

37. Chevron

Row 전체가 클릭 가능하다면 chevron은 optional이다.

사용할 경우:

muted
작게
일관된 위치

과도한 강조 금지.

38. Spacing

권장:

HOME horizontal padding: 기존 20px 수준 유지 가능
row vertical padding: 14~18px
section gap: 20~28px
header와 status summary 사이 여백 충분히 유지

밀집된 관리자 페이지처럼 보이지 않게 한다.

39. Border

권장:

1px

또는 hairline divider.

강한 gray border 금지.

기존 --divider / --line token 재사용 권장.

40. Shadow

HOME List Row에는 shadow를 사용하지 않는 것을 기본으로 한다.

Action Dock 또는 floating UI에는 제한적으로 shadow 사용 가능.

41. Surface

전체 배경:

warm off-white
pale sage

Row:

별도 카드 배경 없이 page surface 위 flat 가능
필요한 경우 white surface 사용
42. 색상 기준

기존 디자인 토큰을 우선 재사용한다.

기본 방향:

background: warm off-white / pale sage
foreground: charcoal
muted: gray sage
icon: neutral dark sage
line: pale gray-green

상태:

DUE: pastel coral
UPCOMING: pastel amber
NORMAL: pastel sage
43. Product 느낌

HOME은 다음 느낌을 목표로 한다.

조용함
정돈됨
신뢰감
기억이 쌓이는 느낌
생활 관리 도구이지만 투두앱 같지 않음
44. 금지 스타일
3D object
glossy UI
강한 gradient
과도한 illustration
Hero art
gamification
emoji 남발
traffic-light처럼 강한 빨노초
card dashboard template 느낌
45. Responsive

필수 검증:

360px
390px
430px

확인:

horizontal overflow 없음
D-Day 잘림 없음
subtitle ellipsis 정상
status summary 3칸 정상
Action Dock overlap 없음
safe bottom 정상
46. Accessibility

Status Summary:

button
aria-pressed

Item Row:

전체 clickable
keyboard accessible
focus ring

Icon Button:

aria-label

D-Day:

색상만으로 상태 전달 금지

NO_HISTORY / NO_CYCLE:

텍스트로 상태 설명
47. R3 범위

R3 — Flat List UI에서 구현할 것:

지금 챙길 기억 별도 priority section 제거
최근 저장한 기억 별도 section 제거
현재 filter 결과를 하나의 main list로 통합
HOME list heading을 filter에 따라 변경
전체 표시 count 제공 가능
DemoItemCard를 flat row 구조로 변경
row에 item name 표시
row subtitle에 현재 memo를 임시 tag summary처럼 표시 가능
D-Day 우선 표시
recentLabel 제거
HOME의 "마지막 N일 전" 계열 문구 제거
NO_HISTORY 표시
NO_CYCLE 표시
ALL에서 Active 전체 접근 유지
ARCHIVED 제외 유지
neutral icon 정책 유지
R2 상태 필터 동작 보존
Action Dock 보존
48. R3에서 하지 않을 것

R3에서는 다음을 구현하지 않는다.

tags[] 실제 데이터 모델
note 실제 데이터 모델
alias 구조 변경
Parser tag candidate
cycle schema 변경
day/week/month 주기
Monthly View 실제 기능
Unified Record / Query
SpeechRecognition HOME 연결
Query Result
Item Detail 전체 개편
/record redirect
/items redirect
/screens/* 변경
49. /items route

R3 완료 후에도 /items route는 유지한다.

단, HOME ALL이 전체 Active 접근 기능을 완전히 대체했다면 Product Navigation에서는 직접 노출하지 않아도 된다.

Redirect 여부는 후속 단계에서 결정한다.

50. /record route

R3에서는 그대로 유지한다.

Action Dock 링크도 기존 /record로 유지 가능.

R4 전까지 Record 기능 migration 금지.

51. /items/[itemId]

Row click destination으로 계속 사용한다.

Canonical detail route 유지.

52. Fixture

/screens/* 24개는 R3에서 수정하지 않는다.

Product List UI 변경을 Fixture List UI에 자동 전파하지 않는다.

53. Existing Domain Logic

다음은 변경 금지:

Lifecycle 계산
Record Candidate
Parser
Matching
Mock AI
Activity History
False Completion
D3 Voice

R3는 HOME presentation layer 변경이 중심이다.

54. R3 Acceptance Criteria
Layout
 지금 챙길 기억 독립 section 제거
 최근 저장한 기억 독립 section 제거
 HOME에 main list 하나만 존재
 filter에 따라 main list가 변경
List Row
 card style 제거 또는 충분히 flat화
 item name 표시
 subtitle 표시
 D-Day 표시
 row 전체 clickable
 divider 사용
 shadow 반복 없음
Status
 R2 filter 유지
 count 유지
 aria-pressed 유지
 neutral icon 유지
Special Status
 NO_HISTORY가 ALL에서 표시
 NO_CYCLE이 ALL에서 표시
 ARCHIVED 제외
Cleanup
 recentLabel 제거
 HOME의 "마지막 N일 전" 제거
 중복 Item 노출 제거
Route
 /record 유지
 /items 유지
 /items/[itemId] 유지
Regression
 Action Dock 유지
 D2 유지
 D3 유지
 Parser 유지
 Matching 유지
 Activity History 유지
 /screens/* 24개 유지
Quality
 360px PASS
 390px PASS
 430px PASS
 typecheck PASS
 lint PASS
 build PASS
55. Codex 검증 지시

이 문서를 추가한 뒤 R3를 바로 시작하지 않는다.

먼저 현재 R2 구현과 본 문서를 비교 분석한다.

확인 항목:
        현재 지금 챙길 기억 구조와 새 명세 충돌
        현재 최근 저장한 기억 구조와 새 명세 충돌
        ALL에서 Item 중복 노출 여부
        DemoItemCard 변경 영향
        current memo를 R3 subtitle로 임시 사용 가능한지
        recentLabel 제거 영향
        NO_HISTORY 표시 방법
        NO_CYCLE 표시 방법
        D-Day 현재 구현 재사용 가능 여부
        Status Filter 회귀 위험
        Action Dock 영향
        /record 영향
        /items 영향
        /items/[itemId] 영향
        /screens/* 영향
        D2/D3/Parser/Matching/Activity History 영향
        R3 착수 가능 여부
56. 검증 보고 형식
02_HOME_UI_UX_SPEC 검증

1. 현재 HOME 구조 충돌
2. 중복 Item 구조
3. Flat Row 전환 영향
4. D-Day / memo / recentLabel 영향
5. NO_HISTORY / NO_CYCLE 처리
6. R2 Status Filter 보존
7. Route / Fixture / D2 / D3 영향
8. R3 시작 가능 여부

Status:
PASS / PARTIAL / BLOCKED
57. STOP RULE

Codex는 검증 보고 후 멈춘다.

사용자가 명시적으로:

R3 진행해

라고 하기 전까지 코드 수정 금지.

R3 완료 후에도 R4를 자동 시작하지 않는다.

각 Task 종료 후 반드시:

PASS
PARTIAL
BLOCKED

중 하나로 보고하고 사용자 승인을 기다린다.