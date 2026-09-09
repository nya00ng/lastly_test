# LASTLY — Change Request / Rebaseline

## 문서 목적

이 문서는 기존 G0 Specification Freeze 이후 진행된 MVP 구현, 팀 회의, 다른 두 팀의 MVP 비교 결과를 반영하여 LASTLY의 정보구조(IA), 핵심 UX, 기록/조회 흐름, 상태 필터, 주기 관리, 월별 보기, 태그/메모 기능을 공식적으로 재기준화하기 위한 Change Request 문서다.

이 문서는 기존 명세 전체를 폐기하지 않는다.

기존 문서와 충돌하는 항목에 대해서만 본 문서가 우선한다.

---

# 1. 변경 배경

팀별 MVP를 비교한 결과 각 구현은 서로 다른 강점을 가지고 있었다.

## 1.1 우리 LASTLY에서 유지할 강점

- 홈에서 관리 상태를 한눈에 보여주는 구조
  - 관리 필요
  - 곧 관리
  - 괜찮아요
- 상태를 숫자로 즉시 파악할 수 있는 요약 구조
- D-Day 중심의 관리 시점 표현
- AI 자동 저장 금지
- False Completion 방지
- 저장 전 사용자 확인
- Activity History를 Source of Truth로 유지
- Parser와 Item Matching 책임 분리
- 태그/메모를 통한 세부 관리 대상 구분

---

## 1.2 nuuco MVP에서 가져올 강점

- 리스트형 메인 화면
- 리스트 / 월별 보기 전환
- 하나의 음성 입력에서 기록과 조회를 모두 처리하는 구조
- 사용자가 별도 검색 화면을 찾지 않아도 되는 자연어 UX
- 마이크 중심의 직관적인 입력 방식
- 조회 발화와 완료 발화를 구분하는 실제 사용 흐름

---

## 1.3 seb0070 MVP에서 가져올 강점

- 일 / 주 / 월 단위 관리 주기 선택
- 반복 간격 직접 조정
- 주 단위 요일 지정 가능 구조
- 별칭(alias)을 활용한 기존 항목 연결 개념
- 향후 제품화에 참고할 수 있는 서버 / AI / DB / Push 분리 구조

---

# 2. 제품 방향 재정의

기존 LASTLY는 기능 단위 화면이 분리되는 방향이 강했다.

기존 구조:

- 홈
- 기록하기
- 전체관리

변경 후에는 홈을 중심으로 사용 흐름을 단순화한다.

새로운 핵심 제품 문장:

> LASTLY에게 말하면, 한 일을 기록하고 지난 기억을 다시 찾을 수 있다.

핵심 흐름:

> 말한다 → 이해한다 → 확인한다 → 기억한다 → 필요할 때 다시 보여준다

LASTLY는 다음 서비스가 아니다.

- To-do 앱
- 일반 캘린더
- 일반 습관 체크 앱
- 메모장
- 일정 관리 앱

LASTLY의 핵심은 사용자가 이미 수행한 행동을 기억하고, 그 기록을 바탕으로 다음 관리 시점을 보여주는 것이다.

---

# 3. 변경사항

# CR-01. 홈 중심 IA로 변경

## 기존

최상위 구조:

- 홈
- 기록하기
- 전체관리

각 기능이 별도 화면으로 존재한다.

## 변경

홈을 MVP의 핵심 작업 공간으로 통합한다.

홈에서 아래 기능을 모두 접근할 수 있어야 한다.

- 관리 상태 확인
- 상태별 필터
- 전체 항목 접근
- 리스트 보기
- 월별 보기
- 음성 기록
- 음성 조회
- 텍스트 입력
- 항목 상세 진입
- 설정 진입

---

# CR-02. 하단 3메뉴 제거

## 기존

하단 메뉴:

- 홈
- 기록하기
- 전체관리

## 변경

MVP에서는 기존 하단 3메뉴를 제거한다.

이유:

- 기록하기는 홈에서 바로 실행 가능하다.
- 전체관리는 홈 리스트와 필터에서 처리할 수 있다.
- 기존 하단 메뉴는 실제 사용자 행동보다 기능 구조를 강제로 분리한다.
- LASTLY의 핵심 행동은 “메뉴를 이동하는 것”이 아니라 “말하거나 기록을 확인하는 것”이다.

