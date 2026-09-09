# LASTLY — Item Detail Functional / UI Specification

## 문서 목적

이 문서는 LASTLY의 개별 관리 항목 상세 화면을 최종 정리한다.

R8의 목적은 새로운 기능을 크게 추가하는 것이 아니라,
R4~R7에서 이미 확정된 데이터를 하나의 일관된 Item Detail 화면으로 정리하는 것이다.

Item Detail에서 사용자는 최소 다음을 이해할 수 있어야 한다.

- 이 항목이 무엇인지
- 마지막으로 언제 했는지
- 다음 관리 시점이 언제인지
- 어떤 세부 대상을 관리하는지
- 어떤 메모가 있는지
- 관리 주기가 어떻게 설정되어 있는지
- 이전에 언제 수행했는지
- 지금 다시 완료 기록을 남길 수 있는지

이 문서는 **R8 — Item Detail 구현의 Source of Truth**다.

기존 문서와 충돌하는 경우 우선순위는 다음과 같다.

1. `docs/00_CHANGE_REQUEST.md`
2. `docs/01_UPDATED_IA.md`
3. `docs/02_HOME_UI_UX_SPEC.md`
4. `docs/03_VOICE_QUERY_RECORD_SPEC.md`
5. `docs/04_TAG_NOTE_SPEC.md`
6. `docs/05_CYCLE_SPEC.md`
7. `docs/06_MONTHLY_VIEW_SPEC.md`
8. `docs/07_ITEM_DETAIL_SPEC.md`

---

# 1. 핵심 역할

Item Detail은 관리 항목 하나를 위한 상세 관리 화면이다.

다음 두 역할을 동시에 수행한다.

```text
상태 확인
+
항목 관리
````

하지만 일반 설정 페이지처럼 보이면 안 된다.

사용자가 가장 먼저 봐야 하는 것은 설정값이 아니라:

```text
마지막 수행
다음 관리
```

다.

---

# 2. 화면 우선순위

Item Detail 정보 우선순위는 다음과 같다.

```text
1. Item identity
2. 현재 관리 상태
3. 마지막 수행 / 다음 관리
4. 오늘 완료 기록
5. Tags
6. Note
7. Cycle
8. Activity History
9. Secondary actions
```

---

# 3. 현재 문제

기존 Detail은 기능이 단계별로 추가되면서:

* 카드 중첩
* 큰 icon block
* shadow 반복
* local edit state
* cycle panel
* tag/note panel
* history card

등이 누적되어 있을 수 있다.

R8에서는 이것을 하나의 명확한 정보 구조로 정리한다.

---

# 4. 디자인 원칙

R8 Item Detail은 기존 Soft Utility UI 방향을 유지한다.

권장:

* warm neutral background
* 1px divider
* 최소한의 radius
* shadow 최소
* typography hierarchy
* whitespace
* flat section

금지:

```text
큰 카드 안에 작은 카드
카드 안에 카드
각 섹션마다 shadow
과도한 icon tile
```

---

# 5. 기본 구조

권장:

```text
←

이불 세탁

[현재 상태]

마지막 수행
9월 1일

다음 관리
9월 15일 · D-7

[오늘 완료 기록]

────────────────

세부 대상
[아이 이불] [아빠 이불]

메모
겨울 이불은 따로 세탁

────────────────

관리 주기
14일마다
[수정]

────────────────

지난 기록
9월 1일
8월 15일
8월 1일

────────────────

