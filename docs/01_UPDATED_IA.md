# LASTLY — Updated Information Architecture

## 문서 목적

이 문서는 `docs/00_CHANGE_REQUEST.md`의 Rebaseline 결정을 실제 화면 구조와 사용자 이동 흐름에 반영하기 위한 IA(Information Architecture) 명세다.

이 문서는 **R1 완료 이후 기준의 Product IA Source of Truth**로 사용한다.

기존 문서와 충돌하는 경우 우선순위는 다음과 같다.

1. `docs/00_CHANGE_REQUEST.md`
2. `docs/01_UPDATED_IA.md`
3. 기존 G0 Freeze 문서

---

# 1. IA 핵심 원칙

LASTLY의 MVP는 더 이상 다음 구조를 사용하지 않는다.

- 홈
- 기록하기
- 전체관리

하단 3메뉴 기반 구조는 제거한다.

새로운 구조는 **홈 중심 Single Workspace**를 기본으로 한다.

사용자가 앱을 열었을 때 홈에서 바로 다음을 수행할 수 있어야 한다.

- 현재 관리 상태 확인
- 전체 항목 접근
- 상태별 필터
- 리스트 보기
- 월별 보기
- 음성 입력
- 텍스트 입력
- 기록
- 조회
- 항목 상세 진입
- 설정 진입

---

# 2. 최상위 Product IA

