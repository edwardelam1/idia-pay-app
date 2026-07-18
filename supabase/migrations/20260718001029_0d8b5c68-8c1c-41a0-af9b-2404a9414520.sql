
-- 1) idia_pico_bites
CREATE TABLE public.idia_pico_bites (
  id text PRIMARY KEY,
  tag text UNIQUE NOT NULL,
  name text NOT NULL,
  ui_component text NOT NULL,
  default_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  gate_policy text NOT NULL DEFAULT 'shift-lock' CHECK (gate_policy IN ('none','shift-lock')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.idia_pico_bites TO anon, authenticated;
GRANT ALL ON public.idia_pico_bites TO service_role;
ALTER TABLE public.idia_pico_bites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalog readable by all" ON public.idia_pico_bites FOR SELECT USING (true);

-- 2) idia_nano_bites
CREATE TABLE public.idia_nano_bites (
  id text PRIMARY KEY,
  name text NOT NULL,
  container_file text NOT NULL,
  industry_id text NOT NULL,
  screen text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.idia_nano_bites TO anon, authenticated;
GRANT ALL ON public.idia_nano_bites TO service_role;
ALTER TABLE public.idia_nano_bites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalog readable by all" ON public.idia_nano_bites FOR SELECT USING (true);

-- 3) idia_nano_pico_relations
CREATE TABLE public.idia_nano_pico_relations (
  nano_bite_id text NOT NULL REFERENCES public.idia_nano_bites(id) ON DELETE CASCADE,
  pico_bite_id text NOT NULL REFERENCES public.idia_pico_bites(id) ON DELETE CASCADE,
  relationship_weight int NOT NULL DEFAULT 10,
  is_mandatory boolean NOT NULL DEFAULT false,
  slot text,
  config_override jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (nano_bite_id, pico_bite_id)
);
CREATE INDEX idia_nano_pico_relations_by_weight
  ON public.idia_nano_pico_relations (nano_bite_id, relationship_weight DESC);
GRANT SELECT ON public.idia_nano_pico_relations TO anon, authenticated;
GRANT ALL ON public.idia_nano_pico_relations TO service_role;
ALTER TABLE public.idia_nano_pico_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalog readable by all" ON public.idia_nano_pico_relations FOR SELECT USING (true);

-- updated_at trigger (reuse public.update_updated_at_column if it exists; otherwise create)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_idia_pico_bites_updated_at BEFORE UPDATE ON public.idia_pico_bites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_idia_nano_bites_updated_at BEFORE UPDATE ON public.idia_nano_bites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_idia_nano_pico_relations_updated_at BEFORE UPDATE ON public.idia_nano_pico_relations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Seed: Pico-Bites catalog (mirrors src/components/pico-bites/registry.ts)
-- ============================================================
INSERT INTO public.idia_pico_bites (id, tag, name, ui_component, gate_policy) VALUES
-- POS
('hosp.ft.pos.item_add','hosp.ft.pos.item_add','Quick-Fire Item Add','QuickFireItemAdd','shift-lock'),
('hosp.ft.pos.mod_apply','hosp.ft.pos.mod_apply','Modifier Application','ModifierApplication','shift-lock'),
('hosp.ft.pos.kds_fire','hosp.ft.pos.kds_fire','KDS Fire Ticket','KdsFireTicket','shift-lock'),
('hosp.ft.pos.void_comp','hosp.ft.pos.void_comp','Rapid Comp/Void','RapidCompVoid','shift-lock'),
('hosp.ft.pos.hold_send_stay','hosp.ft.pos.hold_send_stay','Hold/Send/Stay','HoldSendStay','shift-lock'),
('hosp.ft.pos.course_assign','hosp.ft.pos.course_assign','Course Assignment','CourseAssignment','shift-lock'),
('hosp.ft.pos.order_pace','hosp.ft.pos.order_pace','Order Pacing Timer','OrderPacingTimer','shift-lock'),
('hosp.ft.pos.order_type','hosp.ft.pos.order_type','Order Type Change','OrderTypeChange','shift-lock'),
('hosp.ft.pos.reopen_check','hosp.ft.pos.reopen_check','Reopen Check','ReopenCheck','shift-lock'),
('hosp.ft.pos.reprint_chit','hosp.ft.pos.reprint_chit','Reprint Chit','ReprintChit','shift-lock'),
-- Inventory
('hosp.ft.inv.status_86','hosp.ft.inv.status_86','Long-Press 86','LongPress86ing','shift-lock'),
('hosp.ft.inv.deplete_recipe','hosp.ft.inv.deplete_recipe','Recipe Depletion','RecipeDepletion','none'),
('hosp.ft.inv.log_waste','hosp.ft.inv.log_waste','Log Waste/Spoilage','LogWasteSpoilage','shift-lock'),
('hosp.ft.inv.receive_stock','hosp.ft.inv.receive_stock','Restock Receive','RestockReceive','shift-lock'),
('hosp.ft.inv.cycle_count','hosp.ft.inv.cycle_count','Physical Count','PhysicalCount','shift-lock'),
('hosp.ft.inv.timed_86','hosp.ft.inv.timed_86','Timed 86','Timed86','shift-lock'),
-- Payment
('hosp.ft.pay.init_nfc','hosp.ft.pay.init_nfc','Contactless Tap','ContactlessTap','shift-lock'),
('hosp.ft.pay.offline_auth','hosp.ft.pay.offline_auth','Offline Fallback','OfflineFallback','shift-lock'),
('hosp.ft.pay.batch_sync','hosp.ft.pay.batch_sync','Cloud Re-Sync','CloudReSync','none'),
('hosp.ft.pay.drawer_state','hosp.ft.pay.drawer_state','Drawer State','DrawerState','shift-lock'),
('hosp.ft.pay.split_even','hosp.ft.pay.split_even','Split Even','SplitEven','shift-lock'),
('hosp.ft.pay.split_item','hosp.ft.pay.split_item','Split By Item','SplitByItem','shift-lock'),
('hosp.ft.pay.tip_close','hosp.ft.pay.tip_close','Tip & Close','TipAndClose','shift-lock'),
('hosp.ft.pay.adjust','hosp.ft.pay.adjust','Adjust Payment','AdjustPayment','shift-lock'),
('hosp.ft.pay.cash_tender','hosp.ft.pay.cash_tender','Cash Tender','CashTender','shift-lock'),
('hosp.ft.pay.drawer_count_open','hosp.ft.pay.drawer_count_open','Drawer Count Open','DrawerState','none'),
('hosp.ft.pay.drawer_count_close','hosp.ft.pay.drawer_count_close','Drawer Count Close','DrawerState','shift-lock'),
('hosp.ft.pay.refund','hosp.ft.pay.refund','Refund','Refund','shift-lock'),
('hosp.ft.pay.reprint_receipt','hosp.ft.pay.reprint_receipt','Reprint Receipt','ReprintReceipt','shift-lock'),
('hosp.ft.pay.gc_sell','hosp.ft.pay.gc_sell','Gift Card Sell','GiftCardSell','shift-lock'),
('hosp.ft.pay.gc_redeem','hosp.ft.pay.gc_redeem','Gift Card Redeem','GiftCardRedeem','shift-lock'),
('hosp.ft.pay.discount_apply','hosp.ft.pay.discount_apply','Discount Apply','DiscountApply','shift-lock'),
-- Fleet
('hosp.ft.fleet.loc_lock','hosp.ft.fleet.loc_lock','GPS Check-In','GpsCheckIn','none'),
('hosp.ft.fleet.time_punch','hosp.ft.fleet.time_punch','Time Punch','TimePunch','none'),
('hosp.ft.fleet.cash_drop','hosp.ft.fleet.cash_drop','Mid-Shift Drop','MidShiftDrop','shift-lock'),
('hosp.ft.fleet.shift_review','hosp.ft.fleet.shift_review','Shift Review','ShiftReview','shift-lock'),
('hosp.ft.fleet.pay_out','hosp.ft.fleet.pay_out','Cash Payout','CashPayout','shift-lock'),
('hosp.ft.fleet.deposit','hosp.ft.fleet.deposit','Deposit Envelope','DepositEnvelope','shift-lock'),
-- Tables
('hosp.ft.tbl.floor_plan','hosp.ft.tbl.floor_plan','Floor Plan','FloorPlan','shift-lock'),
('hosp.ft.tbl.timer','hosp.ft.tbl.timer','Table Timer','TableTimer','shift-lock'),
('hosp.ft.tbl.seat_assign','hosp.ft.tbl.seat_assign','Seat Assignment','SeatAssignment','shift-lock'),
('hosp.ft.tbl.party_size','hosp.ft.tbl.party_size','Party Size','PartySize','shift-lock'),
('hosp.ft.tbl.transfer','hosp.ft.tbl.transfer','Table Transfer','TableTransfer','shift-lock'),
-- Customer
('hosp.ft.cust.lookup','hosp.ft.cust.lookup','Guest Lookup','GuestLookup','none'),
('hosp.ft.cust.loyalty','hosp.ft.cust.loyalty','Loyalty Scan','LoyaltyScan','shift-lock'),
('hosp.ft.cust.email_receipt','hosp.ft.cust.email_receipt','Email Receipt','EmailReceipt','shift-lock'),
('hosp.ft.cust.save','hosp.ft.cust.save','Guest Save','GuestSave','shift-lock'),
('hosp.ft.cust.notes','hosp.ft.cust.notes','Guest Notes','GuestNotes','shift-lock'),
-- Self
('hosp.ft.self.break','hosp.ft.self.break','Break Punch','BreakPunch','none'),
('hosp.ft.self.sales_tips','hosp.ft.self.sales_tips','My Sales & Tips','MySalesAndTips','none'),
('hosp.ft.self.handoff','hosp.ft.self.handoff','Table Handoff','TableHandoff','shift-lock'),
('hosp.ft.self.broadcast','hosp.ft.self.broadcast','Employee Broadcast','EmployeeBroadcast','none'),
-- Analytics
('hosp.ft.rpt.view_pmix','hosp.ft.rpt.view_pmix','View PMix','ViewPmix','none'),
('hosp.ft.rpt.view_labor_sales','hosp.ft.rpt.view_labor_sales','Labor vs Sales','LaborVsSales','none'),
('hosp.ft.rpt.loc_compare','hosp.ft.rpt.loc_compare','Location Compare','LocationCompare','none'),
('hosp.ft.rpt.export_ledger','hosp.ft.rpt.export_ledger','Ledger Export','LedgerExport','none'),
-- KDS
('hosp.ft.kds.board','hosp.ft.kds.board','KDS Board','KdsBoard','none'),
('hosp.ft.kds.all_day','hosp.ft.kds.all_day','KDS All-Day View','KdsAllDayView','none'),
('hosp.ft.kds.recall','hosp.ft.kds.recall','KDS Recall','KdsRecall','shift-lock'),
('hosp.ft.kds.device_setup','hosp.ft.kds.device_setup','KDS Device Setup','KdsDeviceSetup','none');

-- ============================================================
-- Seed: Nano-Bite containers (the 5 forms)
-- ============================================================
INSERT INTO public.idia_nano_bites (id, name, container_file, industry_id, screen) VALUES
('hosp.ft.ops.service_loc','Service Location','ServiceLocation.tsx','hospitality.food_truck','Service Location'),
('hosp.ft.ops.prep','Daily Prep List','DailyPrepList.tsx','hospitality.food_truck','Prep'),
('hosp.ft.sales.mobile_pos','Mobile POS Sale','MobilePosSale.tsx','hospitality.food_truck','Mobile POS'),
('hosp.ft.infra.health','Health Permit Log','HealthPermitLog.tsx','hospitality.food_truck','Health'),
('hosp.ft.ops.restock','Commissary Restock','CommissaryRestock.tsx','hospitality.food_truck','Restock');

-- ============================================================
-- Seed: Nano ↔ Pico relations (baseline affinities)
-- Higher weight wins conflict for the same slot; is_mandatory keeps loser visible but dimmed.
-- ============================================================
INSERT INTO public.idia_nano_pico_relations (nano_bite_id, pico_bite_id, relationship_weight, is_mandatory, slot) VALUES
-- Mobile POS: POS core + Payment
('hosp.ft.sales.mobile_pos','hosp.ft.pos.item_add',       100, true,  'primary'),
('hosp.ft.sales.mobile_pos','hosp.ft.pos.mod_apply',       90, false, 'secondary'),
('hosp.ft.sales.mobile_pos','hosp.ft.pos.kds_fire',        80, true,  'footer'),
('hosp.ft.sales.mobile_pos','hosp.ft.pos.void_comp',       70, false, 'secondary'),
('hosp.ft.sales.mobile_pos','hosp.ft.pay.init_nfc',        95, true,  'primary'),
('hosp.ft.sales.mobile_pos','hosp.ft.pay.cash_tender',     85, false, 'secondary'),
('hosp.ft.sales.mobile_pos','hosp.ft.pay.tip_close',       75, false, 'footer'),
('hosp.ft.sales.mobile_pos','hosp.ft.pay.split_even',      60, false, 'secondary'),

-- Daily Prep List
('hosp.ft.ops.prep','hosp.ft.inv.log_waste',               100, true,  'primary'),
('hosp.ft.ops.prep','hosp.ft.inv.receive_stock',            90, false, 'secondary'),
('hosp.ft.ops.prep','hosp.ft.inv.cycle_count',              80, false, 'secondary'),
('hosp.ft.ops.prep','hosp.ft.inv.deplete_recipe',           70, false, 'footer'),

-- Service Location
('hosp.ft.ops.service_loc','hosp.ft.fleet.loc_lock',       100, true,  'primary'),
('hosp.ft.ops.service_loc','hosp.ft.fleet.time_punch',      90, true,  'secondary'),
('hosp.ft.ops.service_loc','hosp.ft.self.break',            60, false, 'footer'),

-- Health Permit Log
('hosp.ft.infra.health','hosp.ft.inv.timed_86',            100, true,  'primary'),
('hosp.ft.infra.health','hosp.ft.fleet.shift_review',       90, false, 'secondary'),
('hosp.ft.infra.health','hosp.ft.inv.log_waste',            70, false, 'footer'),

-- Commissary Restock
('hosp.ft.ops.restock','hosp.ft.inv.receive_stock',        100, true,  'primary'),
('hosp.ft.ops.restock','hosp.ft.inv.log_waste',             90, false, 'secondary'),
('hosp.ft.ops.restock','hosp.ft.inv.cycle_count',           70, false, 'footer');