기타 관리
```

---

# 6. Header

상단에는 최소:

```text
Back
Item Name
```

을 제공한다.

---

# 7. Back

기본:

```text
←
```

클릭 시 이전 화면.

가능하면 browser/router back을 사용한다.

---

# 8. Header에서 중복 navigation 금지

R1에서 제거한 Bottom Navigation을 Detail 때문에 다시 넣지 않는다.

---

# 9. Item Name

Item Name은 상세 화면의 가장 강한 텍스트다.

예:

```text
이불 세탁
```

---

# 10. Item Name Edit

이름 수정은 가능해야 한다.

단 기본 화면에서 항상 input으로 보이지 않는다.

기본:

```text
이불 세탁
[수정]
```

또는 section edit mode.

---

# 11. Name 변경

Name 수정 시:

* HOME 즉시 반영
* `/items` 즉시 반영
* Month Detail 즉시 반영
* Alias 유지
* Activity History 유지
* Tags 유지
* Note 유지
* Cycle 유지

---

# 12. Status Summary

Item Detail 상단에서 현재 Lifecycle을 한눈에 보여준다.

가능한 상태:

```text
DUE
UPCOMING
NORMAL
NO_HISTORY
NO_CYCLE
ARCHIVED
```

---

# 13. Status 표현

사용자용 copy로 변환한다.

예:

```text
DUE
→ 관리 필요

UPCOMING
→ 곧 관리

NORMAL
→ 관리 중

NO_HISTORY
→ 기록 없음

NO_CYCLE
→ 주기 없음
```

ARCHIVED는 현재 archive 기능이 실제 Product에 존재할 때만 표시.

---

# 14. Status icon

작은 neutral icon 사용 가능.

큰 decorative illustration은 사용하지 않는다.

---

# 15. Lifecycle color

R2/R3 색 정책 유지.

상태색은:

* D-Day
* small status cue
* selected state

정도에 제한한다.

---

# 16. 핵심 날짜 영역

상단에서 가장 중요한 데이터:

```text
마지막 수행
다음 관리
```

---

# 17. Last Performed

Activity History의 최신 수행일을 사용한다.

Source of Truth:

```text
item.history[]
```

---

# 18. Last Performed 예

```text
마지막 수행
2026년 9월 1일
```

---

# 19. History 없음

NO_HISTORY:

```text
마지막 수행
기록 없음
```

---

# 20. Next Due

R6 typed:

```text
nextDueDate
```

와:

```text
dDayLabel
```

을 사용한다.

---

# 21. Next Due 예

```text
다음 관리
9월 15일 · D-7
```

---

# 22. Due Today

```text
다음 관리
오늘 · D-Day
```

---

# 23. Overdue

```text
다음 관리
9월 1일 · D+7
```

---

# 24. NO_CYCLE

```text
다음 관리
주기 없음
```

---

# 25. NO_HISTORY

주기가 있어도 수행 기록이 없으면:

```text
다음 관리
첫 기록 후 계산
```

또는 현재 Product copy와 동일한 짧은 문구 사용.

---

# 26. 날짜 카드를 두 개 만들지 않는다

금지:

```text
[마지막 수행 카드]
[다음 관리 카드]
```

각각 큰 shadow card.

권장:

```text
마지막 수행        다음 관리
9월 1일           9월 15일 · D-7
```

2-column summary 또는 flat information block.

---

# 27. 모바일

360px에서도 2-column 가능하나
정보가 답답하면 세로 stack 허용.

가독성을 우선한다.

---

# 28. 오늘 완료 CTA

Item Detail의 primary action은:

```text
오늘 완료 기록
```

이다.

---

# 29. CTA 목적

사용자가 이 Item을 지금 수행했다면
별도 입력 없이 기존 R4 Composer의 Item context로 진입할 수 있어야 한다.

---

# 30. 기존 `/record?item=` 재사용

Item Detail에서 완료 CTA 클릭:

```text
/record?item={itemId}
```

또는 동일 UnifiedComposer의 item-context mode.

현재 architecture에서 더 자연스러운 방식을 사용한다.

새 Record 시스템을 만들지 않는다.

---

# 31. 자동 저장 금지

`오늘 완료 기록` 버튼을 눌렀다고 Activity를 생성하면 안 된다.

반드시:

```text
Composer
→ Confirmation
→ Save
```

기존 R4 안전 규칙 유지.

---

# 32. False Completion 보호

Detail CTA도 기존 parser/confirmation pipeline을 우회하지 않는다.

---

# 33. CTA copy

권장:

```text
오늘 완료 기록
```

또는:

```text
완료 기록하기
```

둘 중 하나로 통일.

---

# 34. 마이크 CTA 추가 여부

Item Detail에 별도의 큰 mic button을 추가하지 않는다.

기본 완료 CTA 하나면 충분하다.

필요 시 Composer 안에서 voice/text 선택.

---

# 35. Metadata 영역

핵심 상태 다음에:

```text
세부 대상
메모
관리 주기
```

배치.

---

# 36. Tags

R5 canonical:

```ts
tags: string[]
```

사용.

---

# 37. Tags 기본 표시

예:

```text
세부 대상