대신 홈 하단에 Action Dock을 둔다.

Action Dock 핵심:

- 중앙 음성 버튼 1개
- 직접 입력 진입
- 기록과 조회를 동일 입력 인터페이스에서 처리

설정은 우측 상단 아이콘으로 접근한다.

---

# CR-03. 전체관리 페이지 요구사항 변경

## 기존

별도의 전체관리 페이지가 필수였다.

## 변경

별도 전체관리 페이지는 필수가 아니다.

대신 아래 조건은 반드시 만족해야 한다.

- 사용자가 모든 관리 항목에 접근 가능해야 한다.
- 상태 필터에 포함되지 않는 항목도 전체 보기에서는 접근 가능해야 한다.
- NO_HISTORY / NO_CYCLE 등 기존 Dashboard 제외 상태를 잃어버리면 안 된다.
- archived 항목은 별도 정책에 따라 접근 가능해야 한다.

즉:

> 전체관리 기능을 삭제하는 것이 아니라, 전체관리 기능을 홈으로 통합한다.

---

# CR-04. 상태 요약을 클릭 가능한 필터로 변경

## 기존

홈 상단에서 관리 상태 숫자를 표시하지만 버튼으로 동작하지 않는다.

## 변경

아래 3개 상태는 모두 클릭 가능한 필터가 되어야 한다.

- 관리 필요
- 곧 관리
- 괜찮아요

내부 상태 값:

- ALL
- DUE
- UPCOMING
- NORMAL

동작:

### DUE 클릭

관리 필요 항목만 표시.

### UPCOMING 클릭

곧 관리 항목만 표시.

### NORMAL 클릭

괜찮아요 항목만 표시.

### 선택 해제 또는 전체 보기

전체 항목 표시.

필터 숫자와 실제 해당 상태의 항목 수가 일치해야 한다.

---

# CR-05. 상태 컬러 사용 방식 변경

상태색은 유지한다.

다만 강한 원색을 사용하지 않는다.

권장 방향:

- DUE → 파스텔 레드
- UPCOMING → 파스텔 옐로
- NORMAL → 파스텔 그린

원칙:

- 아이콘 자체에 빨강 / 노랑 / 초록 라인 컬러를 반복 적용하지 않는다.
- 아이콘은 기본 중립색을 사용한다.
- 선택된 상태 영역의 배경, border, D-Day 등에 상태색을 제한적으로 사용한다.
- 색상만으로 상태를 전달하지 않는다.
- 아이콘, 숫자, 위치 등 다른 시각적 정보도 함께 제공한다.

---

# CR-06. 홈 리스트를 카드 중심에서 라인형 리스트 중심으로 변경

## 변경 방향

- 카드가 반복되는 UI를 줄인다.
- 얇은 border / divider 중심으로 구분한다.
- 충분한 여백을 사용한다.
- 항목명, 태그, D-Day를 빠르게 읽을 수 있어야 한다.
- 각 row 전체는 클릭 가능해야 한다.

예:

