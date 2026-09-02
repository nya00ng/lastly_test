# LASTLY User Flow Specification
## AI 생활주기 기억 웹앱
**UFS v1.1 — Final Sync Baseline**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 문서 | User Flow Specification |
| 기준 문서 | 01 LASTLY PRD v1.1 FINAL / 02 LASTLY BRS v1.1 FINAL |
| 참조 정합성 | 05 AI Parser v1.1 FINAL / 06 DB·ERD v1.1 FINAL / 07 API v1.1 FINAL의 확정 책임 경계 역반영 |
| 제품 형태 | Mobile-first Web App / PWA |
| 개발 형태 | 1인 단계별 개발 |
| 적용 범위 | 외부 사용자가 실제 테스트 가능한 Prototype Core MUST + 명시적 SHOULD |
| 기준일 | 2026.08.30 |
| 문서 상태 | **Development Baseline — Final Sync** |

---

# 1. 문서 목적

이 문서는 LASTLY 사용자가 서비스에 진입한 순간부터 실제 생활관리 행동을 기록하고, AI 해석을 확인하고, 기록을 관리하고, 관리주기와 다음 관리시점을 확인하고, 알림을 통해 다시 기록하는 전체 사용자 흐름을 정의한다.

이 문서에서는 다음을 고정한다.

- 사용자가 어떤 상태에서 어떤 행동을 할 수 있는가
- 각 행동 뒤에 어떤 화면 또는 상태로 이동하는가
- AI Parser와 Item Matching이 어느 시점에 동작하는가
- `COMPLETED / PLANNED / NOT_COMPLETED / UNCERTAIN / QUERY / UNKNOWN`이 어떻게 분기되는가
- `IN_SCOPE / OUT_OF_SCOPE / UNCERTAIN`이 어떻게 분기되는가
- 날짜 없는 완료형, 날짜 불확실, 미래 날짜 충돌을 어떻게 처리하는가
- 기존 Item 후보가 0/1/여러 개일 때 흐름이 어떻게 달라지는가
- 중복 가능 기록, 복수 행동, 5개 초과 행동을 어떻게 처리하는가
- 기록 수정·삭제 후 사용자가 어떤 갱신 결과를 보게 되는가
- `NO_HISTORY / NO_CYCLE / NORMAL / UPCOMING / DUE / ARCHIVED` 상태가 사용자 흐름에서 어떻게 사용되는가
- Due Notification, Today Complete, Other Date, Snooze, Stale Notification을 어떻게 처리하는가
- MUST와 SHOULD 기능이 어떤 흐름에서 분리되는가
- 오류가 발생해도 사용자의 입력과 실제 수행 사실을 어떻게 안전하게 보존하는가

이 문서는 최종 시각 디자인을 정의하지 않는다. 컴포넌트, 레이아웃, Copy, 화면 상태의 구체 UI는 04 UI/UX Functional Specification이 담당한다.

---

# 2. 문서 우선순위

본 UFS는 다음 상위 규칙을 변경하지 않는다.

```text
01 PRD
↓
02 BRS
↓
03 UFS
```

AI/DB/API의 구현 세부사항이 본 흐름과 충돌하는 경우 상위 제품 규칙을 먼저 확인한다.

Codex 또는 구현 Agent가 문서 충돌을 임의로 해석하여 사용자 Flow를 변경해서는 안 된다.

---

# 3. 사용자 흐름 설계 원칙

## UF-P01 — 이미 한 행동이 시작점

기본 Flow는 미래 할 일 생성이 아니라 완료 생활행동 기록에서 시작한다.

```text
실제 행동 수행
↓
LASTLY 기록
↓
기억
↓
관리
↓
알림
↓
재기록
```

## UF-P02 — 정상 Flow는 짧게

명확한 완료 입력은 가능한 한 다음 흐름으로 끝난다.

```text
기록
→ 입력
→ AI 분석
→ Item Matching
→ 사용자 확인
→ 저장
```

## UF-P03 — 불확실할 때만 추가 질문

다음 경우에만 Clarification을 추가한다.

- 완료 여부 불확실
- Action 불확실
- Date 불확실
- Scope 불확실
- 기존 Item 후보가 여러 개
- 중복 가능
- 복수 행동 중 일부가 수정 필요

## UF-P04 — AI는 사실 확정자가 아님

AI 결과는 저장 전 사용자가 확인한다.

## UF-P05 — AI 실패는 Core Loop 실패가 아님

AI/STT/Network 실패 시 사용자가 수동 입력으로 복구할 수 있어야 한다.

## UF-P06 — Item Matching은 AI Parser 뒤에 실행

AI Parser는 기존 사용자 Item ID를 결정하지 않는다.

## UF-P07 — History 누적

새 수행은 기존 기록을 덮어쓰지 않는다.

## UF-P08 — Dashboard와 전체관리 목적 분리

Dashboard:

> 지금 무엇을 관리해야 하지?

전체관리:

> 나는 무엇을 관리하고 있지?

## UF-P09 — SHOULD가 Core MUST를 막지 않음

Archive/Restore/Merge 등 SHOULD 기능은 구현되지 않았다는 이유만으로 Core Prototype Flow가 실패해서는 안 된다.

---

# 4. 주요 사용자 상태

인증 상태:

```text
UNAUTHENTICATED
AUTHENTICATED
SESSION_EXPIRED
```

기록 상태:

```text
IDLE
INPUTTING
TRANSCRIBING
REVIEWING_TRANSCRIPT
ANALYZING
PARSER_RESULT
ITEM_MATCHING
CLARIFICATION
CONFIRMATION
SAVING
SUCCESS
ERROR
```

Item Lifecycle 상태:

```text
NO_HISTORY
NO_CYCLE
NORMAL
UPCOMING
DUE
ARCHIVED
```

---

# 5. Screen ID

논리 Screen ID는 다음 24개를 유지한다.

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

Screen ID는 논리 상태 식별자다. 실제 구현에서 같은 Route 안의 Modal, Bottom Sheet, Inline State로 합칠 수 있다.

---

# 6. Top Navigation

로그인 후 기본 Navigation:

```text
홈
기록하기
전체 관리
```

보조:

```text
설정
```

모바일에서는 `기록하기`를 Primary Action으로 빠르게 접근할 수 있어야 한다.

---

# 7. Core User Journey

```text
진입
↓
인증
↓
Dashboard 또는 Empty
↓
기록하기
↓
Text 또는 Voice
↓
AI Parser
↓
필요 시 Semantic Clarification
↓
Item Matching
↓
필요 시 Target 선택
↓
사용자 Confirmation
↓
Activity 저장
↓
Item/History 반영
↓
Cycle 설정 또는 기존 Cycle 유지
↓
Lifecycle 계산
↓
Dashboard
↓
Due
↓
Push
↓
Today / Other Date / Snooze
↓
새 Activity 또는 알림 연기
```

---

# 8. FLOW A — App Entry

사용자가 앱에 진입하면 `S00`에서 현재 인증 Session을 확인한다.

분기:

```text
유효 Session
→ 사용자 데이터 상태 확인
→ S10 또는 S02

Session 없음
→ S01

Session 만료/복구 실패
→ S01 + 필요한 안내
```

---

# 9. FLOW B — Sign Up

`S01`에서 신규 사용자가 가입한다.

성공:

```text
Account 생성
↓
Profile 준비
↓
사용자 데이터 없음
↓
S02
```

실패:

```text
입력 유지
↓
오류 표시
↓
S01 유지
```

---

# 10. FLOW C — Login

로그인 성공 후:

```text
Active Item/Activity 존재
→ S10

기록 없음
→ S02
```

다른 사용자의 캐시된 개인 데이터가 잠깐이라도 노출되어서는 안 된다.

---

# 11. FLOW D — Logout

로그아웃 시:

```text
Session 종료
↓
현재 사용자 개인 화면 상태 제거
↓
현재 Device Push Subscription 비활성화 처리
↓
S01
```

핵심 데이터는 DB에 유지된다.

---

# 12. FLOW E — Empty State

최초 사용자 또는 Active Item이 없는 사용자에게 `S02`를 표시한다.

예:

```text
아직 생활기록이 없어요.

오늘 한 생활관리를
한 문장으로 남겨보세요.

“오늘 이불 빨았어”

[첫 기록 남기기]
```

예시는 실제 사용자 데이터로 자동 저장하지 않는다.

---

# 13. FLOW F — Dashboard Entry

기존 사용자에게 `S10`을 표시한다.

기본 관리영역 대상:

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

Dashboard와 전체관리의 역할을 혼합하지 않는다.

---

# 14. FLOW G — Record Entry Points

사용자는 다음 경로에서 기록을 시작할 수 있다.

- Bottom Navigation의 기록하기
- Dashboard CTA
- Empty State CTA
- Item Detail의 기록 추가
- Notification의 완료 Action

자유 자연어 입력은 `S11`로 통합한다.

Item Detail/Notification의 `오늘 했어요`는 별도의 Quick Complete Flow다.

---

# 15. FLOW H — Text Input

`S11`에서 자연어를 입력한다.

```text
Text 입력
↓
분석하기
↓
S14
```

빈 입력은 AI에 전달하지 않는다.

입력 오류/뒤로가기가 발생해도 가능한 한 입력을 보존한다.

---

# 16. FLOW I — Voice Input

`S11`에서 마이크를 선택한다.

```text
Mic 선택
↓
권한 확인
↓
S12
↓
녹음
↓
STT
↓
S13
```

---

# 17. FLOW J — Microphone Permission Denied

권한 거부 시:

```text
음성 사용 불가 안내
↓
[직접 입력하기]
[브라우저 설정 안내]
```

사용자는 Text Flow로 즉시 복귀할 수 있어야 한다.

---

# 18. FLOW K — STT Success

`S13`에서 Transcript를 보여준다.

```text
이렇게 들었어요.

[오늘 에어컨 필터 청소했어]

[수정]
[분석하기]
```

사용자가 수정한 Transcript가 AI Parser의 입력이 된다.

---

# 19. FLOW L — STT Misrecognition

Transcript가 틀리면:

```text
사용자 텍스트 수정
↓
수정된 Transcript 확정
↓
S14
```

AI가 원래 음성을 임의로 복구했다고 가정하지 않는다.

---

# 20. FLOW M — STT Failure

STT Provider 실패, Timeout, 빈 음성 등:

```text
S50 또는 S13 Error State
↓
[다시 말하기]
[직접 입력]
```

입력 가능한 Core Loop를 유지한다.

---

# 21. FLOW N — AI Processing

`S14`에서 AI Parser가 수행하는 책임:

```text
Segment 분리
Intent
Scope
Normalized Action
Date Expression
Resolved Date
Date Precision
Date Resolution Source
Query Type
Semantic Clarification 필요 여부
```

**기존 Management Item 후보 탐색은 여기서 하지 않는다.**

---

# 22. FLOW O — AI Parser Success

Schema/Semantic Validation을 통과한 뒤 Segment별로 분기한다.

```text
COMPLETED + IN_SCOPE + EXACT
→ Item Matching

Clarification 필요
→ S16

PLANNED
→ 비저장 안내

NOT_COMPLETED
→ 비저장 안내

UNCERTAIN
→ 완료/날짜 등 확인

QUERY
→ 조회 안내, Activity 생성 없음

UNKNOWN
→ Clarification 또는 Manual Flow

OUT_OF_SCOPE
→ 비저장 안내

TOO_MANY_ACTIONS
→ 입력 분할 안내
```

---

# 23. FLOW P — AI Parser Failure

다음 상황:

- Provider 실패
- Timeout
- Invalid JSON
- Schema Validation 실패
- Semantic Validation 실패

처리:

```text
원문 유지
↓
재시도 또는 Manual Record
```

AI 실패 때문에 임의 COMPLETED를 만들지 않는다.

---

# 24. FLOW Q — COMPLETED / IN_SCOPE / EXACT

예:

```text
오늘 이불 빨았어
```

해석:

```text
COMPLETED
IN_SCOPE
이불 세탁
2026-08-30
EXACT
```