아이 이불
아빠 이불
```

또는 chip.

---

# 38. Tags UI

작은 neutral chip 허용.

금지:

* lifecycle 컬러 chip
* rainbow tags
* 큰 pill
* shadow

---

# 39. Tags Edit

태그 수정 가능.

기존 R5 normalization 유지:

* trim
* empty 제거
* 중복 제거
* 입력 순서 유지
* 최대 10개
* tag당 30자

---

# 40. Tags Empty

```text
세부 대상
등록된 세부 대상이 없어요.
```

또는:

```text
세부 대상 추가
```

짧은 UI.

---

# 41. Note

R5 canonical:

```ts
note: string | null
```

---

# 42. Note 기본 표시

예:

```text
메모

겨울 이불은 따로 세탁
```

---

# 43. Note Empty

```text
메모
메모 없음
```

또는 `메모 추가`.

---

# 44. Note Edit

textarea 사용.

기존 정책:

* trim
* empty → null
* max 500

---

# 45. Note와 History 구분

Note는 Item metadata다.

Activity History의 메모처럼 표시하지 않는다.

---

# 46. Tag / Note 편집 UI

R8에서는 모든 metadata section을 동시에 input 상태로 두지 않는다.

기본은 read mode.

수정 요청 시 edit mode.

---

# 47. 편집 방식

다음 중 현재 architecture에 더 맞는 방식을 선택 가능.

A.

```text
각 section별 수정
```

B.

```text
상단 전체 수정
```

권장:

```text
section별 수정
```

Cycle UI가 이미 독립 section이라 일관성이 좋다.

---

# 48. Save / Cancel

편집 state에서는 반드시:

```text
취소
저장
```

제공.

---

# 49. Cancel

취소 시 Store mutation 없음.

---

# 50. Validation

입력 validation 실패 시:

* 기존 값 유지
* 사용자 안내
* silent truncation 금지

---

# 51. Cycle

R6 canonical:

```ts
cycle
```

사용.

---

# 52. Cycle 기본 표시

```text
관리 주기

