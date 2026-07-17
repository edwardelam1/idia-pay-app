# FOH Coverage Audit — Toast Skills 101 vs. Current Pico-Bites

## Current 20 Pico-Bites (already shipped)

**POS**: QuickFireItemAdd · ModifierApplication · KdsTicketRouting · RapidCompVoid
**Payment**: ContactlessTap · DrawerState
**Inventory**: LongPress86ing · RestockReceive · RecipeDepletion · LogWasteSpoilage
**Fleet**: GpsCheckIn · TimePunch · MidShiftDrop
**Analytics**: ViewPmix · LaborVsSales · ShiftReview · LocationCompare · CloudReSync · LedgerExport · OfflineFallback

## Gap Analysis vs. Toast FOH Skills 101

| Toast Skill Area | Coverage | Missing |
|---|---|---|
| Start of Day | Partial | Passcode/PIN login screen · Opening cash count |
| End of Day | Partial | Closing cash count · Declare cash tips |
| Order Management | Partial | Hold/Send/Stay · Course assignment · Order pacing |
| Table Management | **None** | Floor plan · Table timers · Seat assignment · Party size · Table transfer |
| Payment Management | Partial | Split evenly · Split by item · Tip entry & close · Adjust payment · Cash tender · Refund |
| Customer Management | **None** | Guest lookup · Loyalty scan · Guest notes/allergies · Email receipt |
| Manage Self | Partial | Break punch (in/out) · View my sales & tips |

## Proposed 18 New Pico-Bites (flat, standardized `PicoBiteProps`)

### `src/components/pico-bites/pos.tsx` (add 3)
1. **HoldSendStay** — three-state action buttons; emits `{action:'hold'|'send'|'stay', ticketId}`.
2. **CourseAssignment** — assign items to course 1/2/3/dessert; emits `{itemId, course}`.
3. **OrderPacingTimer** — table-timer / ticket-age chip; long-press to bump.

### `src/components/pico-bites/tables.tsx` (NEW file, 5 bites)
4. **FloorPlan** — grid of tables with color-coded status (open/seated/paid).
5. **TableTimer** — per-table elapsed time + threshold alert.
6. **SeatAssignment** — order-by-seat selector (1–8).
7. **PartySize** — numpad entry, drives seat grid.
8. **TableTransfer** — pick source→destination table; manager PIN gate.

### `src/components/pico-bites/payment.tsx` (add 5)
9. **SplitEven** — party-size divisor; emits `{splitCount, perGuest}`.
10. **SplitByItem** — line-item picker across N checks.
11. **TipAndClose** — preset % chips + custom numpad; closes check.
12. **AdjustPayment** — post-auth tip/amount adjust; manager gate on delta > threshold.
13. **CashTender** — cash-received numpad; computes change due.

### `src/components/pico-bites/customer.tsx` (NEW file, 3 bites)
14. **GuestLookup** — phone/email search against `customers` table; attaches to check.
15. **LoyaltyScan** — QR/manual code entry; emits `{loyaltyId, points}`.
16. **EmailReceipt** — capture guest email; queues receipt send.

### `src/components/pico-bites/self.tsx` (NEW file, 2 bites) + fleet additions
17. **BreakPunch** — start/end break; PIN-gated; drives labor compliance.
18. **MySalesAndTips** — read-only card: my checks, sales, tips-to-date this shift.

### Extend existing bites (no new files)
- **DrawerState** → add `open_count` and `close_count` modes (opening/closing cash drawer counts) via a `mode` config prop.
- **TimePunch** → already covers clock-in/out; BreakPunch handles breaks.
- End-of-shift **DeclareCashTips** flow rolls into ShiftReview as an existing sub-step (add tip numpad to ShiftReview config, not a new bite).

## Blueprint & Registry Wiring

- Register 18 new `telemetryTag`s in `src/components/pico-bites/registry.ts`:
  `ft.pos.hold_send_stay`, `ft.pos.course_assign`, `ft.pos.pacing`,
  `ft.tbl.floor_plan`, `ft.tbl.timer`, `ft.tbl.seat`, `ft.tbl.party_size`, `ft.tbl.transfer`,
  `ft.pay.split_even`, `ft.pay.split_item`, `ft.pay.tip_close`, `ft.pay.adjust`, `ft.pay.cash`,
  `ft.cust.lookup`, `ft.cust.loyalty`, `ft.cust.email_receipt`,
  `ft.self.break`, `ft.self.my_sales`.
- Append the same 18 IDs to `bundlesByVertical.hospitality.food_truck` in the Supabase `device_provisioning_blueprints` blueprint (migration).
- All bites emit through `TelemetryBus` → `nano_bite_executions` (flat ledger, no per-domain tables).

## Screens (5-tab menu preserved)

New bites slot into the existing 5 tabs — no new top-level tabs:
- **POS**: +HoldSendStay, +CourseAssignment, +OrderPacingTimer, +Tables suite (5), +Customer suite (3)
- **Payment**: +5 payment bites
- **Fleet**: +BreakPunch, +MySalesAndTips
- **Inventory / Analytics**: unchanged

## Technical Details

- Every new component conforms to `PicoBiteProps<TConfig, TPayload>` and calls `onAction` only.
- Table Service state (open tables, timers, seats) is derived from `nano_bite_executions` via a lightweight selector in `src/lib/idia/telemetry-selectors.ts` (new file) — no new tables.
- `GuestLookup` reads existing `profiles` (public directory, PII-free) plus a new `customers` table proposal deferred to a follow-up plan.
- All manager-gated actions (TableTransfer, AdjustPayment > threshold, void) reuse `ManagerAuth` primitive (PIN + biometric).
- Anti-scroll invariant preserved: each new bite fits the standard `PicoCard` footprint.

## Out of Scope (call out to user)

- **Reservations / Waitlist** — not in Toast FOH 101; defer.
- **Kitchen Display printer routing** — hardware bridge, not FOH.
- **Loyalty program backend** — LoyaltyScan emits the intent; backend integration is a separate plan.
- **Customers table schema** — GuestLookup uses `profiles` for now; a dedicated `customers` table is a follow-up.
