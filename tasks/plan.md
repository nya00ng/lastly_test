# Implementation Plan: Move the backend from Render to Supabase

## Overview

Move the application backend in small, verifiable slices from the two Render Docker services to the user's Supabase project. Reuse the repository's migrations, Auth integration, RLS, RPCs, rule parser, and Golden Tests. The upstream repository already includes a Supabase Edge Function for digest delivery.

## Architecture Decisions

- Use the user's own Supabase project as the source of truth for database, Auth, RLS, migrations, and RPCs.
- Do not attempt to deploy the existing NestJS or Python FastAPI containers unchanged to Supabase Edge Functions.
- Migrate the REST API by vertical feature slices so each slice has an endpoint, authentication, database access, tests, and a frontend verification.
- Keep server-side AI available while the API moves. Decide separately whether the Python AI logic will be ported to TypeScript, replaced by direct provider calls, or retired in favor of the browser rule/local-AI path.
- Keep Render running until the Supabase path passes the same Golden Tests and core browser flows.
- Never place the Supabase service-role key in browser code.

## Task List

### Phase 1: Baseline and foundation

- [x] Task 1: Record the current API contracts, environment variables, database migrations, cron jobs, and baseline test results. API baseline: 13 suites and 885 tests pass after rebuilding the parser package; API and parser typechecks pass.
- [ ] Task 1a: Create or select the user's Supabase project, apply migrations, deploy the existing digest Edge Function, and configure Vault/Edge secrets. The new Seoul project and all 23 migrations are done; digest secrets and deployment remain.
- [x] Task 2: Create a Supabase Edge Function foundation with shared environment loading, Supabase Auth token verification, JSON responses, CORS, and error handling. Initial `api` function is deployed; six isolated tests, preflight 204, unauthenticated 401, anonymous JWT 200, and cross-user isolation pass.

### Phase 2: Core user flow

- [ ] Task 3: Move item and log operations: list, create, update, archive/restore, complete, and history.
- [ ] Task 4: Move capture operations: interpret, cadence preview, and commit, preserving the existing rule parser and Golden Test behavior.

### Checkpoint: Core user flow

- [ ] Items and logs work with a real Supabase user.
- [ ] Existing rule and sequence Golden Tests pass.
- [ ] The browser can create an item and record a completion through the new endpoint.
- [ ] Render remains available as a rollback path.

### Phase 3: Account and notifications

- [ ] Task 5: Move profile, notification settings, export, and account deletion operations.
- [ ] Task 6: Move push subscription and notification action operations, then validate Web Push/VAPID behavior in the Edge Function runtime.
- [ ] Task 7: Verify the existing digest Edge Function and pg_cron on the user's project, disable the Render keep-awake job, and prevent duplicate dispatch during cutover.

### Checkpoint: Account and notifications

- [ ] Profile and settings flows work.
- [ ] Notification subscription and complete/snooze actions work.
- [ ] Scheduled digest runs once per user without duplicate sends.

### Phase 4: AI and cutover

- [ ] Task 8: Choose and implement the AI migration path: TypeScript port, direct provider calls from Edge Functions, or temporary external AI service.
- [ ] Task 9: Switch the web client to the Supabase API behind a rollback flag and run the full typecheck, unit tests, Golden Tests, and browser smoke test.
- [ ] Task 10: Observe the Supabase path, then remove Render only after the user confirms the new deployment is stable.

### Checkpoint: Complete

- [ ] API and scheduled jobs no longer depend on Render.
- [ ] AI behavior has an explicit supported fallback path.
- [ ] All required tests and the main user flow pass.
- [ ] Render can be retired without losing data or functionality.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| NestJS cannot be copied directly into Edge Functions | High | Port one endpoint group at a time and preserve contracts with focused tests. |
| Python FastAPI AI service cannot run unchanged in hosted Edge Functions | High | Separate API migration from AI migration; keep the current AI fallback until a replacement is verified. |
| Service-role queries bypass RLS | High | Keep user ownership predicates in repositories during the first port; add authenticated-user tests for every endpoint. |
| Web Push behaves differently in the Edge runtime | Medium | Test VAPID delivery and expired-subscription cleanup before switching notifications. |
| Cron sends duplicate digests during cutover | High | Disable only one scheduler at a time and add idempotency/observability before changing the URL. |
| A failed migration interrupts the app | High | Keep Render deployed and switch endpoints only behind a reversible configuration change. |

## Open Questions

- The first API slice uses one `api` Edge Function with internal routing. Revisit this only if bundle size or deployment isolation requires it.
- Should server-side AI remain external, or should the Python logic be ported to TypeScript?
- The user chose a new Supabase project rather than reviving the paused one. `lastly-personal` is healthy in Seoul, project ref `ovcexehchfxqibspbsyp`; do not alter the paused project.
