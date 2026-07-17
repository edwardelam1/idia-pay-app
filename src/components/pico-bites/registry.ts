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
} from "./pos";
import {
  LongPress86ing,
  RecipeDepletion,
  LogWasteSpoilage,
  RestockReceive,
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
} from "./payment";
import { GpsCheckIn, TimePunch, MidShiftDrop, ShiftReview } from "./fleet";
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
import { GuestLookup, LoyaltyScan, EmailReceipt } from "./customer";
import { BreakPunch, MySalesAndTips } from "./self";

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
};

export function getPicoBite(tag: string): PicoBiteEntry | null {
  return PICO_BITE_REGISTRY[tag] ?? null;
}