14일마다
```

---

# 53. Cycle Edit

R6에서 만든:

```text
주기 없음
일
주
월
요일 selector
```

를 재사용.

R8에서 새로운 cycle editor를 만들지 않는다.

---

# 54. Cycle UI compact

기본 화면에서는 설정 controls 전부 노출하지 않는다.

기본:

```text
관리 주기
14일마다
[수정]
```

수정 시 editor 표시.

---

# 55. Next Due와 Cycle 중복

상단에는 결과:

```text
다음 관리
9월 15일
```

하단 metadata에는 설정:

```text
관리 주기
14일마다
```

둘은 다른 의미이므로 함께 존재 가능.

---

# 56. Activity History

History는 Item Detail의 주요 하단 section이다.

---

# 57. History Source

Source of Truth:

```text
item.history[]
```

---

# 58. History 정렬

최신 수행일이 위.

현재 R4 ordering 유지.

---

# 59. History Row

기본:

```text
9월 1일
8월 15일
8월 1일
```

---

# 60. History row 정보

R8에서 각 row에 지나치게 많은 정보를 추가하지 않는다.

최소:

```text
날짜
```

필요하면 source:

```text
직접 기록
음성 기록
```

등은 후순위.

---

# 61. Activity tag snapshot 금지

R5에서 Activity-level Tag Snapshot은 미구현 범위다.

따라서 과거 History row에 현재 Tag를 붙여서
그 당시 수행한 세부 대상처럼 표현하면 안 된다.

---

# 62. Note snapshot 금지

현재 Item Note를 과거 Activity row에 붙이지 않는다.

---

# 63. History Empty

```text
아직 기록이 없어요.
```

---

# 64. NO_HISTORY CTA

History가 없을 때:

```text
첫 기록 남기기
```

CTA 가능.

기존 Composer 재사용.

---

# 65. History Pagination

Demo MVP 10개 내외에서는 pagination 필요 없음.

---

# 66. History collapse

History가 매우 많아지는 경우는 후속.

R8 MVP에서는 전체 목록 또는 제한된 최근 기록 표시 가능.

---

# 67. 권장 MVP

최대 최근:

```text
10개
```

표시 후 필요하면:

```text
전체 기록 보기
```

후속.

현재 Demo 데이터가 적으면 전체 표시.

---

# 68. Activity 수정

R8에서 과거 Activity edit 기능을 새로 구현하지 않는다.

---

# 69. Activity 삭제

R8에서 과거 Activity delete 기능을 새로 구현하지 않는다.

---

# 70. Item Archive

현재 Product에 Archive 기능이 이미 존재한다면 Secondary Action으로 유지 가능.

---

# 71. Archive 위치

Primary content에 크게 노출하지 않는다.

하단:

```text
항목 보관
```

형태.

---

# 72. Delete

실제 Delete 기능은 R8 필수 아님.

---

# 73. Danger Zone

Archive/Delete가 있을 경우
화면 최하단 Secondary 영역.

---

# 74. Danger color

실제 destructive action에만 제한적으로 사용.

---

# 75. Item Detail과 Month

R7 Month의 Activity/Due row 클릭:

```text
/items/[itemId]
```

현재 Detail로 이동.

---

# 76. Month 복귀

Detail에서 back하면
기존 Month selectedDate state가 router 구조상 보존되지 않을 수 있다.

R8 MVP에서 상태 persistence 필수 아님.

---

# 77. Item Detail과 HOME

HOME Flat Row:

```text
/items/[itemId]
```

동일 canonical Detail 사용.

---

# 78. `/items`

전체관리 리스트도 같은 Detail 사용.

---

# 79. Detail route

Canonical:

```text
/items/[itemId]
```

유지.

---

# 80. 별도 Detail route 추가 금지

금지:

```text
/detail/[id]
/memory/[id]
```

---

# 81. Item ID 없음

존재하지 않는 Item ID:

현재 Product fallback 정책 유지.

가능하면:

```text
항목을 찾을 수 없어요.
```

* 돌아가기.

---

# 82. Demo Store Source

Detail은 R4~R7 Product Store의 current item을 사용.

정적 `demoItems.find()`로 되돌리지 않는다.

---

# 83. Store Sync

Detail edit 후:

* HOME
* Month
* `/items`
* Notification

같은 Store에서 즉시 반영.

---

# 84. Item Detail local shadow state

Edit draft는 local state 가능.

하지만 canonical metadata는 Provider.

---

# 85. 저장 후

저장 성공 시 local draft와 Store가 동일 상태.

---

# 86. derived state

다음은 Detail 자체에서 임의 재계산하지 않는다.

* lifecycle
* D-Day
* nextDue

R6 engine / Provider derived values 사용.

---

# 87. History Source of Truth

마지막 수행일을 별도 `lastPerformed` local field로 관리하지 않는다.

History에서 파생된 값 사용.

---

# 88. date normalization

History display에서는 R7/R6 date-only helper를 재사용 가능.

---

# 89. 날짜 표시 copy

저장 format:

```text
YYYY-MM-DD
```

UI:

```text
2026년 9월 1일
```

또는:

```text
9월 1일
```

현재 app tone에 맞춰 통일.

---

# 90. 시간 표시

R8 MVP에서 time-of-day 표시 필수 아님.

---

# 91. Item Detail Status + D-Day

중복 표시 주의.

예:

```text
관리 필요
다음 관리 9월 1일 · D+7
```

이면 충분.

큰 D+7 badge를 별도로 또 반복하지 않는다.

---

# 92. Icon

Item category icon이 현재 존재한다면 작은 보조 icon으로 유지 가능.

---

# 93. 큰 Icon Tile

기존 큰 rounded icon box가 있다면 제거 또는 축소 권장.

Item Name보다 시각적으로 강하면 안 된다.

---

# 94. Category

현재 category 필드가 있다면 작은 metadata로 표시 가능.

예:

```text
생활관리
```

하지만 R8 핵심 정보는 아니다.

---

# 95. Category Edit

R8에서 새 category edit 기능 구현 필수 아님.

---

# 96. Layout hierarchy

권장 전체 구조:

```text
Header

