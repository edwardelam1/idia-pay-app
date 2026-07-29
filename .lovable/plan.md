## Goal

Give each Nano-Bite container a localized brain: a Pico-Bite fires `onAction`, the container updates ephemeral state, and that state flows back down into every sibling's `config`. No Pico-Bite gains storage, context, or knowledge of its siblings — the contract in `src/lib/idia/pico-bite.ts` stays untouched.

```text
Numpad ──onAction──► NanoBiteHost reducer ──► runtime state
                            │                      │
                            └──► TelemetryBus       ▼
                                 (flat ledger)  merged config ──► CartPane / SummaryBar / TipSelector
```

## What gets built

**1. `src/lib/idia/nano-runtime.ts` (new)** — the nervous system, pure and testable.

- `NanoRuntimeState`: ephemeral session shape — `lines[]`, `subtotal`, `tax`, `total`, `entryBuffer`, `tenderAmount`, `amountDue`, `tipAmount`, `customer`, `lastScan`, `selectedLineId`, `stage` (`building | tendering | complete`).
- `nanoRuntimeReducer(state, event)` — switches on the canonical `pico.*` telemetry tag, not on component identity. Initial coverage of the Mobile POS sale loop:
  - `pico.input.numpad` submit → sets `entryBuffer`/`tenderAmount`
  - `pico.ui.item_grid` / `pico.ops.sku_lookup` select → append/increment a cart line
  - `pico.ui.cart_pane` select_line → `selectedLineId`
  - `pico.ui.discount_prompt`, `pico.ui.tip_selector` → adjust totals
  - `pico.pay.cash_tender` / `pico.pay.split_tender` → decrement `amountDue`, set change due
  - `pico.crm.customer_lookup` → `customer`
  - `pico.input.barcode_scan` / `qr_scan` → `lastScan`
  - unknown tags fall through unchanged (never throws — the catalog is 112 wide and will keep growing)
- `projectConfig(tag, manifestConfig, state)` — merges derived state **over** the Hub-published config for the consuming tags (`cart_pane.lines`, `summary_bar` totals, `customer_display.amount`, `numpad.title`, `receipt_preview`, etc.). Manifest config remains the base so Hub authorship still wins for anything the runtime doesn't own.

**2. `src/components/nanobites/NanoBiteHost.tsx`** — wire it in.

- `useReducer(nanoRuntimeReducer, initialNanoRuntime)`, reset whenever `nanoBiteId` changes (ephemeral per screen).
- The existing `onEmit` keeps emitting to `TelemetryBus` exactly as today, and additionally `dispatch`es the same event locally — the ledger stays the single audit path; the reducer is a pure local projection.
- `PicoSlot` receives `config={projectConfig(bite.tag, bite.config, state)}` instead of the raw manifest config.

**3. Cross-nano-bite reads (optional, same change)** — the reducer subscribes to `TelemetryBus` only for its own `nanoBiteId`, so two docks on screen never bleed into each other.

## Deliberately not doing

- No new tables, no writes beyond the existing flat `nano_bite_executions` ledger.
- No mock/seed data: an empty cart renders the existing `SterileState`, exactly as now.
- No change to `PicoBiteProps`, the registry, or the manifest resolver.

## Technical notes

Runtime state is intentionally ephemeral (in-memory, dies on navigate/reload) — persisting a half-built cart would require a Hub-owned order record, which is a separate decision. If you want carts to survive a screen switch, say so and I'll lift the reducer to a provider keyed by `cartonCode` instead.
