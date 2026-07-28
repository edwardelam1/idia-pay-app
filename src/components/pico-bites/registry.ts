/**
 * Universal Pico-Bite registry — structural only.
 *
 * Keys are the CANONICAL telemetry tags published by the Hub in
 * `public.idia_pico_bites` (112 entries, namespaces: input, output, ui,
 * pay, loyalty, ops, crm, compliance, sched, fleet, health, telemetry,
 * logic). All business data (item catalogs, tender amounts, routes,
 * symptoms, tiles, employees, etc.) comes from the Hub blueprint config.
 * There is NO mock or seed data here.
 */
import type { ComponentType } from "react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";

import {
  PinPadPicoBite, NumpadPicoBite, SignaturePadPicoBite, KeyboardPicoBite,
  BarcodeScanPicoBite, QrScanPicoBite, NfcTapPicoBite, MagStripePicoBite,
  ChipInsertPicoBite, CameraCapturePicoBite, VoiceCommandPicoBite,
  WeightScalePicoBite, IdScanPicoBite, FingerprintPicoBite, FaceScanPicoBite,
} from "./universal/input";
import {
  ReceiptPrinterPicoBite, KitchenPrinterPicoBite, LabelPrinterPicoBite,
  CashDrawerPicoBite, BuzzerPicoBite,
  IndicatorLightPicoBite, AlarmBellPicoBite, RelaySwitchPicoBite,
  RfidWritePicoBite, EmailBlastPicoBite, SmsBlastPicoBite, PushNotifyPicoBite,
} from "./universal/output";
import {
  ItemGridPicoBite, CartPanePicoBite, SummaryBarPicoBite, OrderTicketPicoBite,
  TableMapPicoBite, NotificationBarPicoBite, CountdownTimerPicoBite,
  ModifierGridPicoBite, RoleBadgePicoBite, PriceDisplayPicoBite,
} from "./universal/display";
import {
  ManagerOverridePicoBite, AgeVerifyPicoBite, IdCheckPicoBite,
  HipaaGatePicoBite, ConsentCheckboxPicoBite, RefundReasonPicoBite,
  VoidReasonPicoBite, DiscountAuthPicoBite,
} from "./universal/compliance";
import {
  LoyaltyScanPicoBite, RewardRedeemPicoBite,
  GiftCardSwipePicoBite, CashTenderPicoBite, CardTenderPicoBite,
  WalletTenderPicoBite, SplitCheckPicoBite, TipPromptPicoBite,
  RefundInitPicoBite, SettlementBatchPicoBite, CryptoPayPicoBite,
} from "./universal/loyalty-payment";
import {
  SkuLookupPicoBite, CycleCountInputPicoBite, StockAdjustPicoBite,
  TemperatureLogPicoBite, ExpirationFlagPicoBite, CustomerLookupPicoBite,
  GuestNotePicoBite, ShiftPunchPicoBite, AuditTrailPicoBite,
} from "./universal/ops-crm";
import {
  BookSlotPicoBite, RescheduleFlowPicoBite, GpsPingPicoBite,
  RouteMapPicoBite, VitalCapturePicoBite,
  SymptomInputPicoBite, IoTSensorPicoBite, EnergyMeterPicoBite,
} from "./universal/schedule-fleet-health";
import {
  OfflineQueuePicoBite, GeoFencePicoBite, DwellTimerPicoBite,
  ProvenanceStampPicoBite, FeatureFlagPicoBite, RuleGatePicoBite,
} from "./universal/logic";

export type GatePolicy = "none" | "shift-lock";

export type PicoBiteEntry = {
  component: ComponentType<PicoBiteProps<any, any>>;
  gate: GatePolicy;
};

const g = (component: ComponentType<PicoBiteProps<any, any>>, gate: GatePolicy = "none"): PicoBiteEntry => ({ component, gate });

