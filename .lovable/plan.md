## What I verified

The blueprint cached in the terminal (`localStorage.idia_blueprint_v1`) does contain pico-bites for all 5 nano-bites (service_loc: 8, prep: 9, mobile_pos: 12, health: 8, restock: 7). So the Hub data is arriving. Two concrete mismatches stop them from painting:

**1. The blueprint sends `tag: null`.** Every inline pico entry looks like:

```text
{ "id": "cdc32b5c-…", "tag": null, "name": null, "slot": "schedule", "weight": 0.65, "mandatory": false }
```

`nano-pico-resolver.ts` does `tag: p.tag || p.id`, so the resolved "tag" becomes a raw UUID (or a legacy dotted id like `hosp.ft.fleet.loc_lock`). `getPicoBite(uuid)` returns `null`, and `PicoSlot` returns `null` on a miss — so every slot renders nothing, silently.

**2. The local registry vocabulary is out of date.** `public.idia_pico_bites` holds the 112 canonical tags, and they don't match the keys hardcoded in `registry.ts`:

```text
DB                            registry.ts
pico.input.barcode_scan   vs  pico.input.barcode
pico.input.nfc_tap        vs  pico.input.nfc
pico.crm.customer_lookup  vs  pico.crm.lookup
pico.ui.item_grid         vs  pico.display.item_grid
pico.pay.cash_tender      vs  pico.payment.cash_tender
pico.ops.temperature_log  vs  pico.ops.temp_log
```

Whole namespaces differ: the Hub uses `pico.ui.*`, `pico.pay.*`, `pico.sched.*`, `pico.telemetry.*`; the registry uses `pico.display.*`, `pico.payment.*`, `pico.schedule.*`, `pico.iot.*`. So even after fixing the UUID lookup, most tags would still miss.

## Fix

1. **Resolve UUID → tag from the Hub catalog**
   - Add a small cached loader that reads `id, tag, name, category, gate_policy, default_slot` from `public.idia_pico_bites` once per session (sessionStorage-backed, keyed by provisioning code).
   - In `nano-pico-resolver.ts`, when a blueprint entry has a null `tag`, resolve it by `id` through that catalog; take `name` from the catalog too when the blueprint's `name` is null (today the dock header would show blanks).
   - Legacy dotted ids that aren't in the catalog keep their id as the tag and fall through to step 3.

2. **Re-key the component registry to the Hub's canonical vocabulary**
   - Rename registry keys in `src/components/pico-bites/registry.ts` to exactly the 112 tags in `idia_pico_bites` (`pico.ui.*`, `pico.pay.*`, `pico.sched.*`, `pico.telemetry.*`, `pico.input.*_scan`, etc.), pointing at the existing universal components.
   - Add an alias table for the legacy dotted food-truck ids still present in the blueprint (e.g. `hosp.ft.fleet.loc_lock`, `hosp.ft.fleet.time_punch`) mapping to their canonical `pico.*` equivalents.
   - Canonical tags with no component yet get a small explicit "Not yet implemented" tile rather than being dropped.

3. **Never fail silently**
   - `PicoSlot` in `NanoBiteHost.tsx` currently returns `null` for an unknown tag. Change it to render a sterile "Unmapped: `<tag>`" tile and `console.warn` once, so a vocabulary drift is visible instead of producing a blank screen.
   - `NanoBiteHost` also returns `null` when the resolved list is empty; replace with an explicit empty state naming the nano-bite.

4. **Cache invalidation**
   - The resolver caches per nano-bite in memory and sessionStorage under `idia.nanoPico.layout.v2`. Bump to `v3` so stale empty layouts from the current broken state don't survive the fix.

5. **Verify in preview**
   - Confirm Mobile POS shows 12 pico tiles, Prep 9, Service Loc 8, Health 8, Restock 7, with real names from the catalog, and that taps still emit through `TelemetryBus`.

No mock or seed data is introduced — every tag, name, slot and weight continues to come from the Hub blueprint and `idia_pico_bites`.

## Files to change

- `src/lib/idia/nano-pico-resolver.ts`
- `src/components/pico-bites/registry.ts`
- `src/components/nanobites/NanoBiteHost.tsx`
- new: a small pico catalog loader under `src/lib/idia/`
