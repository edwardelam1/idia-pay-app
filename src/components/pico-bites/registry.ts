/**
 * Flat Pico-Bite registry.
 * Maps blueprint telemetry tag → component + default config + gate policy.
 * LiquidOS consults this registry as its primary dispatcher; a blueprint
 * that includes a `layout` array wins over the defaults.
 */
import type { ComponentType } from "react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import {
  QuickFireItemAdd,
  ModifierApplication,
  KdsTicketRouting,
  RapidCompVoid,
  HoldSendStay,
  CourseAssignment,
  OrderPacingTimer,
  OrderTypeChange,
  ReopenCheck,
  ReprintChit,
} from "./pos";
import {
  KdsBoard,
  KdsAllDayView,
  KdsRecall,
  KdsDeviceSetup,
  KdsFireTicket,
} from "./kds";
import {
  LongPress86ing,
  RecipeDepletion,
  LogWasteSpoilage,
  RestockReceive,
  PhysicalCount,
  Timed86,
} from "./inventory";
import {
  ContactlessTap,
  OfflineFallback,
  CloudReSync,
  DrawerState,
  SplitEven,
  SplitByItem,
  TipAndClose,
  AdjustPayment,
  CashTender,
  Refund,
  ReprintReceipt,
  GiftCardSell,
  GiftCardRedeem,
  DiscountApply,
} from "./payment";
import {
  GpsCheckIn,
  TimePunch,
  MidShiftDrop,
  ShiftReview,
  CashPayout,
  DepositEnvelope,
} from "./fleet";
import {
  ViewPmix,
  LaborVsSales,
  LocationCompare,
  LedgerExport,
} from "./analytics";
import {
  FloorPlan,
  TableTimer,
  SeatAssignment,
  PartySize,
  TableTransfer,
} from "./tables";
import { GuestLookup, LoyaltyScan, EmailReceipt, GuestSave, GuestNotes } from "./customer";
import { BreakPunch, MySalesAndTips, TableHandoff, EmployeeBroadcast } from "./self";

export type GatePolicy = "none" | "shift-lock";

export type PicoBiteEntry = {
  component: ComponentType<PicoBiteProps<any, any>>;
  defaultConfig: Record<string, unknown>;
  gate: GatePolicy;
};

