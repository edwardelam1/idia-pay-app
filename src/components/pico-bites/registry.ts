/**
 * Flat Pico-Bite registry — structural only.
 * Maps blueprint telemetry tag → component + gate policy. All business data
 * (item catalogs, locations, menus, employees, tickets) comes from the Hub
 * blueprint config or from operator-managed tables at runtime. There is NO
 * mock or seed data in this file.
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

// Structural defaults only — numeric thresholds/percentages the terminal needs
// to render controls. No sample menu items, ingredients, locations, tickets,
// employees, or messages. Everything else flows from the Hub blueprint config.
export const PICO_BITE_REGISTRY: Record<string, PicoBiteEntry> = {
  // POS
  "hosp.ft.pos.item_add": { component: QuickFireItemAdd, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pos.mod_apply": { component: ModifierApplication, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pos.kds_fire": { component: KdsFireTicket, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pos.void_comp": { component: RapidCompVoid, gate: "shift-lock", defaultConfig: {} },

  // Inventory (all read the operator-managed daily_prep_list catalog)
  "hosp.ft.inv.status_86": { component: LongPress86ing, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.inv.deplete_recipe": { component: RecipeDepletion, gate: "none", defaultConfig: {} },
  "hosp.ft.inv.log_waste": { component: LogWasteSpoilage, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.inv.receive_stock": { component: RestockReceive, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.inv.cycle_count": { component: PhysicalCount, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.inv.timed_86": { component: Timed86, gate: "shift-lock", defaultConfig: {} },

  // Payment
  "hosp.ft.pay.init_nfc": { component: ContactlessTap, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pay.offline_auth": { component: OfflineFallback, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pay.batch_sync": { component: CloudReSync, gate: "none", defaultConfig: {} },
  "hosp.ft.pay.drawer_state": { component: DrawerState, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pay.split_even": { component: SplitEven, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pay.split_item": { component: SplitByItem, gate: "shift-lock", defaultConfig: { checkCount: 2 } },
  "hosp.ft.pay.tip_close": { component: TipAndClose, gate: "shift-lock", defaultConfig: { presets: [0.15, 0.18, 0.2, 0.25] } },
  "hosp.ft.pay.adjust": { component: AdjustPayment, gate: "shift-lock", defaultConfig: { threshold: 5 } },
  "hosp.ft.pay.cash_tender": { component: CashTender, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pay.drawer_count_open": { component: DrawerState, gate: "none", defaultConfig: { mode: "open_count" } },
  "hosp.ft.pay.drawer_count_close": { component: DrawerState, gate: "shift-lock", defaultConfig: { mode: "close_count" } },
  "hosp.ft.pay.refund": { component: Refund, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pay.reprint_receipt": { component: ReprintReceipt, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pay.gc_sell": { component: GiftCardSell, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pay.gc_redeem": { component: GiftCardRedeem, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pay.discount_apply": { component: DiscountApply, gate: "shift-lock", defaultConfig: { threshold: 15 } },

  // Fleet
  "hosp.ft.fleet.loc_lock": { component: GpsCheckIn, gate: "none", defaultConfig: {} },
  "hosp.ft.fleet.time_punch": { component: TimePunch, gate: "none", defaultConfig: {} },
  "hosp.ft.fleet.cash_drop": { component: MidShiftDrop, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.fleet.shift_review": { component: ShiftReview, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.fleet.pay_out": { component: CashPayout, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.fleet.deposit": { component: DepositEnvelope, gate: "shift-lock", defaultConfig: {} },

  // Analytics
  "hosp.ft.rpt.view_pmix": { component: ViewPmix, gate: "none", defaultConfig: {} },
  "hosp.ft.rpt.view_labor_sales": { component: LaborVsSales, gate: "none", defaultConfig: {} },
  "hosp.ft.rpt.loc_compare": { component: LocationCompare, gate: "none", defaultConfig: {} },
  "hosp.ft.rpt.export_ledger": { component: LedgerExport, gate: "none", defaultConfig: {} },

  // POS · extended order management
  "hosp.ft.pos.hold_send_stay": { component: HoldSendStay, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pos.course_assign": { component: CourseAssignment, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pos.order_pace": { component: OrderPacingTimer, gate: "shift-lock", defaultConfig: { thresholdSec: 300 } },
  "hosp.ft.pos.order_type": { component: OrderTypeChange, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pos.reopen_check": { component: ReopenCheck, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.pos.reprint_chit": { component: ReprintChit, gate: "shift-lock", defaultConfig: {} },

  // Tables
  "hosp.ft.tbl.floor_plan": { component: FloorPlan, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.tbl.timer": { component: TableTimer, gate: "shift-lock", defaultConfig: { thresholdSec: 1800 } },
  "hosp.ft.tbl.seat_assign": { component: SeatAssignment, gate: "shift-lock", defaultConfig: { partySize: 4 } },
  "hosp.ft.tbl.party_size": { component: PartySize, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.tbl.transfer": { component: TableTransfer, gate: "shift-lock", defaultConfig: {} },

  // Customer
  "hosp.ft.cust.lookup": { component: GuestLookup, gate: "none", defaultConfig: {} },
  "hosp.ft.cust.loyalty": { component: LoyaltyScan, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.cust.email_receipt": { component: EmailReceipt, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.cust.save": { component: GuestSave, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.cust.notes": { component: GuestNotes, gate: "shift-lock", defaultConfig: {} },

  // Self
  "hosp.ft.self.break": { component: BreakPunch, gate: "none", defaultConfig: {} },
  "hosp.ft.self.sales_tips": { component: MySalesAndTips, gate: "none", defaultConfig: {} },
  "hosp.ft.self.handoff": { component: TableHandoff, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.self.broadcast": { component: EmployeeBroadcast, gate: "none", defaultConfig: {} },

  // KDS
  "hosp.ft.kds.board": { component: KdsBoard, gate: "none", defaultConfig: {} },
  "hosp.ft.kds.all_day": { component: KdsAllDayView, gate: "none", defaultConfig: {} },
  "hosp.ft.kds.recall": { component: KdsRecall, gate: "shift-lock", defaultConfig: {} },
  "hosp.ft.kds.device_setup": { component: KdsDeviceSetup, gate: "none", defaultConfig: {} },
};

export function getPicoBite(tag: string): PicoBiteEntry | null {
  return PICO_BITE_REGISTRY[tag] ?? null;
}
