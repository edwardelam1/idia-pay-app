## Diagnosis

The pico-bite data pipeline is working end-to-end:

- `idia_blueprint_v1` in localStorage contains the inline `picoBites` array for every nano-bite (verified: `hosp.ft.sales.mobile_pos` → 8 picos).
- `fetchNanoPicoLayout('hosp.ft.sales.mobile_pos')` returns 4 resolved bites (`pos.item_add`, `pay.init_nfc`, `pos.mod_apply`, `pos.kds_fire`), all mapped in the client registry.
- A `<section>` labeled "Live Inputs · 3 active" is actually mounted in the DOM with real pico-bite UI (Quick-Fire Add, Taco $4.50, etc.).

The dock is not blank — it is **clipped out of view**. In `MobilePosSale.tsx` the layout is:

```text
<div class="flex h-full flex-col">   ← sovereign frame ~319x692, overflow:hidden
  <header shrink-0 />
  <div class="flex-1 overflow-y-auto"> ...menu/cart/tip... </div>   ← eats all height
  <NanoBiteHost />                     ← pushed below the frame, clipped
</div>
```

The same pattern repeats in `DailyPrepList`, `HealthPermitLog`, `CommissaryRestock`, and `ServiceLocation` — the host was appended as the last sibling in a flex column whose middle child already consumes all available height, so on the phone-shaped sovereign frame the dock sits below the visible area.

## Fix

Presentation-only change to the five hospitality container files. Do not touch the resolver, registry, blueprint, or telemetry bus.

1. **Make the dock a real footer**, not a trailing sibling that competes with `flex-1`:
   - Wrap `<NanoBiteHost>` in a `shrink-0` footer band with a max-height and its own `overflow-y-auto`, so the dock always occupies the bottom slice of the frame and its inner grid can scroll if it overflows.
   - Class shape: `shrink-0 border-t bg-card/85 backdrop-blur px-3 py-2 max-h-[38%] overflow-y-auto`.

2. **Tighten `NanoBiteHost` for narrow frames** so the visible slice actually shows tiles instead of just the header:
   - Drop the `sm:grid-cols-2 lg:grid-cols-3` breakpoints in favor of `grid-cols-2` at all widths inside the dock (the sovereign frame is ~319px wide, so `sm:` never triggers and everything stacks 1-wide today).
   - Reduce header vertical rhythm (`mb-1`, smaller "N active" chip) to reclaim space.

3. **Apply the same footer wrapper to all five containers** so the dock is uniformly visible:
   - `MobilePosSale.tsx` (nano `hosp.ft.sales.mobile_pos`)
   - `DailyPrepList.tsx` (`hosp.ft.ops.prep`)
   - `HealthPermitLog.tsx` (`hosp.ft.infra.health`)
   - `CommissaryRestock.tsx` (`hosp.ft.ops.restock`)
   - `ServiceLocation.tsx` (`hosp.ft.ops.service_loc`)
   - For `CommissaryRestock`, replace the current `absolute bottom-0` band (which stacks over the scroll content) with the same flex-footer pattern for consistency.

## Verification

- Reload Mobile POS in the preview; confirm "Live Inputs · N active" band is visible at the bottom of the sovereign frame with real pico-bite tiles (Quick-Fire Add, Contactless Tap, etc.).
- Repeat for Prep, Health, Restock, Service Loc.
- Confirm the header/body layout of each container is unchanged and no new scroll appears on the outer page.

## Out of scope

- Blueprint payload, `nano-pico-resolver`, `PICO_BITE_REGISTRY`, `TelemetryBus`, and any database work. The data path is already correct.
