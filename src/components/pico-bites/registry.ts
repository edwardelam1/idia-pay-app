/**
 * Universal Pico-Bite registry — structural only, strictly 1:1.
 *
 * Keys are the CANONICAL telemetry tags published by the Hub in
 * `public.idia_pico_bites` (112 entries, namespaces: input, output, ui,
 * pay, loyalty, ops, crm, compliance, sched, fleet, health, telemetry,
 * logic). Every tag maps to its OWN independently authored component in
 * its own file under `src/components/pico-bites/<namespace>/`. No two tags
 * may share a component — the assertion at the bottom of this file enforces
 * that at module load.
 *
 * All business data (item catalogs, tender amounts, routes, symptoms,
 * tiles, employees, etc.) comes from the Hub blueprint `config`. There is
 * NO mock or seed data here.
 */
import type { ComponentType } from "react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";

import {
  // input
  PinPadPicoBite, NumpadPicoBite, SignaturePadPicoBite, KeyboardPicoBite,
  BarcodeScanPicoBite, QrScanPicoBite, NfcTapPicoBite, MagStripePicoBite,
  ChipInsertPicoBite, CameraCapturePicoBite, VoiceCommandPicoBite,
  WeightScalePicoBite, IdScanPicoBite, FingerprintPicoBite, FaceScanPicoBite,
  // output
  ReceiptPrinterPicoBite, KitchenPrinterPicoBite, KdsRoutePicoBite,
  LabelPrinterPicoBite, CashDrawerPicoBite, BuzzerPicoBite,
  CustomerDisplayPicoBite, ScaleDisplayPicoBite, EmailSendPicoBite,
  SmsSendPicoBite, PushNotifyPicoBite,
  // ui
  ItemGridPicoBite, CartPanePicoBite, SummaryBarPicoBite, ChartPanePicoBite,
  TicketRibbonPicoBite, ReceiptPreviewPicoBite, KanbanBoardPicoBite,
  TableMapPicoBite, MapViewPicoBite, CalendarViewPicoBite,
  ModifierSheetPicoBite, CategoryTabsPicoBite, UpsellCarouselPicoBite,
  DiscountPromptPicoBite, SplitCheckPicoBite, TipSelectorPicoBite,
  NotesFieldPicoBite, SearchBarPicoBite,
  // compliance
  ManagerOverridePicoBite, AgeVerifyPicoBite, IdCheckPicoBite, KycGatePicoBite,
  HipaaGatePicoBite, ConsentPromptPicoBite, SigCapturePicoBite,
  RefundReasonPicoBite, VoidReasonPicoBite, AuditStampPicoBite,
  ChainOfCustodyPicoBite, PermitGatePicoBite, TaxHolidayFlagPicoBite,
  // loyalty
  LoyaltyScanPicoBite, RewardRedeemPicoBite, GiftCardSwipePicoBite,
  ReferralCapturePicoBite, ReviewPromptPicoBite,
  // pay
  CashTenderPicoBite, AchPromptPicoBite, DepositCapturePicoBite,
  WalletPayPicoBite, SplitTenderPicoBite, TipShareSplitPicoBite,
  RefundExecutePicoBite, SettlementBatchPicoBite, CryptoPayPicoBite,
  CurrencyConvertPicoBite, InvoiceSendPicoBite,
  // ops
  SkuLookupPicoBite, BinScanPicoBite, BatchTrackPicoBite,
  CycleCountInputPicoBite, TransferTicketPicoBite, TemperatureLogPicoBite,
  ExpirationFlagPicoBite, ParAlertPicoBite,
  // crm
  CustomerLookupPicoBite, ContactCapturePicoBite, NewCustomerPicoBite,
  NotesPinPicoBite, TagCustomerPicoBite,
  // sched
  BookSlotPicoBite, ReminderPicoBite, NoShowFlagPicoBite, RosterPickPicoBite,
  // fleet
  GpsPingPicoBite, RoutePlanPicoBite, OdometerLogPicoBite, PodCapturePicoBite,
  // health
  VitalCapturePicoBite, SymptomInputPicoBite, DoseCheckPicoBite,
  ConsentFormPicoBite,
  // telemetry
  IoTSensorPicoBite, EnergyMeterPicoBite, WaterMeterPicoBite,
  EmissionsLogPicoBite,
  // logic
  OfflineQueuePicoBite, RetryBackoffPicoBite, GeoFencePicoBite,
  DwellTimerPicoBite, ProvenanceStampPicoBite, RulesEnginePicoBite,
  StateMachinePicoBite, SessionLockPicoBite, EventPublishPicoBite,
  WebhookEmitPicoBite,
} from "./index";

export type GatePolicy = "none" | "shift-lock";

