## Goal
Turn the current one-button "Fire Ticket" stub into a real Toast-style Kitchen Display System — with prep stations, expediter vs prep-station device roles, live tickets, bump/recall, and All Day View — backed by real Supabase tables and realtime updates. No mock data.

## Toast KDS features to cover
From the Toast article:
1. Fire tickets from POS → appear on KDS oldest→newest
2. Prep station routing (each item goes to the correct station)
3. Device role: **Expediter** (sees whole order) vs **Prep Station** (sees only its items)
4. **Bump / Fulfill** — whole ticket or single item
5. **Show Recently Fulfilled** + **Unfulfill**
6. **Recall** — re-open the most recently fulfilled ticket
7. **All Day View** — aggregate count of each item still to make
8. Device setup (assign role + stations)

## New database tables
All under `public`, RLS on, `authenticated` grants, service_role full, scoped by `business_id` (matches existing tenancy pattern in `daily_prep_list`, `nano_bite_executions`).

- `kds_stations` — id, business_id, name, sort_order, is_expediter (bool), active
- `kds_devices` — id, business_id, device_id (text, matches provisioning), role ('expediter'|'prep'), station_ids uuid[], last_seen_at
- `kds_tickets` — id, business_id, ticket_number (short human code), source ('pos'|'online'|'kiosk'), order_type, table_label, server_name, fired_at, status ('active'|'fulfilled'|'recalled'), fulfilled_at, recalled_at
- `kds_ticket_items` — id, ticket_id fk cascade, business_id, menu_item_id nullable, name, quantity, modifiers jsonb, station_id fk kds_stations, course int, status ('pending'|'fulfilled'), fulfilled_at, sort_order
- `menu_item_station_routes` (optional light table) — business_id, menu_item_id or menu_item_name, station_id — used server-side to compute `station_id` on ticket_items when firing

Indexes: `(business_id, status, fired_at)` on tickets; `(ticket_id)`, `(business_id, station_id, status)` on items. Add both tables to `supabase_realtime` publication.

## Server functions (`createServerFn` + `requireSupabaseAuth`)
`src/lib/kds.functions.ts`:
- `fireKdsTicket({ items, table_label, server_name, order_type, source })` — creates ticket + items, resolves station per item via `menu_item_station_routes` (fallback: default station).
- `bumpItem({ item_id })`, `bumpTicket({ ticket_id })` — mark fulfilled; when all items fulfilled, mark ticket fulfilled.
- `unfulfillItem({ item_id })`, `recallLastTicket({ station_id? })` — flip back to `active`, mark `recalled_at`.
- `upsertKdsDevice({ device_id, role, station_ids })` (uses explicit INSERT-or-UPDATE per project rule — **no upsert**).
- `listActiveTickets({ station_id? })` used only for SSR/first paint; live updates via Supabase realtime channel on the client.

## UI Pico-Bites (`src/components/pico-bites/kds.tsx`)
Reachable via new telemetry tags under `hosp.ft.kds.*`. All go through `TelemetryBus` and honor `shift-lock` where financial-ish.

- `KdsBoard` — grid of active tickets, oldest-left, per-item bump, "Bump All" per ticket. Subscribes to `kds_tickets`+`kds_ticket_items` realtime. Filter by device role/stations.
- `KdsAllDayView` — collapses active items into `{name × qty}` totals (server-side aggregate query, refreshed on realtime).
- `KdsRecentlyFulfilled` — last 20 fulfilled tickets in the last hour, with **Unfulfill**.
- `KdsRecall` — one-tap recall of the most recent fulfilled ticket for this device's stations.
- `KdsDeviceSetup` — pick role (Expediter/Prep) and stations; writes to `kds_devices` (INSERT-or-UPDATE, no upsert).
- Rewrite existing `KdsTicketRouting` (POS side) to actually call `fireKdsTicket` with the current cart instead of a fake toast.

Register all new tags in `src/components/pico-bites/registry.ts`.

## Realtime
Subscribe inside `useEffect` with cleanup (per project rule). One channel per KDS screen, filtered by `business_id` and (for prep) station list.

## Out of scope for this pass
- SMS alerts, kitchen productivity reports, multi-language, color-coded modifiers — flagged in Toast article but deferred; the schema leaves room (`modifiers jsonb`, timestamps) to add later.
- Editing menu-item → station routes UI (seed via SQL/admin for now; the fire function tolerates missing routes by falling back to the default station).

## Deliverables
1. Migration: 4 tables + realtime publication + default "Expediter" and "Kitchen" stations per business (via trigger on `businesses` insert, plus one-time backfill).
2. `src/lib/kds.functions.ts` with the six server fns above.
3. `src/components/pico-bites/kds.tsx` with 5 new bites + rewritten `KdsTicketRouting`.
4. Registry updates.
5. Removes any remaining mock/stub state from KDS path (honors the no-mock rule).