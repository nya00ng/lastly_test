# Rule Parser V2.1 Product Integration Pilot

Date: 2026-09-17

## Decision

**PARTIAL**. Local Product integration is ready for device testing. Preview deployment failed with `Not authorized`; CLI reports account `eg2x228-6731`. No new Preview URL was produced. Physical Product voice QA is pending. Production was not deployed or reconfigured.

## Scope and Files

- `.env.example`: documents opt-in `AI_PROVIDER=rule-v21`; default remains `mock`.
- `app/api/ai/parse/route.ts`: runtime provider/date discovery; rule proposal validation branch; rejects rule pilot in Vercel Production.
- `lib/ai/provider.ts`: missing provider defaults to mock; existing Mock/OpenAI implementations retained.
- `lib/ai/types.ts`: RULE response mode, contextual candidate type, optional suggested name/timing.
- `lib/ai/product-parse.ts`: shared text/transcript request orchestration.
- `lib/ai/rule-pilot.ts`: schema validation, confidence guard and existing server candidate calculation.
- `lib/rule-parser/product-pipeline.ts`: unchanged V2.1 parse/context matching composition using current Store items; exact nominal-name matching for session-created items.
- `lib/rule-parser/product-worker.ts`: lazy Garu/WASM initialization and reuse.
- `lib/rule-parser/product-client.ts`: shared Worker, request correlation, timeout and explicit failure.
- `components/app/UnifiedComposer.tsx`: shared parser call, preserves RULE contextual matching, confirmation names and pilot label.
- `scripts/rule-pilot-smoke.mjs`: integration/safety tests.
- This report and `output/rule-pilot/`: evidence.

Pre-existing Lab, dependency, deployment-ignore and other uncommitted work was preserved. This task added no dependency. No SpeechRecognition, Store, History, Cycle, Month or fixture source was changed.

## Provider and Flow

Default: `AI_PROVIDER=mock`. Test/Preview opt-in: `AI_PROVIDER=rule-v21`.

Both HOME sheet and `/record` use the same UnifiedComposer. Existing SpeechRecognition produces editable transcript; transcript and direct text both call `parseProductInput`.

Flow: GET server provider/Seoul date -> lazy browser Worker V2.1 -> POST proposal -> server schema/confidence/candidate validation -> contextual matching presentation -> existing Query/Confirmation UI.

Parser does not choose Item IDs. Current session items are matching input. LOW/MEDIUM forces clarification; Query and non-completed intents cannot be record candidates. Saving still requires explicit user confirmation. Existing atomic multi-save and future-date guards remain.

Browser proposals/confidence are untrusted Demo input, NOT production write authorization. This is not a persistent backend. The Product pilot still needs the configuration/validation API and is NOT fully offline. No external AI inference is invoked on the rule path.

## Behavior Evidence

`output/rule-pilot/contract.json`: 16 input cases plus new-item query, confidence, future and 2/5/6-action tests PASS.

| Input | Result |
| --- | --- |
| 화분 물줬어 | New 화분 물 주기, confirmation only |
| 자동차 워셔액 넣었어 | New 자동차 워셔액 넣기, confirmation only |
| 가습기 말렸어 | New 가습기 말리기, confirmation only |
| 신발 언제 빨았어 | QUERY, 신발 세탁 |
| 렌즈 언제 갈았어 | QUERY, 렌즈 교체 |
| 정수기 필터 언제 갈았어 | QUERY, 정수기 필터 |
| 정수기 필터 갈았어 | Existing item, confirmation only |
| 칼 갈았어 / 커피 갈았어 | Literal sharpening/grinding names; not replacement |
| 그릇 씻었어 | 그릇 씻기; not laundry |
| 신발 빨려고 했어 | PLANNED, no candidate |
| 화분 물 안 줬어 | NOT_COMPLETED, no candidate |

