## Finding from history

We already fixed this on **July 8**:

- You provided the new publishable key: `sb_publishable_L_foF7A1ds9WBnsVnvcNVA_JYrRwm8B`
- `.env` was updated to use that value for:
  - `SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- Server-side code was repointed to:
  - `IDIA_PUBLISHABLE_KEY`
  - `IDIA_SECRET_KEY`

The current project state has **regressed**: `.env` is back to the old JWT-format anon key for both publishable env vars. That is why Supabase Auth returns `Legacy API keys are disabled` on every login attempt.

## Permanent fix plan

### 1. Restore the known-good publishable key

Update `.env` so both browser/server publishable entries use the July 8 key again:

```env
SUPABASE_PUBLISHABLE_KEY="sb_publishable_L_foF7A1ds9WBnsVnvcNVA_JYrRwm8B"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_L_foF7A1ds9WBnsVnvcNVA_JYrRwm8B"
```

Keep `SUPABASE_URL` / `VITE_SUPABASE_URL` unchanged.

### 2. Add a startup guard against legacy JWT keys

Add a small client-side validation in `src/integrations/supabase/client.ts` before `createClient(...)`:

- If the configured publishable key starts with `eyJ`, fail fast with a clear error like:
  - `Supabase publishable key is a disabled legacy JWT. Use sb_publishable_...`
- This prevents the app from silently using a reverted legacy key again.

### 3. Add the same guard to authenticated server middleware

Add the same validation in `src/integrations/supabase/auth-middleware.ts` for the server publishable key path.

This protects `requireSupabaseAuth` server functions if runtime env is ever pointed back at a JWT-format key.

### 4. Add the same guard to privileged server client

Add a clear validation in `src/integrations/supabase/client.server.ts`:

- Prefer `IDIA_SECRET_KEY` as it does today.
- If the value starts with `eyJ`, fail fast with a message that the secret must be the new `sb_secret_...` format.

### 5. Tighten `life-pii-bridge` fallback order

Update `supabase/functions/life-pii-bridge/index.ts` so it does **not** fall back to disabled legacy variables after `IDIA_*`:

Current fallback still includes:

```ts
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
SUPABASE_PUBLISHABLE_KEY
```

Plan:

- Use `IDIA_SECRET_KEY` first.
- Use `IDIA_PUBLISHABLE_KEY` only if needed.
- Reject any key that starts with `eyJ` with a clear server misconfiguration error.
- Do not silently try disabled legacy keys.

### 6. Verify the actual failure path

After implementation:

- Reload preview.
- Attempt OTP/login.
- Confirm `/auth/v1/otp` no longer sends the old JWT in `apikey` / `authorization` headers.
- Confirm no console error says `Legacy API keys are disabled`.

## Not changing

- No RLS changes.
- No profile policy changes.
- No blockchain logic changes.
- No payment function changes unless they reference disabled Supabase keys.
- No secret values will be exposed or committed beyond the public `sb_publishable_...` key.