```text
LASTLY
│
├─ HOME
│  ├─ Header
│  ├─ Status Summary
│  ├─ Status Filter
│  ├─ List / Monthly Toggle
│  ├─ All Active Items Access
│  ├─ Unified Input
│  │  ├─ Voice
│  │  └─ Text
│  ├─ Record Flow
│  ├─ Query Flow
│  └─ Item Detail Entry
│
├─ ITEM DETAIL
│  ├─ Item Name
│  ├─ Tags
│  ├─ Note
│  ├─ D-Day
│  ├─ Cycle
│  ├─ Activity History
│  ├─ Mark Done Today
│  ├─ Edit
│  └─ Delete / Archive
│
└─ SETTINGS
   ├─ Notification
   ├─ Device Permission
   ├─ App Information
   └─ Future Account Settings
3. HOME
3.1 역할

HOME은 단순 Dashboard가 아니다.

HOME은 다음 역할을 동시에 수행하는 MVP의 핵심 작업 공간이다.

관리 상태 확인
전체 목록 탐색
기록
조회
월별 탐색
항목 상세 진입
3.2 Header

필수 요소:

LASTLY 로고/텍스트
알림 진입
설정 진입

기존 우측 상단 알림/설정 구조는 유지 가능하다.

금지:

불필요한 환영 문구
긴 설명 문구
감성 배너
광고성 Hero 영역
상태 확인보다 먼저 보이는 마케팅 카피
4. Status Summary
4.1 상태

상단 3개 상태는 다음과 같다.

DUE
UPCOMING
NORMAL

사용자 노출 이름:

관리 필요
곧 관리
괜찮아요
4.2 기능

각 상태 요약은 정보 표시가 아니라 필터 버튼이다.

예:

┌────────┬────────┬────────┐
│   !    │   ◷    │   ✓    │
│   2    │   3    │   5    │
└────────┴────────┴────────┘

동작:

DUE 클릭 → DUE만 표시
UPCOMING 클릭 → UPCOMING만 표시
NORMAL 클릭 → NORMAL만 표시
현재 선택 상태를 다시 클릭하거나 ALL 상태 선택 → 전체 Active 항목 표시
4.3 ALL 범위

ALL은 단순히 DUE + UPCOMING + NORMAL 합계가 아니다.

ALL에는 다음 Active 상태를 모두 포함해야 한다.

DUE
UPCOMING
NORMAL
NO_HISTORY
NO_CYCLE

ARCHIVED는 ALL Active에서 제외한다.

5. Status Summary 시각 규칙

상태 컬러는 유지하되 화면 전체에 반복하지 않는다.

권장:

DUE → Pastel Red
UPCOMING → Pastel Yellow
NORMAL → Pastel Green

원칙:

아이콘은 기본 중립색
숫자 또는 선택 배경에 상태색 제한적 사용
색상만으로 상태 전달 금지
선택된 필터는 border/background/aria-pressed 등으로 명확히 표현
강한 빨강/노랑/초록 원색 금지
6. List / Monthly View

HOME 본문은 두 가지 View를 제공한다.

[ 리스트 ] [ 월별 ]

기본값:

리스트
6.1 List View

List View는 Active Item 전체 또는 선택된 상태를 row 형태로 보여준다.

각 row 기본 구성:

Item name
tags summary
D-Day
optional status cue

예:

이불 세탁                         D+2
아이 이불 · 아빠 이불
────────────────────────────

정수기 필터                       D-3
주방 정수기
────────────────────────────

칫솔 교체                         D-10
아이 칫솔 · 엄마 칫솔

금지:

과도한 카드 반복
강한 shadow
큰 rounded card 반복
홈에서 "마지막 N일 전" 표시
아이콘마다 빨/노/초 컬러 반복
의미 없는 decorative icon 반복
6.2 Monthly View

Monthly View는 일반 일정 캘린더가 아니다.

표현 대상:

Activity History의 실제 수행 기록
관리 예정일

날짜 선택 시:

해당 날짜의 수행 기록
해당 날짜의 관리 예정

을 Bottom Sheet 또는 이에 준하는 UI로 보여준다.

Generic To-do 일정 기능은 추가하지 않는다.

7. Unified Input

HOME 하단에는 Action Dock을 둔다.

7.1 목적

사용자는 "기록 화면"과 "검색 화면"을 구분하지 않는다.

하나의 입력 진입점에서 Intent를 판별한다.

7.2 구성

권장 구조:

              🎙

     말해서 기록하거나 물어보세요

          [ 직접 입력 ]

또는 기능적으로 동등한 구조.

필수:

중앙 음성 버튼 1개
직접 입력 진입
record/query 공통 진입
7.3 금지
기록용 마이크와 조회용 마이크 분리
검색 전용 별도 화면
마이크 버튼 여러 개
사용자가 먼저 기능 유형을 선택해야 하는 UX
음성 입력 전용 탭
fake transcript
8. Intent Routing

예:

오늘 이불 빨았어

→ COMPLETED
→ Record Flow

이불 언제 빨았지?

→ QUERY
→ Query Flow

별도 검색 화면은 만들지 않는다.

9. Record Flow
HOME
→ Voice/Text
→ Parser
→ COMPLETED
→ Item Matching
→ Confirmation
→ User Edit
→ Commit
→ Activity 생성
→ HOME 갱신

필수 안전 규칙:

자동 저장 금지
저장 전 사용자 확인
미래 완료일 금지
NOT_COMPLETED 저장 금지
PLANNED 저장 금지
UNCERTAIN 자동 저장 금지
최대 5 semantic actions
5개 초과 시 partial save 금지
multi-save atomic
10. Query Flow
HOME
→ Voice/Text
→ Parser
→ QUERY
→ Item Matching
→ Activity History 조회
→ Query Result

Query 결과에서는 Activity를 생성하지 않는다.

가능한 결과:

Exact
이불 세탁은 9월 1일에 기록했어요.
Similar / Ambiguous
비슷한 기록이 있어요.

→ 후보 선택

Not Found
관련 기록을 찾지 못했어요.

→ 기록하기 CTA 제공 가능

11. Query Result 책임

Query Result는 Parser 응답 자체에 Activity History 데이터를 억지로 포함시키지 않는다.

권장 구조:

Parser
→ QUERY intent
→ Matching Layer
→ Activity History Read
→ Query Result UI

Parser 책임:

intent
action
date
scope
optional candidate information

Parser가 item_id를 직접 확정하지 않는다.

12. ITEM DETAIL

Canonical Item Detail route는 유지한다.

권장:

/items/[itemId]

ITEM DETAIL 포함 요소:

Item name
Tags
Note
D-Day
Cycle
Activity History
오늘 했어요
수정
삭제 또는 Archive
13. Activity History

Activity History는 계속 Source of Truth다.

다음 값은 History 기반으로 파생해야 한다.

lastDoneOn
nextDueOn
D-Day
logCount
average interval
monthly performed markers

동일 Item 기록 시 기존 lastDoneOn을 단순 덮어쓰는 구조로 변경하면 안 된다.

올바른 구조:

Management Item
 ├─ Activity #1
 ├─ Activity #2
 ├─ Activity #3
 └─ Activity #4
14. Tags / Note

ITEM DETAIL에서는 tags와 note를 분리한다.

예:

이불 세탁

태그
[아이 이불] [아빠 이불]

메모
겨울 이불까지 같이 세탁함

정의:

Alias = 같은 Item의 다른 표현
Tag   = Item 내부의 세부 대상
Note  = 자유 메모

세 개를 혼용하지 않는다.

15. Cycle

관리 주기는 Item Detail 또는 저장 확인 흐름에서 수정 가능하다.

MVP 기준:

none
day
week
month

예:

3일마다
2주마다
1달마다
매주 토요일

주기는 사용자가 최종 결정한다.

AI 자동 확정 금지.

16. SETTINGS

설정은 HOME 우측 상단에서 진입한다.

기존 route 유지 가능:

/settings

포함:

Notification
Device Permission
App Information
Future account settings

MVP에서 하단 Navigation에 Settings를 추가하지 않는다.

17. Notification

알림 진입이 이미 상단에 존재하는 경우 유지 가능하다.

기존:

/notification

route를 유지할 수 있다.

단, Notification은 HOME의 새로운 최상위 Navigation tab으로 추가하지 않는다.

18. Existing Route Compatibility

R1 이후에도 기존 Product route는 즉시 삭제하지 않는다.

18.1 /record

현재는 유지한다.

목적:

기존 deep link 보존
기존 D3 Voice 기능 보존
R4 이전 회귀 방지

향후 R4 완료 후:

HOME Unified Input으로 기능 통합
/record는 redirect 또는 compatibility route로 전환 가능

권장 redirect 예:

/record
→ /?composer=open

단:

R4 완료 전 redirect 금지.

18.2 /record?item=...

기존 Item 기반 record 진입이 존재한다면 R4 이전까지 보존한다.

향후 HOME Unified Input 통합 후에는 Item context를 HOME composer state로 전달해야 한다.

기능 손실 없이 migration해야 한다.

18.3 /items

현재는 유지한다.

목적:

NO_HISTORY / NO_CYCLE 포함 전체 접근 보존
R2/R3 완료 전 기능 손실 방지

향후 HOME ALL List가 완성되고 검증된 후:

/items
→ /?view=list&filter=all

형태의 redirect 가능.

단:

R3 완료 전 삭제 또는 redirect 금지.

18.4 /items/[itemId]

Canonical 상세 route로 유지한다.

삭제하거나 HOME 내부 modal 전용으로 바꾸지 않는다.

19. /screens/* Fixture 정책

기존 24개 /screens/*는 Product IA와 별개인 Regression Asset이다.

원칙:

삭제 금지
임의 리디자인 금지
Product Navigation 변경을 fixture Shell에 자동 전파 금지
기존 Screen ID 유지
기존 fixture 상태 유지
R9에서 회귀 검증

Product UI와 Fixture UI는 목적이 다르므로 분리해서 관리한다.

20. Navigation 정책
제거

Product 하단:

홈
기록하기
전체관리

3메뉴 Navigation

유지
HOME
/items/[itemId]
/settings
/notification
호환 /record
호환 /items
21. Back Navigation

ITEM DETAIL:

기본 Back → 이전 화면
Browser history 없으면 HOME

Record compatibility route:

Back → HOME 또는 이전 화면

Settings:

Back → HOME 또는 이전 화면

권장:

history 있음
→ router.back()

history 없음
→ /
22. Mobile Layout

우선 대상:

360px
390px
430px

최대 Product 폭:

기존 480px 수준 유지 가능

Touch target:

최소 44x44px

Action Dock:

safe-bottom 고려
본문과 겹치지 않도록 padding 확보
fixed 사용 시 content bottom padding 필수
23. Accessibility

필수:

Status Summary는 실제 button semantics
선택 상태는 aria-pressed 또는 동등한 의미 제공
Color-only status 금지
Icon button은 aria-label 필수
Month day button은 날짜 label 제공
Action Dock mic button은 listening state 전달
Keyboard navigation 지원
Focus Ring 유지
24. 상태 필터 규칙

상태 필터 state:

type HomeFilter =
  | "ALL"
  | "DUE"
  | "UPCOMING"
  | "NORMAL";

ALL 결과:

DUE
UPCOMING
NORMAL
NO_HISTORY
NO_CYCLE

ARCHIVED 제외.

24.1 Count 규칙

상단 3개 Summary count는 각각:

DUE count
UPCOMING count
NORMAL count

와 정확히 일치해야 한다.

NO_HISTORY / NO_CYCLE은 상단 3개 숫자에 포함하지 않아도 된다.

하지만 ALL List에서는 반드시 접근 가능해야 한다.

25. Filter Interaction

예:

초기:

filter = ALL

DUE 클릭:

filter = DUE

같은 DUE를 다시 클릭:

filter = ALL

또는 별도의 "전체" 진입을 둘 수 있다.

단, UI가 불필요하게 복잡해지면 별도 ALL 버튼은 필수가 아니다.

26. View 상태
type HomeView = "list" | "month";

기본:

list

View 선택은 local state로 시작 가능하다.

향후:

localStorage
사용자 preference

로 저장 가능.

27. Filter와 View 조합

Filter와 View는 독립적이다.

예:

filter = DUE
view = list

→ DUE list

filter = DUE
view = month

→ DUE에 해당하는 관리 예정/기록만 강조 가능

단, 월별 보기의 정확한 필터 적용 정책은 R7 구현 시 확정 가능하다.

최소 요구:

ALL Monthly View 제공
날짜별 Activity 표시
날짜별 Due 표시
28. Action Dock 상태

Action Dock은 HOME의 고정된 주요 진입점이다.

상태 예:

idle
listening
transcribing
interpreting
result
error

R1에서는 구조만 존재한다.

R4에서 실제 Unified Input state machine과 연결한다.

29. R1 현재 구현과의 관계

R1에서 이미 구현된 것:

Product 하단 3메뉴 제거
HOME Action Dock 구조 추가
/record 유지
/items 유지
/items/[itemId] 유지
설정 상단 진입 유지
/screens/* Fixture 보존

따라서 본 문서는 R1 결과를 되돌리지 않는다.

30. 제거하지 말아야 할 기존 기능

IA 변경 중 아래를 손상시키지 않는다.

Mock AI Adapter
/api/ai/parse
Parser validation
Golden fixtures
False Completion guard
Demo Matching
Alias
Activity History
D3 Browser SpeechRecognition
transcript edit
voice fallback
24 /screens/* fixtures
31. 화면 책임 정리
HOME

책임:

현재 관리 상태
전체 Active Item 접근
필터
리스트
월별
기록 진입
조회 진입
Item Detail 진입

HOME에서 하지 않는 것:

전체 Activity 상세 편집
복잡한 Item 설정
장문의 note 편집
복잡한 cycle 세부 설정
ITEM DETAIL

책임:

Item 단위 관리
tags
note
cycle
Activity History
오늘 했어요
edit/delete
SETTINGS

책임:

기기 및 앱 설정
알림 관련 사용자 설정
32. R2 진입 조건

R2 — Clickable Status Filter는 다음 조건에서 시작한다.

R1 PASS
Product 하단 3메뉴 제거 확인
HOME Action Dock 존재
/record 보존
/items 보존
/items/[itemId] 보존
/screens/* 24개 보존
typecheck PASS
lint PASS
build PASS

현재 이 조건이 모두 충족된 경우에만 R2를 시작한다.

33. R2 구현 범위

R2에서 구현할 것:

Status Summary를 button으로 전환
ALL / DUE / UPCOMING / NORMAL filter
실제 count 연동
선택 상태 표시
neutral icon color
pastel status cue
NO_HISTORY / NO_CYCLE를 ALL에서 보존
선택된 filter에 따라 HOME list 데이터 변경
34. R2에서 하지 않을 것

R2에서는 다음 작업을 하지 않는다.

List card → row 전체 리디자인
Unified Voice / Query 기능
Tag / Note 데이터 변경
Cycle schema 변경
Monthly View
Item Detail 전체 개편
/record redirect
/items redirect
/screens/* 수정

이 작업들은 후속 R3~R8 범위다.

35. R3 이후 예상 책임
R3

Flat List UI

card → divider row
tags 표시
D-Day 우선
최근 N일 전 제거
불필요한 최근 기억 블록 정리
R4

Unified Record / Query

HOME에서 voice/text 입력
COMPLETED / QUERY 분기
Query Result
기존 /record 호환 처리
R5

Tag / Note

tags[]
note
alias와 분리
item matching 연계
R6

Cycle

none
day
week
month
interval
weekdays optional
R7

Monthly View

calendar
Activity marker
Due marker
date sheet
R8

Item Detail

tags
note
cycle
history
edit/delete
R9

Regression

False Completion
QUERY no-save
future date
atomic
fixtures
responsive
typecheck/lint/build
36. Acceptance Criteria
IA
 HOME이 Product의 핵심 작업 공간이다.
 Product 하단 3메뉴가 없다.
 HOME에서 전체 Active Item 접근 경로가 있다.
 HOME에서 Action Dock 진입점이 있다.
 Settings는 상단에서 접근 가능하다.
 Notification 접근이 유지된다.
Route
 /record 유지
 /items 유지
 /items/[itemId] 유지
 /settings 유지
 /notification 유지
Data Access
 DUE 접근 가능
 UPCOMING 접근 가능
 NORMAL 접근 가능
 NO_HISTORY 접근 가능
 NO_CYCLE 접근 가능
Regression
 D2 Mock AI 보존
 D3 Voice 보존
 Parser 보존
 Matching 보존
 Activity History 보존
 /screens/* 24개 보존
 typecheck PASS
 lint PASS
 build PASS
37. Codex 검증 지시

이 문서를 프로젝트에 추가한 뒤 Codex는 즉시 R2를 시작하지 않는다.

먼저 현재 R1 결과와 본 IA 문서를 비교한다.

검증 내용:

R1 구현과 01_UPDATED_IA.md 충돌 여부
Product 하단 Navigation 제거 상태
HOME Action Dock 상태
/record 보존 상태
/items 보존 상태
/items/[itemId] 보존 상태
전체 Active Item 접근 상태
NO_HISTORY / NO_CYCLE 접근 상태
/screens/* 24개 보존 상태
R2 시작 가능 여부

보고 형식:

01_UPDATED_IA 검증

1. R1 구현과 새 IA 충돌
2. Route 보존 상태
3. HOME 책임 충족 상태
4. 전체 Active Item 접근 상태
5. Fixture / D2 / D3 영향
6. R2 시작 가능 여부

Status:
PASS / PARTIAL / BLOCKED
38. STOP RULE

본 문서를 읽은 것만으로 R2를 자동 시작하지 않는다.

Codex는 검증 보고 후 멈춘다.

사용자가 명시적으로:

R2 진행해

라고 하기 전까지 코드 수정 금지.

R2 완료 후에도 R3를 자동 시작하지 않는다.

각 단계마다:

PASS
PARTIAL
BLOCKED

중 하나로 보고하고 사용자 승인을 기다린다.