Actual Chromium Product text/UI cases are in `browser-first.log` and `browser-flows.log`. `save-history.log` verifies explicit save -> History -> HOME -> Month, and querying the newly created item. No automatic save was performed.

HOME voice callback was tested with simulated recognition events, then the real Worker/API path: transcript 신발 언제 빨았어 -> 찾은 기억 / 신발 세탁; save CTA count 0 (`voice-stub-result.log`). This is NOT physical microphone verification. An initial test assertion used the wrong heading and timed out; the observed actual heading was used for verification without changing app code.

## Initialization and Failure

One lazily created Worker per browser page; Garu initialization Promise and analyzer are reused across Composer mounts. Reload/new page initializes a new Worker. No model load is required by the mock branch.

Measured desktop Chromium samples (not mobile benchmarks): first init 291.5 ms; first parse 88 ms; first text submit-to-UI 982 ms. Warm parses approximately 1.9-6.5 ms, text submit-to-UI 88-152 ms. Simulated voice Query parse 3.4 ms. Real microphone transcript-to-UI latency is unmeasured.

Forced Worker initialization failure: visible localized error, POST count 0, save CTA count 0 (`init-failure.log`). Timeout is 30 seconds; failed Worker is disposed and a user retry can initialize again. No silent mock fallback, including dev/test.

## Regression and Verification

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- Rule pilot contract smoke: PASS.
- Existing V2.1 evaluation: unchanged critical/confidence-error counts; original rule hash unchanged. Existing legacy intent misses are not represented as full corpus accuracy.
- Existing Cycle and Month helper smoke: PASS.
- Mock Product route smoke: six routes, 24/24 fixtures and four Mock API probes PASS.
- Browser save/query/History/HOME/Month synchronization: PASS for tested flow.
- Month 42 cells preserved at 360/390/430/1024; no horizontal overflow in tested Month layouts.
- Month DUE/UPCOMING/NORMAL filters: Activity count stays 4; Due counts 3/0/1 in current test month; recorded in `responsive.log`.
- Full physical touch/Delete/Settings/voice regression was not rerun; those source modules were unchanged. Do not infer complete physical regression PASS from source preservation.
- Existing Node evaluator warning about module type/deprecation remains; browser server error logs were empty for tested sessions.

## Preview and Device QA

Local Product rule test: `http://127.0.0.1:3103/`.
Local Mock comparison: `http://127.0.0.1:3102/`.
Localhost links are for this computer, not a phone-share URL.

Preview command used `--target=preview`, `AI_PROVIDER=rule-v21`, Lab enabled and Gemma Lab disabled. Authorization failed. Reauthenticate with access to the existing LASTLY project before retrying. Do not change deployment protection or Production to work around this.

Pending: iPhone 16 Pro Safari, iPhone Chrome, Galaxy Z Flip3 Chrome, Samsung Internet. Test in Product, not Lab: 화분 물줬어; 신발 언제 빨았어; 정수기 필터 갈았어; 렌즈 언제 갈았어; 칼 갈았어; 커피 갈았어; 신발 빨려고 했어; 화분 물 안 줬어. Verify editable transcript, correct routing, no auto save, and explicit confirmation. Existing user Lab QA does not establish this Product pilot's voice/device PASS.

## Known Limitations

- Existing V2.1: 나 화장실 청소했어 is conservative LOW clarification; 화분물안줬어 is UNKNOWN rather than NOT_COMPLETED but cannot save; 렌즈 다음주에 갈꺼야 remains low action confidence. No rule relaxation was introduced.
- Matching is conservative and may have less recall than the Mock parser. New names use literal suggested nominal forms; exact-name follow-up query is supported without adding target-only fuzzy matching.
- Browser SpeechRecognition remains browser/OS/network dependent and may use the browser vendor's service. This is not local offline STT.
- Demo Store remains session-only. Refresh does not persist newly saved items.
- Production switching requires separate approval after actual Preview/device QA. Current final verdict: **PARTIAL**.
