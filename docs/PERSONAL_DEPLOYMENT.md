# 개인 배포 상태 (2026-10-19)

이 문서는 이전 단계 기록인 OWN_SUPABASE_MIGRATION.md와 tasks의 체크리스트보다 최신이다.

대상: `nya00ng/lastly_test`, Supabase `lastly-personal` (`ovcexehchfxqibspbsyp`). 세빈 서비스와 기존 일시정지 프로젝트는 변경하지 않았다. 기존 사용자 데이터는 복사하지 않은 새 DB다.

## 완료 및 검증

- DB 마이그레이션 24개 적용, 익명 로그인 활성화. RLS 및 다른 사용자의 항목에 기록/별칭 삽입 차단을 실제 요청으로 검증했다.
- 기존 Nest 서비스와 원본 규칙 파서를 번들링해 Edge API에서 호출한다. Nest HTTP 서버나 Python 컨테이너를 실행하는 방식은 아니다.
- 항목/기록 CRUD, 보관/복원, 완료/되돌리기, 홈/달력/검색, capture 해석/주기/확정, 프로필/설정/내보내기/탈퇴, 알림 구독/해제/행동 API를 배포했다.
- JWT 검증 후 사용자 권한 클라이언트로 실행한다. service-role은 인증된 본인 계정 삭제에만 사용한다.
- digest 함수와 Vault/CRON/VAPID 설정 완료. 5분 주기 작업의 HTTP 200 응답을 확인했다. 휴면 방지 작업은 없다.
- 기존 API 885개 테스트, Edge 22개 테스트, API/web 타입 검사와 웹 production build 통과. Edge 22개 중 19개는 이전 모듈, 3개는 새 통합 처리기 테스트다.
- 통합 live smoke에서 API 기능과 사용자 격리를 검증했다. 통합 smoke 계정은 정리한다. 이전 lifecycle smoke의 빈 익명 계정은 남아 있을 수 있다.
- 로컬에서 “오늘 책 읽었고 일주일에 한번씩 읽을거야”가 `책 읽기`, 오늘 완료, 1주 주기로 저장됐다. 표시용 테스트 기록 1개는 남아 있다.

## 제외 / 미검증

- 사용자 선택에 따라 서버 Gemini 및 임베딩 비활성화. 키만 추가하면 켜지는 상태가 아니며 AI 어댑터 연결이 별도로 필요하다.
- 브라우저 규칙은 검증했다. 기기 Gemma 경로는 유지했지만 모델 다운로드/실제 추론은 이번에 검증하지 않았다.
- Google OAuth 미설정. `NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=false`로 숨기고 익명 사용을 안내한다. 브라우저 데이터 삭제 시 익명 기록에 접근하지 못할 수 있다.
- 푸시 구독 API와 예약 함수 호출은 검증했지만 실제 기기 푸시 수신은 미검증이다.
- Vercel 배포와 실제 도메인 저장 검증 진행 중.
- 현재 통합 API는 원본 공용 입력 스키마를 사용한다. 이전 문서의 별도 달력 날짜 검증 설명은 현재 통합 처리기에 해당하지 않는다.

## 재배포 및 복구

루트에서 `node scripts/build-edge-backend.mjs`를 먼저 실행한다. 생성 파일 `supabase/functions/_shared/backend.js`는 Git에서 제외된다. 그 뒤 `supabase functions deploy api --project-ref ovcexehchfxqibspbsyp`를 실행한다. digest도 동일 프로젝트에 배포한다.

`scripts/configure-personal-backend.mjs`는 Windows 초기 설정/복구용이다. 재실행 시 기존 VAPID를 보존하고 CRON_SECRET을 Vault와 함께 교체하므로 매 배포마다 실행하지 않는다. 비밀값은 저장소나 브라우저에 넣지 않는다.

Vercel: 루트 `apps/web`, 브랜치 `main` (검증한 `codex/supabase-backend`를 fast-forward 반영), 해당 폴더 vercel.json. 공개 환경변수: 개인 Supabase URL/publishable key, Edge API URL, VAPID 공개키, 개발 로그인 false, Google 로그인 false. Edge CORS_ORIGIN에는 실제 웹 origin과 localhost만 허용한다.

문제 시 동일 개인 Supabase를 쓰는 직전 검증 커밋/배포로 웹과 Edge를 되돌린다. DB/사용자 데이터는 삭제하지 않는다. 세빈 Render URL만 다시 붙이면 개인 DB와 불일치하므로 그렇게 전환하지 않는다. 기존 Render는 이번 작업에서 종료하지 않는다.
