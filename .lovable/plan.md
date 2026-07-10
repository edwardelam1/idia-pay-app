## Seed Food Truck Pico-Bites into `device_provisioning_blueprints`

The Golden Rule (no synthetic rows in code) means the taxonomy is stored in Supabase. Each blueprint row's `payload.modules.bundles[]` contains the Food Truck bundle with a `nanoBites` array. Today it has 5 bites; we need to append the 20 new Pico-Bites so `registry.ts → normalizeBundle` picks them up automatically and `LiquidOS` will group them by `microElement`.

### Scope

- Six blueprint rows contain a `tertiary.hospitality.food_truck` bundle:
  `IDIA-GLG2-DUB6`, `IDIA-47VF-D73C`, `IDIA-22PD-MBN9-8UH2-FVST`,
  `IDIA-IJKX-ET0U`, `IDIA-UU4A-YHC2`, `IDIA-FRWD-NEUL`.
- All six get the same 20 bites appended to the Food Truck bundle only.
- Also mirror any appearance of the Food Truck bundle inside
  `payload.modules.bundlesByVertical.hospitality[]` in the same rows, so
  vertical-scoped hydration and direct-bundle hydration stay in sync.

### Data shape (matches existing entries — no `industryId` on the bite; the parent bundle carries it)

Each new entry:
```json
{
  "id": "hosp.ft.pos.item_add",
  "task": "Quick-Fire Item Addition ...",
  "cadence": "event",
  "automatable": false,
  "microElement": "POS & Order Routing",
  "requiresTier": "basic",
  "valueChainStage": "service"
}
```

The 20 bites cover 5 micro-elements exactly as specified:
- POS & Order Routing (4) — `item_add`, `mod_apply`, `kds_fire`, `void_comp`
- Dynamic Inventory (4) — `status_86`, `deplete_recipe`, `log_waste`, `receive_stock`
- Payment Processing (4) — `init_nfc`, `offline_auth`, `batch_sync`, `drawer_state`
- Fleet Management (4) — `loc_lock`, `time_punch`, `cash_drop`, `shift_review`
- Mobile Analytics (4) — `view_pmix`, `view_labor_sales`, `loc_compare`, `export_ledger`

### Implementation

Single `UPDATE` via the insert tool using a JSONPath-aware `jsonb_set` on `modules.bundles` (and, when present, `modules.bundlesByVertical.hospitality`). We locate the Food Truck bundle index dynamically per row so we don't clobber other bundles, then concat the new 20 onto its `nanoBites` array. Idempotency: skip bites whose `id` already exists on the target bundle (so re-running the seed is safe).

### Out of scope

- No schema changes, no new tables, no RLS changes.
- No new UI components. The 20 Pico-Bites will surface via existing
  `LiquidOS` grouping by `microElement`; wiring each one to a dedicated
  screen component is a follow-up.
- No taxonomy files created in `src/` (this codebase uses Supabase-hosted
  blueprints, not `src/taxonomy/nanoBites/hospitality.ts`).
