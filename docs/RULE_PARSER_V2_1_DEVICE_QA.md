# V2.1 Manual Device QA

Date: 2026-09-17. Execution status: PREVIEW READY; PENDING PHYSICAL DEVICE EVIDENCE.
No DEVICE QA verdict yet. Unverified is not PASS and is not an observed FAIL.
Previous desktop automation does not substitute for these four environments.

## Test origin

HTTPS Preview: https://lastly-6t63yrh6m-nya00ng.vercel.app/rule-parser-lab

Deployment: dpl_JsdNBVR8cozkosK55ktnbkSaL6Kx, READY, Preview (not Production).
Vercel authentication completed by the user. The origin retains Deployment
Protection: unauthenticated requests redirect to Vercel login. Sign in using an
authorized account on each test browser. No protection setting was disabled.
Authorized CLI verification uses Vercel's supported deployment protection token;
the token is not included in this document or shared test URL.

Remote build PASS. Authorized Lab response HTTP200 contains Rule Parser Lab V2.1,
the input and initialization controls. This is HTTP/rendered-HTML evidence only,
not mobile WASM initialization evidence. Preview Product API probe returned
MOCK / QUERY / record_candidate=false for 신발 언제 빨았어.
Existing Production https://lastly-six.vercel.app/rule-parser-lab remains HTTP404.
Production was not promoted or replaced.

Deployment-only settings: RULE_PARSER_LAB_ENABLED=1, AI_PROVIDER=mock,
LOCAL_AI_LAB_ENABLED=0. Do not change project-wide Production settings.
Exclude output, local env files, archives and personal documents from uploads.
Preview authentication, if present, must be handled by legitimate tester login;
do not disable protection as a workaround.

## Environment record

| Device | Browser | OS version | Browser version | Network | HTTPS origin | Tester/date |
| --- | --- | --- | --- | --- | --- | --- |
| iPhone 16 Pro | Safari | pending | pending | pending | Preview above | pending |
| iPhone 16 Pro | Chrome | pending | pending | pending | Preview above | pending |
| Galaxy Z Flip3 | Chrome | pending | pending | pending | Preview above | pending |
| Galaxy Z Flip3 | Samsung Internet | pending | pending | pending | Preview above | pending |

## Device matrix

All PENDING values require physical-device evidence, not viewport emulation.

| Check | iPhone Safari | iPhone Chrome | Flip3 Chrome | Flip3 Samsung |
| --- | --- | --- | --- | --- |
| Load / no blank page | PENDING | PENDING | PENDING | PENDING |
| Cold init, ms | PENDING | PENDING | PENDING | PENDING |
| Repeat init, ms | PENDING | PENDING | PENDING | PENDING |
| Completed | PENDING | PENDING | PENDING | PENDING |
| Query | PENDING | PENDING | PENDING | PENDING |
| Planned | PENDING | PENDING | PENDING | PENDING |
| Negative | PENDING | PENDING | PENDING | PENDING |
| Uncertain | PENDING | PENDING | PENDING | PENDING |
| Polysemy | PENDING | PENDING | PENDING | PENDING |
| Water | PENDING | PENDING | PENDING | PENDING |
| New names | PENDING | PENDING | PENDING | PENDING |
| Edit / reparse | PENDING | PENDING | PENDING | PENDING |
| 100-repeat total/mean/max | PENDING | PENDING | PENDING | PENDING |
| Offline loaded session | PENDING | PENDING | PENDING | PENDING |
| Offline reload | PENDING | PENDING | PENDING | PENDING |
| Back / reload / revisit | PENDING | PENDING | PENDING | PENDING |
| Voice transcript paste | PENDING | PENDING | PENDING | PENDING |
| Console errors | PENDING | PENDING | PENDING | PENDING |
| Crash / tab kill / freeze | PENDING | PENDING | PENDING | PENDING |
| Heat / memory pressure | PENDING | PENDING | PENDING | PENDING |
| Verdict | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |

## Procedure per environment

1. Record OS/browser versions and Wi-Fi/cellular details. Open the Preview lab URL.
2. Press 분석기 초기화. Record the displayed initialization milliseconds, whether
   this is first visit or repeat, and any failed/blank page. Do not clear unrelated
   browser data. If a truly cold cache cannot be established, label it unknown.
3. Enter each input below, press 분석하기, and capture the JSON result or screenshot.
   Record intent, target, action, matchingSurface, candidates, newItemCandidate,
   suggestedItemName, nextStep and processing ms. Never interpret a candidate as
   an actual save. The lab contains no persistence operation.
