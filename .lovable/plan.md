## Context

Supabase disabled the legacy JWT-format `anon` and `service_role` keys for the connected project (`zxyngqciipcvveigrzqt`) and reissued them in the new `sb_publishable_...` / `sb_secret_...` format. The current `.env` still ships the old JWT anon key, and the server runtime secrets (`SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) still reference the disabled values, so both the browser client and every server function / edge function are now hitting Supabase with rejected keys.

## Plan

1. **Collect the new keys from the user** (they are not something I can read from Supabase). Ask for:
   - New publishable key (`sb_publishable_...`) — public, safe to commit.
   - New service role / secret key (`sb_secret_...`) — must go through the secure secret form.

2. **Update the browser publishable key** in `.env`:
   - Replace `VITE_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_PUBLISHABLE_KEY` with the new `sb_publishable_...` value.
   - Leave `SUPABASE_URL` / `VITE_SUPABASE_URL` / project id unchanged.
   - `src/integrations/supabase/client.ts`, `client.server.ts`, and `auth-middleware.ts` already read from these env vars — no code edits needed.

3. **Update runtime secrets** used by server functions and edge functions:
   - `SUPABASE_PUBLISHABLE_KEY` → new publishable key (via `set_secret`, non-sensitive).
   - `SUPABASE_SERVICE_ROLE_KEY` → new secret key (via `add_secret` secure form so the value never passes through chat).
   - This also refreshes the key that `hydrate-terminal`, `relay-usdc-transfer`, `flexa-payment-processing`, and `fiat-payment-processing` edge functions rely on.

4. **Verify** after keys are in place:
   - Reload the preview and confirm the Supabase client boots without `Invalid API key` errors in the console.
   - Trigger `TerminalProvisionGate` hydration path and confirm `hydrate-terminal` still returns 200.
   - If any edge function still 401s, redeploy it so it picks up the new secret.

## Out of scope

- `LOVABLE_API_KEY` (separate rotation tool, not affected by Supabase key rotation).
- Any change to RLS, table grants, or the provisioning fallback logic added earlier.
- Rewriting the auth middleware or client files — they already source keys from env.

## What I need from you

Please paste the new **publishable key** (`sb_publishable_...`) in chat, and be ready to paste the new **secret key** (`sb_secret_...`) into the secure form I'll open for `SUPABASE_SERVICE_ROLE_KEY`.
