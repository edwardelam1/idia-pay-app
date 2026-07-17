## Goal

Convert the 20 Food Truck Pico-Bites from vertical-siloed, self-contained components into a flat, config-driven, blueprint-rendered library. LiquidOS becomes the render engine; Pico-Bites become dumb terminals; all events flow through one TelemetryBus.

## 1. Flatten the directory

Move + rename (git mv, keep git history where possible):

```text
src/components/nanobites/hospitality/foodtruck/*  →  src/components/pico-bites/*
```

Function-based renames (the three you named + the rest, following the same rule — describe input mechanic, not vertical):

| Old (foodtruck)          | New (pico-bites)              | Mechanic                          |
|--------------------------|-------------------------------|-----------------------------------|
| QuickFireItemAdd         | DynamicGridPicoBite           | tap grid of configurable buttons  |
| TimePunch                | NumpadAuthPicoBite            | PIN numpad + status toggle        |
| GpsCheckIn               | LocationLockPicoBite          | geo-lock w/ drift monitor         |
| ContactlessTap           | ContactlessTapPicoBite        | NFC/tap intake                    |
| ModifierApplication      | ModifierChipsPicoBite         | multi-select chip group           |
| RapidCompVoid            | ManagerApprovedActionPicoBite | manager auth + amount             |
| KdsTicketRouting         | RouteToStationPicoBite        | dispatch to endpoint(s)           |
| RecipeDepletion          | AutoDeductPicoBite             | reactive counter, event-driven    |
| LogWasteSpoilage         | LoggedReasonPicoBite          | reason picker + qty + note        |
| RestockReceive           | ScanReceivePicoBite           | scan/manual receive               |
| DrawerState              | ManagerCountPicoBite          | manager auth + count entry        |
| MidShiftDrop             | ManagerCashDropPicoBite       | manager auth + currency           |
| LongPress86ing           | LongPressToggleGridPicoBite   | long-press toggle over grid       |
| CloudReSync              | SyncQueuePicoBite             | queue drain + retry               |
| OfflineFallback          | OfflineBannerPicoBite         | connectivity indicator            |
| LedgerExport             | BatchExportPicoBite           | batch confirm + export            |
| LaborVsSales             | DualSeriesChartPicoBite       | two-series chart + range picker   |
| LocationCompare          | HistoricalCompareChartPicoBite| dropdown + range + chart          |
| ShiftReview              | SummaryPanelPicoBite          | tallied summary + confirm         |
| ViewPmix                 | RankedListPicoBite            | ranked list w/ sort               |

## 2. Standardized props

Every Pico-Bite conforms to:

```ts
// src/lib/idia/pico-bite.ts
export interface PicoBiteProps<TConfig = Record<string, unknown>, TPayload = unknown> {
  telemetryTag: string;                         // e.g. "ft.pos.item_add"
  config: TConfig;                              // schema-defined labels/colors/limits/etc.
  onAction: (payload: TPayload) => void;        // fires up to LiquidOS
}
```

Rules baked into every Pico-Bite:
- No `useCartonCode`, no `recordExecution`, no `supabase` import, no localStorage writes for cross-bite state.
- No hardcoded copy — labels, button text, min/max, currency symbol, grid items, station endpoints, reason codes, chart series names all come from `config`.
- Shift-lock, drift, and clock state that USED to live inside individual bites is removed from the bite; the OS decides whether to render/disable a bite via blueprint config (`disabledWhen`) — see §3.
- Manager auth stays inside `ManagerApprovedActionPicoBite` / `ManagerCountPicoBite` / `ManagerCashDropPicoBite` because it's an input mechanic, but the PIN/biometric result is emitted through `onAction` — never persisted by the bite.

## 3. LiquidOS becomes the render engine

New rendering pipeline in `src/lib/idia/LiquidOS.tsx`:

1. Read `PayAppBlueprint` from `ProvisioningEngine.hydrateFromHub`.
2. For each active Nano-Bite, read its `layout` from the blueprint. Layout schema:

    ```jsonc
    {
      "layout": {
        "kind": "columns" | "stack" | "grid",
        "regions": [
          {
            "id": "left",
            "picoBite": "DynamicGridPicoBite",
            "telemetryTag": "ft.pos.item_add",
            "config": { "items": [...], "gate": "shiftReady" }
          },
          {
            "id": "right",
            "picoBite": "NumpadAuthPicoBite",
            "telemetryTag": "ft.fleet.time_punch",
            "config": { "maxLength": 6, "toggleLabel": ["Clock In","Clock Out"] }
          }
        ]
      }
    }
    ```

