/**
 * Universal Pico-Bite registry — structural only.
 * Maps blueprint telemetry tag → component + gate policy. All business data
 * (item catalogs, tender amounts, routes, symptoms, tiles, employees, etc.)
 * comes from the Hub blueprint config. There is NO mock or seed data here.
 *
 * Naming convention: `pico.<category>.<intent>`.
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
  CashDrawerPicoBite, BuzzerPicoBite, HapticPulsePicoBite,
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
  LoyaltyScanPicoBite, RewardRedeemPicoBite, PointsBalancePicoBite,
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
  BookSlotPicoBite, RescheduleFlowPicoBite, CheckInPicoBite, GpsPingPicoBite,
  RouteMapPicoBite, VehicleStatusPicoBite, VitalCapturePicoBite,
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
  // --- Input
  "pico.input.pin_pad":        g(PinPadPicoBite),
  "pico.input.numpad":         g(NumpadPicoBite),
  "pico.input.signature":      g(SignaturePadPicoBite),
  "pico.input.keyboard":       g(KeyboardPicoBite),
  "pico.input.barcode":        g(BarcodeScanPicoBite),
  "pico.input.qr":             g(QrScanPicoBite),
  "pico.input.nfc":            g(NfcTapPicoBite),
  "pico.input.mag_stripe":     g(MagStripePicoBite, "shift-lock"),
  "pico.input.chip_insert":    g(ChipInsertPicoBite, "shift-lock"),
  "pico.input.camera":         g(CameraCapturePicoBite),
  "pico.input.voice":          g(VoiceCommandPicoBite),
  "pico.input.scale":          g(WeightScalePicoBite),
  "pico.input.id_scan":        g(IdScanPicoBite),
  "pico.input.fingerprint":    g(FingerprintPicoBite),
  "pico.input.face":           g(FaceScanPicoBite),

  // --- Output / Peripherals
  "pico.output.receipt":         g(ReceiptPrinterPicoBite, "shift-lock"),
  "pico.output.kitchen_ticket":  g(KitchenPrinterPicoBite, "shift-lock"),
  "pico.output.label":           g(LabelPrinterPicoBite, "shift-lock"),
  "pico.output.cash_drawer":     g(CashDrawerPicoBite, "shift-lock"),
  "pico.output.buzzer":          g(BuzzerPicoBite),
  "pico.output.haptic":          g(HapticPulsePicoBite),
  "pico.output.indicator_light": g(IndicatorLightPicoBite),
  "pico.output.alarm":           g(AlarmBellPicoBite),
  "pico.output.relay":           g(RelaySwitchPicoBite),
  "pico.output.rfid_write":      g(RfidWritePicoBite, "shift-lock"),
  "pico.output.email":           g(EmailBlastPicoBite),
  "pico.output.sms":             g(SmsBlastPicoBite),
  "pico.output.push":            g(PushNotifyPicoBite),

  // --- Display / UI structure
  "pico.display.item_grid":       g(ItemGridPicoBite, "shift-lock"),
  "pico.display.cart_pane":       g(CartPanePicoBite, "shift-lock"),
  "pico.display.summary_bar":     g(SummaryBarPicoBite),
  "pico.display.order_ticket":    g(OrderTicketPicoBite),
  "pico.display.table_map":       g(TableMapPicoBite, "shift-lock"),
  "pico.display.notification":    g(NotificationBarPicoBite),
  "pico.display.countdown":       g(CountdownTimerPicoBite),
  "pico.display.modifier_grid":   g(ModifierGridPicoBite, "shift-lock"),
  "pico.display.role_badge":      g(RoleBadgePicoBite),
  "pico.display.price":           g(PriceDisplayPicoBite),

  // --- Compliance / Auth
  "pico.compliance.manager_override": g(ManagerOverridePicoBite),
  "pico.compliance.age_verify":       g(AgeVerifyPicoBite, "shift-lock"),
  "pico.compliance.id_check":         g(IdCheckPicoBite, "shift-lock"),
  "pico.compliance.hipaa_gate":       g(HipaaGatePicoBite),
  "pico.compliance.consent":          g(ConsentCheckboxPicoBite),
  "pico.compliance.refund_reason":    g(RefundReasonPicoBite, "shift-lock"),
  "pico.compliance.void_reason":      g(VoidReasonPicoBite, "shift-lock"),
  "pico.compliance.discount_auth":    g(DiscountAuthPicoBite, "shift-lock"),

  // --- Loyalty & Payment
  "pico.loyalty.scan":         g(LoyaltyScanPicoBite),
  "pico.loyalty.redeem":       g(RewardRedeemPicoBite, "shift-lock"),
  "pico.loyalty.points":       g(PointsBalancePicoBite),
  "pico.payment.gift_swipe":   g(GiftCardSwipePicoBite, "shift-lock"),
  "pico.payment.cash_tender":  g(CashTenderPicoBite, "shift-lock"),
  "pico.payment.card_tender":  g(CardTenderPicoBite, "shift-lock"),
  "pico.payment.wallet_tender":g(WalletTenderPicoBite, "shift-lock"),
  "pico.payment.split_check":  g(SplitCheckPicoBite, "shift-lock"),
  "pico.payment.tip":          g(TipPromptPicoBite, "shift-lock"),
  "pico.payment.refund_init":  g(RefundInitPicoBite, "shift-lock"),
  "pico.payment.settlement":   g(SettlementBatchPicoBite, "shift-lock"),
  "pico.payment.crypto":       g(CryptoPayPicoBite, "shift-lock"),

  // --- Ops & CRM
  "pico.ops.sku_lookup":         g(SkuLookupPicoBite),
  "pico.ops.cycle_count_input":  g(CycleCountInputPicoBite, "shift-lock"),
  "pico.ops.stock_adjust":       g(StockAdjustPicoBite, "shift-lock"),
  "pico.ops.temp_log":           g(TemperatureLogPicoBite, "shift-lock"),
  "pico.ops.expiration_flag":    g(ExpirationFlagPicoBite, "shift-lock"),
  "pico.ops.shift_punch":        g(ShiftPunchPicoBite),
  "pico.ops.audit_trail":        g(AuditTrailPicoBite),
  "pico.crm.lookup":             g(CustomerLookupPicoBite),
  "pico.crm.guest_note":         g(GuestNotePicoBite),

  // --- Schedule / Fleet / Health / IoT
  "pico.schedule.book_slot":     g(BookSlotPicoBite),
  "pico.schedule.reschedule":    g(RescheduleFlowPicoBite),
  "pico.schedule.check_in":      g(CheckInPicoBite),
  "pico.fleet.gps_ping":         g(GpsPingPicoBite),
  "pico.fleet.route_map":        g(RouteMapPicoBite),
  "pico.fleet.vehicle_status":   g(VehicleStatusPicoBite),
  "pico.health.vital":           g(VitalCapturePicoBite),
  "pico.health.symptom":         g(SymptomInputPicoBite),
  "pico.iot.sensor":             g(IoTSensorPicoBite),
  "pico.iot.energy":             g(EnergyMeterPicoBite),

  // --- Logic / Ambient
  "pico.logic.offline_queue": g(OfflineQueuePicoBite),
  "pico.logic.geofence":      g(GeoFencePicoBite),
  "pico.logic.dwell":         g(DwellTimerPicoBite),
  "pico.logic.provenance":    g(ProvenanceStampPicoBite),
  "pico.logic.feature_flag":  g(FeatureFlagPicoBite),
  "pico.logic.rule_gate":     g(RuleGatePicoBite),
};

export function getPicoBite(tag: string): PicoBiteEntry | null {
  return PICO_BITE_REGISTRY[tag] ?? null;
}
