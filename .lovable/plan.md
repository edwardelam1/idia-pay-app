
## Architecture recap (confirmed)

- The 5 files in `src/components/nanobites/hospitality/` (`ServiceLocation`, `DailyPrepList`, `MobilePosSale`, `HealthPermitLog`, `CommissaryRestock`) are **Nano-Bite containers** (forms), not legacy debt.
- Pico-Bites in `src/components/pico-bites/` are **inputs** that mount inside a Nano-Bite container.
- Which Pico-Bites appear in which Nano-Bite — and who wins UI conflicts — is decided by weighted rows in Supabase, editable from IDIA Hub without a deploy.

## Database (migration)

Three new tables. All are catalog/relationship data, not tenant-owned, so reads are open to `authenticated` (and `anon` for terminal boot); writes are `service_role` only (Hub pushes via edge / admin).

1. `public.idia_pico_bites`
   - `id text PK` (e.g. `pico.pos.numpad`)
   - `tag text unique not null` (matches `PICO_BITE_REGISTRY` key, e.g. `hosp.ft.pos.item_add`)
   - `name text not null`
   - `ui_component text not null` (matches the React component export used by the registry)
   - `default_config jsonb not null default '{}'`
   - `gate_policy text not null default 'shift-lock'` (`'none' | 'shift-lock'`)
   - `created_at`, `updated_at`

2. `public.idia_nano_bites`
   - `id text PK` (e.g. `hosp.ft.sales.mobile_pos`, matches current `NanoBiteSpec.id`)
   - `name text not null`
   - `container_file text not null` (e.g. `MobilePosSale.tsx` — resolved through `ATOM_FILE_MAP`)
   - `industry_id text not null`
   - `screen text` (which sidebar screen it renders on)
   - `created_at`, `updated_at`

3. `public.idia_nano_pico_relations`
   - `nano_bite_id text references idia_nano_bites(id) on delete cascade`
   - `pico_bite_id text references idia_pico_bites(id) on delete cascade`
   - `relationship_weight int not null default 10` (higher wins; loser dims)
   - `is_mandatory bool not null default false`
   - `slot text` (optional layout hint: `primary | secondary | footer`)
   - `config_override jsonb` (per-relation overrides merged over `default_config`)
   - `PRIMARY KEY (nano_bite_id, pico_bite_id)`
   - Index on `(nano_bite_id, relationship_weight desc)`

GRANTs + RLS per project rules: `GRANT SELECT` to `anon, authenticated`; `GRANT ALL` to `service_role`; RLS enabled; SELECT policy `USING (true)`; no INSERT/UPDATE/DELETE policy (service_role bypasses).

## Seed data

Seed all 20 current Food-Truck Pico-Bites from `src/components/pico-bites/registry.ts` into `idia_pico_bites` (id = tag; component name; default config; gate policy — all values already in the registry file, copied into rows).

Seed the 5 Nano-Bite containers into `idia_nano_bites` mapping current `ATOM_FILE_MAP`:
- `hosp.ft.ops.service_loc` → `ServiceLocation.tsx`
- `hosp.ft.ops.prep` → `DailyPrepList.tsx`
- `hosp.ft.sales.mobile_pos` → `MobilePosSale.tsx`
- `hosp.ft.infra.health` → `HealthPermitLog.tsx`
- `hosp.ft.ops.restock` → `CommissaryRestock.tsx`

Seed a baseline `idia_nano_pico_relations` set that mirrors today's affinities (e.g. MobilePosSale ⇄ `hosp.ft.pos.*` + `hosp.ft.pay.*`; DailyPrepList ⇄ `hosp.ft.inv.log_waste`, `hosp.ft.inv.receive_stock`, `hosp.ft.inv.cycle_count`; ServiceLocation ⇄ `hosp.ft.fleet.loc_lock`, `hosp.ft.fleet.time_punch`; HealthPermitLog ⇄ `hosp.ft.inv.timed_86`, `hosp.ft.fleet.shift_review`; CommissaryRestock ⇄ `hosp.ft.inv.receive_stock`, `hosp.ft.inv.log_waste`). Weights authored so exact duplicates never draw; mandatory flag set on the anchor tag(s) per form.

## Frontend wiring

New module: `src/lib/idia/nano-pico-resolver.ts`
- `fetchNanoPicoLayout(nanoBiteId): Promise<ResolvedLayout>` — joins the three tables, sorts by `relationship_weight desc`, marks the top weight per conflicting slot as `active`, others as `dimmed`, honors `is_mandatory`.
- Falls back to a hardcoded map (current behavior) if the fetch errors, so terminals boot offline.
- Result cached per `nano_bite_id` in `sessionStorage` for the session.

New shell component: `src/components/nanobites/NanoBiteHost.tsx`
- Given a `nano_bite_id`, resolves the layout, then renders each relation as a Pico-Bite via `getPicoBite(tag).component` with `config = {...default_config, ...config_override}`, `gateSatisfied` from the existing shift-lock hook, and a `dimmed` visual prop for losers.
- Emits telemetry via the existing `TelemetryBus`.

Refactor the 5 container files
- Each keeps its bespoke chrome (title, header, layout regions, business-specific side-effects) but replaces its inline widget stack with `<NanoBiteHost nanoBiteId="hosp.ft.…" />` in the main content slot.
- No mock data added; no business logic changed outside layout composition.

Renderer dispatch (`src/lib/idia/LiquidOS.tsx`)
- `NanoBiteRenderer` continues to prefer the flat `getPicoBite` path for spec ids that are themselves Pico-Bites.
- When `spec.id` matches an `idia_nano_bites.id`, it renders the corresponding container file (via existing `ATOM_FILE_MAP`), which now internally uses `NanoBiteHost`.

## Conflict-resolution rule

- Two Pico-Bites are "in conflict" when they share the same `slot` on the same Nano-Bite.
- Highest `relationship_weight` wins → rendered normally.
- Losers with `is_mandatory = true` render at 50% opacity + `pointer-events: none` and show a tooltip "Overridden by <winner>".
- Losers with `is_mandatory = false` are hidden.

## Hub-side surface (out of scope for this repo, noted)

- IDIA Hub gets a CRUD UI over these three tables via `service_role`. No changes required in IDIA Pay beyond consuming the tables.

## Technical notes

- Migration includes GRANTs + RLS + policy in the required 4-step order.
- `updated_at` trigger reused (`public.update_updated_at_column`).
- Types will regenerate after migration approval; only then wire the resolver + refactor containers.
- No mock/simulation data; seed rows describe real tags already present in the frontend registry.

## Deliverable order

1. Migration (schema + GRANTs + RLS + policies + seed rows for pico-bites, nano-bites, and baseline relations) — one call.
2. After approval + types regen: `nano-pico-resolver.ts` + `NanoBiteHost.tsx`.
3. Refactor the 5 container files to render `<NanoBiteHost />` in their content slot.
4. Verify: typecheck, load `IDIA-FRWD-NEUL`, confirm each of the 5 screens renders DB-driven Pico-Bites and that a manually-lowered weight in Supabase visibly dims the loser without redeploy.