다음 단계:

```text
Item Matching
↓
S15
```

---

# 25. FLOW R — IMPLICIT_TODAY

예:

```text
칫솔 바꿨어
```

완료가 명확하고 날짜 표현이 없으면:

```text
resolved_date = User Today
date_precision = EXACT
date_resolution_source = IMPLICIT_TODAY
```

사용자에게 오늘 날짜가 제안되었음을 확인 가능하게 하고 `S15`에서 수정할 수 있어야 한다.

자동저장하지 않는다.

---

# 26. FLOW S — PLANNED

예:

```text
내일 이불 빨 거야
```

처리:

```text
Activity 생성 X
To-do 자동생성 X
↓
안내
↓
기록 화면 또는 이전 화면
```

---

# 27. FLOW T — NOT_COMPLETED

예:

```text
오늘 이불 못 빨았어
```

처리:

```text
Activity 생성 X
↓
완료기록으로 저장하지 않았음을 명확히 표시
```

---

# 28. FLOW U — UNCERTAIN Completion

예:

```text
필터 갈았었나?
```

`S16`에서 실제 완료 여부를 묻는다.

```text
실제로 했어요
→ Action/Date 확정 필요
→ Manual-confirmed Record Flow

확실하지 않아요
→ Activity 0

안 했어요
→ Activity 0
```

사용자의 명시적 완료 확인 없이 Record Candidate가 되지 않는다.

---

# 29. FLOW V — UNKNOWN Intent

AI가 의미를 안전하게 분류하지 못하면:

```text
UNKNOWN
↓
S16
```

사용자는:

```text
[직접 기록하기]
[다시 입력하기]
[취소]
```

를 선택한다.

`UNKNOWN`을 조용히 `COMPLETED`로 바꾸지 않는다.

---

# 30. FLOW W — AI Intent가 틀렸다고 사용자가 판단

AI가 다음으로 판정했을 수 있다.

```text
PLANNED
NOT_COMPLETED
QUERY
UNKNOWN
```

사용자가 “실제로 완료한 기록이 맞다”고 수정하려면 기존 AI Segment를 직접 COMPLETED로 바꾸어 저장하지 않는다.

```text
AI 결과 거부
↓
Manual Record Flow
↓
Action 직접 확정
↓
Date 직접 확정
↓
사용자 Confirmation
```

이 경로는 AI 오판과 실제 사용자 사실을 구분하기 위한 안전 Flow다.

---

# 31. FLOW X — Scope IN_SCOPE

반복 생활관리 범위가 명확하면 계속 진행한다.

예:

```text
이불 세탁
칫솔 교체
필터 청소
```

---

# 32. FLOW Y — Scope OUT_OF_SCOPE

예:

```text
오늘 친구 만났어
오늘 영화 봤어
```

처리:

```text
Management Item 생성 X
Activity 생성 X
```

일반 Lifelog로 저장하지 않는다.

---

# 33. FLOW Z — Scope UNCERTAIN

문맥상 생활관리인지 확실하지 않으면 `S16`에서 확인한다.

```text
“LASTLY에서 반복 관리할 항목인가요?”

예
→ Action/Date 확인
→ Record Flow

아니오
→ Activity 0
```

---

# 34. FLOW AA — OUT_OF_SCOPE 판정이 틀렸다고 사용자가 판단

기존 AI Segment를 직접 IN_SCOPE + COMPLETED로 승격하지 않는다.

```text
AI 결과 거부
↓
Manual Record Flow
↓
사용자가 생활관리 Action/Date 직접 확정
```

---

# 35. FLOW AB — Date EXACT

오늘, 어제, 그제, 명시 날짜 등 정확한 날짜가 확정되면 Item Matching으로 진행할 수 있다.

---

# 36. FLOW AC — Date APPROXIMATE

예:

```text
지난주쯤 이불 빨았어
며칠 전에 필터 청소했어
```

처리:

```text
S16 Date Clarification
↓
정확한 날짜 선택
↓
계속
```

정확한 날짜 선택 전 Activity를 저장하지 않는다.

---

# 37. FLOW AD — Date UNKNOWN

예:

```text
전에 세탁조 청소했어
예전에 칫솔 바꿨어
```

처리:

```text
S16
↓
[날짜 선택]
[기록 취소]
```

AI가 임의 날짜를 생성하지 않는다.

---

# 38. FLOW AE — Future Completed Date Conflict

예:

```text
내일 이불 빨았어
```

완료형이어도 미래 수행일은 저장할 수 없다.

```text
S16 Date Correction
↓
User Today 이하 날짜 확정
```

---

# 39. FLOW AF — Action Clear

예:

```text
이불 세탁
```

Action이 충분히 명확하면 Item Matching으로 이동한다.

---

# 40. FLOW AG — Action Ambiguous

예:

```text
청소했어
갈았어
바꿨어
```

`S16`에서 관리 대상을 확인한다.

```text
무엇을 청소했나요?
[직접 입력]
```

Action이 확정되기 전 저장하지 않는다.

---

# 41. FLOW AH — AI Semantic Clarification 완료

`COMPLETION / ACTION / DATE / SCOPE` Clarification이 모두 해결되면 Item Matching 단계로 이동한다.

미해결 Clarification이 하나라도 남으면 저장 Confirmation으로 이동하지 않는다.

---

# 42. FLOW AI — Item Matching 시작

AI Parser/Clarification 결과로 확정된 `normalized_action`을 현재 사용자의 Active Item과 비교한다.

Item Matching은 AI Parser와 별도 책임이다.

---

# 43. FLOW AJ — Item Candidate 0개

적절한 기존 Active Item이 없으면:

```text
NEW_ITEM_CANDIDATE
↓
S15
```

사용자에게 신규 Item으로 저장될 것을 보여준다.

---

# 44. FLOW AK — Item Candidate 1개

충분히 명확한 기존 Item 후보가 1개면:

```text
MATCHED_ITEM
↓
S15
```

기존 Item에 새 Activity가 추가됨을 보여준다.

사용자는 연결 대상을 변경할 수 있다.

---