// Sensible default configs so an unschematic blueprint still boots. When the
// Hub delivers a `layout` block with tiles/rows/etc, those override.
export const PICO_BITE_REGISTRY: Record<string, PicoBiteEntry> = {
  // POS
  "hosp.ft.pos.item_add": {
    component: QuickFireItemAdd,
    gate: "shift-lock",
    defaultConfig: {
      title: "Quick-Fire Add",
      tiles: [
        { id: "sku.taco", label: "Taco", price: 4.5 },
        { id: "sku.burrito", label: "Burrito", price: 9 },
        { id: "sku.quesadilla", label: "Quesadilla", price: 7.25 },
        { id: "sku.nachos", label: "Nachos", price: 6.5 },
        { id: "sku.horchata", label: "Horchata", price: 3 },
        { id: "sku.jarritos", label: "Jarritos", price: 3.5 },
      ],
    },
  },
  "hosp.ft.pos.mod_apply": {
    component: ModifierApplication,
    gate: "shift-lock",
    defaultConfig: {
      title: "Modifiers",
      modifiers: [
        { id: "no_onion", label: "No Onion" },
        { id: "extra_cheese", label: "Extra Cheese", delta: 1 },
        { id: "spicy", label: "Spicy" },
        { id: "no_cilantro", label: "No Cilantro" },
      ],
    },
  },
  "hosp.ft.pos.kds_fire": {
    component: KdsTicketRouting,
    gate: "shift-lock",
    defaultConfig: { station: "Grill" },
  },
  "hosp.ft.pos.void_comp": {
    component: RapidCompVoid,
    gate: "shift-lock",
    defaultConfig: {},
  },

  // Inventory
  "hosp.ft.inv.status_86": {
    component: LongPress86ing,
    gate: "shift-lock",
    defaultConfig: {
      title: "86 Menu Items",
      items: [
        { id: "sku.taco", label: "Taco" },
        { id: "sku.burrito", label: "Burrito" },
        { id: "sku.quesadilla", label: "Quesadilla" },
        { id: "sku.nachos", label: "Nachos" },
      ],
    },
  },
  "hosp.ft.inv.deplete_recipe": {
    component: RecipeDepletion,
    gate: "none",
    defaultConfig: { subtitle: "Auto-driven by POS fires" },
  },
  "hosp.ft.inv.log_waste": {
    component: LogWasteSpoilage,
    gate: "shift-lock",
    defaultConfig: {
      items: [
        { id: "ing.protein", label: "Protein" },
        { id: "ing.tortilla", label: "Tortilla" },
        { id: "ing.cheese", label: "Cheese" },
        { id: "ing.produce", label: "Produce" },
      ],
    },
  },
  "hosp.ft.inv.receive_stock": {
    component: RestockReceive,
    gate: "shift-lock",
    defaultConfig: {
      items: [
        { id: "ing.protein", label: "Protein", par: 20 },
        { id: "ing.tortilla", label: "Tortilla", par: 100 },
        { id: "ing.cheese", label: "Cheese", par: 15 },
      ],
    },
  },

  // Payment
  "hosp.ft.pay.init_nfc": {
    component: ContactlessTap,
    gate: "shift-lock",
    defaultConfig: {},
  },
  "hosp.ft.pay.offline_auth": {
    component: OfflineFallback,
    gate: "shift-lock",
    defaultConfig: {},
  },
  "hosp.ft.pay.batch_sync": {
    component: CloudReSync,
    gate: "none",
    defaultConfig: {},
  },
  "hosp.ft.pay.drawer_state": {
    component: DrawerState,
    gate: "shift-lock",
    defaultConfig: {},
  },

  // Fleet
  "hosp.ft.fleet.loc_lock": {
    component: GpsCheckIn,
    gate: "none",
    defaultConfig: { locations: ["Downtown Lot", "Stadium", "Farmers Market"] },
  },
  "hosp.ft.fleet.time_punch": {
    component: TimePunch,
    gate: "none",
    defaultConfig: {},
  },
  "hosp.ft.fleet.cash_drop": {
    component: MidShiftDrop,
    gate: "shift-lock",
    defaultConfig: {},
  },
  "hosp.ft.fleet.shift_review": {
    component: ShiftReview,
    gate: "shift-lock",
    defaultConfig: {},
  },

  // Analytics
  "hosp.ft.rpt.view_pmix": {
    component: ViewPmix,
    gate: "none",
    defaultConfig: {},
  },
  "hosp.ft.rpt.view_labor_sales": {
    component: LaborVsSales,
    gate: "none",
    defaultConfig: {},
  },
  "hosp.ft.rpt.loc_compare": {
    component: LocationCompare,
    gate: "none",
    defaultConfig: {},
  },
  "hosp.ft.rpt.export_ledger": {
    component: LedgerExport,
    gate: "none",
    defaultConfig: {},
  },

  // POS · extended order management
  "hosp.ft.pos.hold_send_stay": {
    component: HoldSendStay,
    gate: "shift-lock",
    defaultConfig: {},
  },
  "hosp.ft.pos.course_assign": {
    component: CourseAssignment,
    gate: "shift-lock",
    defaultConfig: {},
  },
  "hosp.ft.pos.order_pace": {
    component: OrderPacingTimer,
    gate: "shift-lock",
    defaultConfig: { thresholdSec: 300 },
  },

  // Tables
  "hosp.ft.tbl.floor_plan": {
    component: FloorPlan,
    gate: "shift-lock",
    defaultConfig: {},
  },
  "hosp.ft.tbl.timer": {
    component: TableTimer,
    gate: "shift-lock",
    defaultConfig: { thresholdSec: 1800 },
  },
  "hosp.ft.tbl.seat_assign": {
    component: SeatAssignment,
    gate: "shift-lock",
    defaultConfig: { partySize: 4 },
  },
  "hosp.ft.tbl.party_size": {
    component: PartySize,
    gate: "shift-lock",
    defaultConfig: {},
  },
  "hosp.ft.tbl.transfer": {
    component: TableTransfer,
    gate: "shift-lock",
    defaultConfig: {},
  },

  // Payment · check splitting & tender
  "hosp.ft.pay.split_even": {
    component: SplitEven,
    gate: "shift-lock",
    defaultConfig: {},
  },
  "hosp.ft.pay.split_item": {
    component: SplitByItem,
    gate: "shift-lock",
    defaultConfig: { checkCount: 2 },
  },
  "hosp.ft.pay.tip_close": {
    component: TipAndClose,
    gate: "shift-lock",
    defaultConfig: { presets: [0.15, 0.18, 0.2, 0.25] },
  },
  "hosp.ft.pay.adjust": {
    component: AdjustPayment,
    gate: "shift-lock",
    defaultConfig: { threshold: 5 },
  },
  "hosp.ft.pay.cash_tender": {
    component: CashTender,
    gate: "shift-lock",
    defaultConfig: {},
  },
  "hosp.ft.pay.drawer_count_open": {
    component: DrawerState,
    gate: "none",
    defaultConfig: { mode: "open_count" },
  },
  "hosp.ft.pay.drawer_count_close": {
    component: DrawerState,
    gate: "shift-lock",
    defaultConfig: { mode: "close_count" },
  },

  // Customer
  "hosp.ft.cust.lookup": {
    component: GuestLookup,
    gate: "none",
    defaultConfig: {},
  },
  "hosp.ft.cust.loyalty": {
    component: LoyaltyScan,
    gate: "shift-lock",
    defaultConfig: {},
  },
  "hosp.ft.cust.email_receipt": {
    component: EmailReceipt,
    gate: "shift-lock",
    defaultConfig: {},
  },

  // Self
  "hosp.ft.self.break": {
    component: BreakPunch,
    gate: "none",
    defaultConfig: {},
  },
  "hosp.ft.self.sales_tips": {
    component: MySalesAndTips,
    gate: "none",
    defaultConfig: {},
  },

  // POS · order flow gaps
  "hosp.ft.pos.order_type": { component: OrderTypeChange, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pos.reopen_check": { component: ReopenCheck, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pos.reprint_chit": { component: ReprintChit, gate: "shift-lock", defaultConfig: {} },

  // Inventory · counts & timed 86
  "hosp.ft.inv.cycle_count": { component: PhysicalCount, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.inv.timed_86": { component: Timed86, gate: "shift-lock", defaultConfig: {} },

  // Payment · refunds, receipts, gift cards, discounts
  "hosp.ft.pay.refund": { component: Refund, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pay.reprint_receipt": { component: ReprintReceipt, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pay.gc_sell": { component: GiftCardSell, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pay.gc_redeem": { component: GiftCardRedeem, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pay.discount_apply": {
    component: DiscountApply,
    gate: "shift-lock",
    defaultConfig: { threshold: 15 },
  },

  // Fleet · EOD cash handling
  "hosp.ft.fleet.pay_out": { component: CashPayout, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.fleet.deposit": { component: DepositEnvelope, gate: "shift-lock", defaultConfig: {} },

  // Customer · save + notes (INSERT/UPDATE only, never upsert)
  "hosp.ft.cust.save": { component: GuestSave, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.cust.notes": { component: GuestNotes, gate: "shift-lock", defaultConfig: {} },

  // Self · handoff + announcements
  "hosp.ft.self.handoff": { component: TableHandoff, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.self.broadcast": { component: EmployeeBroadcast, gate: "none", defaultConfig: {} },
};

export function getPicoBite(tag: string): PicoBiteEntry | null {
  return PICO_BITE_REGISTRY[tag] ?? null;
}
