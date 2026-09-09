# LASTLY — Global Visual Polish Specification

## 문서 목적

이 문서는 R1~R8에서 구현된 LASTLY Product 기능을 그대로 유지한 상태에서
전체 앱의 시각 체계, 정보 위계, 인터랙션 일관성을 정리하기 위한 명세다.

이번 단계의 목적은 새로운 기능을 추가하는 것이 아니다.

핵심 목표는:

```text
기능은 그대로
구조는 그대로
데이터 의미는 그대로
디자인만 전체적으로 통일
````

이다.

이 문서는 **Global Visual Polish의 Source of Truth**다.

기존 기능 명세와 충돌하는 경우 기능 명세가 우선한다.

우선순위:

1. `docs/00_CHANGE_REQUEST.md`
2. `docs/01_UPDATED_IA.md`
3. `docs/02_HOME_UI_UX_SPEC.md`
4. `docs/03_VOICE_QUERY_RECORD_SPEC.md`
5. `docs/04_TAG_NOTE_SPEC.md`
6. `docs/05_CYCLE_SPEC.md`
7. `docs/06_MONTHLY_VIEW_SPEC.md`
8. `docs/07_ITEM_DETAIL_SPEC.md`
9. `docs/08_GLOBAL_VISUAL_POLISH_SPEC.md`

---

# 1. 가장 중요한 원칙

Global Visual Polish에서 절대 변경하면 안 되는 것:

* IA
* Route
* Store 구조
* Parser
* Matching
* Activity History
* Cycle Engine
* Month Event Engine
* Query / Record Flow
* False Completion 보호
* Multi Segment
* Atomic Save
* Tag / Note 의미
* Lifecycle 의미

이번 단계는 **Visual / Interaction Layer**다.

---

# 2. 완료 기준

완성된 LASTLY는 다음 인상을 가져야 한다.

```text
생활관리 앱
+
AI 비서
+
기록 도구
```

하지만 다음처럼 보이면 안 된다.

```text
전형적인 Todo 앱
일정 캘린더 앱
건강 앱
습관 트래커
대시보드 SaaS
카드가 잔뜩 쌓인 AI 템플릿
```

---

# 3. Design Keyword

핵심 디자인 키워드:

```text
Soft
Quiet
Utility
Personal
Reliable
Warm
Structured
```

---

# 4. 시각적 방향

LASTLY의 UI는:

* 부드럽지만 유아적이지 않음
* 친근하지만 장난스럽지 않음
* 따뜻하지만 베이지 일색이 아님
* 정돈됐지만 SaaS처럼 차갑지 않음
* AI 서비스지만 AI gradient 남발하지 않음

---

# 5. 기존 문제

현재 Product에는 이전 단계에서 남은 다음 흔적이 존재할 수 있다.

* rounded card 반복
* shadow card 반복
* 큰 icon tile
* 서로 다른 radius
* 서로 다른 button height
* 서로 다른 spacing
* component마다 다른 heading 크기
* pill 남발
* 상태별 색상 과다
* UI 밀도 불균형
* `/items`와 HOME 스타일 차이
* Composer와 Product Shell 스타일 차이
* Month View와 List View 스타일 차이

이번 단계에서 전체적으로 정리한다.

---

# 6. Design System 중심 정리

가능하면 각 Component에서 임의 Tailwind 값을 계속 추가하지 않는다.

다음 공통 규칙을 정한다.

```text
Color
Typography
Spacing
Radius
Border
Shadow
Button
Icon
Surface
Motion
```

---

# 7. Color Palette

기존 방향을 유지한다.

Base:

```text
Background Ivory
#F7F6F1
```

Primary Text:

```text
#24312D
```

Secondary Text:

```text
#53645E
```

Primary Green:

```text
#2F7E67
```

Soft Sage:

```text
#EEF4EF
```

Line:

```text
#D8E2DD
```

---

# 8. Lifecycle Colors

상태 색은 제한적으로 사용한다.

DUE:

```text
#E7A5A0
```

UPCOMING:

```text
#DFC58A
```

NORMAL:

```text
#9FC9B7
```

---

# 9. Lifecycle 색상 사용 범위

허용:

* D-Day text
* tiny status indicator
* selected status summary accent
* due marker

금지:

* 전체 카드 배경
* large colored icon tile
* 모든 text
* large filled pill
* full calendar cell

---

# 10. Background

전체 App Background는 warm neutral 기반.

권장:

```text
#F7F6F1
```

Section마다 흰색 Card를 반복해서 배치하지 않는다.

---

# 11. Surface

Surface는 꼭 필요할 때만.

예:

* Composer
* Bottom Sheet
* selected state
* focused input
* calendar container

기본 화면 section은 background 없이도 가능.

---

# 12. Pure White

`#FFFFFF`은:

* input
* elevated sheet
* selected important surface

정도로 제한.

전체 화면을 흰 카드 집합처럼 만들지 않는다.

---

# 13. Typography

폰트는 현재 Product font system을 유지한다.

가능하면 전체 Product에서 한 font family로 통일.

SUIT 계열이 현재 설정되어 있다면 그대로 사용.

---

# 14. Typography Scale

권장 hierarchy:

```text
Page Title
24~28px

Section Title
16~18px

Primary Item
15~17px

Body
14~15px

Secondary
12~13px

Micro
11~12px
```

---

# 15. Font Weight

권장:

```text
Page title 650~700
Section title 600
Item title 550~600
Body 400~500
Secondary 400
```

모든 텍스트를 bold로 만들지 않는다.

---

# 16. Line Height

권장:

```text
Heading 1.2~1.3
Body 1.45~1.6
```

---

# 17. Text Contrast

Text hierarchy를 색상으로도 분리한다.

Primary:

```text
#24312D
```

Secondary:

```text
#53645E
```

Muted:

line보다 약간 진한 neutral tone.

---

# 18. Spacing System

가능하면 공통 spacing scale 사용.

권장:

```text
4
8
12
16
20
24
32
40
48
```

무작위:

```text
17px
19px
27px
31px
```

남발 금지.

---

# 19. Horizontal Padding

모바일 Product main content:

권장:

```text
16~20px
```

390 기준:

```text
20px
```

---

# 20. Section Gap

큰 section:

```text
28~36px
```

section 내부:

```text
12~20px
```

---

# 21. Radius System

기존 `rounded-[22px]`, `rounded-[18px]`, `rounded-[24px]`
등이 혼재하면 정리한다.

권장 3단계:

```text
Small = 8px
Medium = 12px
Large = 16px
```

---

# 22. Large Radius

Bottom Sheet / Composer 등 일부 큰 surface에서만:

```text
20px
```

허용 가능.

---

# 23. Pill Radius

진짜 pill이 필요한 경우만:

```text
999px
```

사용.

모든 button을 pill로 만들지 않는다.

---

# 24. Border

기본:

```text
1px solid #D8E2DD
```

---

# 25. Border 사용

divider로 충분한 곳은 box border를 만들지 않는다.

예:

HOME Item Row:

```text
row
divider
row
divider
```

---

# 26. Shadow

Shadow는 최소화한다.

허용:

* Bottom Sheet
* Floating Action Dock
* temporary overlay

금지:

* HOME row
* Item card
* History row
* Status summary cell
* Month date cell

---

# 27. Shadow Strength

사용할 경우 매우 subtle.

Blur 큰 SaaS shadow 금지.

---

# 28. Icon System

아이콘 스타일을 통일한다.

권장:

```text
outline
1.5~2px stroke
rounded line cap
```

---

# 29. Icon Size

기본:

```text
16px
18px
20px
```

Hero-like icon:

필요 시 24px.

---

# 30. Icon Tile

큰 colored square 안 icon 패턴은 최소화한다.

필요하다면:

```text
32~36px
```

small neutral icon container.

---

# 31. Decorative Illustration

Global Polish에서 새로운 large decorative illustration 추가 금지.

LASTLY는 utility product가 중심.

---

# 32. Button Hierarchy

Button은 최소 3종으로 통일.

```text
Primary
Secondary
Ghost
```

---

# 33. Primary Button

사용:

