# Pay-side "Split Brain" Provisioning Fix

Apply the two drop-in replacements you provided to IDIA Pay. No DB migration needed — the `device_provisioning_blueprints` table (`code`, `business_id`, `payload`, `status`) already exists in `types.ts`.

## Changes

### 1. Edit `src/components/nanobites/system/TerminalProvisionGate.tsx`

Replace the body of `handleProvision` (and only that function) with the three-tier cascade:

- **Attempt A** — `device_provisioning_blueprints` by `code`. If found and `status === 'active'`, look up `businesses` by `business_id` for the display name. Inactive → toast "This provisioning code is deactivated. Check IDIA Hub." and stop.
- **Attempt B** — `businesses.provisioning_codes` array via `.contains([code])`.
- **Attempt C** — `businesses.provisioning_code` string via `.eq`.
- If none match → existing "Provisioning code not recognized" toast.
- Wrap every phase in a `PROV_GATE_${Date.now()}` correlation ID and emit `[BEGIN] / [STEP] / [SUCCESS] / [ERROR_BEGIN] / [ERROR_DETAIL]` markers via `logPlanck`.

Untouched: imports, `HardwareStorage`, the hardware-bridge declaration, JSX, error boundary wrapper, and the default export.

Type cleanup vs. the snippet you pasted: use `unknown` casts (matching the file's existing style) instead of `any` to keep ESLint clean.

### 2. Create `src/lib/provisioning-engine.ts`

New module exporting `ProvisioningEngine` plus `PayAppBlueprint` / `BlueprintModule` types and `SEED_BLUEPRINT`:

- `hydrateFromHub(code)` — query `device_provisioning_blueprints.select("payload, status").eq("code", code)`. Throw clearly on: query error, no row, `status !== 'active'`, or null/empty payload. On success, cache the payload to `localStorage` under `idia_blueprint_v1`. Fall back to `SEED_BLUEPRINT` only when the code is `IDIA-2026-DEMO01` or `DEMO`.
- `loadCached()` — read + JSON.parse the cached blueprint, swallow parse errors.
- `wipeDevice()` — clear the cache key.
- All phases tagged with `HYDRATE_${Date.now()}` / `WIPE_${Date.now()}` IDs and the same `[BEGIN]/[STEP]/[SUCCESS]/[ERROR_BEGIN]/[ERROR_DETAIL]/[ERROR_END]` markers, emitted via `console.info` / `console.error` (the existing pattern used by `registry.ts`).

No consumer is wired up to `ProvisioningEngine` in this turn — it stands alongside `src/lib/idia/registry.ts` (which feeds the sidebar) as the dedicated manifest-cache layer the Pay shell can call post-gate. Wiring it into `TenancyProvider` / `LiquidOS` is a follow-up if you want it.

## Files touched

- edit: `src/components/nanobites/system/TerminalProvisionGate.tsx`
- create: `src/lib/provisioning-engine.ts`

## Out of scope (Hub-side, not in this repo)

- Strict `IDIA-XXXX-XXXX` generator
- Seeded `payload` on Hub's `INSERT` into `device_provisioning_blueprints`

Apply those in the `idia-hub` project. The Pay-side defenses above mean Pay will degrade gracefully (clear error, not a crash) until Hub ships them.