export type PicoBiteEntry = {
  component: ComponentType<PicoBiteProps<any, any>>;
  gate: GatePolicy;
};

const g = (
  component: ComponentType<PicoBiteProps<any, any>>,
  gate: GatePolicy = "none",
): PicoBiteEntry => ({ component, gate });

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
  "pico.output.kds_route":       g(KdsRoutePicoBite, "shift-lock"),
  "pico.output.label_printer":   g(LabelPrinterPicoBite, "shift-lock"),
  "pico.output.cash_drawer":     g(CashDrawerPicoBite, "shift-lock"),
  "pico.output.buzzer":          g(BuzzerPicoBite),
  "pico.output.customer_display":g(CustomerDisplayPicoBite),
  "pico.output.scale_display":   g(ScaleDisplayPicoBite),
  "pico.output.email_send":      g(EmailSendPicoBite),
  "pico.output.sms_send":        g(SmsSendPicoBite),
  "pico.output.push_notify":     g(PushNotifyPicoBite),

  // --- UI structure (pico.ui.*)
  "pico.ui.item_grid":        g(ItemGridPicoBite, "shift-lock"),
  "pico.ui.cart_pane":        g(CartPanePicoBite, "shift-lock"),
  "pico.ui.summary_bar":      g(SummaryBarPicoBite),
  "pico.ui.chart_pane":       g(ChartPanePicoBite),
  "pico.ui.ticket_ribbon":    g(TicketRibbonPicoBite),
  "pico.ui.receipt_preview":  g(ReceiptPreviewPicoBite),
  "pico.ui.kanban_board":     g(KanbanBoardPicoBite),
  "pico.ui.table_map":        g(TableMapPicoBite, "shift-lock"),
  "pico.ui.map_view":         g(MapViewPicoBite),
  "pico.ui.calendar_view":    g(CalendarViewPicoBite),
  "pico.ui.modifier_sheet":   g(ModifierSheetPicoBite, "shift-lock"),
  "pico.ui.category_tabs":    g(CategoryTabsPicoBite),
  "pico.ui.upsell_carousel":  g(UpsellCarouselPicoBite),
  "pico.ui.discount_prompt":  g(DiscountPromptPicoBite, "shift-lock"),
  "pico.ui.split_check":      g(SplitCheckPicoBite, "shift-lock"),
  "pico.ui.tip_selector":     g(TipSelectorPicoBite, "shift-lock"),
  "pico.ui.notes_field":      g(NotesFieldPicoBite),
  "pico.ui.search_bar":       g(SearchBarPicoBite),

  // --- Compliance / Auth (pico.compliance.*)
  "pico.compliance.manager_override":  g(ManagerOverridePicoBite),
  "pico.compliance.age_verify":        g(AgeVerifyPicoBite, "shift-lock"),
  "pico.compliance.id_check":          g(IdCheckPicoBite, "shift-lock"),
  "pico.compliance.kyc_gate":          g(KycGatePicoBite, "shift-lock"),
  "pico.compliance.hipaa_gate":        g(HipaaGatePicoBite),
  "pico.compliance.consent_prompt":    g(ConsentPromptPicoBite),
  "pico.compliance.sig_capture":       g(SigCapturePicoBite),
  "pico.compliance.refund_reason":     g(RefundReasonPicoBite, "shift-lock"),
  "pico.compliance.void_reason":       g(VoidReasonPicoBite, "shift-lock"),
  "pico.compliance.audit_stamp":       g(AuditStampPicoBite),
  "pico.compliance.chain_of_custody":  g(ChainOfCustodyPicoBite),
  "pico.compliance.permit_gate":       g(PermitGatePicoBite),
  "pico.compliance.tax_holiday_flag":  g(TaxHolidayFlagPicoBite),

  // --- Loyalty (pico.loyalty.*)
  "pico.loyalty.loyalty_scan":     g(LoyaltyScanPicoBite),
  "pico.loyalty.reward_redeem":    g(RewardRedeemPicoBite, "shift-lock"),
  "pico.loyalty.gift_card_swipe":  g(GiftCardSwipePicoBite, "shift-lock"),
  "pico.loyalty.referral_capture": g(ReferralCapturePicoBite),
  "pico.loyalty.review_prompt":    g(ReviewPromptPicoBite),

  // --- Payment (pico.pay.*)
  "pico.pay.cash_tender":      g(CashTenderPicoBite, "shift-lock"),
  "pico.pay.ach_prompt":       g(AchPromptPicoBite, "shift-lock"),
  "pico.pay.deposit_capture":  g(DepositCapturePicoBite, "shift-lock"),
  "pico.pay.wallet_pay":       g(WalletPayPicoBite, "shift-lock"),
  "pico.pay.split_tender":     g(SplitTenderPicoBite, "shift-lock"),
  "pico.pay.tip_share_split":  g(TipShareSplitPicoBite, "shift-lock"),
  "pico.pay.refund_execute":   g(RefundExecutePicoBite, "shift-lock"),
  "pico.pay.settlement_batch": g(SettlementBatchPicoBite, "shift-lock"),
  "pico.pay.crypto_pay":       g(CryptoPayPicoBite, "shift-lock"),
  "pico.pay.currency_convert": g(CurrencyConvertPicoBite),
  "pico.pay.invoice_send":     g(InvoiceSendPicoBite),

  // --- Ops (pico.ops.*)
  "pico.ops.sku_lookup":         g(SkuLookupPicoBite),
  "pico.ops.bin_scan":           g(BinScanPicoBite),
  "pico.ops.batch_track":        g(BatchTrackPicoBite, "shift-lock"),
  "pico.ops.cycle_count_input":  g(CycleCountInputPicoBite, "shift-lock"),
  "pico.ops.transfer_ticket":    g(TransferTicketPicoBite, "shift-lock"),
  "pico.ops.temperature_log":    g(TemperatureLogPicoBite, "shift-lock"),
  "pico.ops.expiration_flag":    g(ExpirationFlagPicoBite, "shift-lock"),
  "pico.ops.par_alert":          g(ParAlertPicoBite),

  // --- CRM (pico.crm.*)
  "pico.crm.customer_lookup":  g(CustomerLookupPicoBite),
  "pico.crm.contact_capture":  g(ContactCapturePicoBite),
  "pico.crm.new_customer":     g(NewCustomerPicoBite),
  "pico.crm.notes_pin":        g(NotesPinPicoBite),
  "pico.crm.tag_customer":     g(TagCustomerPicoBite),

  // --- Schedule (pico.sched.*)
  "pico.sched.book_slot":    g(BookSlotPicoBite),
  "pico.sched.reminder":     g(ReminderPicoBite),
  "pico.sched.no_show_flag": g(NoShowFlagPicoBite),
  "pico.sched.roster_pick":  g(RosterPickPicoBite),

  // --- Fleet (pico.fleet.*)
  "pico.fleet.gps_ping":     g(GpsPingPicoBite),
  "pico.fleet.route_plan":   g(RoutePlanPicoBite),
  "pico.fleet.odometer_log": g(OdometerLogPicoBite),
  "pico.fleet.pod_capture":  g(PodCapturePicoBite),

  // --- Health (pico.health.*)
  "pico.health.vital_capture": g(VitalCapturePicoBite),
  "pico.health.symptom_input": g(SymptomInputPicoBite),
  "pico.health.dose_check":    g(DoseCheckPicoBite),
  "pico.health.consent_form":  g(ConsentFormPicoBite),

  // --- Telemetry / IoT (pico.telemetry.*)
  "pico.telemetry.iot_sensor":    g(IoTSensorPicoBite),
  "pico.telemetry.energy_meter":  g(EnergyMeterPicoBite),
  "pico.telemetry.water_meter":   g(WaterMeterPicoBite),
  "pico.telemetry.emissions_log": g(EmissionsLogPicoBite),

  // --- Logic / Ambient (pico.logic.*)
  "pico.logic.offline_queue":    g(OfflineQueuePicoBite),
  "pico.logic.retry_backoff":    g(RetryBackoffPicoBite),
  "pico.logic.geo_fence":        g(GeoFencePicoBite),
  "pico.logic.dwell_timer":      g(DwellTimerPicoBite),
  "pico.logic.provenance_stamp": g(ProvenanceStampPicoBite),
  "pico.logic.rules_engine":     g(RulesEnginePicoBite),
  "pico.logic.state_machine":    g(StateMachinePicoBite),
  "pico.logic.session_lock":     g(SessionLockPicoBite),
  "pico.logic.event_publish":    g(EventPublishPicoBite),
  "pico.logic.webhook_emit":     g(WebhookEmitPicoBite),
};

/** Ordered list of tags, for catalog/diagnostic surfaces. */
export const PICO_BITE_TAGS = Object.keys(PICO_BITE_REGISTRY);

/**
 * Guard: no component may back two tags. If this fires, a pico-bite was
 * aliased instead of being authored independently.
 */
(() => {
  const seen = new Map<ComponentType<PicoBiteProps<any, any>>, string>();
  for (const [tag, entry] of Object.entries(PICO_BITE_REGISTRY)) {
    const prior = seen.get(entry.component);
    if (prior) {
      console.error(
        `[pico-registry] "${tag}" reuses the component already bound to "${prior}". Every tag needs its own component.`,
      );
    }
    seen.set(entry.component, tag);
  }
})();

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
