# 내 Supabase로 이전하기

> 아래는 단계별 작업 당시 기록이다. 현재 통합 API·알림·웹 배포 상태와 제한사항은 [PERSONAL_DEPLOYMENT.md](PERSONAL_DEPLOYMENT.md)를 우선 참고한다.

이 저장소는 세빈의 `main`을 기준으로 복제했다. 현재 DB·인증은 Supabase, 알림 발송은 Supabase Edge Function, 나머지 API와 AI는 Render에 있다. 이 문서는 **내 프로젝트를 준비하는 단계**를 기록한다. 백엔드 API 전환은 `tasks/plan.md`의 기능별 순서로 진행한다.

## 1. 내 프로젝트 선택

기존 Supabase 프로젝트는 일시 정지된 상태다. 데이터는 건드리지 않고 `nya00ng` 조직에 새 프로젝트 `lastly-personal`을 서울 지역으로 만들었다. 프로젝트 ID는 `ovcexehchfxqibspbsyp`, URL은 `https://ovcexehchfxqibspbsyp.supabase.co`다. 비밀번호나 비밀키를 GitHub, 이 문서, 채팅에 적지 않는다.

## 2. DB와 인증

이 저장소의 `supabase/migrations`를 **내 프로젝트에만** 적용한다. 새 프로젝트에 Supabase CLI를 연결하고 `supabase db push`로 23개 마이그레이션을 적용했다. 로컬·원격 마이그레이션 이력도 일치한다. `items`, `item_logs`, `profiles`, `notifications`, `push_subscriptions`, `cadence_priors` 등 핵심 7개 테이블의 RLS가 켜진 것을 확인했다. 기존 앱과 동일하게 익명 로그인도 켰다.

## 3. 알림 함수와 예약 작업

`supabase/functions/dispatch-digests`가 이미 있다. 이 함수는 `CRON_SECRET`으로 호출자를 검사하며, `supabase/config.toml`에서 이 함수의 기본 JWT 검사를 끈다. DB의 예약 작업은 Vault에 저장한 **내 프로젝트 URL**을 읽는다.

내 Supabase 대시보드에서 다음을 설정한다.

| 위치 | 이름 | 값 |
|---|---|---|
| Vault | `supabase_url` | 내 프로젝트 URL |
| Vault | `cron_secret` | 새로 만든 긴 임의 문자열 |
| Edge Function Secrets | `CRON_SECRET` | 위 `cron_secret`과 같은 값 |
| Edge Function Secrets | `VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | 내 웹 푸시 키 |

`SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`는 호스팅된 Edge Function의 기본 환경변수다. `CRON_SECRET`과 VAPID 값은 직접 설정해야 한다. 함수를 배포한 뒤 예약 작업이 내 함수로 호출되는지 확인한다. `keep-api-awake`는 복제본에서 제거한다.

새 `api` Edge Function은 `GET /v1/items`, `POST /v1/items`, `POST /v1/items/:id/complete`, `POST /v1/logs/undo`를 제공한다. 호출 주소는 `https://ovcexehchfxqibspbsyp.supabase.co/functions/v1/api/v1/items`다. 브라우저의 사전 요청(OPTIONS)을 처리하기 위해 플랫폼 JWT 검사를 끄고, 실제 요청에서는 함수가 사용자 토큰을 검증한다. 조회·기록에는 사용자 권한의 Supabase 클라이언트를 사용하므로 RLS가 적용된다. 웹앱 주소는 Edge Function Secrets의 `CORS_ORIGIN`에 설정한다. OPTIONS 204, 미인증 GET 401, 익명 JWT GET 200과 사용자 간 항목 격리를 확인했다. 생성·첫 완료일·중복 이름 409·완료 기록·되돌리기·다음 예정일 재계산도 새 DB에서 검증하고 테스트 항목은 삭제했다. **나머지 API와 웹 연결 전환은 아직 하지 않았다.**

## 4. 웹과 API 연결

2026-10-19 추가 이전: `PATCH /v1/items/:id`, `DELETE /v1/items/:id`(보관), `POST /v1/items/:id/restore`, `GET/POST /v1/items/:id/logs`, `PATCH/DELETE /v1/logs/:id`를 개인 프로젝트에 배포했다. 기록 날짜 수정·삭제 후 DB 트리거의 예정일 재계산, 보관 후 기록 유지와 복원, 이름 충돌 409, 타 사용자 수정 차단을 실제 API에서 검증했다. Edge 단위 테스트 19개와 기존 API 테스트 885개가 통과했고 Edge 처리 모듈의 strict TypeScript 검사도 통과했다.

재검증 스크립트: `supabase/functions/tests/lifecycle-smoke.mjs`. `LASTLY_LIVE_TEST=ovcexehchfxqibspbsyp`로 명시적으로 실행하며, 익명 계정 2개를 만들고 해당 실행에서 만든 항목만 삭제한다. 이번 두 번의 실행에서 항목·기록은 모두 정리했고 빈 익명 계정 4개가 남았다. 날짜 입력은 실제 달력 날짜도 확인하여 `2026-02-30` 같은 값은 400으로 거절한다. 이름 변경 시 기존 임베딩은 비우며 AI 임베딩 생성은 AI 이전 단계에서 연결한다. 항목 상세의 주기 제안, 홈·검색·달력, capture, 계정·알림·AI와 웹 전환은 아직 남아 있다.

웹앱에는 내 프로젝트의 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 필요하다. `SUPABASE_SERVICE_ROLE_KEY`는 브라우저에 넣지 않는다. 현재 `NEXT_PUBLIC_API_URL`은 Render API를 가리킨다. API 기능을 Edge Function으로 옮겨 확인한 뒤 이 주소를 단계적으로 전환한다.

## 진행 기준

- 파서를 다시 빌드한 상태에서 API 테스트 13개 묶음, 총 885개가 통과한다.
- API와 파서 TypeScript 검사도 통과한다.
- 알림 발송 Edge Function은 이미 있지만, **내 Supabase에 아직 배포되지 않았다.** 첫 `api` 함수만 배포했다.
- Render의 NestJS API와 Python AI 서버 이전은 아직 시작 단계다.

참고: [Edge Function 환경변수](https://supabase.com/docs/guides/functions/secrets), [예약 실행](https://supabase.com/docs/guides/functions/schedule-functions), [JWT 설정](https://supabase.com/docs/guides/functions/auth-headers).