# 45. FLOW AL — Item Candidate 여러 개

예:

```text
거실 에어컨 필터
안방 에어컨 필터
공기청정기 필터
```

다음으로 이동:

```text
AMBIGUOUS_TARGET
↓
S16 Target Selection
```

Target 선택은 AI Parser Clarification Enum이 아니라 Item Matching 사용자 Flow다.

---

# 46. FLOW AM — Archived Item Matching

Archived Item은 기본 신규 Matching 후보에서 제외한다.

사용자가 해당 항목을 다시 사용하려면 SHOULD 기능인 Restore Flow가 구현된 경우 명시적으로 복원 후 진행한다.

Restore가 구현되지 않은 Core MVP에서는 신규/다른 Active Item Flow를 사용한다.

---

# 47. FLOW AN — AI Confirmation

`S15`는 Core Trust Gate다.

최소 확인:

```text
Action
Performed Date
Original Text
기존 Item / 신규 Item
```

사용자 Actions:

```text
[수정]
[기록]
[취소]
```

---

# 48. FLOW AO — Confirmation에서 Action 수정

사용자가 Action을 수정하면:

```text
Action 수정
↓
필요 시 Item Matching 재실행
↓
S15 재확인
```

Action 수정으로 기존 Matching 결과가 더 이상 유효하면 그대로 사용하지 않는다.

---

# 49. FLOW AP — Confirmation에서 Date 수정

날짜 수정 후:

```text
미래 날짜 검증
↓
중복 검증 영향 확인
↓
S15 재확인
```

---

# 50. FLOW AQ — Confirmation에서 Item 수정

사용자는 자신의 Active Item 후보 중 다른 Item을 선택하거나 신규 Item으로 확정할 수 있다.

다른 사용자의 Item은 후보에 나타나지 않는다.

---

# 51. FLOW AR — Cancel Before Save

사용자가 저장 전에 취소하면 Activity는 생성되지 않는다.

AI Parse Log의 기술적 저장 여부와 사용자 Activity는 구분한다.

---

# 52. FLOW AS — Record Saving

사용자가 `기록하기`를 선택하면:

```text
SAVING
↓
Server Validation
↓
Ownership
↓
Duplicate Guard
↓
Transaction
↓
Activity 저장
```

Server 성공 전 `S17` Success를 표시하지 않는다.

---

# 53. FLOW AT — Save Success

저장 성공 시 `S17`.

표시:

```text
기록한 Item
수행일
Last Performed
현재 Cycle 상태
```

신규 Item + Cycle 없음:

```text
[관리주기 설정]
[나중에]
```

Cycle 설정을 강제하지 않는다.

---

# 54. FLOW AU — Save Failure

저장 실패:

```text
Success 화면 X
↓
입력/확정값 유지
↓
[재시도]
[수정]
```

부분 성공 여부가 불명확하면 성공으로 간주하지 않는다.

---

# 55. FLOW AV — Duplicate Candidate

동일 사용자 + 동일 Active Item + 동일 수행일의 유효 Activity가 존재하면:

```text
중복 가능성 경고
↓
[기존 기록 보기]
[그래도 추가]
[취소]
```

사용자가 명시적으로 추가한 경우만 같은 날 복수 Activity를 허용한다.

---

# 56. FLOW AW — Double Submit / Retry

Double Click, Network Retry, 동일 Parse Segment 재전송은 추가 Activity를 만들지 않는다.

사용자에게 동일 성공 결과를 보여주는 방향으로 처리한다.

---

# 57. FLOW AX — Multiple Completed Actions

예:

```text
오늘 이불 빨았고 칫솔도 바꿨어
```

처리:

```text
Segment 1: 이불 세탁
Segment 2: 칫솔 교체
↓
각 Segment 확인
↓
한 번에 저장
```

각 Segment는 별도 Activity다.

---

# 58. FLOW AY — Mixed Intent

예:

```text
오늘 필터 청소했고 내일 이불 빨 거야
```

처리:

```text
Segment 1 COMPLETED → 저장 후보
Segment 2 PLANNED → 저장 안 함
```

사용자는 저장되는 Segment를 명확히 확인할 수 있어야 한다.

---

# 59. FLOW AZ — Multiple Action Partial Edit

복수 저장 후보 중 특정 Segment의 Action/Date/Item을 수정할 수 있다.

수정 후 각 Segment의 저장 가능 조건을 다시 확인한다.

---

# 60. FLOW BA — Multiple Action User Exclusion

사용자는 특정 Record Candidate를 이번 저장에서 제외할 수 있다.

제외된 Segment는 Activity가 되지 않는다.

---

# 61. FLOW BB — Multiple Save Atomicity

사용자가 최종 선택한 여러 Record를 한 번에 저장할 때 기본 흐름은:

```text
전체 검증
↓
전체 저장 성공
또는
전체 저장 실패
```

한 Segment 오류 때문에 나머지만 조용히 저장하지 않는다.

---

# 62. FLOW BC — More Than 5 Actions

5개 초과 의미 행동이 감지되면:

```text
부분 Parse 결과 저장 X
↓
“한 번에 최대 5개까지 기록할 수 있어요.
입력을 나눠주세요.”
↓
S11
```

---

# 63. FLOW BD — Record Saved → Cycle Existing

기존 Item에 Cycle이 있으면:

```text
새 Activity
↓
Last 갱신
↓
Next Due 재계산
↓
Status 재계산
↓
Dashboard 반영
```

---

# 64. FLOW BE — Record Saved → No Cycle

새 Item 또는 NO_CYCLE Item이면:

```text
S17
↓
[관리주기 설정]
→ S25

[나중에]
→ S10 또는 S21
```

---

# 65. FLOW BF — Cycle Setting

`S25`에서 MVP Core는:

```text
N일마다
또는
주기 없음
```

이다.

사용자가 Cycle을 정한다.

AI가 자동으로 확정하지 않는다.

---

# 66. FLOW BG — Cycle Validation

유효한 Cycle:

```text
1 이상의 정수
```

잘못된 값:

```text
0
음수
비정수
```

은 저장하지 않는다.

---