* 기록하기
* 저장
* 중요한 완료 CTA

특징:

* Primary Green
* high contrast
* 44~48px height
* Medium radius

---

# 34. Secondary Button

사용:

* 직접 입력
* 수정
* Today
* optional action

특징:

* neutral border
* white/transparent background

---

# 35. Ghost Button

사용:

* Back
* close
* navigation arrow
* subtle edit

---

# 36. Danger

실제 destructive action만 red.

현재 runtime archive/delete가 없으므로
Global Polish에서 danger pattern을 새로 만들 필요 없음.

---

# 37. Button Height

모바일 touch target:

```text
44~48px
```

small icon button이라도 hit area 40px 이상 확보.

---

# 38. Input

공통 스타일:

* visible label
* 44~48px min height
* subtle border
* Medium radius
* white or near-white surface
* focus ring
* error state

---

# 39. Textarea

Note textarea:

* 충분한 padding
* auto wrapping
* 500자 지원
* focus state
* mobile keyboard 고려

---

# 40. Focus

keyboard focus를 제거하지 않는다.

기본 browser focus를 숨길 경우
동등하거나 더 명확한 custom focus 제공.

---

# 41. App Shell

전체 App Shell의:

* max-width
* background
* horizontal padding
* top spacing

통일.

---

# 42. Desktop

Desktop에서 app이 full-width dashboard처럼 늘어나지 않는다.

개인 생활관리 앱의 집중감을 유지.

권장 max width:

```text
480~640px
```

현재 구조에 맞는 값을 유지하거나 조정.

---

# 43. Mobile

기준:

```text
360
390
430
```

---

# 44. HOME Header

HOME Header는 최소한으로.

예:

```text
LASTLY

[알림] [설정]
```

---

# 45. HOME Greeting 금지

기존에 남아 있다면 제거.

금지:

```text
좋은 아침이에요!
오늘도 멋진 하루 보내세요.
```

LASTLY 핵심과 관계 없음.

---

# 46. HOME Marketing Copy 금지

금지:

```text
AI가 당신의 일상을 관리해드려요.
```

Product 안에서는 기능적 copy 우선.

---

# 47. Status Summary

R2의 DUE / UPCOMING / NORMAL Summary는 유지한다.

시각적으로는 3개의 큰 독립 카드처럼 만들지 않는다.

---

# 48. Status Summary 권장 구조

하나의 horizontal group 안에서:

```text
관리 필요 2
곧 관리   2
관리 중   3
```

---

# 49. Status Summary Border

Group outer border 또는 divider 구조 가능.

각 cell에 shadow 금지.

---

# 50. Status Summary Selected

선택 상태는:

* subtle background
* small bottom indicator
* text weight
* lifecycle accent

정도로 표시.

---

# 51. Status Summary Icon

아이콘이 필요하다면 neutral.

상태색 아이콘 남발 금지.

---

# 52. List / Month Switch

R7 View Switch는 compact segmented control 형태 권장.

예:

```text
[ 목록 | 월간 ]
```

---

# 53. View Switch 크기

Status Summary보다 시각적으로 강하면 안 된다.

---

# 54. HOME List

R3 Flat Row 유지.

절대 다시 Card List로 되돌리지 않는다.

---

# 55. HOME Row

구조:

```text
Item Name                 D-Day
Tags
──────────────────────────────
```

---

# 56. HOME Row Height

Tag 유무에 따라 약간 차이는 가능하지만
과도하게 큰 vertical padding 금지.

---

# 57. HOME Row D-Day

Lifecycle color 사용 가능.

단 large badge보다 text cue 권장.

---

# 58. HOME Row Tags

Secondary tone.

한 줄.

ellipsis.

---

# 59. HOME Row Hover / Press

Desktop:

subtle background.

Mobile:

pressed state.

Row 전체가 clickable area.

---

# 60. HOME Empty State

현재 Filter 결과가 없으면
과도한 illustration 대신 짧은 text.

---

# 61. Month View

R7 기능 구조 유지.

Calendar는:

```text
grid
line
number
marker
```

중심.

---

# 62. Month Calendar Surface

