# Backend migration checklist

- [x] Establish the current baseline before changing deployment behavior: 885 API tests and both typechecks pass after rebuilding parser.
- [x] Create the new `lastly-personal` Supabase project and apply all 23 database migrations.
- [ ] Configure Vault and Edge Function secrets for the notification scheduler.
- [x] Verify the first Edge endpoint: OPTIONS 204, unauthenticated 401, authenticated anonymous GET 200, and cross-user item isolation. Test item removed; test Auth users remain.
- [ ] Migrate items and logs. List, create, complete, and undo are deployed and verified; history, update, archive/restore, search, calendar/feed remain.
- [ ] Migrate capture and preserve Golden Tests.
- [ ] Checkpoint: core user flow works through Supabase.
- [ ] Migrate profile and notification settings.
- [ ] Migrate push notifications and scheduled digest dispatch.
- [ ] Checkpoint: account and notifications work through Supabase.
- [ ] Decide and implement the AI migration path.
- [ ] Switch the web client with a rollback option.
- [ ] Run full verification and retire Render only after approval.