# 67. FLOW BH — Cycle Save

Cycle 저장 후:

```text
Last 존재
→ Next Due 계산
→ Status 계산
→ Notification 설정 가능

Last 없음
→ NO_HISTORY
→ Next Due 없음
```

---

# 68. FLOW BI — Cycle Remove

Cycle 제거:

```text
Activity History 유지
Last 유지
Next Due 없음
Status = NO_CYCLE
Pending 관리 알림 취소/무효화
```

단, 유효 Activity가 없으면 `NO_HISTORY`.

---

# 69. FLOW BJ — All Management Entry

`S20`은 사용자의 Active Item 전체를 보여준다.

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

# 70. FLOW BK — All Management Search

검색:

```text
Item 이름
유효 Alias
```

현재 사용자 데이터만 대상으로 한다.

검색결과 없음은 별도 Empty State로 보여준다.

---

# 71. FLOW BL — NO_HISTORY Item

유효 Activity가 하나도 없는 Active Item:

```text
NO_HISTORY
```

사용자에게:

```text
“수행기록 없음”
```

으로 표현한다.

Actions:

```text
[기록 추가]
[Item 수정]
```

Cycle이 저장되어 있더라도 Last가 없으므로 Next Due는 없다.

---

# 72. FLOW BM — NO_CYCLE Item

유효 Activity는 있지만 Cycle이 없다.

`S20/S21`에서:

```text
Last Performed 표시
주기 없음
[주기 설정]
```

Dashboard 관리상태 영역에는 기본 노출하지 않는다.

---

# 73. FLOW BN — NORMAL Item

`S21`에서 Last / Next Due / Status / History를 볼 수 있다.

Dashboard에서 정상 관리 대상의 낮은 우선순위로 표시한다.

---

# 74. FLOW BO — UPCOMING Item

관리시점이 가까워진 Item.

Dashboard에서 DUE 다음 우선순위로 보여준다.

---

# 75. FLOW BP — DUE Item

관리 필요 Item.

Dashboard에서 최우선 표시한다.

사용자는 Item Detail에서 즉시:

```text
[오늘 했어요]
[기록 추가]
```

를 선택할 수 있다.

---

# 76. FLOW BQ — Item Detail

`S21` 최소 정보:

```text
Item Name
Last Performed 또는 기록 없음
Elapsed
Cycle
Next Due
Status
최근 Activity
```

Core Actions:

```text
오늘 했어요
기록 추가
전체 History
주기 설정/수정
Item 이름 수정
```

---

# 77. FLOW BR — Activity History

`S22`에서 삭제되지 않은 Activity를 최신순으로 본다.

각 Activity에서 Core Action:

```text
[수정]
[삭제]
```

과거 History를 Last Date 하나로 덮어쓰지 않는다.

---

# 78. FLOW BS — Record Edit Entry

`S23`에서 Core 수정 대상:

```text
Performed Date
연결 Management Item
```

일반 Record Edit에서 생성 당시 Original Text/Action Snapshot을 임의 편집하는 것을 Core 요구로 두지 않는다.

---

# 79. FLOW BT — Record Date Edit

수행일 수정:

```text
Date 선택
↓
미래일 검증
↓
저장
↓
Lifecycle 재계산
```

최신 Activity 순서가 변경될 수 있다.

---

# 80. FLOW BU — Record Item Move

자신의 다른 Active Item으로 Record 이동:

```text
Target Item 선택
↓
저장
↓
원본 Item 재계산
↓
대상 Item 재계산
```

다른 사용자 Item으로 이동할 수 없다.

---

# 81. FLOW BV — Record Delete

사용자 확인 후 Activity를 삭제 상태로 만든다.

```text
Delete
↓
History에서 제외
↓
Last 재계산
↓
Next Due 재계산
↓
Status 재계산
↓
알림 재조정
```

---

# 82. FLOW BW — Delete Latest Activity

예:

```text
A < B < C
```

C 삭제:

```text
B = 새로운 Last
```

이전 History는 유지된다.

---

# 83. FLOW BX — Delete Only Activity

유일한 유효 Activity 삭제:

```text
Last 없음
Next Due 없음
Status = NO_HISTORY
```

Item 자체는 Active 상태로 남을 수 있다.

---

# 84. FLOW BY — Undo Recent Save

신규 Activity 저장 직후 Undo UX를 제공할 수 있다.

```text
Undo
↓
Activity 제거/복원 가능한 삭제처리
↓
Lifecycle 재계산
```

Undo는 실제 데이터 상태와 동기화되어야 한다.

---

# 85. FLOW BZ — Item Edit

`S24` Core MUST:

```text
Item 이름 수정
```

이름 수정은 Activity History를 변경하지 않는다.

---

# 86. FLOW CA — Item Archive [SHOULD]

Archive는 SHOULD 기능이다.

구현된 경우:

```text
Archive
↓
History 유지
↓
Dashboard 제외
↓
Active 목록 기본 제외
↓
관리 알림 중단
```

미구현만으로 Core Prototype을 실패로 판정하지 않는다.

---

# 87. FLOW CB — Archived Item Restore [SHOULD]

Restore가 구현된 경우:

```text
Archived Item
↓
Restore
↓
History/Cycle 기준 Lifecycle 재계산
↓
Active Item
```

---

# 88. FLOW CC — Item Merge [SHOULD]

중복 Item 병합이 구현된 경우:

```text
대표 Item 선택
↓
Source Item 선택
↓
Cycle 충돌 시 사용자 선택
↓
History 통합
↓
Alias 통합
↓
전체 성공
```

History가 손실되어서는 안 된다.

미구현은 Core 25 MUST의 실패가 아니다.

---

# 89. FLOW CD — Dashboard Sorting

기본:

```text
DUE
↓
UPCOMING
↓
NORMAL
```

DUE:

```text
가장 오래 지난 Item 우선
```

UPCOMING/NORMAL:

```text
Next Due 가까운 Item 우선
```

---

# 90. FLOW CE — Dashboard Refresh After Record

새 Activity가 저장되면:

```text
현재 Item Lifecycle 재계산
↓
S10 재진입/갱신
```

