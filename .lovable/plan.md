## Root cause

The "Legacy API keys are disabled" 401 on `/auth/v1/otp` comes from the **browser Supabase client**. Its API key is baked in at build time from `VITE_SUPABASE_PUBLISHABLE_KEY`, and `.env` still holds the old JWT anon key that Supabase disabled on 2026-06-03. Every login attempt sends that dead key as `apikey` + `Authorization`, and Supabase Auth rejects it before any edge function runs.

A secondary bug: `supabase/functions/life-pii-bridge/index.ts` has an orphaned `console.error(...) / return / }` block (lines 38–40) left over from an earlier edit. That's a syntax error, which is why the function also 500s.

## Fix

1. **`.env`** — replace the two publishable-key lines with the new key you already provided:
   - `SUPABASE_PUBLISHABLE_KEY="sb_publishable_L_foF7A1ds9WBnsVnvcNVA_JYrRwm8B"`
   - `VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_L_foF7A1ds9WBnsVnvcNVA_JYrRwm8B"`
   - Leave URL and project id untouched. This is what permanently fixes the login legacy-key error — Vite will rebuild the browser bundle with the live key.

2. **`supabase/functions/life-pii-bridge/index.ts`** — delete the dead lines 38–40 (the duplicate `console.error` / `return` / `}` after the valid `if` block) so the function parses and stops 500-ing.

3. **Verify** — reload preview, attempt login: `/auth/v1/otp` should return 200; `hydrate-terminal` should stay 200; `life-pii-bridge` should return PII (or 401 if unauth) but not 500.

## Not doing

- No changes to server env vars (`IDIA_PUBLISHABLE_KEY` / `IDIA_SECRET_KEY` are already correctly wired in `client.server.ts`, `auth-middleware.ts`, and the edge function fallback chain).
- No RLS, schema, or provider-config changes.
