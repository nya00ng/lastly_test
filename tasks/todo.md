# Backend migration checklist

- [x] Establish the current baseline before changing deployment behavior: 885 API tests and both typechecks pass after rebuilding parser.
- [ ] Select the user's Supabase project and configure its database, Vault, and Edge Function secrets.
- [ ] Build and test the shared Supabase Edge Function foundation.
- [ ] Migrate items and logs.
- [ ] Migrate capture and preserve Golden Tests.
- [ ] Checkpoint: core user flow works through Supabase.
- [ ] Migrate profile and notification settings.
- [ ] Migrate push notifications and scheduled digest dispatch.
- [ ] Checkpoint: account and notifications work through Supabase.
- [ ] Decide and implement the AI migration path.
- [ ] Switch the web client with a rollback option.
- [ ] Run full verification and retire Render only after approval.