3. A registry maps string → component:

    ```ts
    // src/components/pico-bites/registry.ts
    export const PICO_BITE_REGISTRY = {
      DynamicGridPicoBite,
      NumpadAuthPicoBite,
      LocationLockPicoBite,
      // …all 20
    } as const;
    export type PicoBiteName = keyof typeof PICO_BITE_REGISTRY;
    ```

4. LiquidOS renders each region by name, injects `telemetryTag` + `config`, and hands every bite the same `onAction` bound to the TelemetryBus.
5. Cross-bite gates (shift-ready, drift, offline) live at the OS level. Blueprint says `"gate": "shiftReady"` on a region → LiquidOS wraps that region with a disabled/overlay state driven by `useShiftLock()`. The bite itself stays dumb.
6. Existing `src/lib/idia/registry.ts` normalization stays — but LiquidOS now consumes `layout` off each sub-module instead of a hardcoded per-vertical `Screen*` component.

## 4. Central Telemetry Bus

New module `src/lib/idia/telemetry-bus.ts`:

```ts
type BusEvent = {
  telemetryTag: string;
  picoBite: PicoBiteName;
  cartonCode: string;      // injected by OS
  businessId: string;      // injected by OS
  screen: string;          // from blueprint
  payload: unknown;
  ts: string;
};

class TelemetryBus {
  emit(evt: Omit<BusEvent, "ts">): void   // enqueue in-memory + IndexedDB
  flush(): Promise<void>                   // batch POST to edge node
  subscribe(fn: (evt: BusEvent) => void)   // for reactive gates
}
```

- Bites call `onAction(payload)` → LiquidOS attaches `cartonCode`, `businessId`, `screen`, `telemetryTag`, `picoBite`, timestamp → `TelemetryBus.emit`.
- Bus queues events, batches to `nano_bite_executions` (existing flat table) via existing `recordExecution` helper, keeps offline queue for retry.
- `recordExecution` in `src/lib/idia/executions.ts` gets a single new caller (the Bus). All 20 old callsites inside bites are deleted.
- Reactive triggers (RouteToStationPicoBite firing → AutoDeductPicoBite reacting) go through `TelemetryBus.subscribe`, not shared localStorage.

## 5. Cleanup / breaking changes

- Delete `src/components/nanobites/hospitality/foodtruck/` after moves land.
- `src/components/foodtruck-inputs/shared.tsx` splits: input primitives (ActionButton, Numpad, QuantityStepper, LongPressButton, PicoCard, ManagerAuth) → `src/components/pico-bites/primitives.tsx`; shift-lock hooks → `src/lib/idia/gates.ts` (OS-only, no bite imports it).
- `SUBMODULE_ID` / `useCartonCode` disappear from bite files entirely.
- Any Hub blueprint that lacks a `layout` block: OS falls back to auto-stack rendering of every Pico-Bite name found on the sub-module (so existing IDIA-FRWD-NEUL / IDIA-IJKX-ET0U hydrate without a Hub-side change on day 1).

## 6. Order of work

1. Create `PicoBiteProps` type + registry + TelemetryBus (no behavior wired).
2. Move primitives into `src/components/pico-bites/primitives.tsx`; extract gates.
3. Port bites one micro-element group at a time (POS → Payments → Inventory → Fleet → Analytics), each becoming stateless + prop-driven, in parallel writes per group.
4. Rewrite `LiquidOS.tsx` renderer to consume `layout` + registry.
5. Wire TelemetryBus → `recordExecution` (single writer).
6. Delete legacy foodtruck folder + dead imports; typecheck; smoke-test with a hand-crafted `layout` payload against IDIA-FRWD-NEUL.

## Out of scope

- Hub-side blueprint schema authoring for `layout` (this plan only makes Pay tolerant of it; Hub can start emitting `layout` after Pay ships).
- New Pico-Bite types beyond the existing 20.
- Server-side batching endpoint for TelemetryBus (still writes to `nano_bite_executions` for now).