Identity / Status
Last / Next
Primary CTA

Tags
Note
Cycle

History

Secondary
```

---

# 97. Section separator

큰 rounded card 대신:

```text
padding
1px divider
section heading
```

을 활용한다.

---

# 98. Section spacing

section 간 충분한 여백.

각 요소를 테두리 box로 감싸지 않는다.

---

# 99. max-width

기존 Product App Shell max-width 유지.

Detail만 넓은 desktop layout으로 확장하지 않는다.

---

# 100. Fixed CTA

Item Detail의 완료 CTA를 fixed bottom으로 만들지 않는 것을 권장한다.

HOME Action Dock과 다른 패턴이므로
기본 content CTA가 더 단순하다.

---

# 101. Sticky CTA

R8 필수 아님.

---

# 102. Mobile First

360 / 390 / 430px 기준.

---

# 103. Keyboard

Edit input/textarea에서 mobile keyboard가 열려도:

* save/cancel 접근 가능
* horizontal overflow 없음

---

# 104. Tag Chip overflow

여러 Tag는 wrap 허용.

HOME과 달리 Detail에서는 ellipsis 필요 없음.

---

# 105. Cycle weekday chips

R6 editor의 wrap 정책 유지.

---

# 106. Long Note

500자 Note가 layout을 깨지 않아야 한다.

read mode에서는 자연스럽게 wrap.

---

# 107. Long Item Name

2줄까지 자연스럽게 허용.

Header layout을 밀어내지 않아야 한다.

---

# 108. Accessibility

Back button accessible name.

Edit buttons:

```text
이름 수정
세부 대상 수정
메모 수정
관리 주기 수정
```

처럼 의미가 분명해야 한다.

---

# 109. CTA accessibility

```text
이불 세탁 완료 기록하기
```

같은 aria-label 가능.

---

# 110. Tags remove

R5 aria-label 유지.

---

# 111. Cycle selector

R6 aria-pressed 유지.

---

# 112. History semantics

History section:

```html
<section>
  <h2>지난 기록</h2>
  <ul>
