# Backend migration checklist

- [x] Establish the current baseline before changing deployment behavior: 885 API tests and both typechecks pass after rebuilding parser.
- [x] Create the new `lastly-personal` Supabase project and apply all 23 database migrations.
- [ ] Configure Vault and Edge Function secrets for the notification scheduler.
- [ ] Verify the deployed Edge Function with a real user (OPTIONS 204 and unauthenticated GET 401 pass; authenticated DB read remains).
- [ ] Migrate items and logs.
- [ ] Migrate capture and preserve Golden Tests.
- [ ] Checkpoint: core user flow works through Supabase.
- [ ] Migrate profile and notification settings.
- [ ] Migrate push notifications and scheduled digest dispatch.
- [ ] Checkpoint: account and notifications work through Supabase.
- [ ] Decide and implement the AI migration path.
- [ ] Switch the web client with a rollback option.
- [ ] Run full verification and retire Render only after approval.