```text
이불 세탁                         D+2
아이 이불 · 아빠 이불
────────────────────────────

정수기 필터                       D-3
주방 정수기
────────────────────────────

칫솔 교체                         D-10
아이 칫솔 · 엄마 칫솔
홈에서 삭제할 것
"마지막 기록 32일 전"
불필요한 감성 배너
홈 상단 긴 설명 문구
반복적인 안내 문장

홈에서는 기록 경과일보다 관리 시점이 우선이다.

CR-07. D-Day 표기 우선

홈의 시간 정보는 D-Day를 기본으로 한다.

정의:

D-3 → 관리일까지 3일 남음
D-Day → 오늘 관리 예정
D+3 → 관리 예정일이 3일 지남

홈에서는:

마지막 32일 전

형식의 경과일 문구를 기본 정보로 사용하지 않는다.

실제 마지막 수행 날짜와 Activity History는 항목 상세에서 확인한다.

CR-08. 기록과 조회를 하나의 입력 인터페이스로 통합

사용자는 기록과 조회를 위해 별도 화면을 찾지 않는다.

같은 마이크 또는 텍스트 입력에서 Intent를 판별한다.

예:

오늘 이불 빨았어

결과:

COMPLETED
→ 기록 확인 흐름

다른 예:

이불 언제 빨았지?

결과:

QUERY
→ 조회 결과 흐름

별도 검색 화면은 만들지 않는다.

CR-09. 음성 UX 단순화

음성 입력은 중앙 마이크 버튼 1개를 핵심으로 한다.

원칙:

음성 버튼 여러 개 금지
검색용 마이크 / 기록용 마이크 분리 금지
사용자가 기능을 선택하기 전에 먼저 말할 수 있어야 한다
음성 인식 결과는 화면에서 확인 가능해야 한다
transcript 수정 가능
인식 실패 시 직접 입력 fallback 제공

권장 문구:

말해서 기록하거나 물어보세요

최초 사용자에게 보여줄 수 있는 예:

오늘 이불 빨았어
이불 언제 빨았지?
CR-10. 월별 보기 추가

홈에서 아래 View Toggle을 제공한다.

[ 리스트 ] [ 월별 ]

기본값:

리스트

월별 보기 목적:

실제 수행 기록을 시간 흐름으로 확인
관리 예정일 확인

월별 화면 표현 대상:

수행 기록
관리 예정

Generic To-do 일정은 추가하지 않는다.

날짜 선택 시 해당 날짜의:

기록
관리 예정

을 Bottom Sheet 또는 이에 준하는 UI로 보여준다.

CR-11. 관리 주기 데이터 구조 확장
기존

주로 day 기반 단일 cycle 값 중심.

예:

cycle_days = 14
변경

MVP 주기 지원:

없음
일
주
월

기본 데이터 개념:

unit: day | week | month
interval: integer >= 1
weekdays?: number[]

예:

3일마다
2주마다
1달마다
매주 토요일

MVP 제외:

년 단위
매월 셋째 화요일
매월 마지막 금요일
복잡한 nth-weekday 규칙
CR-12. 주기 결정 권한 유지

주기는 사용자가 최종 결정한다.

AI는 MVP에서 관리 주기를 자동 확정하지 않는다.

향후 충분한 Activity History가 쌓인 경우 추천 기능은 가능하다.

예:

최근 평균 17일 간격으로 기록했어요. 2주로 바꿀까요?

추천은 가능하지만 자동 변경은 금지한다.

CR-13. Tag와 Note 추가

각 Management Item은 세부 식별 정보를 가질 수 있다.

예:

이불 세탁
아이 이불 · 아빠 이불

데이터 개념:

tags: string[]
note: string | null
Tag

세부 관리 대상을 구분하기 위한 짧은 구조화 정보.

예:

아이 이불
아빠 이불
엄마 신발
나이키 운동화
Note

자유 텍스트 메모.

예:

겨울 이불까지 같이 세탁함
필터 모델 A123 사용

Tag와 Alias는 서로 다른 개념이며 혼용하지 않는다.

CR-14. Alias 유지

Alias는 같은 Management Item을 부르는 다른 표현이다.

예:

Management Item:

이불 세탁

Alias:

이불 빨래
이불 빨기

Tag:

아이 이불
아빠 이불

즉:

Alias = 같은 행동의 다른 표현
Tag = 같은 항목 내부의 세부 대상

둘을 혼용하지 않는다.

CR-15. Item Matching 책임 유지

Parser가 item_id를 직접 선택하지 않는다.

Parser는 다음 정보를 추출한다.

intent
action
date
scope
optional tag candidate
optional cycle candidate

Item Matching Layer가 다음 정보를 참고할 수 있다.

item name
exact tag
alias
normalized text
similarity

Matching 결과:

exact
candidate
ambiguous
new

애매한 경우 사용자 확인이 필요하다.

4. 기존 원칙 중 반드시 유지되는 사항

이번 Rebaseline에서도 아래 원칙은 변경하지 않는다.

4.1 기록 안전
AI 자동 저장 금지
사용자 확인 없이 Activity 저장 금지
False Completion은 Critical Blocker
PLANNED 저장 금지
NOT_COMPLETED 저장 금지
UNCERTAIN 자동 저장 금지
미래 완료일 저장 금지
4.2 지원 Intent

지원 Intent:

COMPLETED
PLANNED
NOT_COMPLETED
UNCERTAIN
QUERY
UNKNOWN

QUERY는 조회 전용이다.

QUERY에서 Activity를 생성하면 안 된다.

4.3 Parser 책임

Parser 책임:

intent
action
date
scope
구조화 후보

Parser는 Management Item의 item_id를 직접 확정하지 않는다.

4.4 Multi Action
최대 5 semantic actions
5개 초과 → TOO_MANY_ACTIONS
partial save 금지
다중 저장은 atomic

예:

이불 빨고 필터 바꾸고 칫솔 바꿨어

→ 3 actions

각 action 확인 후 하나의 저장 트랜잭션으로 처리 가능.

4.5 Data Source of Truth

Activity History가 Source of Truth다.

동일 항목을 다시 기록할 경우:

잘못된 방식:

lastDoneOn 값을 덮어씀

올바른 방식:

Activity #1
Activity #2
Activity #3

새 Activity를 추가한다.

Management Item의:

lastDoneOn
nextDueOn
D-Day
logCount
average interval

등은 Activity History에서 계산 또는 파생한다.

5. 변경 후 MVP 핵심 구조
LASTLY
│
├─ HOME
│  │
│  ├─ 상태 요약
│  │  ├─ 관리 필요
│  │  ├─ 곧 관리
│  │  └─ 괜찮아요
│  │
│  ├─ 상태 필터
│  │
│  ├─ View
│  │  ├─ 리스트
│  │  └─ 월별
│  │
│  ├─ 전체 항목 접근
│  │
│  ├─ 자연어 입력
│  │  ├─ 음성
│  │  └─ 텍스트
│  │
│  ├─ Intent
│  │  ├─ 기록
│  │  └─ 조회
│  │
│  └─ Item Detail 진입
│
├─ ITEM DETAIL
│  │
│  ├─ 항목명
│  ├─ 태그
│  ├─ 메모
│  ├─ D-Day
│  ├─ 관리 주기
│  ├─ Activity History
│  ├─ 오늘 했어요
│  ├─ 수정
│  └─ 삭제
│
└─ SETTINGS
6. Codex 구현 시 절대 금지

다음 행동은 금지한다.

IA / UI
기존 기능을 확인 없이 삭제
전체관리 페이지 삭제와 동시에 전체 항목 접근 기능까지 삭제
하단 메뉴 제거 후 기록 진입 경로 상실
상태 필터를 색상만으로 표현
카드 UI를 다시 과도하게 반복
Natural Language
QUERY를 Activity로 저장
PLANNED를 완료 기록으로 저장
NOT_COMPLETED를 완료 기록으로 저장
UNKNOWN을 자동 저장
사용자가 확인하지 않은 결과 자동 저장
Item Matching
Parser가 item_id 직접 확정
유사도가 낮은 항목을 자동 병합
Tag와 Alias 혼용
Data
Activity History를 lastDoneOn 단일 값 구조로 축소
과거 Activity 삭제 없이 수정 결과를 덮어쓰기
multi action partial save
Voice
음성 실패 시 fake transcript 생성
마이크 미지원 상태에서 성공한 것처럼 처리
transcript 수정 기능 삭제
Scope
Generic To-do 추가
일반 일정 등록 기능 추가
가족 공유 기능 임의 추가
예약 / 결제 / 소셜 기능 추가
7. 구현 우선순위

이번 Rebaseline은 한 번에 전체 구현하지 않는다.

순서:

R1 IA Rebaseline
↓
R2 Clickable Status Filter
↓
R3 List UI
↓
R4 Unified Record / Query
↓
R5 Tag / Note
↓
R6 Day / Week / Month Cycle
↓
R7 Monthly View
↓
R8 Item Detail
↓
R9 Regression

각 Task가 PASS 된 뒤 다음 Task로 이동한다.

8. Rebaseline Acceptance Criteria

아래가 모두 충족되어야 이번 Change Request가 정상 반영된 것으로 본다.

IA
 홈이 핵심 작업 공간이다.
 기존 하단 홈 / 기록 / 전체관리 3메뉴가 제거되었다.
 별도 전체관리 탭 없이 모든 관리 항목에 접근할 수 있다.
 설정 진입 경로가 존재한다.
Status
 관리 필요 상태를 클릭할 수 있다.
 곧 관리 상태를 클릭할 수 있다.
 괜찮아요 상태를 클릭할 수 있다.
 상태 필터가 실제 리스트에 반영된다.
 상태 숫자와 데이터 count가 일치한다.
List
 리스트가 line / divider 중심이다.
 항목명이 표시된다.
 tags가 표시된다.
 D-Day가 표시된다.
 홈에서 "마지막 N일 전" 기본 문구가 제거되었다.
Voice / Natural Language
 하나의 마이크로 기록이 가능하다.
 같은 마이크로 조회가 가능하다.
 COMPLETED와 QUERY가 분기된다.
 QUERY는 저장되지 않는다.
 transcript 수정 가능하다.
 저장 전 사용자 확인이 유지된다.
Tags / Notes
 tags와 note가 분리되어 있다.
 tags와 alias가 분리되어 있다.
 홈에서 tag summary를 확인할 수 있다.
 상세에서 tag / note 수정이 가능하다.
Cycle
 없음 지원
 일 단위 지원
 주 단위 지원
 월 단위 지원
 interval 수정 가능
 다음 관리일 계산 가능
Calendar
 리스트 / 월별 전환 가능
 수행 기록 표시
 관리 예정 표시
 날짜 선택 가능
Data Safety
 Activity History가 유지된다.
 Parser가 item_id를 직접 결정하지 않는다.
 False Completion guard 유지
 미래 완료일 저장 금지
 multi action max 5 유지
 multi action atomic save 유지
Responsive / Quality
 360px 정상
 390px 정상
 430px 정상
 touch target 최소 44px
 typecheck PASS
 lint PASS
 build PASS
9. Codex에게 주는 최초 작업 지시

이 문서를 읽은 즉시 전체 코드를 수정하지 않는다.

먼저 현재 코드베이스를 검사하고 다음 보고서를 작성한다.

Codex가 먼저 보고할 것
1. 현재 구현과 본 Change Request 충돌 목록

형식:

[CONFLICT]
현재:
변경 요구:
영향 파일:
위험도:
2. 유지해야 할 기존 기능

특히:

Mock AI Adapter
/api/ai/parse
parser validation
False Completion guard
Activity History
dev screen fixtures
기존 build pipeline
3. 삭제 또는 통합될 UI

예:

bottom navigation
record standalone entry
all management standalone entry
4. 데이터 모델 변경 필요 여부

특히:

tags
note
cycle unit
cycle interval
weekdays
calendar query
5. Migration 위험

기존 데이터 또는 demo fixture와 새 모델 간 충돌을 분석한다.

6. 구현 계획

R1부터 R9까지 나누어 제시한다.

10. STOP RULE

Codex는 분석 보고서를 제출한 뒤 멈춘다.

사용자가 명시적으로:

R1 진행해

라고 하기 전까지 실제 구현을 시작하지 않는다.

또한 각 Task 완료 후 다음 Task를 자동 시작하지 않는다.

매 단계:

PASS
PARTIAL
BLOCKED

중 하나로 보고하고 사용자 승인을 기다린다.


이게 **00번 문서**야.

이 문서에서는 아직 디자인 픽셀값이나 화면 세부구조까지 박아 넣지 않고, **“무엇이 바뀌었고 무엇은 절대 바뀌면 안 되는지”**를 먼저 잠그는 역할로 만들었어.

다음은 `01_UPDATED_IA.md`로 가면 돼. 거기서는 이제 **홈 / 상세 / 설정 구조, 전체관리 제거 방식, 하단 메뉴 제거, 실제 화면 이동 Flow**를 더 구체적으로 확정하면 돼.