```

같은 의미 구조 권장.

실제 framework 구조에 맞게 적용.

---

# 113. Focus state

모든 interactive element는 keyboard focus 확인 가능해야 한다.

---

# 114. Motion

R8에서 복잡한 animation 필요 없음.

Edit section open/close 정도의 subtle transition 가능.

---

# 115. Reduced Motion

transition이 있다면 prefers-reduced-motion 고려 가능.

---

# 116. Loading

Demo Track에서는 loading skeleton 불필요.

---

# 117. Error state

Metadata save가 local Demo Store라면 실제 network error 없음.

validation error만 처리.

---

# 118. Supabase

R8에서 연결하지 않는다.

---

# 119. DB

R8에서 migration 하지 않는다.

---

# 120. Auth

추가하지 않는다.

---

# 121. Push

추가하지 않는다.

---

# 122. Notification scheduler

추가하지 않는다.

---

# 123. Parser

Item Detail redesign을 위해 Parser를 변경하지 않는다.

---

# 124. Matching

R5 Matching precedence 유지:

```text
Exact Item Name
→ Exact Alias
→ Exact Tag
→ Note
→ Fuzzy
```

---

# 125. R4 Regression

반드시 유지:

* UnifiedComposer
* Voice
* COMPLETED
* Confirmation
* QUERY
* False Completion
* Multi Segment
* Atomic Save

---

# 126. R5 Regression

반드시 유지:

* tags
* note
* Alias
* Tag Candidate
* Tag Query
* Metadata Store sync

---

# 127. R6 Regression

반드시 유지:

* Day
* Week
* Weekdays
* Month
* nextDue
* D-Day
* Lifecycle
* NO_HISTORY
* NO_CYCLE

---

# 128. R7 Regression

반드시 유지:

* List / Month
* Month Events
* Activity marker
* Due marker
* selected date detail
* Store sync

---

# 129. Detail complete CTA test

예:

Item:

```text
이불 세탁
```

Click:

```text
오늘 완료 기록
```

Expected:

```text
UnifiedComposer
item context = bedding
auto save = 0
```

---

# 130. Completion save

Confirmation 후 저장:

Expected:

* history +1
* Last Performed 변경
* Next Due 재계산
* D-Day 재계산
* HOME 변경
* Month Activity marker 변경
* Month Due marker 이동 가능
* Item Detail 즉시 갱신

---

# 131. Metadata edit test

Name:

```text
이불 세탁
→ 침구 세탁
```

Expected:

* Detail 변경
* HOME 변경
* `/items` 변경
* Month Detail 변경
* Alias 유지
* History unchanged

---

# 132. Tag edit test

Tag 추가/삭제:

Expected:

* Detail 변경
* HOME subtitle 변경
* Month Detail subtitle 변경
* History unchanged

---

# 133. Note edit test

Expected:

* Detail 변경
* `/items` search 반영
* HOME 미노출
* Month 미노출
* History unchanged

---

# 134. Cycle edit test

14일:

```text
→ 매월
```

Expected:

* Detail cycle label 변경
* nextDue 변경
* D-Day 변경
* HOME lifecycle 변경 가능
* Month Due marker 이동
* History unchanged

---

# 135. Remove cycle

Expected:

```text
nextDue = null
NO_CYCLE
```

History가 존재할 경우.

---

# 136. No history item

Detail:

```text
마지막 수행
기록 없음

다음 관리
첫 기록 후 계산
```

---

# 137. No cycle item

Detail:

```text
마지막 수행
8월 1일