하나의 subtle bordered surface 가능.

날짜마다 card 금지.

---

# 63. Month Header

```text
<    2026년 9월    >
오늘
```

navigation hierarchy 정리.

---

# 64. Today Button

작은 secondary/ghost control.

Primary CTA처럼 만들지 않는다.

---

# 65. Calendar Week Label

일~토는 muted typography.

---

# 66. Date Cell

날짜 number + marker.

최소 touch target 유지.

---

# 67. Today State

outline / weight 등.

강한 primary fill을 쓰지 않는 것을 권장.

---

# 68. Selected Date

selected state는 today와 구분.

예:

* selected = soft primary background
* today = ring

---

# 69. Activity Marker

filled dot.

---

# 70. Due Marker

outline ring.

---

# 71. Month Detail

Calendar 아래 Activity/Due sections는 Flat Row 유지.

Card stack 금지.

---

# 72. Action Dock

HOME 핵심 입력 영역.

현재 floating Action Dock은 유지하되
시각적으로 지나치게 무겁지 않게 한다.

---

# 73. Action Dock 구조

권장:

```text
[ 🎙 말하기 ]     [ 직접 입력 ]
```

또는 central mic 중심.

현재 기능을 변경하지 않는 범위에서 polish.

---

# 74. Action Dock 높이

모바일에서 content를 과도하게 가리지 않도록 한다.

---

# 75. Action Dock Background

Surface + subtle shadow.

전체 앱에서 shadow가 허용되는 대표 요소 중 하나.

---

# 76. Mic

가장 중요한 입력 action.

Primary accent 사용 가능.

---

# 77. Direct Input

Secondary action.

Mic와 같은 시각 강도를 줄 필요 없음.

---

# 78. Composer

R4 UnifiedComposer 기능 구조 그대로.

이번 단계에서 state machine 변경 금지.

---

# 79. Composer Visual Hierarchy

각 상태:

```text
입력
음성
처리 중
확인
조회 결과
차단
저장 완료
```

가 동일 디자인 시스템 안에서 보여야 한다.

---

# 80. Composer Bottom Sheet

* Large radius
* subtle shadow
* neutral background
* clear heading
* safe area padding

---

# 81. Composer 입력

Text field + action hierarchy 정리.

---

# 82. Voice State

Listening 상태에서 과도한 waveform animation 필요 없음.

작은 pulse / status text 정도.

---

# 83. Processing

AI loading을 과장하지 않는다.

```text
기억을 확인하고 있어요
```

정도의 짧은 상태 copy.

---

# 84. Confirmation

가장 중요한 정보:

```text
항목
날짜
세부 대상
```

---

# 85. Confirmation Card 남발 금지

각 정보마다 독립 card 만들지 않는다.

한 flat summary 안에서 label/value 구조.

---

# 86. Confirmation Buttons

취소 = secondary
기록하기 = primary

---

# 87. Query Result

Record Confirmation과 시각적으로 구분.

조회 결과에는 저장 CTA가 없어야 한다.

---

# 88. Query Result 강조

찾은 날짜와 Item Name 우선.

---

# 89. Blocked State

False Completion 등 blocked 상태는
warning 느낌은 주되 red alert screen처럼 만들지 않는다.

---

# 90. `/items`

현재 `/items` 화면은 HOME보다 오래된 카드 스타일이 남아 있을 수 있다.

Global Polish에서 반드시 HOME 톤과 맞춘다.

---

# 91. `/items` 목적

전체 관리 항목 탐색.

HOME과 동일 데이터이지만
검색 / 카테고리 / 전체 목록 중심.

---

# 92. `/items` List

가능하면 기존 DemoItemCard를
HOME보다 약간 상세한 flat row 또는 minimal list card로 정리.

---

# 93. `/items` 카드

허용한다면:

* border
* minimal radius
* no shadow

정도로 제한.

---

# 94. `/items` 정보

최소:

```text
Item Name
Tags
Cycle
D-Day / Status
```

---

# 95. `/items` 정보 과밀 금지

Note 전체 표시 금지.

Note는 search에는 사용하지만 카드 기본 content에는 불필요.