예정일 기준이 아니라 실제 최신 수행일을 기준으로 한다.

---

# 91. FLOW CF — Notification Permission Context

Browser Permission은 첫 앱 진입 즉시 강제하지 않는다.

권장 Flow:

```text
Cycle 설정
↓
“관리일에 알림을 받을까요?”
↓
S41
↓
Browser Permission
```

---

# 92. FLOW CG — Device Notification Setting

`S41`은 전역 서비스 알림 Boolean이 아니라 **현재 기기 알림 사용 상태**를 중심으로 한다.

```text
이 기기에서 알림 받기
```

Item별 세부 설정 UI는 SHOULD로 둘 수 있다.

---

# 93. FLOW CH — Notification Permission Denied

거부:

```text
Push 수신 X
Dashboard DUE 정상
기록/History 정상
```

앱 전체를 막지 않는다.

---

# 94. FLOW CI — Due Notification

Cycle + Last + 알림 가능 상태에서 Due 시점에 Notification이 도착한다.

Push Payload는 최소 정보를 사용하고, 클릭 후 최신 상태를 다시 조회한다.

---

# 95. FLOW CJ — Notification Landing

Notification 클릭:

```text
S30
↓
현재 Item/Delivery 최신 상태 확인
```

Actions:

```text
오늘 했어요
다른 날 했어요
나중에 알려줘
```

---

# 96. FLOW CK — Stale Notification

알림 발송 후 이미 새 Activity가 존재해 해당 Due가 무효라면:

```text
오래된 완료 Action 강제 X
↓
최신 상태 안내
↓
Item Detail 또는 Dashboard
```

과거 Push 내용을 사실 Source of Truth로 사용하지 않는다.

---

# 97. FLOW CL — Complete Today

`S31`:

```text
오늘 했어요
↓
Duplicate Guard
↓
새 Activity(User Today)
↓
Lifecycle 재계산
↓
이전 Snooze/Pending Due 무효화
↓
다음 관리시점
```

기존 History를 유지한다.

---

# 98. FLOW CM — Complete Other Date

`S32`:

```text
정확한 과거 날짜 선택
↓
미래 날짜 차단
↓
Duplicate Guard
↓
새 Activity
```

기존 Last보다 오래된 과거 날짜라면 History에 추가하되 최신 Last는 유지한다.

---

# 99. FLOW CN — Snooze

`S33`은 DUE Item에서만 사용한다.

MVP 옵션:

```text
1일
3일
7일
```

결과:

```text
Activity 변화 없음
Last 변화 없음
Next Due 변화 없음
Status = DUE 유지
Push 재알림만 연기
```

---

# 100. FLOW CO — New Activity After Snooze

Snooze 후 사용자가 다른 경로에서 실제 Activity를 저장하면:

```text
새 Activity
↓
Snooze 무효화
↓
기존 Pending Due 무효화
↓
새 Lifecycle
```

---

# 101. FLOW CP — Notification Action Retry

Notification의 Today Complete 요청이 재전송되어도 같은 수행이 여러 번 생성되어서는 안 된다.

---

# 102. FLOW CQ — Session Expired During Record

기록 중 Session이 만료되면:

```text
입력값 유지
↓
재인증 안내
↓
로그인 성공
↓
가능한 경우 기록 Flow 복구
```

재인증 없이 개인 DB Write를 수행하지 않는다.

---

# 103. FLOW CR — Network Failure During Analysis

```text
원문 유지
↓
재시도
또는
Manual Record
```

---

# 104. FLOW CS — Network Failure During Save

```text
Success 표시 X
↓
저장 상태 재확인
↓
안전한 Retry
```

Retry가 중복 Activity를 만들지 않아야 한다.

---

# 105. FLOW CT — Manual Record Flow

AI 결과를 사용할 수 없거나 사용자가 해석을 거부한 경우:

```text
Action 직접 입력
↓
Performed Date 직접 선택
↓
생활관리 기록임을 사용자 확정
↓
Item Matching
↓
Confirmation
↓
Save
```

Manual Flow도 미래 날짜, Ownership, Duplicate 등 핵심 규칙을 우회하지 않는다.

---

# 106. FLOW CU — Query in MVP

예:

```text
이불 언제 빨았지?
```

Parser는 QUERY로 식별한다.

Core MVP에서는:

```text
Activity 생성 X
↓
“조회 기능은 준비 중이에요” 또는 안전한 안내
```

실제 대화형 기억 조회는 NEXT 기능이다.

---

# 107. FLOW CV — Out-of-scope Re-entry

OUT_OF_SCOPE 안내 후 사용자는:

```text
[다른 기록 입력]
→ S11
```

할 수 있다.

일반 메모 저장 기능으로 전환하지 않는다.

---

# 108. FLOW CW — Back Navigation

AI 분석 전/후 뒤로가기를 하더라도 아직 저장되지 않은 상태는 Activity가 아니다.

가능하면 원문/수정값을 보존한다.

---

# 109. FLOW CX — App Refresh

새로고침:

```text
Auth Session 복구
↓
DB 최신 상태 조회
```

핵심 Activity/Item 상태를 Browser 임시 State만으로 복원하지 않는다.

---

# 110. FLOW CY — Re-login Persistence

로그아웃 후 재로그인:

```text
Item 유지
Activity History 유지
Cycle 유지
Lifecycle 재계산 결과 유지
```

다른 사용자의 데이터는 보이지 않는다.

---

# 111. Recording State Machine

```text
IDLE
↓
INPUTTING
↓
TRANSCRIBING? 
↓
REVIEWING_TRANSCRIPT?
↓
ANALYZING
↓
PARSER_RESULT
↓
CLARIFICATION? 
↓
ITEM_MATCHING
↓
TARGET_SELECTION?
↓
CONFIRMATION
↓
SAVING
↓
SUCCESS
```

오류 상태:

```text
STT_ERROR
AI_ERROR
NETWORK_ERROR
SAVE_ERROR
SESSION_ERROR
```

각 오류에서 가능한 복구점으로 돌아간다.

---

# 112. Item Lifecycle State Machine