export const PICO_BITE_REGISTRY: Record<string, PicoBiteEntry> = {
  // --- Input (pico.input.*)
  "pico.input.pin_pad":        g(PinPadPicoBite),
  "pico.input.numpad":         g(NumpadPicoBite),
  "pico.input.signature_pad":  g(SignaturePadPicoBite),
  "pico.input.keyboard":       g(KeyboardPicoBite),
  "pico.input.barcode_scan":   g(BarcodeScanPicoBite),
  "pico.input.qr_scan":        g(QrScanPicoBite),
  "pico.input.nfc_tap":        g(NfcTapPicoBite),
  "pico.input.mag_stripe":     g(MagStripePicoBite, "shift-lock"),
  "pico.input.chip_insert":    g(ChipInsertPicoBite, "shift-lock"),
  "pico.input.camera_capture": g(CameraCapturePicoBite),
  "pico.input.voice_command":  g(VoiceCommandPicoBite),
  "pico.input.weight_scale":   g(WeightScalePicoBite),
  "pico.input.id_scan":        g(IdScanPicoBite),
  "pico.input.fingerprint":    g(FingerprintPicoBite),
  "pico.input.face_scan":      g(FaceScanPicoBite),

  // --- Output / Peripherals (pico.output.*)
  "pico.output.receipt_printer": g(ReceiptPrinterPicoBite, "shift-lock"),
  "pico.output.kitchen_printer": g(KitchenPrinterPicoBite, "shift-lock"),
  "pico.output.kds_route":       g(KitchenPrinterPicoBite, "shift-lock"),
  "pico.output.label_printer":   g(LabelPrinterPicoBite, "shift-lock"),
  "pico.output.cash_drawer":     g(CashDrawerPicoBite, "shift-lock"),
  "pico.output.buzzer":          g(BuzzerPicoBite),
  "pico.output.customer_display":g(PriceDisplayPicoBite),
  "pico.output.scale_display":   g(WeightScalePicoBite),
  "pico.output.email_send":      g(EmailBlastPicoBite),
  "pico.output.sms_send":        g(SmsBlastPicoBite),
  "pico.output.push_notify":     g(PushNotifyPicoBite),

  // --- UI structure (pico.ui.*)
  "pico.ui.item_grid":        g(ItemGridPicoBite, "shift-lock"),
  "pico.ui.cart_pane":        g(CartPanePicoBite, "shift-lock"),
  "pico.ui.summary_bar":      g(SummaryBarPicoBite),
  "pico.ui.chart_pane":       g(SummaryBarPicoBite),
  "pico.ui.ticket_ribbon":    g(OrderTicketPicoBite),
  "pico.ui.receipt_preview":  g(OrderTicketPicoBite),
  "pico.ui.kanban_board":     g(OrderTicketPicoBite),
  "pico.ui.table_map":        g(TableMapPicoBite, "shift-lock"),
  "pico.ui.map_view":         g(RouteMapPicoBite),
  "pico.ui.calendar_view":    g(BookSlotPicoBite),
  "pico.ui.modifier_sheet":   g(ModifierGridPicoBite, "shift-lock"),
  "pico.ui.category_tabs":    g(ModifierGridPicoBite),
  "pico.ui.upsell_carousel":  g(ItemGridPicoBite),
  "pico.ui.discount_prompt":  g(DiscountAuthPicoBite, "shift-lock"),
  "pico.ui.split_check":      g(SplitCheckPicoBite, "shift-lock"),
  "pico.ui.tip_selector":     g(TipPromptPicoBite, "shift-lock"),
  "pico.ui.notes_field":      g(GuestNotePicoBite),
  "pico.ui.search_bar":       g(KeyboardPicoBite),

  // --- Compliance / Auth (pico.compliance.*)
  "pico.compliance.manager_override":  g(ManagerOverridePicoBite),
  "pico.compliance.age_verify":        g(AgeVerifyPicoBite, "shift-lock"),
  "pico.compliance.id_check":          g(IdCheckPicoBite, "shift-lock"),
  "pico.compliance.kyc_gate":          g(IdCheckPicoBite, "shift-lock"),
  "pico.compliance.hipaa_gate":        g(HipaaGatePicoBite),
  "pico.compliance.consent_prompt":    g(ConsentCheckboxPicoBite),
  "pico.compliance.sig_capture":       g(SignaturePadPicoBite),
  "pico.compliance.refund_reason":     g(RefundReasonPicoBite, "shift-lock"),
  "pico.compliance.void_reason":       g(VoidReasonPicoBite, "shift-lock"),
  "pico.compliance.audit_stamp":       g(AuditTrailPicoBite),
  "pico.compliance.chain_of_custody":  g(ProvenanceStampPicoBite),
  "pico.compliance.permit_gate":       g(RuleGatePicoBite),
  "pico.compliance.tax_holiday_flag":  g(FeatureFlagPicoBite),

  // --- Loyalty (pico.loyalty.*)
  "pico.loyalty.loyalty_scan":     g(LoyaltyScanPicoBite),
  "pico.loyalty.reward_redeem":    g(RewardRedeemPicoBite, "shift-lock"),
  "pico.loyalty.gift_card_swipe":  g(GiftCardSwipePicoBite, "shift-lock"),
  "pico.loyalty.referral_capture": g(KeyboardPicoBite),
  "pico.loyalty.review_prompt":    g(NotificationBarPicoBite),

  // --- Payment (pico.pay.*)
  "pico.pay.cash_tender":      g(CashTenderPicoBite, "shift-lock"),
  "pico.pay.ach_prompt":       g(CardTenderPicoBite, "shift-lock"),
  "pico.pay.deposit_capture":  g(CashTenderPicoBite, "shift-lock"),
  "pico.pay.wallet_pay":       g(WalletTenderPicoBite, "shift-lock"),
  "pico.pay.split_tender":     g(SplitCheckPicoBite, "shift-lock"),
  "pico.pay.tip_share_split":  g(TipPromptPicoBite, "shift-lock"),
  "pico.pay.refund_execute":   g(RefundInitPicoBite, "shift-lock"),
  "pico.pay.settlement_batch": g(SettlementBatchPicoBite, "shift-lock"),
  "pico.pay.crypto_pay":       g(CryptoPayPicoBite, "shift-lock"),
  "pico.pay.currency_convert": g(PriceDisplayPicoBite),
  "pico.pay.invoice_send":     g(EmailBlastPicoBite),

  // --- Ops (pico.ops.*)
  "pico.ops.sku_lookup":         g(SkuLookupPicoBite),
  "pico.ops.bin_scan":           g(BarcodeScanPicoBite),
  "pico.ops.batch_track":        g(RfidWritePicoBite, "shift-lock"),
  "pico.ops.cycle_count_input":  g(CycleCountInputPicoBite, "shift-lock"),
  "pico.ops.transfer_ticket":    g(StockAdjustPicoBite, "shift-lock"),
  "pico.ops.temperature_log":    g(TemperatureLogPicoBite, "shift-lock"),
  "pico.ops.expiration_flag":    g(ExpirationFlagPicoBite, "shift-lock"),
  "pico.ops.par_alert":          g(AlarmBellPicoBite),

  // --- CRM (pico.crm.*)
  "pico.crm.customer_lookup":  g(CustomerLookupPicoBite),
  "pico.crm.contact_capture":  g(KeyboardPicoBite),
  "pico.crm.new_customer":     g(KeyboardPicoBite),
  "pico.crm.notes_pin":        g(GuestNotePicoBite),
  "pico.crm.tag_customer":     g(RoleBadgePicoBite),

  // --- Schedule (pico.sched.*)
  "pico.sched.book_slot":    g(BookSlotPicoBite),
  "pico.sched.reminder":     g(CountdownTimerPicoBite),
  "pico.sched.no_show_flag": g(RescheduleFlowPicoBite),
  "pico.sched.roster_pick":  g(ShiftPunchPicoBite),

  // --- Fleet (pico.fleet.*)
  "pico.fleet.gps_ping":     g(GpsPingPicoBite),
  "pico.fleet.route_plan":   g(RouteMapPicoBite),
  "pico.fleet.odometer_log": g(NumpadPicoBite),
  "pico.fleet.pod_capture":  g(SignaturePadPicoBite),

  // --- Health (pico.health.*)
  "pico.health.vital_capture": g(VitalCapturePicoBite),
  "pico.health.symptom_input": g(SymptomInputPicoBite),
  "pico.health.dose_check":    g(NumpadPicoBite),
  "pico.health.consent_form":  g(ConsentCheckboxPicoBite),

  // --- Telemetry / IoT (pico.telemetry.*)
  "pico.telemetry.iot_sensor":    g(IoTSensorPicoBite),
  "pico.telemetry.energy_meter":  g(EnergyMeterPicoBite),
  "pico.telemetry.water_meter":   g(IoTSensorPicoBite),
  "pico.telemetry.emissions_log": g(IoTSensorPicoBite),

  // --- Logic / Ambient (pico.logic.*)
  "pico.logic.offline_queue":    g(OfflineQueuePicoBite),
  "pico.logic.retry_backoff":    g(OfflineQueuePicoBite),
  "pico.logic.geo_fence":        g(GeoFencePicoBite),
  "pico.logic.dwell_timer":      g(DwellTimerPicoBite),
  "pico.logic.provenance_stamp": g(ProvenanceStampPicoBite),
  "pico.logic.rules_engine":     g(RuleGatePicoBite),
  "pico.logic.state_machine":    g(IndicatorLightPicoBite),
  "pico.logic.session_lock":     g(RelaySwitchPicoBite),
  "pico.logic.event_publish":    g(PushNotifyPicoBite),
  "pico.logic.webhook_emit":     g(PushNotifyPicoBite),
};