---

# 96. Search

Search input 디자인 시스템 통일.

---

# 97. Category Filter

Filter chip이 있다면
선택 state만 primary accent.

모든 chip을 진한 색으로 만들지 않는다.

---

# 98. Item Detail

R8 구조 그대로 유지.

Global Polish에서 기능 구조를 다시 바꾸지 않는다.

---

# 99. Item Detail Header

Back + Item Name 중심.

---

# 100. Item Detail Status

small status text.

---

# 101. Last / Next

flat info block.

390/430 2-column
360 vertical.

---

# 102. Complete CTA

Primary hierarchy.

---

# 103. Metadata Sections

Tags / Note / Cycle:

divider 중심.

---

# 104. Edit Buttons

작은 Ghost / Secondary.

section title 옆에 정렬 가능.

---

# 105. History

Flat list.

divider.

---

# 106. Notification

Notification 화면도 Product visual system과 맞춘다.

---

# 107. Notification Item

큰 card stack 대신 compact row 권장.

---

# 108. Notification 상태

현재 Store-derived information 유지.

기능 변경 없음.

---

# 109. Settings

현재 존재하는 Settings UI가 있다면
동일 typography/input/button 규칙 적용.

새 setting 기능 추가 금지.

---

# 110. Feedback

현재 Feedback UI가 있다면
메인 Product hierarchy보다 약하게.

---

# 111. Copy Style

UI copy는 짧게.

권장:

```text
기록 없음
주기 없음
오늘 완료 기록
메모 추가
세부 대상 추가
```

---

# 112. Copy 금지

길고 설명적인 AI copy 남발 금지.

예:

```text
AI가 분석하여 최적의 관리 주기를 추천해드릴게요.
```

현재 기능에도 없음.

---

# 113. Motion System

Motion은 기능을 설명하는 수준.

---

# 114. Transition Duration

권장:

```text
150~220ms
```

---

# 115. Ease

standard ease-out.

---

# 116. Motion 허용

* View switch
* Bottom Sheet
* button press
* selected date
* edit section open
* mic listening

---

# 117. Motion 금지

* continuous decorative animation
* bouncing cards
* floating blobs
* unnecessary parallax
* excessive spring

---

# 118. Reduced Motion

가능하면:

```text
prefers-reduced-motion
```

지원.

---

# 119. Loading State

Demo Track이므로 skeleton overhaul 필요 없음.

---

# 120. Responsive Rule

360px는 단순 축소가 아니다.

필요하면:

* stack
* wrap
* hide secondary copy
* reduce gap

사용.

---

# 121. 360px

반드시:

* no horizontal overflow
* header stable
* status summary readable
* calendar 7 columns
* action dock safe
* composer safe
* item detail safe

---

# 122. 390px

Main reference width.

---

# 123. 430px

wide mobile.

과도하게 stretched controls 금지.

---

# 124. Desktop

mobile app을 가운데 크게 늘린 모습이 아니라
적당한 max-width를 유지.

---

# 125. Safe Area

Bottom Sheet / Action Dock:

```text
env(safe-area-inset-bottom)
```

지원 가능하면 적용.

---

# 126. Accessibility

Global Polish로 접근성을 깨뜨리면 실패다.

---

# 127. Contrast

Text / button contrast 확인.

---

# 128. Color-only State 금지

Lifecycle
Activity / Due
selected
today

색상 외:

* shape
* border
* icon
* text weight

같은 cue 유지.

---

# 129. Touch Target

44px 권장.

---

# 130. Semantic Structure

기존 R8/R7 semantic heading/list 유지.

---

# 131. Focus Ring

모든 interactive component.

---

# 132. aria-pressed

기존:

* status
* List/Month
* cycle
* weekday
* calendar date

유지.

---

# 133. aria-current

Today state 유지.

---

# 134. aria-label

Mic / Back / Calendar nav / Tag remove / CTA 등 유지.

---

# 135. Design Token 권장

가능하면 공통 token 또는 class variable 사용.

예:

```text
--bg
--surface
--text
--text-muted
--line
--primary
--due
--upcoming
--normal
--radius-sm
--radius-md
--radius-lg
```

