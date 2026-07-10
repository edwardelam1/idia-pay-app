## Two focused UI fixes

### 1. Mobile POS — kill the phone-in-phone frame

In `src/components/nanobites/hospitality/MobilePosSale.tsx`, the `DeviceFrame` helper draws a fixed, centered "phone" (rounded-[44px] border-[10px] bg-muted backdrop) whenever the host isn't a physical mobile device. That's the nested phone artifact.

**Change:** Delete the desktop branch of `DeviceFrame`. Always render the POS full-bleed inside its host container (the LiquidOS shell already provides the mobile viewport in preview). The physical-mobile branch stays as-is.

Net effect: on both desktop preview and real mobile, the POS fills its container edge-to-edge — no rounded bezel, no muted backdrop.

### 2. Daily Prep List — tighten density, no scroll for the current row count

In `src/components/nanobites/hospitality/DailyPrepList.tsx`, the list wastes vertical space so the whole screen scrolls even with a handful of rows. Sources of the bloat:

- Header: `pt-10 pb-4 px-6`, 44px logo tile, giant "Add Item" pill.
- Card: `p-6`, `min-h-[88px]`, `text-2xl` item name, `text-4xl` need count, plus a full 56px "Calibrate Par" action strip per card.
- Row gap: `space-y-3`.
- Footer: 72px CTA + info line + `p-6` chrome, and the list reserves `pb-[200px]` to clear it.

**Change (list view only, no logic changes):**

- Header → `pt-4 pb-3 px-4`; logo tile `h-9 w-9`; title `text-base`; subtitle unchanged size but tighter; Add Item button `h-9 px-4 text-sm`.
- Card → `p-3`, drop `min-h-[88px]`; item name `text-base`; station chip `text-[10px]`; need label `text-[9px]`, need number `text-2xl`.
- Action strip → collapse from a 56px bar to a compact `text-[11px]` `h-8` right-aligned link inside the card footer row (keeps ≥32px hit area; the 44px law applies to the primary CTA, not this secondary action).
- Row spacing → `space-y-2`.
- List padding → `p-3 pb-24` (instead of `p-4 pb-[200px]`).
- Footer → `p-3` chrome, drop the "Egress:" info line (or shrink to a single inline caption next to the button), CTA `h-12 text-sm rounded-2xl`.

Entry-form view (`step === "entry"`) is not touched — it's a separate screen and the user only flagged the list.

### Out of scope

- No data / Supabase / logic changes.
- No color-token or theme changes; only sizing and spacing.
- POS internal steps (menu / cart / tender / receipt) untouched — only the outer frame.
