# Defensive Payload Parsing for Hub Manifest

The `hydrate-terminal` edge function returns 200 OK, but the payload may arrive stringified or with the business ID nested inside a config block. Add defensive parsing and a recursive deep-search so Pay binds regardless of manifest shape.

## Changes

### 1. `src/components/nanobites/system/TerminalProvisionGate.tsx`

Replace the payload-mapping block (from `const payload = envelope.payload;` through the `!targetBusiness.id` guard) with:

- **Defensive parse:** if `envelope.payload` is a string, `JSON.parse` it inside a try/catch; log `[STEP]` on success or a warning on failure.
- **Inspection logging:** `logPlanck` a `PROVISION_INSPECT` step listing root keys, plus `console.dir(payloadObj, { depth: null })` so the exact shape lands in DevTools.
- **`deepFind(obj, targetKeys)` helper** (typed against `unknown` to match file lint style): checks current-level keys first, then recurses into every nested object/array. Returns first non-null / non-empty match.
- **Broad key net:**
  - ID: `businessId`, `business_id`, `merchantId`, `organization_id`, `org_id`
  - Name: `clientOrganization`, `business_name`, `merchantName`, `org_name`, `name` (fallback `"Authorized Terminal"`)
- **Unwrap wrapped IDs:** if extracted ID is an object with `.id`, use `String(extractedId.id)`; else coerce to string.
- Keep the `PROVISION_MALFORMED` toast + marker, but include root keys in the error detail so failures are diagnosable from Planck logs alone.
- Downstream `HardwareStorage.setItem`, `onProvisioned`, success toast, and `PROVISION_SUCCESS` marker unchanged.

### 2. `src/lib/provisioning-engine.ts`

Mirror the defensive parse before caching so `loadCached()` never returns a double-stringified blob:

- After the `envelope.success` / non-empty payload guards, coerce `envelope.payload`: if string, `JSON.parse` inside try/catch and log a `[STEP]` marker; otherwise use as-is.
- Cache the parsed object under `idia_blueprint_v1` (unchanged key).
- `SEED_BLUEPRINT` fallback, `loadCached()`, `wipeDevice()` untouched.

## Out of scope

- Hub-side manifest shape or `hydrate-terminal` edge function (lives in `idia-hub` repo)
- Toaster, AuthGate, RLS, migrations, `registry.ts`, `TenancyProvider`

## Files touched

- edit: `src/components/nanobites/system/TerminalProvisionGate.tsx`
- edit: `src/lib/provisioning-engine.ts`