```text
Activity 없음
→ NO_HISTORY

Activity 있음 + Cycle 없음
→ NO_CYCLE

Activity 있음 + Cycle 있음
→ NORMAL / UPCOMING / DUE

Archive [SHOULD]
→ ARCHIVED
```

복원 시 현재 History/Cycle 기준으로 다시 계산한다.

---

# 113. Core MUST Flow

Core Prototype에서 반드시 실제로 이어져야 하는 흐름:

```text
Auth
→ Text/Voice
→ STT
→ AI Parser
→ Item Matching
→ Confirmation
→ Persistent Save
→ History
→ Last
→ Cycle
→ Next Due
→ Status
→ Dashboard
→ Due Notification
→ Today Complete
→ New Activity
```

---

# 114. SHOULD Flow

Core Release와 분리:

```text
Record Restore
Item Archive
Archived Item Restore
Item Merge
세부 Item Notification Setting
```

SHOULD 미구현만으로 `prototype-v1` Core MUST를 실패로 판정하지 않는다.

---

# 115. Critical Negative Flow 1 — False Completion

```text
“오늘 이불 못 빨았어”
↓
NOT_COMPLETED
↓
Activity 0
```

---

# 116. Critical Negative Flow 2 — Planned

```text
“내일 이불 빨 거야”
↓
PLANNED
↓
Activity 0
```

---

# 117. Critical Negative Flow 3 — Query

```text
“이불 언제 빨았지?”
↓
QUERY
↓
Activity 0
```

---

# 118. Critical Negative Flow 4 — Approximate Date

```text
“지난주쯤 이불 빨았어”
↓
APPROXIMATE
↓
Date 선택 전 Activity 0
```

---

# 119. Critical Negative Flow 5 — Future Completed

```text
performed_date > User Today
↓
Save Block
```

---

# 120. Critical Negative Flow 6 — Ambiguous Target

```text
기존 Item 여러 개
↓
AI 임의선택 X
↓
사용자 선택
```

---

# 121. Critical Negative Flow 7 — Snooze

```text
DUE
→ Snooze
→ Activity 0
→ DUE 유지
```

---

# 122. Critical Negative Flow 8 — Cross-user

```text
User A
→ User B Item ID 접근
→ 흐름 차단
```

다른 사용자 Item을 정상 Confirmation 후보로 보여주지 않는다.

---

# 123. Critical Negative Flow 9 — Save Failure

```text
DB 실패
↓
Success 화면 X
```

---

# 124. Critical Negative Flow 10 — More Than 5 Actions

```text
6개 이상 의미 행동
↓
일부만 저장 X
↓
입력 분할 안내
```

---

# 125. Golden Path — Text

```text
1. S01 로그인
2. S10/S02 진입
3. S11 기록하기
4. “오늘 이불 빨았어”
5. S14 AI 분석
6. COMPLETED / IN_SCOPE / 이불 세탁 / 오늘
7. Item Matching
8. S15 Confirmation
9. 기록하기
10. S17 저장 성공
11. S25 28일 주기 설정
12. S10 Dashboard
13. Item 상태 확인
14. 재로그인 후 데이터 유지
```

---

# 126. Golden Path — Voice

```text
1. S11
2. 마이크
3. S12 발화
4. S13 Transcript
5. 수정/확인
6. S14 AI Parser
7. Item Matching
8. S15
9. Save
10. S17
```

---

# 127. Golden Path — Notification Loop

```text
1. Item DUE
2. Push 수신
3. S30
4. 오늘 했어요
5. S31
6. 새 Activity
7. 과거 History 유지
8. Last = 오늘
9. Next Due 재계산
10. Status 갱신
```

---

# 128. Critical Exception — STT

```text
음성 실패
→ 직접 입력
→ Core Flow 계속
```

---

# 129. Critical Exception — AI

```text
AI 실패
→ 원문 유지
→ Manual Record
→ Item Matching
→ Confirmation
```

---

# 130. Critical Exception — Date

```text
날짜 불확실
→ Date Clarification
→ 정확한 날짜
→ 계속
```

---

# 131. Critical Exception — Duplicate

```text
중복 후보
→ Warning
→ 사용자 명시적 확인 또는 취소
```

---

# 132. Critical Exception — Session

```text
Session 만료
→ 개인 Write 차단
→ 재로그인
→ 입력 복구
```

---

# 133. Critical Exception — Stale Notification

```text
오래된 Push
→ 최신 상태 재조회
→ 이미 완료됨
→ 추가 완료 강요 X
```

---

# 134. Screen → Primary Flow Mapping

| Screen | Primary Flow |
|---|---|
| S00 | App Entry / Session |
| S01 | Auth |
| S02 | Empty / First Record |
| S10 | Dashboard |
| S11 | Text/Voice Entry |
| S12 | Voice Capture |
| S13 | Transcript Review |
| S14 | AI Parser Processing |
| S15 | Final Confirmation |
| S16 | Semantic/Target Clarification |
| S17 | Saved |
| S20 | All Management |
| S21 | Item Detail |
| S22 | Activity History |
| S23 | Record Edit |
| S24 | Item Edit |
| S25 | Cycle |
| S30 | Notification Landing |
| S31 | Today Complete |
| S32 | Other Date |
| S33 | Snooze |
| S40 | Settings |
| S41 | Device Notification |
| S50 | Error / Recovery |

---

# 135. Intent → Flow Mapping

| Intent | User Flow |
|---|---|
| COMPLETED | Clarification 필요 여부 → Item Matching → Confirmation |
| PLANNED | Activity 없음 → 안내 |
| NOT_COMPLETED | Activity 없음 → 안내 |
| UNCERTAIN | 완료 여부 Clarification |
| QUERY | Activity 없음 → 조회 안내 |
| UNKNOWN | Clarification 또는 Manual Record |

---

# 136. Scope → Flow Mapping

| Scope | User Flow |
|---|---|
| IN_SCOPE | 계속 |
| OUT_OF_SCOPE | Activity 없음 |
| UNCERTAIN | S16 Scope 확인 |

---

# 137. Date → Flow Mapping