---

# 136. Token 도입 범위

현재 Tailwind 구조와 충돌하지 않는 최소한의 tokenization.

전체 CSS architecture rewrite 금지.

---

# 137. Tailwind

기존 Tailwind 사용 유지.

새 CSS framework 추가 금지.

---

# 138. UI Library

새 UI library 추가 금지.

---

# 139. Icon Library

현재 icon library가 있다면 유지.

새 icon library 추가 금지.

---

# 140. Animation Library

새 animation dependency 추가 금지.

---

# 141. 기능 코드 변경 금지

다음 파일은 특별한 이유 없으면 수정하지 않는다.

```text
lib/ai/*
lib/cycle.ts
lib/month-view.ts
DemoActivityProvider.tsx
```

---

# 142. 허용되는 기능 파일 변경

오직 visual prop/className 구조 때문에 필요할 때만 최소 변경.

Behavior 변경 금지.

---

# 143. Parser

절대 변경 금지.

---

# 144. Matching

절대 변경 금지.

---

# 145. Cycle Engine

절대 변경 금지.

---

# 146. Month Engine

절대 변경 금지.

---

# 147. Store

절대 behavioral 변경 금지.

---

# 148. Route

추가/삭제 금지.

---

# 149. Product routes

반드시 유지:

```text
/
/record
/record?item=
/items
/items/[itemId]
/notification
/settings
```

현재 존재하는 Product route 기준.

---

# 150. Fixtures

`/screens/*` 24개는 Visual Polish 대상이 아니다.

절대 수정하지 않는다.

---

# 151. Demo Fixture Style

Fixture Screen 스타일을 Product에 다시 가져오지 않는다.

---

# 152. Global Polish 우선순위

작업 순서 권장:

```text
1. Visual tokens
2. App Shell
3. Shared buttons/inputs
4. HOME
5. Month
6. Action Dock
7. Composer
8. /items
9. Item Detail
10. Notification
11. Responsive
12. Accessibility
13. Regression
```

---

# 153. HOME 최우선

사용자 첫인상의 대부분이 HOME이므로
가장 먼저 polish.

---

# 154. HOME Acceptance

* [ ] Greeting/marketing clutter 없음
* [ ] Status Summary integrated
* [ ] List/Month switch compact
* [ ] Flat Row 유지
* [ ] shadow card 제거
* [ ] Action Dock clear
* [ ] primary hierarchy 명확

---

# 155. Month Acceptance

* [ ] 42 cell 유지
* [ ] Activity/Due 형태 구분
* [ ] calendar card clutter 없음
* [ ] selected/today 구분
* [ ] detail flat list

---

# 156. Composer Acceptance

* [ ] 모든 state visual consistency
* [ ] confirmation hierarchy
* [ ] query result distinction
* [ ] voice state clear
* [ ] save CTA hierarchy
* [ ] Bottom Sheet consistent

---

# 157. Items Acceptance

* [ ] Search hierarchy
* [ ] Filter consistency
* [ ] HOME와 visual language 일치
* [ ] legacy card shadow 제거

---

# 158. Detail Acceptance

* [ ] R8 hierarchy 유지
* [ ] section divider
* [ ] edit action consistency
* [ ] Last/Next readability
* [ ] CTA primary
* [ ] History flat

---

# 159. Notification Acceptance

* [ ] Store data unchanged
* [ ] visual system consistency
* [ ] compact hierarchy

---

# 160. Global Visual Regression

기능이 하나라도 깨지면 Global Polish PASS 불가.

---

# 161. R4 Regression

반드시:

```text
COMPLETED
QUERY
NOT_COMPLETED
PLANNED
Voice
Confirmation
Multi Segment
Atomic Save
```

PASS.

---

# 162. R5 Regression

반드시:

```text
Tags
Note
Alias
Exact Name
Exact Alias
Exact Tag
Matching precedence
```

PASS.

---

# 163. R6 Regression

반드시:

```text
Day
Week
Weekday
Month
Month-end
Next Due
Lifecycle
```

PASS.

---

# 164. R7 Regression

