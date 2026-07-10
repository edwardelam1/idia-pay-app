# Food Truck Pico-Bite Front-End Input Catalog — Build Plan

Ship the 20 Pico-Bite interaction surfaces so every hardware/UI event listed in the catalog has a real component wired to `recordExecution()`. No mock data; every input emits its documented `hosp.ft.*` action string.

## Scope

5 micro-element folders × 4 Pico-Bites = 20 new components, plus shared input primitives and a routing map so `NanoBiteOpsDashboard` can render each bite's actual UI when launched.

Out of scope: real Bluetooth/NFC/RJ11 hardware drivers, KDS network POST target config, cloud sync backend — these are stubbed at the boundary (button press emits telemetry; hardware handshake logged as `[HARDWARE_STUB]`).

## File Structure

```text
src/components/nanobites/hospitality/foodtruck/
  pos/
    QuickFireItemAdd.tsx         # 1.1 hosp.ft.pos.item_add
    ModifierApplication.tsx      # 1.2 hosp.ft.pos.mod_apply
    KdsTicketRouting.tsx         # 1.3 hosp.ft.pos.kds_fire
    RapidCompVoid.tsx            # 1.4 hosp.ft.pos.void_comp
  inventory/
    LongPress86ing.tsx           # 2.1 hosp.ft.inv.status_86
    RecipeDepletion.tsx          # 2.2 hosp.ft.inv.deplete_recipe (auto/read-only)
    LogWasteSpoilage.tsx         # 2.3 hosp.ft.inv.log_waste
    RestockReceive.tsx           # 2.4 hosp.ft.inv.receive_stock
  payment/
    ContactlessTap.tsx           # 3.1 hosp.ft.pay.init_nfc
    OfflineFallback.tsx          # 3.2 hosp.ft.pay.offline_auth
    CloudReSync.tsx              # 3.3 hosp.ft.pay.batch_sync
    DrawerState.tsx              # 3.4 hosp.ft.pay.drawer_state
  fleet/
    GpsCheckIn.tsx               # 4.1 hosp.ft.fleet.loc_lock
    TimePunch.tsx                # 4.2 hosp.ft.fleet.time_punch
    MidShiftDrop.tsx             # 4.3 hosp.ft.fleet.cash_drop
    ShiftReview.tsx              # 4.4 hosp.ft.fleet.shift_review
  analytics/
    ViewPmix.tsx                 # 5.1 hosp.ft.rpt.view_pmix
    LaborVsSales.tsx             # 5.2 hosp.ft.rpt.view_labor_sales
    LocationCompare.tsx          # 5.3 hosp.ft.rpt.loc_compare
    LedgerExport.tsx             # 5.4 hosp.ft.rpt.export_ledger
  shared/
    Numpad.tsx                   # PIN + amount entry modal
    QuantityStepper.tsx          # +/- tap stepper
    ActionButton.tsx             # Large touch-target primary CTA
    LongPressButton.tsx          # Gesture-aware grid button
  index.ts                       # id -> component registry
```

## Component Contract

Every Pico-Bite component receives:

```ts
type PicoBiteProps = {
  nanoBiteId: string;       // e.g. "hosp.ft.pos.item_add"
  cartonCode: string;       // active provisioning code from TenancyProvider
  subModuleId: string;      // "tertiary.hospitality.food_truck"
  onComplete?: () => void;
};
```

On every documented input, the component calls:

```ts
recordExecution({
  cartonCode, subModuleId, nanoBiteId,
  screen: "<micro-element label>",
  action: "hosp.ft.<...>",
  payload: { /* the exact form values captured */ },
});
```

Hardware triggers (NFC tap, cash drawer pulse, GPS poll, KDS POST) log a `[HARDWARE_STUB]` console line and include a `simulated: true` flag on the payload until real drivers land.

## Cross-Bite Wiring

- `RecipeDepletion` (2.2) subscribes to `subscribeExecutions` and auto-emits `hosp.ft.inv.deplete_recipe` whenever a `hosp.ft.pos.kds_fire` record arrives for the same carton.
- `GpsCheckIn` + `TimePunch` write a small `foodtruck.shift-lock` flag to localStorage; `QuickFireItemAdd` reads it and disables the grid with a "Lock Location + Clock In required" banner until both are satisfied — enforces the strict sequential workflow noted in section 4.

## Dashboard Integration

`NanoBiteOpsDashboard` already groups bites by `microElement`. Add a single map (`src/components/nanobites/hospitality/foodtruck/index.ts`) from `nanoBiteId` → component, and update the launch handler to render the mapped component in the existing task modal. No taxonomy or blueprint changes — the 25 nano-bites already live in Supabase from the earlier seed.

## Shared Primitives

- `Numpad`: 3×4 grid, masked mode for PINs, decimal mode for currency, ESC/OK, tap-only.
- `QuantityStepper`: −/value/+ with press-and-hold repeat.
- `ActionButton`: min 56px touch target, variant `primary|danger|warning|ghost`.
- `LongPressButton`: 600ms hold → fires `onLongPress`; short tap fires `onTap`.

All primitives use existing shadcn/Tailwind tokens; no new colors.

## Validation

Zod schema per bite for the emitted `payload` (e.g. `LogWasteSpoilage` requires `{ itemId: string, qty: number>0, reason: enum }`). Invalid submissions surface a Sonner toast and do NOT call `recordExecution`.

## Verification Steps After Build

1. Hydrate a Food Truck carton, open dashboard, confirm all 5 sections render 4 bites each.
2. Launch each bite, complete the primary happy path, and confirm a new record appears in `localStorage["idia.pay.executions.v1"]` with the exact `action` string from the catalog.
3. Fire a KDS ticket (1.3) and confirm 2.2 auto-emits `deplete_recipe` without user input.
4. Clear shift-lock and verify 1.1 grid is disabled with the guard banner.
