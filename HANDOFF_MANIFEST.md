# LASTLY Codex Handoff Manifest

## Package status

- Specification: v1.1 FINAL
- G0 Freeze: PASS
- Runtime implementation: NOT STARTED
- Starting phase: PHASE 1
- Starting task: Application UI Scaffold

## Root files

- `README.md` — 프로젝트 전체 요약
- `AGENTS.md` — Codex 최상위 구현 규칙
- `.env.example` — 환경변수 템플릿, 실제 Secret 없음
- `CODEX_START_PROMPT.md` — Codex에 처음 전달할 실행 프롬프트
- `HANDOFF_MANIFEST.md` — 패키지 구성 설명

## docs/

`00` 및 `01~12` v1.1 FINAL 명세서가 포함되어 있다.

## Usage

1. 이 패키지를 Git Repository root로 사용하거나 기존 빈 Repository에 복사한다.
2. Codex에서 Repository를 연다.
3. `CODEX_START_PROMPT.md` 내용을 첫 지시로 전달한다.
4. Codex가 `AGENTS.md`와 `/docs`를 읽은 뒤 PHASE 1 / TASK 1만 수행하게 한다.
5. Task 완료 보고와 테스트 결과를 확인한 뒤 다음 Task로 진행한다.

## Do not

- G0 이후 명세를 이유 없이 수정하지 않는다.
- 전체 앱을 한 번에 생성하도록 지시하지 않는다.
- 실제 Runtime 검증 전 기능 완료를 선언하지 않는다.
