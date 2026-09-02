# LASTLY — Codex Start Prompt

아래 지시를 이 Repository의 첫 작업 지시로 사용한다.

---

## 역할

너는 LASTLY의 구현 담당 Coding Agent다. 이 프로젝트는 G0 Specification Freeze를 통과했으며, 현재는 **실제 구현 전**이다.

임의로 제품 범위를 재해석하거나 확장하지 말고 Repository의 문서를 Source of Truth로 사용한다.

## 가장 먼저 읽을 파일

작업 시작 전에 반드시 다음 순서로 읽는다.

1. `AGENTS.md`
2. `README.md`
3. `docs/00_LASTLY_Cross_Document_Audit_G0_FREEZE_v1.1_FINAL.md`
4. `docs/01_LASTLY_PRD_v1.1_FINAL.md`
5. `docs/03_LASTLY_User_Flow_Specification_v1.1_FINAL.md`
6. `docs/04_LASTLY_UI_UX_Functional_Specification_v1.1_FINAL.md`
7. `docs/10_LASTLY_Solo_Development_Execution_Plan_v1.1_FINAL.md`

필요한 세부 규칙은 `docs/02`, `05`, `06`, `07`, `08`, `09`, `11`, `12`에서 확인한다.

## 현재 Phase

```text
G0 = PASS
CURRENT PHASE = PHASE 1
CURRENT TASK = TASK 1 — Application UI Scaffold
```

**PHASE 2 이상의 Auth / Supabase DB / AI Provider / STT Provider / 실제 Push Notification 구현은 아직 시작하지 않는다.**

## TASK 1 목표

Repository가 비어 있거나 Application Scaffold가 없다면 LASTLY의 Frontend Scaffold를 만든다.

기준 기술:

```text
Next.js
React
TypeScript
Tailwind CSS
App Router
ESLint
```

기존 Repository가 이미 초기화되어 있다면 기존 구조를 먼저 분석하고 불필요하게 재생성하지 않는다.

TASK 1에서 구현할 범위:

- Mobile-first Application Shell
- Global Layout
- 기본 Route 구조
- 공통 Header / Bottom Navigation 등 App Navigation의 기초
- Design Token / 기본 Typography / Spacing 구조
- Fixture 기반 UI를 넣을 수 있는 구조
- 24 Screen ID를 이후 단계에서 연결할 수 있는 Route/Component Architecture
- Loading / Empty / Error 상태를 확장 가능한 구조로 준비
- 360 / 390 / 430px 모바일 폭을 우선 고려

TASK 1에서 **하지 말 것**:

- Supabase Production 연결
- 실제 Authentication
- 실제 DB Write
- 실제 AI 호출
- 실제 STT 호출
- 실제 Push Notification
- Siri / Bixby
- SHOULD 기능 선행 구현
- 전체 24개 화면을 한 번에 완성
- 임의의 새로운 Product Feature 추가

## 절대 Product Rule

다음 규칙은 이후 모든 Phase에서도 유지한다.

- AI Parse 결과 자동 저장 금지
- `Parse → Confirm/Edit → Save`
- False Completion 방지
- Intent: `COMPLETED / PLANNED / NOT_COMPLETED / UNCERTAIN / QUERY / UNKNOWN`
- Scope: `IN_SCOPE / OUT_OF_SCOPE / UNCERTAIN`
- Parser와 Item Matching 책임 분리
- Activity History가 Source of Truth
- 미래 Completed Activity 저장 금지
- 최대 5 Semantic Actions
- 6개 이상 `TOO_MANY_ACTIONS`, partial save 금지
- Multi-record Save는 Atomic
- Per-user Isolation
- Application API/BFF Canonical Write
- Production Browser Direct Core DB Write 금지
- MUST와 SHOULD 범위를 혼동하지 않음

## 작업 방식

코드를 수정하기 전에 먼저 짧게 다음을 보고한다.

```text
1. 이해한 현재 Phase / Task
2. 이번 Task에서 읽은 문서
3. 변경할 것으로 예상되는 파일
4. 구현하지 않을 범위
5. 문서 충돌 또는 질문 여부
```

Critical contradiction이 없으면 바로 구현한다. 이미 문서에서 답을 찾을 수 있는 내용은 사용자에게 다시 묻지 않는다.

구현 후 반드시 가능한 범위에서 다음을 실행한다.

```text
lint
typecheck
build 또는 관련 compile check
관련 test
```

Repository에 해당 script가 없다면 임의로 성공 처리하지 말고 현재 상태를 보고한다.

## 완료 보고 형식

```text
Task: PHASE 1 / TASK 1 — Application UI Scaffold
Status: PASS / PARTIAL / BLOCKED

Files changed:
- ...

Implemented:
- ...

Not implemented by scope:
- ...

Validation:
- lint:
- typecheck:
- build:
- tests:

Document conflicts:
- none / details

Known issues:
- ...

Next recommended task:
- ...
```

## 중요한 금지사항

- 한 번에 LASTLY 전체를 구현하지 않는다.
- 테스트를 통과시키기 위해 명세 또는 Ground Truth를 바꾸지 않는다.
- `AGENTS.md`의 규칙을 우회하지 않는다.
- Secret 값을 코드에 작성하지 않는다.
- `.env.example`에 실제 Secret을 넣지 않는다.
- Mock을 실제 기능 완료라고 보고하지 않는다.

이제 위 문서를 읽고 **PHASE 1 / TASK 1 — Application UI Scaffold**만 시작하라.
