# Rule V2.1 Public Preview Authorization Gate

Date: 2026-09-17

Final verdict: **PREVIEW READY FOR DEVICE QA**

## Access and Authorization

1. Historical `Not authorized` was not reproduced. Current `whoami`, `teams ls`, project inspection and deployment all succeeded. There is insufficient historical evidence to attribute that earlier error to a specific account/token cause. The current phone-access blocker was confirmed separately: the original project has `ssoProtection.deploymentType=all_except_custom_domains`.
2. CLI account: `eg2x228-6731`.
3. Team: `nya00ng`, account ID `team_7IpZ4ZurqTXjx4aG0yMUDZF6`. Original project `lastly`, ID `prj_EHwRr6bPM4d0BjnRhrrY5Oe4DfIa`. Local link matches the remote project; successful deploy proves current deployment authorization.
4. Existing-project Preview succeeded: deployment `dpl_behzDUWPiEJCdA61JCkSfseAe3hV`. It retains the original project's authentication protection and is not the phone-test URL.
5. Separate test project created: `lastly-rule-v21-pilot`, ID `prj_2ClWqMZzXjgKiJCGNBcWE5FTGtJ0`. Only this project's SSO protection was set to null.
6. Strategy: deployment-scoped environment overrides plus temporary `VERCEL_PROJECT_ID`/`VERCEL_ORG_ID` process variables. The original `.vercel/project.json` was not rewritten or unlinked. Vercel automatically classified the test project's first deployment as production despite the requested preview target. That bootstrap URL is not recommended: the existing PILOT_PREVIEW_ONLY guard blocks its parser. The subsequent deployment is a genuine Preview (`target: null`), and is the tested URL below. No original Production alias was moved.
7. Public Preview / identical URL for QR encoding: https://lastly-rule-v21-pilot-9o4av66rb-nya00ng.vercel.app/ . Deployment ID: `dpl_3nkUECM3RBJDYTqAeJnqzqxWhF7j`. A fresh browser and unauthenticated HTTP requests accessed it without Vercel login or bypass tokens.
8. Preview provider proof: GET `/api/ai/parse` returned `provider: rule-v21`; actual Product POST responses returned `mode: RULE`. Environment values were passed to this deployment only.
9. Original Production provider proof: POST `https://lastly-six.vercel.app/api/ai/parse` returned `ok: true, mode: MOCK` before and after Preview work. Its Production AI_PROVIDER setting was not written.
10. Original Production unchanged proof: before/after inspection resolves `lastly-six.vercel.app` to `dpl_DY5GEayktFhi54MMGLKY4q2emm1w`, URL `lastly-1r8w6cgwz-nya00ng.vercel.app`, created September 9. Aliases `lastly-six.vercel.app` and `lastly-nya00ng.vercel.app` unchanged. Original SSO protection unchanged. No original project deletion, unlink, environment write or alias operation was performed.

## Runtime QA

11. Unauthenticated route smoke: `/`, `/record`, `/items`, `/notification`, `/settings` all HTTP 200.
12. Actual public Preview Product `/record` UI smoke in Chromium:

| Input | Observed result |
| --- | --- |
| 화분 물줬어 | COMPLETED; confirmation name `화분 물 주기`; no save click |
| 신발 언제 빨았어 | QUERY; `신발 세탁`, last record August 20; save CTA 0 |
| 칼 갈았어 | COMPLETED; confirmation name `칼 갈기`, not replacement |
| 커피 갈았어 | COMPLETED; confirmation name `커피 갈기`, not replacement |
| 신발 빨려고 했어 | PLANNED; blocked UI, save CTA 0 |
| 화분 물 안 줬어 | NOT_COMPLETED; blocked UI, save CTA 0 |
| 2026년 8월 1일 신발 빨았어 | EXACT / EXPLICIT / 2026-08-01; confirmation date matches, no implicit-today notice |
| 2099년 1월 1일 신발 빨았어 | DATE clarification; record_candidate false; save CTA 0 |

All parses used the real Preview browser Worker and API route, not mocked responses. Confirmation inputs were inspected separately to verify the displayed item names. No save button was clicked. Console: 0 errors, 0 warnings in the inspected session.

13. Physical microphone: **MANUAL DEVICE REQUIRED**. No simulated speech event is counted as real microphone verification. Test the same Product URL on iPhone Safari/Chrome and Galaxy Chrome/Samsung Internet.
14. `npm run typecheck`: PASS.
15. `npm run lint`: PASS.
16. `npm run build`: PASS locally and on Vercel. Remote install warnings about existing dependency lifecycle scripts and ESLint support were not hidden or fixed in this authorization-only task.
17. `git diff --check`: PASS; existing CRLF conversion notices only.
18. Source changes in this task: none. Added this report; browser-generated artifacts under `.playwright-cli/`. Existing dirty Pilot/Blocker changes preserved. Workspace `C:\Users\Administrator\Desktop\lastly`, branch `main`, HEAD `5f49306f37b0e532ec8a800270221a739435fc3f`. No commit/push performed.
19. **PREVIEW READY FOR DEVICE QA**. Public access and provider separation verified; physical-device voice QA remains pending. The exact historical authorization failure cause remains unconfirmed, rather than being retrospectively guessed.

The test project is disposable and has no persistent user data. The original Production remains mock. This gate does not authorize a Production parser switch.