4. Where remote browser debugging is unavailable, record console as UNVERIFIED,
   not zero based only on the absence of an on-screen error.

### Required inputs

Completed:
- 신발 빨았어
- 화분 물줬어
- 보조배터리 충전했어
- 자동차 워셔액 넣었어
- 가습기 말렸어

Polysemy:
- 칼 갈았어
- 커피 갈았어
- 정수기 필터 갈았어
- 렌즈 갈았어

Knife and coffee must retain 갈다 / 갈기, never 교체. Filter and lens can offer
their compatible replacement items. All candidates still require review.

Water:
- 화분 물줬어
- 화분에 물 줬어
- 화분에 물을 줬어

Expect COMPLETED, target 화분, action 물 주다, suggested 화분 물 주기.

Query:
- 신발 언제 빨았어
- 렌즈 언제 갈았어
- 정수기 필터 언제 갈았어
- 칼 언제 갈았어
- 화분 언제 물줬어

Expect QUERY and recordCandidate=false; only compatible existing candidates.

Planned:
- 신발 빨려고 했어
- 렌즈 다음주에 갈 거야
- 화분 물 주려고 했어
- 가습기 말려야 해

Expect PLANNED or safe clarification, never COMPLETED / positive record candidate.

Negative:
- 신발 안 빨았어
- 정수기 필터 못 갈았어
- 화분 물 안 줬어
- 가습기 아직 안 말렸어

Uncertain:
- 신발 빨았나
- 화분 물 줬나
- 렌즈 갈았는지 모르겠어
- 가습기 말렸나 기억 안 나

Expect NOT_COMPLETED / UNCERTAIN respectively and no record candidate.

New names: recheck 화분 물줬어, 자동차 워셔액 넣었어, 가습기 말렸어,
칼 갈았어, 그릇 씻었어. No wrong name and no automatic save.

### Edit and reparse

In the same textarea, successively analyze 화분 물줬어, 화분 물 안 줬어,
화분 내일 물 줄 거야. Capture all three outputs and verify no stale positive
candidate remains after the negative/planned input.

### 100-repeat stability

Use the existing 100 cases from lib/rule-parser/evaluation-v21.ts / the `unseen`
rows in output/rule-parser-v21/results.json. Enter them through the unmodified
lab UI. Record each displayed ms; processing total=sum(ms), mean=sum/100,
max=max(ms). Record wall-clock duration separately: manual typing/tapping time
is not parser latency. Do not install a batch feature for this task.
Record freeze, involuntary reload, crash, memory pressure symptoms and subjective
heat. If only a subset is completed, report N/100 rather than PASS.

### Offline and navigation

After initialization, disable both Wi-Fi and cellular. Parse a new input in the
same loaded tab. Record this separately from an offline reload. Offline reload
failure alone is an acceptable documented limitation, not parser-init failure
on an online origin. Reconnect, reload, go back/revisit and initialize again;
record each displayed init time. Do not claim a service worker/PWA exists.

### Voice transcript bridge

Use the unchanged Product voice flow for 화분 물줬어, 신발 언제 빨았어,
정수기 필터 갈았어. Copy the actual STT transcript, including spacing/errors,
into the lab manually. Record spoken phrase, actual transcript and V2.1 result.
Do not automatically wire voice to the new parser or save during this check.

## Acceptance

Any negative/planned/uncertain -> COMPLETED, Query -> Record, knife/coffee ->
replacement, incompatible existing candidate, repeated crash/tab kill, or online
parser-init failure is a DEVICE QA FAIL. Safe clarification/LOW/no candidate/raw
fallback and offline reload limitations must be disclosed as usability limits.

Only after actual results are collected choose DEVICE QA PASS, DEVICE QA PASS
WITH LIMITATIONS, or DEVICE QA FAIL. Current state is pending, not a fabricated
member of that completed-test verdict set. Product integration requires a separate
approval task even after a passing device gate.

## Current change record

Only .vercelignore (deployment exclusion) and this QA document added in this task.
No Parser rule, application feature, Product integration or provider change.
No device/browser version, latency, heat or crash result has been supplied yet.
No local typecheck/lint rerun: application code is unchanged. Vercel build and
TypeScript check passed remotely. Deployment emitted package install-script
approval warnings for existing dependencies; no new package was added to the app.
No commit/push. Only the explicitly authorized Preview deployment was created.
