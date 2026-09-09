# LASTLY — Tag / Note Functional Specification

## 문서 목적

이 문서는 LASTLY의 관리 항목에 존재하는 세부 정보를:

- Tag
- Note
- Alias

세 가지 개념으로 명확히 분리하고,
HOME / Item Detail / Record Confirmation / Query / Matching에서
각 정보가 어떤 책임을 가지는지 정의한다.

이 문서는 **R5 — Tag / Note 구현의 Source of Truth**다.

현재 Demo 모델의 `memo`는 여러 의미를 혼합해서 사용하고 있기 때문에
R5에서는 이를 명시적인 `tags[]`와 `note` 구조로 분리한다.

기존 문서와 충돌하는 경우 우선순위는 다음과 같다.

1. `docs/00_CHANGE_REQUEST.md`
2. `docs/01_UPDATED_IA.md`
3. `docs/02_HOME_UI_UX_SPEC.md`
4. `docs/03_VOICE_QUERY_RECORD_SPEC.md`
5. `docs/04_TAG_NOTE_SPEC.md`
6. 기존 G0 Freeze 문서

---

# 1. 핵심 정의

LASTLY에서는 다음 세 가지를 서로 다른 개념으로 취급한다.

```text
Alias
Tag
Note

세 개를 혼용하지 않는다.

2. Alias 정의

Alias는 같은 Item을 부르는 다른 표현이다.

예:

Item
이불 세탁

Alias
이불 빨래
이불 빨기
이불 빨다

또 다른 예:

Item
정수기 필터 교체

Alias
정수기 필터 갈기
정수기 필터 바꾸기
필터 교체

Alias의 목적은 Item Matching이다.

Alias는 사용자에게 HOME subtitle로 보여주는 세부 대상이 아니다.

3. Tag 정의

Tag는 하나의 Item 안에서 관리하는 세부 대상이다.

예:

Item
이불 세탁

Tags
아이 이불
아빠 이불

또 다른 예:

Item
신발 세탁

Tags
아이 신발
엄마 신발
아빠 신발
나이키 운동화

즉:

이불 빨래

는 Alias가 될 수 있지만,

아이 이불

은 Tag다.

4. Note 정의

Note는 Item과 관련된 자유 메모다.

예:

Item
이불 세탁

Note
겨울 이불까지 같이 세탁함

또는:

Item
정수기 필터 교체

Note
다음에는 2개 묶음으로 주문하기

Note는 구조화된 세부 대상을 저장하는 용도가 아니다.

5. 세 개념 비교
구분	의미	예
Item	관리 대상 자체	이불 세탁
Alias	Item의 다른 표현	이불 빨래
Tag	Item 내부 세부 대상	아이 이불
Note	자유 메모	겨울 이불까지 같이 세탁함
6. 잘못된 사용 예

다음 구조는 금지한다.

memo = "아이 이불 · 아빠 이불 · 겨울 이불도 세탁"

이 경우 구조가 섞여 있다.

올바른 구조:

tags: ["아이 이불", "아빠 이불"]

note: "겨울 이불까지 같이 세탁함"
7. 현재 Demo 모델 문제

현재 Demo Item에는 다음과 같은 구조가 존재한다.

memo: string

하지만 이 memo는 fixture마다 다음 용도로 혼합 사용되고 있다.

Tag Summary
Detail Memo
설명문
세부 대상
자유 메모

R5에서는 이 구조를 명확히 분리한다.

8. R5 이후 Demo Item 권장 구조

R5 이후 Demo Item은 최소 다음 구조를 가진다.

type DemoItem = {
  id: string;
  name: string;

  tags: string[];
  note: string | null;

  ...
};

기존 Lifecycle / Cycle / History 등 필드는 유지한다.

9. Alias 구조

Alias는 Item 본체와 별도 책임으로 유지한다.

현재 별도 Demo Matching Alias Map이 존재한다면 유지 가능하다.

예:

itemAliases = {
  bedding: [
    "이불 빨래",
    "이불 빨기",
  ],
};

R5에서 Alias를 tags[] 안으로 이동시키면 안 된다.

10. memo Migration 원칙

R5에서 기존 Demo fixture의 memo를 그대로 제거하기 전에
각 값이 실제로 어떤 의미인지 분류한다.

예:

아이 이불 · 아빠 이불

→ tags

주방 정수기

→ tag 또는 세부 대상

겨울철 대비

→ note 성격

11. Migration 방식

가능한 fixture는 명시적으로 다음과 같이 변환한다.

기존:

{
  name: "이불 세탁",
  memo: "아이 이불 · 아빠 이불"
}

변경:

{
  name: "이불 세탁",
  tags: ["아이 이불", "아빠 이불"],
  note: null
}
12. Note가 있는 예
{
  name: "이불 세탁",
  tags: ["아이 이불", "아빠 이불"],
  note: "겨울 이불까지 같이 세탁함"
}
13. 빈 Tag

Tag가 없는 Item은:

tags: []

를 사용한다.

null을 사용하지 않는다.

14. 빈 Note

Note가 없으면:

note: null

을 사용한다.

빈 문자열을 canonical value로 사용하지 않는다.

입력 UI에서 빈 문자열은 저장 전 null로 normalize한다.

15. Tag 개수

MVP에서 한 Item의 Tag는 과도하게 늘어나지 않도록 한다.

권장:

0 ~ 10개

Hard Limit을 구현할 경우:

10개

를 기본값으로 한다.

16. Tag 문자열

권장:

앞뒤 공백 제거
빈 문자열 금지
동일 Item 내 중복 Tag 금지
너무 긴 Tag 금지

권장 최대 길이:

30자
17. Note 길이

MVP 권장 최대:

500자

필요하면 기존 UI input length policy와 맞춰 사용할 수 있다.

18. Tag 중복 처리

예:

아이 이불
아이 이불

저장 시:

["아이 이불"]

한 개만 유지한다.

비교 시 trim된 exact value 기준으로 중복 제거 가능하다.

19. Tag 순서

Tag는 사용자가 입력한 순서를 기본적으로 유지한다.

자동 alphabetical sort 금지.

예:

[
  "아이 이불",
  "아빠 이불",
  "겨울 이불"
]

사용자가 의도한 순서 유지.

20. HOME Tag 표시

HOME Flat Row에서는 Tag Summary를 표시한다.

예:

이불 세탁                       D+2
아이 이불 · 아빠 이불
────────────────────────────
21. HOME Note 표시

HOME 기본 Row에서는 Note를 표시하지 않는다.

금지:

이불 세탁                       D+2
아이 이불 · 아빠 이불
겨울 이불까지 같이 세탁함

HOME은 빠른 스캔이 목적이다.

Note는 Item Detail에서 확인한다.

22. HOME Tag가 없는 경우

Tag가 없으면 subtitle을 억지로 만들지 않는다.

예:

냉장고 정리                  기록 없음
────────────────────────────

빈 공간을 메모 문장으로 채울 필요 없다.

23. HOME Tag Summary

여러 Tag가 있는 경우:

아이 이불 · 아빠 이불 · 겨울 이불

형태로 연결한다.

구분자:

 · 

를 기본으로 한다.

24. HOME Overflow

Tag Summary는 한 줄을 기본으로 한다.

필요 시:

ellipsis

사용.

Row 높이가 Tag 개수에 따라 계속 늘어나지 않도록 한다.

25. Item Detail 구조

R5 이후 Item Detail에는 Tag와 Note가 별도 영역으로 보여야 한다.

예:

← 이불 세탁

D+2

태그
[아이 이불] [아빠 이불]

메모
겨울 이불까지 같이 세탁함

관리 주기
2주마다

지난 기록
9월 1일
8월 15일
8월 1일
26. Tag UI

Item Detail의 Tag는 chip 또는 작은 pill 형태로 표시 가능하다.

권장:

작은 radius
subtle background
neutral tone
과도한 컬러 없음

Tag마다 빨/노/초 상태색 사용 금지.

27. Note UI

Note는 일반 text block으로 표시한다.

Card 안의 또 다른 강한 Card 구조는 피한다.

예:

메모

겨울 이불까지 같이 세탁함
28. Item Edit

R5에서 Item Edit UI는 최소 다음을 수정할 수 있어야 한다.

name
tags
note

기존 cycle edit는 그대로 유지한다.

Cycle 구조 자체는 R6에서 변경한다.

29. Tag 입력 UX

권장 방식:

태그

[ 아이 이불 × ]
[ 아빠 이불 × ]

[ + 태그 추가 ]

또는 입력창에서 Enter로 추가 가능.

30. Tag 입력 금지 UX

다음 방식은 피한다.

아이 이불,아빠 이불,겨울이불

하나의 문자열 field로만 관리.

내부 데이터는 반드시:

string[]

이어야 한다.

31. Tag 삭제

Tag chip의 삭제 버튼 또는 Edit UI에서 제거 가능해야 한다.

삭제는 Item 자체 삭제가 아니다.

32. Note Edit

Note는 textarea 사용 가능.

예:

세부 메모

[ 겨울 이불까지 같이 세탁함       ]
33. Record Confirmation과 Tag

R4 Confirmation에는 현재:

Action
Date
Matched Item

이 있다.

R5에서는 Tag 후보를 추가할 수 있다.

34. Parser Tag Candidate

Parser가 사용자 문장에서 세부 대상을 발견할 수 있다.

예:

오늘 아빠 이불 빨았어

가능한 해석:

Action:
이불 세탁

Tag Candidate:
아빠 이불
35. Parser 자동 Tag 확정 금지

AI가 Tag Candidate를 제안할 수는 있지만,
새 Tag를 사용자 확인 없이 Item에 추가하면 안 된다.

즉:

AI proposal
→ User confirmation
→ Tag save
36. Parser Tag Candidate 책임

Parser가 할 수 있는 것:

"아빠 이불"

같은 세부 대상 문자열 후보 추출.

Parser가 하지 않는 것:

item_id 선택
existing tag id 선택
새 Tag 자동 저장
Tag 변경 자동 반영
37. Parser Contract 확장

현재 Parser Contract를 깨지 않는 범위에서
Segment에 optional Tag Candidate를 추가할 수 있다.

권장 개념:

tag_candidates?: string[];

또는 현재 Schema naming convention에 맞는 동등한 구조.

기본값:

[]
38. Parser Contract 확장 시 원칙

기존 필수 Contract를 깨지 않는다.

다음 필드는 그대로 유지한다.

intent
scope
normalized_action
performed_date
clarification
record_candidate
item_match

Tag Candidate는 optional enrichment다.

39. Mock AI

R5에서 Mock AI에도 Tag Candidate 테스트 fixture를 추가한다.

예:

오늘 아빠 이불 빨았어

Expected:

intent = COMPLETED
normalized_action = "이불 세탁"
tag_candidates = ["아빠 이불"]
40. 기존 Query와 Tag

R5 이후 다음 Query를 지원할 수 있어야 한다.

아빠 이불 언제 빨았지?
41. Query Matching 순서

권장 개념:

1. Item Name
2. Alias
3. Exact Tag
4. Existing fuzzy/similarity

단 정확한 세부 구현은 현재 Matching architecture와 충돌하지 않도록 한다.

42. Parser가 Matching하지 않음

다시 명시:

Parser
→ action / tag candidate
Matching Layer
→ Item candidate

Parser가 아빠 이불을 보고 직접:

item_id = bedding

으로 결정하면 안 된다.

43. Tag 기반 Item Matching

예:

Item:

이불 세탁

Tags:

아이 이불
아빠 이불

사용자:

아빠 이불 언제 빨았지?

Matching Layer는 아빠 이불 exact tag를 통해
이불 세탁 Item을 후보로 찾을 수 있다.

44. Tag가 여러 Item에 존재할 경우

예:

Item A:

이불 세탁
Tag: 아이 것

Item B:

신발 세탁
Tag: 아이 것

사용자:

아이 것 언제 했지?

임의 확정 금지.

Ambiguous 후보를 표시한다.

45. Query Result

Tag가 특정된 Query Result는 가능하면 세부 대상을 표시한다.

예:

아빠 이불은
9월 1일에 기록했어요.

[이불 세탁 보기]
46. Activity와 Tag 관계

R5에서 중요한 원칙:

Item Tag와 Activity History는 서로 다른 데이터다.

Item.tags

는 Item의 세부 관리 대상 목록.

Activity History는 실제 수행 사건.

47. Activity Tag Snapshot

R5 MVP에서는 Activity마다 Tag Snapshot을 반드시 저장할지 여부를 신중히 다룬다.

최소 MVP 기준으로는:

Item tags는 Item metadata
Activity는 수행 이력

으로 유지할 수 있다.

48. Activity Tag 확장

향후 정확히:

아빠 이불만 빨았다

같은 세부 이력을 장기 조회하려면
Activity에 수행 Tag Snapshot이 필요할 수 있다.

예:

activity.tags = ["아빠 이불"]

하지만 R5에서 이를 무조건 구현할 필요는 없다.

49. R5 MVP 결정

이번 R5의 필수 범위는:

Item-level Tags
+
Item-level Note
+
Tag-aware display
+
Tag-aware Matching
+
optional Parser Tag Candidate

이다.

Activity-level Tag History는 이번 단계의 필수 조건이 아니다.

50. Activity Source of Truth 유지

Tag/Note를 추가한다고 Activity History 원칙을 변경하지 않는다.

다음은 계속 Activity에서 파생한다.

마지막 수행일
D-Day
다음 관리일
수행 횟수
월별 수행 기록
51. Note와 Matching

Note는 검색 보조 정보로 사용할 수 있다.

예:

Note:
안방 큰 이불

사용자가:

안방 큰 이불 언제 빨았지?

라고 하면 후보 검색에 활용 가능하다.

52. Matching 우선순위에서 Note

Note는 Tag보다 약한 신호로 취급하는 것을 권장한다.

개념:

Exact Item Name
→ Exact Alias
→ Exact Tag
→ Note
→ Fuzzy

현재 Matching 구조에 맞게 구현 가능.

53. Note 자동 Alias 금지

Note 문자열을 자동으로 Alias에 등록하지 않는다.

예:

Note:
겨울에만 사용하는 이불

이 문장 전체가 자동 Alias가 되면 안 된다.

54. Tag 자동 Alias 금지

Tag 역시 자동 Alias로 복사하지 않는다.

다만 Matching Layer는 Tag를 검색 signal로 사용할 수 있다.

55. Alias 자동 Tag 금지

Alias를 자동 Tag로 표시하지 않는다.

56. Item Detail Edit State

기존 Item Detail의 local-only edit가 있다면
R5에서는 Product Demo Store와 연결하여
HOME과 Detail이 동일 Item metadata를 보도록 하는 것이 목표다.

현재 화면만 바뀌고 HOME에서는 이전 값이 보이는 구조는 피한다.

57. Demo Store 확장

R4에서 추가된 Product Demo Runtime Store를 재사용한다.

권장 Store 책임 추가:

updateItemMetadata(...)

예:

updateItemMetadata({
  itemId,
  name,
  tags,
  note
})
58. Fixture 직접 Mutation 금지

기존 원칙 유지.

금지:

demoItems[index].tags.push(...)

또는:

demoItems[index].note = ...

Product runtime store에서 immutable update한다.

59. Demo 초기 데이터

R5에서는 기존 fixture를 structuredClone한 Product Runtime Data에
tags/note를 포함시킨다.

Fixture asset 자체와 Product runtime state 책임을 구분한다.

60. /items 검색

기존 /items 검색이:

item.name + memo

를 사용하고 있다면 R5 이후 다음으로 변경한다.

item.name
+
tags
+
note

Alias를 현재 Product search에 포함시킬지는 Matching helper 재사용 여부에 따라 결정 가능하다.

61. HOME Row

기존 R3에서 memo를 subtitle로 임시 사용하고 있다.

R5에서는 이를 실제:

item.tags.join(" · ")

으로 교체한다.

62. HOME Note 금지

R5 이후에도 HOME Row에서 note를 기본 표시하지 않는다.

63. NO Tag HOME

Tag 없는 항목:

보일러 점검                     주기 없음
────────────────────────────

처럼 subtitle 없이 표시할 수 있다.

64. Detail Summary

Item Detail 상단에서 현재 memo를 subtitle처럼 사용하고 있다면
R5 이후:

tags summary
note

를 분리한다.

65. Detail 권장 순서
Item Name

D-Day

Tags

Note

Cycle

Activity History

Actions

R6/R8에서 세부 구조가 다시 조정될 수 있다.

R5에서는 Tag/Note 분리에 필요한 최소 UI만 변경한다.

66. Item Detail Cycle

R5에서는 기존 cycleDays / cycleLabel 구조를 유지한다.

Cycle을 day/week/month로 바꾸지 않는다.

그 작업은 R6다.

67. Item Detail History

R5에서 Activity History 구조를 변경하지 않는다.

68. Record Confirmation Tag Candidate

예:

입력:

오늘 아빠 이불 빨았어

Confirmation:

이렇게 기록할까요?

항목
이불 세탁

날짜
오늘

세부 대상
[아빠 이불]

[취소] [기록하기]
69. Existing Tag Candidate

AI 제안한 Tag가 기존 Item Tag와 exact match하면
기본 선택 상태로 제안할 수 있다.

단 사용자 확인 전 저장하지 않는다.

70. New Tag Candidate

AI가 기존에 없는 Tag를 제안하면:

새 태그
아기방 이불

처럼 구분할 수 있다.

자동 추가 금지.

71. 사용자가 Tag Candidate를 거절

사용자가 candidate를 해제하면
Activity 기록은 Tag 추가 없이 저장 가능해야 한다.

Tag가 Record 자체의 mandatory field가 되면 안 된다.

72. Note와 Record

R5에서 자연어 기록마다 Note를 자동 생성하는 기능은 구현하지 않는다.

예:

오늘 이불 빨았어. 얼룩이 많았어.

AI가 임의로:

note = "얼룩이 많았음"

을 Item Note에 자동 덮어쓰면 안 된다.

73. Item Note 변경 권한

Item Note는 사용자가 명시적으로 수정하는 metadata다.

Record 문장에서 추론된 내용을 자동으로 Item Note에 저장하지 않는다.

74. Tag 변경 권한

Tag도 사용자 최종 확인 대상이다.

75. 신규 Item 생성

R4에서 "새 항목으로 기록"이 가능하다면
신규 Item 생성 시 기본값:

tags: []
note: null

으로 생성한다.

76. 신규 Item + Tag Candidate

예:

오늘 거실 카펫 빨았어

새 Item:

카펫 세탁

Tag Candidate가 없으면:

tags: []
77. Tag 입력 Sanitization

R5에서 Tag는 최소 다음 normalization을 거친다.

trim
remove empty
deduplicate
78. Note Sanitization

Note:

trim

후 빈 값이면:

null
79. Unicode / 한글

Tag와 Note는 한글 입력을 기본 지원한다.

Emoji를 기술적으로 완전히 금지할 필요는 없지만
MVP UX에서 Emoji Tag를 적극 권장하지 않는다.

80. 검색 Normalize

Matching/Search에서 최소:

trim
case normalization

을 사용할 수 있다.

한국어 spacing 변형 대응은 기존 matching helper와 조합 가능하다.

81. Tag exact match

Tag exact match는 fuzzy보다 강한 signal이다.

예:

아빠 이불

이 exact Tag라면
단순 문자열 유사도보다 우선할 수 있다.

82. Alias exact match

Alias exact match 역시 강한 signal.

Item Name / Alias / Tag 간 정확한 scoring 정책은
현재 matching architecture를 분석한 뒤 최소 변경으로 확정한다.

83. Query Ambiguity

Tag를 추가했다고 ambiguity safety를 약화시키면 안 된다.

후보가 2개 이상 명확히 경쟁하면:

어떤 기억을 찾을까요?

사용자 선택.

84. Parser Tag Candidate 예시
Case A

입력:

오늘 아빠 이불 빨았어

Expected concept:

{
  "intent": "COMPLETED",
  "normalized_action": "이불 세탁",
  "tag_candidates": ["아빠 이불"]
}
85. Parser Tag Candidate 예시 B

입력:

아이 신발 언제 빨았지?

Expected:

intent = QUERY
tag candidate = 아이 신발

Activity 저장 없음.

86. Tag Candidate 없는 입력
오늘 이불 빨았어

Expected:

tag_candidates: []

가능.

Tag 추출을 억지로 하지 않는다.

87. Note Parser 비대상

R5 MVP에서는 Parser가 note_candidate를 생성하는 것을 필수로 하지 않는다.

Note는 사용자 편집 중심.

88. R5 Data Model 범위

R5에서 변경 가능:

DemoItem type
Demo fixture
Demo runtime store
Product HOME
Item Detail
Items search
Matching helper
Parser schema optional tag candidate
Mock AI fixtures
Unified Composer confirmation
89. R5에서 변경하지 않을 것
Supabase production schema
migration SQL
Auth
RLS
API persistence
day/week/month cycle
Monthly View
notification scheduler
Push
Activity History fundamental schema
Activity tag history 필수화
alias learning
embedding search
90. 향후 DB 구조

R5에서는 실제 Runtime DB migration을 실행하지 않는다.

하지만 미래 DB 명세는 최소 다음을 지원해야 한다.

개념적으로:

management_items
- id
- name
- note
- ...

item_tags
또는
management_items.tags

정규화 방식은 Phase 2 DB 명세에서 결정한다.

R5에서 성급하게 production DB schema를 확정하지 않는다.

91. Tags DB 후보

미래 선택지는 크게 두 가지다.

A
management_items.tags JSON/array
B
item_tags
- id
- item_id
- label

R5 Demo 구현에서는 둘 중 하나를 production 결정으로 확정하지 않는다.

92. Alias DB

기존 item_aliases 개념은 유지한다.

Tag DB와 Alias DB를 합치지 않는다.

93. R5 구현 순서

권장:

1. 현재 memo 사용처 조사
2. DemoItem tags/note model 추가
3. fixture migration
4. Demo Store metadata update
5. HOME subtitle 변경
6. Item Detail Tag/Note UI
7. Item Edit 연결
8. /items search 변경
9. Matching tag support
10. optional Parser tag candidate
11. Confirmation candidate UI
12. regression
94. 기존 Memo 제거 전략

memo를 즉시 삭제하기 전에 실제 사용처를 모두 검색한다.

확인:

HOME
/items
Item Detail
Matching
Fixture screens
tests
any helper

Product에서 모든 참조가 교체됐음을 확인한 뒤 제거한다.

Fixture가 기존 memo에 의존하면 compatibility를 유지할 수 있다.

95. Product / Fixture 분리

Product Demo Item과 Fixture Screen model이 같은 타입을 공유하고 있다면
R5에서 /screens/*가 깨질 위험을 분석한다.

필요하다면:

compatibility field 유지
adapter
derived memo

등을 사용한다.

Fixture 24개를 임의 수정하지 않는다.

96. Compatibility memo

R5 중간 단계에서 필요하다면 임시로:

memo?: string

을 compatibility field로 유지할 수 있다.

단 Product Source of Truth는:

tags
note

가 되어야 한다.

97. Derived Memo 금지 여부

Product 내부에서 다시:

memo = tags.join(" · ")

을 canonical state로 저장하지 않는다.

표시용 derived value는 가능.

예:

const tagSummary = item.tags.join(" · ");
98. Item Rename

Item 이름 수정 시 Alias를 자동 변경/삭제하지 않는다.

Alias 관리 정책은 별도.

99. Tag Rename

Tag 변경이 기존 Activity History를 수정하면 안 된다.

Item metadata만 변경.

100. Note 수정

Note 수정이 Activity History를 수정하면 안 된다.

101. Search Test

예:

Item:

이불 세탁
tags = ["아이 이불", "아빠 이불"]
note = "겨울 이불까지 같이 세탁함"

Search:

아빠 이불

Expected:

이불 세탁
102. Note Search Test

Search:

겨울 이불

Expected:

이불 세탁

가능.

103. Alias Search Test

Query:

이불 빨래 언제 했지?

Expected:

이불 세탁 match

Alias 기능 회귀 없음.

104. Tag Query Test

Query:

아빠 이불 언제 빨았지?

Expected:

QUERY
candidate false
이불 세탁 match
Activity mutation 0
105. Tag Record Test

Input:

오늘 아빠 이불 빨았어

Expected:

COMPLETED
candidate true
Item = 이불 세탁
Tag Candidate = 아빠 이불
Confirmation

자동 저장 없음.

106. Note Mutation Test

Item Detail:

Note:
겨울 이불까지 같이 세탁함

수정:

겨울 이불은 다음 달에 따로 세탁

Expected:

Item Detail 즉시 반영
HOME 기본 Row에는 Note 노출 없음
Activity History 변화 없음
107. Tag Mutation Test

기존:

["아이 이불", "아빠 이불"]

변경:

["아이 이불", "아빠 이불", "겨울 이불"]

Expected:

Item Detail 반영
HOME Tag Summary 반영
Activity History 변화 없음
108. Delete Tag Test
아빠 이불 삭제

Expected:

["아이 이불"]

Activity History 그대로.

109. Empty Tag Test
tags = []

Expected:

HOME subtitle 없음
layout 깨짐 없음
Item Detail "태그 없음" 또는 Add UI 표시 가능
110. Empty Note Test
note = null

Expected:

Item Detail:

메모 없음

또는:

메모 추가

CTA 가능.

HOME 영향 없음.

111. Duplicate Tag Test

입력:

아이 이불
아이 이불

Expected:

["아이 이불"]
112. Tag Limit Test

10개 제한을 적용한다면 11번째 추가 시:

기존 10개 유지
11번째 저장하지 않음
사용자에게 명확한 안내

Silent truncation 금지.

113. R5 Acceptance — Data
 tags: string[]
 note: string | null
 Alias와 분리
 Product에서 memo canonical 사용 종료
 Fixture 호환 유지
114. R5 Acceptance — HOME
 HOME subtitle은 tags 기반
 구분자 ·
 한 줄 ellipsis
 Note 기본 미노출
 Tag 없을 때 layout 정상
 R2 filter 유지
 R3 flat row 유지
115. R5 Acceptance — Item Detail
 Tags 별도 표시
 Note 별도 표시
 Tags 수정 가능
 Note 수정 가능
 이름 수정 유지
 Cycle 기존 동작 유지
 History 유지
116. R5 Acceptance — Store
 Item metadata immutable update
 fixture direct mutation 없음
 HOME/Items/Detail 동일 Product store 사용
 edit 후 다른 Product 화면에도 반영
117. R5 Acceptance — Matching
 Item Name matching 유지
 Alias matching 유지
 Exact Tag matching 추가
 Note 검색 보조 가능
 Parser item_id 선택 안 함
 ambiguity safety 유지
118. R5 Acceptance — Parser

R5에서 Parser Tag Candidate를 구현하는 경우:

 optional candidate
 기존 schema 깨지지 않음
 candidate 자동 저장 없음
 COMPLETED/QUERY Intent 유지
 QUERY candidate false 유지

Parser Tag Candidate를 이번 R5에서 구현하지 않는 경우
그 이유와 후속 범위를 명확히 보고해야 한다.

단 Tag-aware Matching은 R5 필수다.

119. R5 Acceptance — Query
 "아빠 이불 언제 빨았지?"가 Record로 가지 않음
 QUERY
 Activity mutation 0
 Tag를 통해 Item 후보 탐색 가능
 ambiguous시 사용자 선택
120. R5 Acceptance — Record
 "오늘 아빠 이불 빨았어" 처리 가능
 자동 저장 없음
 Confirmation 유지
 Tag Candidate 자동 Item mutation 없음
 사용자 최종 확인
121. R5 Acceptance — Regression
 R1 IA 유지
 R2 Filter 유지
 R3 Flat List 유지
 R4 Unified Composer 유지
 Voice Runtime 유지
 COMPLETED 유지
 QUERY 유지
 False Completion 유지
 Multi Segment 유지
 Atomic Save 유지
 Activity History 유지
 /record 유지
 /record?item= 유지
 /items 유지
 /items/[itemId] 유지
 /screens/* 24개 유지
122. R5 금지사항

절대 하지 않는다.

Alias와 Tag 통합
Note를 Alias로 사용
Tag를 Alias로 자동 저장
Parser가 item_id 선택
Tag 자동 확정
Record 문장에서 Note 자동 덮어쓰기
Activity History를 Item metadata로 대체
Cycle 구조 변경
Calendar 구현
Supabase migration
Auth
Push
Fixture 원본 mutation
123. R5 Quality Gate

반드시:

npm run typecheck
npm run lint
npm run build

모두 PASS.

124. Responsive Gate

필수:

360px
390px
430px

확인:

Tag chip overflow
Tag edit keyboard
Note textarea
HOME tag summary ellipsis
Item Detail horizontal overflow
Confirmation tag candidate layout
125. Accessibility

Tag remove button:

aria-label

예:

아빠 이불 태그 삭제

Tag input:

visible label 또는 aria-label

Note:

label 필수

Chip 색상만으로 상태 전달하지 않는다.

126. R5 구현 전 Codex 분석

본 문서를 추가한 직후 R5를 바로 시작하지 않는다.

먼저 현재 R4 코드와 실제 memo 사용처를 전부 조사한다.

127. 반드시 분석할 항목
DemoItem.memo 정의 위치
모든 memo fixture 값
HOME의 memo 사용
/items의 memo 사용
Item Detail의 memo 사용
Matching의 memo 사용 여부
/screens/*의 memo 의존 여부
DemoActivityProvider 신규 Item memo 생성 위치
tags[] / note 추가 시 Type 영향
Alias 현재 저장 위치
Alias Matching 현재 구조
Tag exact matching을 추가할 가장 안전한 위치
Note 검색을 추가할 위치
Parser schema에 optional Tag Candidate 추가 가능 여부
Mock Provider 영향
UnifiedComposer Confirmation 영향
기존 R4 multi segment 영향
Demo Store metadata update 필요 범위
Item Detail edit local state를 Store로 옮길 방법
/items search 변경 범위
Fixture regression 위험
R5 예상 변경 파일
R5 blocker
R5 착수 가능 여부
128. 분석 시 중요한 질문

Codex는 특히 다음을 답해야 한다.

현재 memo 값을 자동으로 split(" · ")해도 안전한가?

모든 fixture가 같은 의미가 아닐 수 있으므로
자동 변환을 가정하지 않는다.

각 fixture를 실제로 확인한다.

129. Parser 변경 판단

Codex는 분석 후:

A. R5에서 Parser Tag Candidate까지 구현

또는:

B. 현재 Parser Contract 영향이 너무 커서
   R5에서는 Item Tag Model + Matching까지만 구현하고
   Parser Candidate는 후속

중 어느 방향이 안전한지 근거를 제시한다.

단,

아빠 이불 언제 빨았지?

같은 Tag Query Matching은 R5에서 가능해야 한다.

130. R5 분석 보고 형식
04_TAG_NOTE_SPEC 검증

1. Current memo 구조
2. memo fixture 의미 분류
3. HOME 영향
4. /items 영향
5. Item Detail 영향
6. Demo Store 영향
7. Alias 구조
8. Tag Matching 전략
9. Note Search 전략
10. Parser Tag Candidate 전략
11. Unified Composer 영향
12. Fixture 영향
13. 예상 변경 파일
14. Migration 위험
15. R5 시작 가능 여부

Status:
PASS / PARTIAL / BLOCKED
131. STOP RULE

이 문서를 읽었다고 R5를 자동 시작하지 않는다.

Codex는 분석 보고 후 멈춘다.

사용자가 명시적으로:

R5 진행해

라고 하기 전까지 코드 수정 금지.

R5 완료 후에도 R6를 자동 시작하지 않는다.

132. R5 완료 보고 필수 항목

R5 완료 후 반드시 보고:

변경 파일 목록
DemoItem model 변경
기존 memo 처리
tags 구조
note 구조
Alias 유지 방식
Demo fixture migration
HOME Tag Summary
HOME Note 미노출 확인
Item Detail Tags
Item Detail Note
Tag edit
Note edit
Product Store metadata update
/items search
Tag Matching
Note Search
Parser Tag Candidate 구현 여부
Mock Provider 영향
Unified Composer 영향
"오늘 아빠 이불 빨았어" 테스트
"아빠 이불 언제 빨았지?" 테스트
QUERY no mutation
Activity History 영향
Cycle 영향 없음
/record
/record?item=
/items
/items/[itemId]
/screens/* 24개
typecheck
lint
build
360px
390px
430px
git diff
예상하지 못한 변경
R6 미착수 확인

최종 판정:

PASS
PARTIAL
BLOCKED