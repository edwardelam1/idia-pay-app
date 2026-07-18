## Issue

The preview confirms the current rendered screen is still the old legacy nano-bite container UI, not the new blueprint-driven pico-bite UI. On Restock, for example, the DOM shows only the legacy "Planck Syncing Ledger…" surface and no "Live Inputs" / pico-bite dock.

## Root cause

`LiquidOS.tsx` still routes the 5 canonical food-truck IDs through `ATOM_FILE_MAP` into legacy container files:

```text
hosp.ft.ops.service_loc      -> ServiceLocation
hosp.ft.ops.prep             -> DailyPrepList
hosp.ft.sales.mobile_pos     -> MobilePosSale
hosp.ft.infra.health         -> HealthPermitLog
hosp.ft.ops.restock          -> CommissaryRestock
```

Those old containers contain large hardcoded UIs and their own table queries/spinners. Adding `NanoBiteHost` to the bottom did not change the real primary UI because LiquidOS continues to mount those legacy atoms first.

## Plan

1. **Stop routing the 5 canonical nano-bites to legacy atoms**
   - Remove those 5 IDs from `ATOM_FILE_MAP` in `src/lib/idia/LiquidOS.tsx`.
   - Keep any unrelated legacy atoms, such as TVA variance, untouched.

2. **Render canonical nano-bites from the blueprint inline pico-bite dock**
   - In `NanoBiteRenderer`, before the legacy atom fallback, detect `spec.picoBites?.length`.
   - Render a new blueprint-driven container for that nano-bite instead of the old hardcoded component.
   - The container will use `NanoBiteHost nanoBiteId={spec.id}` so it pulls the Hub-provided pico-bites from the cached blueprint.

3. **Make the blueprint container visibly different and operational**
   - Show a compact header with the nano-bite name/screen and active pico count.
   - Fill the sovereign frame with the pico-bite controls as the main UI, not as a tiny footer.
   - Avoid the old POS/prep/restock hardcoded layouts entirely for these 5 IDs.

4. **Fix blank states honestly**
   - If the Hub blueprint has no inline pico-bites for a nano-bite, show a clear "No Pico-Bites published" state instead of a blank frame or legacy spinner.
   - Do not add mock/simulation data.

5. **Verify in preview**
   - Confirm Mobile POS renders real pico-bite controls like Quick-Fire Add / Contactless Tap instead of the old blank POS screen.
   - Confirm Service Loc, Prep, Health, and Restock also render the blueprint-driven pico-bite grid and no longer show the unchanged legacy UI.

## Files to change

- `src/lib/idia/LiquidOS.tsx`
- Possibly `src/components/nanobites/NanoBiteHost.tsx` only if it needs a full-frame display mode rather than the current dock styling.