반드시:

```text
List/Month
42 cells
Activity marker
Due marker
Month sync
```

PASS.

---

# 165. R8 Regression

반드시:

```text
Complete CTA
Name edit
Tag edit
Note edit
Cycle edit
History
```

PASS.

---

# 166. Visual QA

각 화면을 최소:

```text
360
390
430
```

에서 캡처/렌더 검증.

---

# 167. Desktop QA

최소 1024 또는 현재 desktop viewport에서도 확인.

---

# 168. Overflow

전체 Product:

```text
horizontal overflow = 0
```

---

# 169. Long Content QA

반드시 테스트:

* 긴 Item Name
* Tag 10개
* Note 500자
* History 10개
* 긴 cycle label
* Calendar +N
* Composer multi segment

---

# 170. Contrast QA

Primary
Secondary
Muted
Lifecycle

가독성 확인.

---

# 171. Interaction QA

* hover
* focus
* active
* disabled
* pressed
* loading
* selected

일관성 확인.

---

# 172. Disabled

disabled button은:

* opacity만 너무 낮추지 않음
* disabled임을 알 수 있음
* text contrast 유지

---

# 173. Empty State QA

* HOME filter empty
* Month selected date empty
* Item history empty
* tags empty
* note empty
* cycle none

스타일 일관성.

---

# 174. Bottom Sheet QA

* 360/390/430
* keyboard
* safe area
* close
* scroll
* Save/Cancel

---

# 175. No Horizontal Scroll

Calendar 포함 전체 화면에서 필수.

---

# 176. Performance

Visual Polish로 불필요한 heavy effect 추가 금지.

금지:

* backdrop blur 과다
* huge box-shadow
* many animated gradients

---

# 177. CSS Complexity

같은 스타일이 반복되면 공통 component/token 고려.

하지만 premature architecture rewrite 금지.

---

# 178. Current Component 재사용

`DemoButton`
`DemoAppShell`

같은 shared UI를 활용해 통일 가능.

---

# 179. Demo Naming

Product component 이름에 Demo가 남는 문제는 이번 단계의 rename 범위가 아니다.

Behavior risk 때문에 이름 변경 대규모 refactor 금지.

---

# 180. Global Polish 구현 전 분석

이 문서를 저장했다고 바로 코드 수정하지 않는다.

먼저 실제 Product UI의 모든 화면과 공통 component를 분석한다.

---

# 181. 반드시 분석할 화면

1. HOME List
2. HOME Month
3. Unified Composer
4. `/record`
5. `/items`
6. `/items/[itemId]`
7. Notification
8. Settings
9. Feedback
10. Error / empty states

---

# 182. 반드시 분석할 Shared Component

1. DemoAppShell
2. DemoButton
3. HomeItemRow
4. DemoItemCard
5. HomeMonthlyView
6. UnifiedComposer
7. ItemDetailDemo
8. NotificationDemo
9. input/button primitives
10. icon usage

---

# 183. 반드시 조사할 스타일

1. Background colors
2. Text colors
3. Border colors
4. Radius 종류
5. Shadow 종류
6. Button heights
7. Input heights
8. Horizontal padding
9. Section spacing
10. Heading sizes
11. Icon sizes
12. Surface styles

---

# 184. 디자인 문제 목록 작성

Codex는 현재 Product에서:

```text
시각적으로 가장 큰 문제 10개
```

를 실제 코드 근거와 함께 먼저 보고한다.

---

# 185. 우선순위

문제는 다음 순서로 분류한다.

```text
P0 — 전체 일관성을 깨뜨림
P1 — 화면별 hierarchy 문제
P2 — polish 수준
```

---

# 186. 정책 A — Global Surface

Codex는 현재 app shell을 분석하고:

```text
A. warm neutral full background
```

를 유지할지,

또는:

```text
B. white main surface + warm outer
```

가 더 적합한지 제안한다.

---

# 187. 정책 B — Status Summary

현재 3개 button 구조를:

```text
integrated segmented summary
```

로 만드는 것이 안전한지 분석.

기능은 유지해야 한다.

---

# 188. 정책 C — `/items`