/**
 * Legacy dotted Pico ids still embedded in older Hub blueprints, mapped to
 * their canonical `pico.*` equivalents.
 */
export const PICO_TAG_ALIASES: Record<string, string> = {
  "hosp.ft.fleet.loc_lock":      "pico.logic.geo_fence",
  "hosp.ft.fleet.time_punch":    "pico.sched.roster_pick",
  "hosp.ft.fleet.shift_review":  "pico.ui.summary_bar",
  "hosp.ft.inv.log_waste":       "pico.ops.transfer_ticket",
  "hosp.ft.inv.deplete_recipe":  "pico.ops.sku_lookup",
  "hosp.ft.inv.receive_stock":   "pico.ops.bin_scan",
  "hosp.ft.inv.cycle_count":     "pico.ops.cycle_count_input",
  "hosp.ft.inv.timed_86":        "pico.ops.expiration_flag",
  "hosp.ft.pos.item_add":        "pico.ui.item_grid",
  "hosp.ft.pos.mod_apply":       "pico.ui.modifier_sheet",
  "hosp.ft.pos.void_comp":       "pico.compliance.void_reason",
  "hosp.ft.pos.kds_fire":        "pico.output.kds_route",
  "hosp.ft.pay.init_nfc":        "pico.input.nfc_tap",
  "hosp.ft.pay.tip_close":       "pico.ui.tip_selector",
  "hosp.ft.pay.cash_tender":     "pico.pay.cash_tender",
};

export function canonicalPicoTag(tag: string): string {
  return PICO_TAG_ALIASES[tag] ?? tag;
}

export function getPicoBite(tag: string): PicoBiteEntry | null {
  return PICO_BITE_REGISTRY[canonicalPicoTag(tag)] ?? null;
}
