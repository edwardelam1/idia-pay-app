## Restore public read on `profiles`

You've confirmed `profiles` is a PII-free public user directory. The blockchain balance regression is because the previous migration dropped the `USING (true)` SELECT policy — cross-user lookups (wallet address, display name, trust score) now return 0 rows and the balance widget falls back to `$0.00`.

### Migration

One `supabase--migration` call:

```sql
CREATE POLICY "Enable read access for all users"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);
```

The existing owner-scoped policies (`Users can view their own profile`, insert, update) stay in place — this just re-adds the public read layer on top.

### Security finding

After the migration, `ignore` the `profiles_public_read` finding via `security--manage_security_finding` with the explanation that `profiles` is intentionally a PII-free public user directory (wallet address, display name, trust score only). Also update `@security-memory` so the scanner stops re-flagging it.

### Not touched

The three proposal-table fixes (`dao_proposals`, `governance_proposals`, `user_proposals` — RLS enabled, public policies dropped) stay as-is. Those were unrelated to the balance regression.

### After approval
1. Run the migration.
2. Ignore + memo the profiles finding.
3. Confirm balances reappear.