현재 DemoItemCard를:

```text
A. flat row
B. minimal bordered list card
```

중 어떤 방식으로 통일할지 제안.

---

# 189. 정책 D — Action Dock

현재 Dock을:

```text
A. 2-button bar
B. central mic + secondary input
```

중 현재 기능과 제품 정체성에 더 적합한 방식 제안.

Behavior 변경 금지.

---

# 190. 정책 E — Composer

현재 Composer 각 state의 UI 구조를 분석해
어디까지 공통 surface/layout으로 통일할지 제안.

---

# 191. 정책 F — Radius

현재 사용 중인 radius를 실제 검색해서
최종 scale을 제안한다.

---

# 192. 정책 G — Shadow

현재 shadow 사용 위치를 검색해서:

```text
유지
제거
축소
```

분류한다.

---

# 193. 정책 H — Typography

현재 font size/weight 사용을 조사해서
최소 typography scale을 제안.

---

# 194. 정책 I — Icon

현재 icon tile / icon size를 조사해서
통일안 제시.

---

# 195. 분석 보고 형식

```text
08_GLOBAL_VISUAL_POLISH_SPEC 검증

1. Current visual system
2. 가장 큰 디자인 문제 10개
3. Color
4. Typography
5. Spacing
6. Radius
7. Border
8. Shadow
9. Icons
10. Buttons
11. Inputs
12. App Shell
13. HOME
14. Month
15. Action Dock
16. Composer
17. /items
18. Item Detail
19. Notification
20. Responsive
21. Accessibility
22. Shared component strategy
23. 예상 변경 파일
24. 기능 regression 위험
25. Global Polish 착수 가능 여부

Status:
PASS / PARTIAL / BLOCKED
```

---

# 196. STOP RULE

분석만 수행한다.

사용자가 명시적으로:

```text
Global Visual Polish 진행해
```

라고 하기 전까지 코드 수정 금지.

---

# 197. Global Polish 구현 범위

사용자 승인 후에만:

* className
* layout
* visual component
* shared UI primitive
* typography
* spacing
* visual animation

수정.

---

# 198. 금지 범위

승인 후에도 다음은 금지:

* Parser
* Matching
* Cycle Engine behavior
* Month Event behavior
* Store behavior
* DB
* Auth
* Push
* Route 변경
* Fixture 수정
* AI Provider 변경

---

# 199. Quality Gate

반드시:

```text
npm run typecheck
npm run lint
npm run build
```

PASS.

---

# 200. Functional Smoke

기존 R1~R8 smoke 전부 PASS.

---

# 201. Route Gate

현재 Product/Fixture route 모두 PASS.

---

# 202. Screenshot QA

가능하면 주요 Product 화면을:

```text
360
390
430
```

에서 시각 검증한다.

---

# 203. Visual Diff Review

Global Polish 전/후:

* 카드 수
* shadow 수
* radius 종류
* typography 종류
* button 종류

가 실제로 줄어들었는지 보고한다.

---

# 204. 완료 보고 필수

Global Visual Polish 완료 후 반드시 보고:

1. 변경 파일
2. 공통 design token
3. Color 정리
4. Typography 정리
5. Spacing 정리
6. Radius 정리
7. Border 정리
8. Shadow 정리
9. Icon 정리
10. Button 정리
11. Input 정리
12. App Shell
13. HOME before/after
14. Status Summary
15. View Switch
16. HOME Flat Row
17. Month View
18. Action Dock
19. Composer
20. `/items`
21. Item Detail
22. Notification
23. Empty States
24. Bottom Sheets
25. Motion
26. Accessibility
27. 360
28. 390
29. 430
30. Desktop
31. horizontal overflow
32. long content
33. R4 regression
34. R5 regression
35. R6 regression
36. R7 regression
37. R8 regression
38. Routes
39. `/screens/*` 24
40. typecheck
41. lint
42. build
43. git diff
44. unexpected changes
45. Parser unchanged
46. Matching unchanged
47. Store behavior unchanged
48. DB/Auth/Push unchanged

최종 판정:

PASS
PARTIAL
BLOCKED
