## What's wrong today (verified)

`src/components/pico-bites/registry.ts` maps all 112 canonical Hub tags, but only ~83 distinct components exist across 8 bundled category files. **34 tags are borrowing another tag's component** instead of having their own, e.g.:

- `pico.ui.chart_pane` → SummaryBar
- `pico.ui.category_tabs` → ModifierGrid
- `pico.ui.search_bar`, `pico.crm.contact_capture`, `pico.crm.new_customer`, `pico.loyalty.referral_capture` → Keyboard
- `pico.fleet.odometer_log`, `pico.health.dose_check` → Numpad
- `pico.telemetry.water_meter`, `pico.telemetry.emissions_log` → IoTSensor
- `pico.logic.event_publish`, `pico.logic.webhook_emit` → PushNotify
- `pico.pay.ach_prompt` → CardTender, `pico.pay.deposit_capture` → CashTender, `pico.pay.currency_convert` → PriceDisplay, `pico.pay.invoice_send` → EmailBlast
- `pico.ops.bin_scan` → BarcodeScan, `pico.ops.transfer_ticket` → StockAdjust, `pico.ops.batch_track` → RfidWrite, `pico.ops.par_alert` → AlarmBell
- `pico.compliance.kyc_gate` → IdCheck, `pico.compliance.sig_capture` → SignaturePad, `pico.compliance.chain_of_custody` → ProvenanceStamp, `pico.compliance.permit_gate` → RuleGate, `pico.compliance.tax_holiday_flag` → FeatureFlag
- `pico.output.kds_route` → KitchenPrinter, `pico.output.customer_display` → PriceDisplay, `pico.output.scale_display` → WeightScale
- plus `pico.ui.ticket_ribbon` / `receipt_preview` / `kanban_board` all sharing OrderTicket, `pico.ui.upsell_carousel` → ItemGrid, `pico.ui.map_view` / `calendar_view` / `discount_prompt` / `split_check` / `tip_selector` / `notes_field` reaching across categories, `pico.sched.no_show_flag` → RescheduleFlow, `pico.sched.roster_pick` → ShiftPunch, `pico.sched.reminder` → CountdownTimer, `pico.logic.retry_backoff` → OfflineQueue, `pico.logic.state_machine` → IndicatorLight, `pico.logic.session_lock` → RelaySwitch.

Also, the pasted reference input file is the intended fidelity standard — several current bites (notably `output.tsx`, 13 one-line components) are far thinner.

## Goal

Every one of the 112 canonical tags gets its own independently authored component in its own file, at the fidelity of the pasted `pico.input.*` reference. Registry becomes strictly 1:1 — no tag ever points at another tag's component.

## Structure

```text
src/components/pico-bites/
  _shared.tsx                 // GateOverlay, SterileState, HardwareTriggerNode,
                              //  HardwareOutputNode, StatusRow — shared chrome only
  input/pin-pad.tsx
  input/numpad.tsx
  ...                          (15 files)
  output/...                   (11)
  ui/...                       (18)
  compliance/...               (13)
  loyalty/...                  (5)
  pay/...                      (11)
  ops/...                      (8)
  crm/...                      (5)
  sched/...                    (4)
  fleet/...                    (4)
  health/...                   (4)
  telemetry/...                (4)
  logic/...                    (10)
  index.ts                     // barrel re-export of all 112
  registry.ts                  // 112 tags -> 112 distinct components + gate policy
```

One file = one exported `*PicoBite`, typed with the existing `PicoBiteProps` from `src/lib/idia/pico-bite.ts`, using the standard `onAction(telemetryTag, payload)` contract, `gateSatisfied`/`gateReason` gate overlay, and rendering purely from blueprint `config`.

## Rules held throughout

- **No mock data.** Any list/tile/amount-shaped bite with empty `config` renders `<SterileState/>`, never invented rows.
- **No shared component across two tags.** Bites that are visually similar (e.g. water meter vs energy meter) get their own file with their own labels, units, icon, action verbs and payload shape.
- Each bite emits a distinct, semantically correct action verb (`poll_scale`, `queue_webhook`, `log_odometer`, …) so the flat telemetry ledger stays meaningful.
- Existing category files (`universal/*.tsx`) are deleted after the split; `registry.ts`, `nano-pico-resolver.ts`, `NanoBiteHost.tsx`, and `primitives.tsx` import paths are updated. `PICO_TAG_ALIASES` (legacy `hosp.ft.*` ids) stays as-is.

## Delivery order (each step compiles on its own)

1. `_shared.tsx` chrome primitives + folder scaffold; registry left working.
2. input (15), output (11), ui (18) — the highest-traffic surfaces.
3. pay (11), loyalty (5), compliance (13).
4. ops (8), crm (5), sched (4), fleet (4), health (4), telemetry (4), logic (10).
5. Rewrite `registry.ts` as a strict 1:1 map; add a build-time assertion that no component appears twice and that all 112 catalog tags are covered.
6. Delete the old `universal/` bundles, fix imports, typecheck.

## Extra: catalog showcase route

Add `/pico-catalog` (its own route file, own `head()` metadata) rendering every registered bite grouped by namespace with its tag label and a console-logging telemetry handler — the same idea as the `InputPicoBitesShowcase` you pasted, but driven off the registry so it can never drift from what's installed. This gives a single screen to visually verify all 112 exist independently.

## Technical notes

- `PicoBiteProps` and the `onAction(tag, payload)` signature are unchanged, so `NanoBiteHost` and `LiquidOS` rendering paths need no behavioural change — only import paths.
- The registry stays the sole tag→component authority; `getPicoBite`/`canonicalPicoTag` signatures unchanged.
- Unmapped tags continue to render the visible "Unmapped" tile in `NanoBiteHost`, which after this work should never appear for a Hub-published tag.