| Date 상태 | User Flow |
|---|---|
| EXACT | 계속 |
| IMPLICIT_TODAY | 오늘 제안 → S15 확인 |
| APPROXIMATE | S16 Date |
| UNKNOWN | S16 Date 또는 취소 |
| 미래 COMPLETED | Date 수정 |
| NOT_APPLICABLE | QUERY 등 비기록 |

---

# 138. Item Matching → Flow Mapping

| Matching | User Flow |
|---|---|
| 0개 | 신규 Item 후보 |
| 1개 | 기존 Item 연결 제안 |
| 여러 개 | S16 Target 선택 |
| Archived | 기본 후보 제외 |

---

# 139. Lifecycle → Screen Mapping

| State | Dashboard | All Management | Item Detail |
|---|---:|---:|---:|
| NO_HISTORY | 기본 제외 | 표시 | 표시 |
| NO_CYCLE | 기본 제외 | 표시 | 표시 |
| NORMAL | 표시 | 표시 | 표시 |
| UPCOMING | 표시 | 표시 | 표시 |
| DUE | 최우선 표시 | 표시 | 표시 |
| ARCHIVED | 제외 | 기본 제외 | 별도 Restore 경로 [SHOULD] |

---

# 140. MUST 기능 Traceability

| # | MUST | User Flow |
|---:|---|---|
| 1 | 자연어 Text | H |
| 2 | Voice | I |
| 3 | Voice → Text | K |
| 4 | Intent | O~V |
| 5 | Action | AF~AG |
| 6 | Date | AB~AE |
| 7 | AI Confirmation | AN |
| 8 | AI 결과 수정 | AO~AQ |
| 9 | Persistent Save | AS~AU |
| 10 | Item Matching | AI~AM |
| 11 | New Item | AJ |
| 12 | Last Performed | BD/BQ |
| 13 | All Management | BJ |
| 14 | Item History | BR |
| 15 | Record Edit/Delete | BS~BX |
| 16 | User Cycle | BF~BI |
| 17 | Next Due | BH/BD |
| 18 | Status | BL~BP |
| 19 | Dashboard | F/CD |
| 20 | Due Notification | CI |
| 21 | 오늘 했어요 | CL |
| 22 | Auth | A~D |
| 23 | User Isolation | CY/Critical 8 |
| 24 | Persistent DB | AS/CY |
| 25 | External Deployment | Golden Paths를 외부 URL에서 검증 |

25개 Core MUST가 모두 사용자 Flow에 배치되어 있다.

---

# 141. User Flow Acceptance Criteria

UFS v1.1은 다음을 만족한다.

- Text/Voice 모두 같은 Core Record Pipeline으로 수렴
- AI Parser와 Item Matching 책임 분리
- `UNKNOWN` Flow 존재
- Scope `UNCERTAIN` Flow 존재
- `IMPLICIT_TODAY` Flow 존재
- `NO_HISTORY` Flow 존재
- 5개 초과 행동 부분 저장 금지
- PLANNED/NOT_COMPLETED/QUERY 직접 완료 승격 금지
- Manual Record Flow 존재
- Duplicate Guard 존재
- Multiple Save Atomicity 반영
- Record Edit/Delete 후 Lifecycle 반영
- Notification stale 검증 반영
- Snooze 1/3/7일 반영
- Device Notification과 전역 알림 개념 분리
- MUST와 SHOULD Flow 분리
- Cross-user 흐름 차단
- 외부 Golden Path 정의

---

# 142. Codex 구현 기준

Codex는 본 User Flow에서 다음을 임의 변경하지 않는다.

1. S14에서 기존 Item ID를 AI가 직접 선택하게 하지 않는다.
2. Confirmation을 생략하지 않는다.
3. `UNKNOWN`을 자동 COMPLETED로 처리하지 않는다.
4. `OUT_OF_SCOPE`를 일반 메모로 저장하지 않는다.
5. `NO_HISTORY`를 `NO_CYCLE`과 동일하게 처리하지 않는다.
6. 5개 초과 행동 중 일부를 조용히 저장하지 않는다.
7. Snooze를 완료 Record로 만들지 않는다.
8. SHOULD 기능을 Core MUST Gate로 승격하지 않는다.
9. 다른 사용자 Item을 Matching 후보로 노출하지 않는다.
10. DB 저장 성공 전 Success 화면을 표시하지 않는다.

문서와 구현이 충돌하면 중단하고 보고한다.

---

# 143. Final User Flow Summary

LASTLY의 최종 Core Flow는 다음과 같다.

```text
사용자가 실제 행동 수행
↓
Text 또는 Voice 입력
↓
STT 확인
↓
AI Parser
↓
필요한 Semantic Clarification
↓
Item Matching
↓
필요한 Target 선택
↓
사용자 Confirmation
↓
Persistent Activity Save
↓
History / Last
↓
Cycle
↓
Next Due / Status
↓
Dashboard
↓
Due Notification
↓
Today / Other Date / Snooze
↓
새 Activity 또는 알림 연기
```

핵심은 “AI가 알아서 저장하는 흐름”이 아니라:

> **사용자가 한 일을 쉽게 말하고, LASTLY가 안전하게 구조화하고, 사용자가 확인한 사실만 기억하며, 그 기억이 다음 관리로 이어지는 흐름**

이다.

---

## UFS v1.1 Final Sync 상태

**PRD v1.1 정합성:** 완료  
**BRS v1.1 Final 정합성:** 완료  
**Screen ID 24개:** 유지  
**AI Parser ↔ Item Matching 책임 분리:** 반영  
**UNKNOWN:** 반영  
**Scope UNCERTAIN:** 반영  
**IMPLICIT_TODAY:** 반영  
**NO_HISTORY:** 반영  
**MUST / SHOULD 분리:** 반영  
**Manual Record Flow:** 반영  
**Multiple >5 / Atomic Save:** 반영  
**Stale Notification:** 반영  
**Snooze 1/3/7:** 반영  
**Device Notification:** 반영  
**Golden Path:** 반영  
**MVP 25/25 Traceability:** 완료  
**Codex 구현 기준:** 사용 가능
