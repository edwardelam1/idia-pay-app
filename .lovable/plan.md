## Security fixes: enable RLS + lock down profiles

Four error-level findings, all fixed via one migration.

### 1. Enable RLS on the three proposal tables

`dao_proposals`, `governance_proposals`, and `user_proposals` already have policies defined — RLS is just switched off, so the policies aren't enforced. Fix:

```sql
ALTER TABLE public.dao_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_proposals ENABLE ROW LEVEL SECURITY;
```

### 2. Require authentication on the proposal tables

Existing policies on these tables use `USING (true)` for the `public` role, meaning anon can read. Per your request ("require authentication only"), drop the public-read policies and replace with `TO authenticated` equivalents. Writes stay restricted to their existing rules (service_role for `governance_proposals`, owner for `user_proposals`, etc.).

### 3. Lock down `profiles`

Drop the `Enable read access for all users` policy (`USING (true)`) and replace with owner-only read:

```sql
DROP POLICY "Enable read access for all users" ON public.profiles;
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

Existing insert/update owner policies stay.

### 4. Deliverable

One `supabase--migration` call with all four changes. Everything is SQL-only — no app code changes needed since the app already queries under authenticated sessions.

---

### `dao_proposals` vs `governance_proposals`

- **`dao_proposals`** — Off-chain committee/DAO-internal proposals inside the app: created by users/committees, discussed via `proposal_comments`, voted on via `dao_votes`, vetoed via `dao_vetoes`. Domain-level governance objects that live entirely in Postgres.
- **`governance_proposals`** — Mirror of **on-chain** protocol proposals indexed from the blockchain (via `governance_indexer_state` and `governance_ledger`). Writes are restricted to `service_role` because only the indexer should insert/update them; users only read.

Same word "proposal", different layers: `dao_proposals` = app-native committee workflow, `governance_proposals` = read-only reflection of on-chain governance state.