다음 관리
주기 없음
```

---

# 138. Due item

```text
관리 필요
다음 관리 9월 1일 · D+7
```

---

# 139. Upcoming item

```text
곧 관리
다음 관리 9월 10일 · D-2
```

---

# 140. Normal item

```text
관리 중
다음 관리 10월 1일 · D-23
```

---

# 141. Duplicate data 표시 금지

같은 값을 여러 section에서 반복하지 않는다.

예:

```text
14일마다
```

는 Cycle section에.

`D-7`은 Next Due에.

---

# 142. Existing Feedback UI

Item Detail에 Product-wide Feedback component가 있다면
R8 핵심 구조를 방해하지 않는 위치에 유지 가능.

새 feedback 기능 추가 금지.

---

# 143. R8 범위

R8에서 구현:

1. Item Detail information architecture 재구성
2. Status summary
3. Last/Next block
4. Primary Complete CTA
5. Tags section
6. Note section
7. Cycle section
8. History section
9. metadata edit Store sync
10. flat visual hierarchy
11. responsive/accessibility
12. regression

---

# 144. R8 범위 아님

다음은 하지 않는다.

* 전체 앱 Visual Redesign
* HOME 전체 theme 변경
* Month redesign
* `/items` 전체 redesign
* 새로운 Design System migration
* Supabase
* DB
* Auth
* Push
* activity edit/delete
* complex archive system
* AI cycle suggestion
* analytics
* notification scheduler

---

# 145. Visual Polish와 구분

R8은:

```text
Item Detail 구조 정리
```

다.

R8 이후 별도 단계에서:

```text
Global Visual Polish
```

를 진행한다.

따라서 R8에서 다른 Product 화면까지
무리하게 디자인 변경하지 않는다.

---

# 146. R8 Acceptance — Structure

* [ ] Header
* [ ] Item identity
* [ ] Lifecycle
* [ ] Last Performed
* [ ] Next Due
* [ ] Complete CTA
* [ ] Tags
* [ ] Note
* [ ] Cycle
* [ ] History
* [ ] Secondary actions

---

# 147. R8 Acceptance — CTA

* [ ] 기존 Composer 재사용
* [ ] Item context 전달
* [ ] auto save 없음
* [ ] Confirmation 유지

---

# 148. R8 Acceptance — Metadata

* [ ] Name edit
* [ ] Tags edit
* [ ] Note edit
* [ ] Cycle edit
* [ ] Store immutable
* [ ] History untouched

---

# 149. R8 Acceptance — Derived

* [ ] Last Performed from History
* [ ] nextDue from R6
* [ ] D-Day from R6
* [ ] Lifecycle from R6
* [ ] Detail에서 별도 계산 없음

---

# 150. R8 Acceptance — History

* [ ] Activity History source
* [ ] newest first
* [ ] empty state
* [ ] no fake tag snapshot
* [ ] no fake note snapshot

---

# 151. R8 Acceptance — Design

* [ ] card nesting 감소
* [ ] large decorative icon 감소
* [ ] shadow 최소
* [ ] divider 중심
* [ ] typography hierarchy
* [ ] mobile readability

---

# 152. R8 Acceptance — Sync

* [ ] Complete → Detail
* [ ] Complete → HOME
* [ ] Complete → Month
* [ ] Metadata → HOME
* [ ] Metadata → `/items`
* [ ] Metadata → Month
* [ ] Cycle → Month Due

---

# 153. R8 Acceptance — Regression

* [ ] R1 유지
* [ ] R2 유지
* [ ] R3 유지
* [ ] R4 유지
* [ ] R5 유지
* [ ] R6 유지
* [ ] R7 유지
* [ ] `/record`
* [ ] `/record?item=`
* [ ] `/items`
* [ ] `/items/[itemId]`
* [ ] `/screens/*` 24

---

# 154. Quality Gate

반드시:

```text
npm run typecheck
npm run lint
npm run build
```

PASS.

---

# 155. Responsive

필수:

```text
360
390
430
```

확인:

* long Item Name
* Last / Next
* CTA
* tags wrap
* note 500 chars
* cycle editor
* weekday chips
* History rows
* horizontal overflow

---

# 156. Accessibility

필수:

* Back
* Complete CTA
* edit buttons
* Save / Cancel
* Tag remove
* Cycle controls
* History heading
* focus states

---

# 157. R8 구현 전 Codex 분석

이 문서를 저장했다고 바로 구현하지 않는다.

먼저 현재 `ItemDetailDemo.tsx`를 실제로 분석한다.

---

# 158. 반드시 분석할 항목

1. 현재 ItemDetailDemo 전체 구조
2. 큰 card / shadow 사용 위치
3. icon tile 위치
4. status 표시 위치
5. last performed 표시 위치
6. next due 표시 위치
7. D-Day 표시 위치
8. Name edit 구현
9. Tags edit 구현
10. Note edit 구현
11. Cycle edit 구현
12. metadata local state
13. Provider updateItemMetadata 연결
14. Cycle Store update 연결
15. History rendering
16. Item Complete CTA 존재 여부
17. `/record?item=` 연결 방식
18. UnifiedComposer 직접 호출 가능 여부
19. route context가 item name 변경 후 안전한지
20. Demo Store source
21. static demoItems 참조 존재 여부
22. NO_HISTORY rendering
23. NO_CYCLE rendering
24. DUE/UPCOMING/NORMAL rendering
25. ARCHIVED rendering
26. `/screens/*` 영향
27. Home / Month sync 영향
28. 예상 변경 파일
29. R8 blocker
30. R8 착수 가능 여부

---

# 159. 정책 A — Complete CTA 연결

Codex는 다음 중 가장 안전한 방식을 제안한다.

A.

```text
/items/[itemId]
→ /record?item={itemId}
```

B.

```text
Detail 내부 UnifiedComposer Sheet
```

기존 R4 architecture 재사용성과
사용자 동선을 근거로 판단.

새 Record 로직 구현 금지.

---

# 160. 정책 B — Edit 방식

다음 중 하나 제안.

A.

```text
각 section 개별 수정
```

B.

```text
전체 수정 mode
```

권장 A.

현재 R5/R6 edit 구조와 충돌 없는지 확인.

---

# 161. 정책 C — Last/Next Layout

A.

```text
2-column
```

B.

```text
vertical stack
```

360px까지 고려해 현재 UI에 적합한 방향 결정.

반응형으로 두 방식을 조합 가능.

---

# 162. 정책 D — History limit

현재 Demo history 길이를 보고:

```text
전체 표시
```

또는:

```text
최근 10개
```

중 선택.

불필요한 pagination 구현 금지.

---

# 163. 분석 보고 형식

```text
07_ITEM_DETAIL_SPEC 검증

1. Current Detail structure
2. Current visual problems
3. Store / derived data source
4. Status / Last / Next
5. Complete CTA strategy
6. Name edit
7. Tags edit
8. Note edit
9. Cycle edit
10. History
11. NO_HISTORY / NO_CYCLE
12. Edit UX policy
13. Last/Next layout policy
14. Responsive risk
15. Accessibility
16. Fixture impact
17. 예상 변경 파일
18. R8 시작 가능 여부

Status:
PASS / PARTIAL / BLOCKED
```

---

# 164. STOP RULE

이 문서를 읽었다고 R8을 자동 시작하지 않는다.

Codex는 분석 후 멈춘다.

사용자가 명시적으로:

```text
R8 진행해
```

라고 하기 전까지 코드 수정 금지.

R8 완료 후 Global Visual Polish를 자동 시작하지 않는다.

---

# 165. R8 완료 보고 필수 항목

반드시 보고:

1. 변경 파일
2. Detail 구조 Before/After
3. Header
4. Item identity
5. Lifecycle
6. Last Performed
7. Next Due
8. D-Day
9. Complete CTA
10. Composer 연결 방식
11. auto save 0
12. Name edit
13. Tags edit
14. Note edit
15. Cycle edit
16. Store sync
17. History
18. History ordering
19. NO_HISTORY
20. NO_CYCLE
21. DUE
22. UPCOMING
23. NORMAL
24. card nesting 감소
25. shadow 감소
26. icon tile 처리
27. Tags wrap
28. Note long text
29. Cycle UI
30. HOME sync
31. `/items` sync
32. Month sync
33. Activity save sync
34. R4 regression
35. R5 regression
36. R6 regression
37. R7 regression
38. `/record`
39. `/record?item=`
40. `/items`
41. `/items/[itemId]`
42. `/screens/*` 24
43. typecheck
44. lint
45. build
46. 360/390/430
47. horizontal overflow
48. accessibility
49. git diff
50. unexpected changes
51. Global Visual Polish NOT STARTED

최종 판정:

PASS
PARTIAL
BLOCKED


