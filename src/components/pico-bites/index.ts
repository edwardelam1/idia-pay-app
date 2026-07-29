/**
 * Barrel for the universal Pico-Bite catalog.
 *
 * Every canonical `pico.*` tag published by the Hub has exactly ONE
 * independently authored component, in exactly one file. Nothing here is
 * shared between two tags.
 */

// --- pico.input.*
export { PinPadPicoBite } from "./input/pin-pad";
export { NumpadPicoBite } from "./input/numpad";
export { SignaturePadPicoBite } from "./input/signature-pad";
export { KeyboardPicoBite } from "./input/keyboard";
export { BarcodeScanPicoBite } from "./input/barcode-scan";
export { QrScanPicoBite } from "./input/qr-scan";
export { NfcTapPicoBite } from "./input/nfc-tap";
export { MagStripePicoBite } from "./input/mag-stripe";
export { ChipInsertPicoBite } from "./input/chip-insert";
export { CameraCapturePicoBite } from "./input/camera-capture";
export { VoiceCommandPicoBite } from "./input/voice-command";
export { WeightScalePicoBite } from "./input/weight-scale";
export { IdScanPicoBite } from "./input/id-scan";
export { FingerprintPicoBite } from "./input/fingerprint";
export { FaceScanPicoBite } from "./input/face-scan";

// --- pico.output.*
export { ReceiptPrinterPicoBite } from "./output/receipt-printer";
export { KitchenPrinterPicoBite } from "./output/kitchen-printer";
export { KdsRoutePicoBite } from "./output/kds-route";
export { LabelPrinterPicoBite } from "./output/label-printer";
export { CashDrawerPicoBite } from "./output/cash-drawer";
export { BuzzerPicoBite } from "./output/buzzer";
export { CustomerDisplayPicoBite } from "./output/customer-display";
export { ScaleDisplayPicoBite } from "./output/scale-display";
export { EmailSendPicoBite } from "./output/email-send";
export { SmsSendPicoBite } from "./output/sms-send";
export { PushNotifyPicoBite } from "./output/push-notify";

// --- pico.ui.*
export { ItemGridPicoBite } from "./ui/item-grid";
export { CartPanePicoBite } from "./ui/cart-pane";
export { SummaryBarPicoBite } from "./ui/summary-bar";
export { ChartPanePicoBite } from "./ui/chart-pane";
export { TicketRibbonPicoBite } from "./ui/ticket-ribbon";
export { ReceiptPreviewPicoBite } from "./ui/receipt-preview";
export { KanbanBoardPicoBite } from "./ui/kanban-board";
export { TableMapPicoBite } from "./ui/table-map";
export { MapViewPicoBite } from "./ui/map-view";
export { CalendarViewPicoBite } from "./ui/calendar-view";
export { ModifierSheetPicoBite } from "./ui/modifier-sheet";
export { CategoryTabsPicoBite } from "./ui/category-tabs";
export { UpsellCarouselPicoBite } from "./ui/upsell-carousel";
export { DiscountPromptPicoBite } from "./ui/discount-prompt";
export { SplitCheckPicoBite } from "./ui/split-check";
export { TipSelectorPicoBite } from "./ui/tip-selector";
export { NotesFieldPicoBite } from "./ui/notes-field";
export { SearchBarPicoBite } from "./ui/search-bar";

// --- pico.compliance.*
export { ManagerOverridePicoBite } from "./compliance/manager-override";
export { AgeVerifyPicoBite } from "./compliance/age-verify";
export { IdCheckPicoBite } from "./compliance/id-check";
export { KycGatePicoBite } from "./compliance/kyc-gate";
export { HipaaGatePicoBite } from "./compliance/hipaa-gate";
export { ConsentPromptPicoBite } from "./compliance/consent-prompt";
export { SigCapturePicoBite } from "./compliance/sig-capture";
export { RefundReasonPicoBite } from "./compliance/refund-reason";
export { VoidReasonPicoBite } from "./compliance/void-reason";
export { AuditStampPicoBite } from "./compliance/audit-stamp";
export { ChainOfCustodyPicoBite } from "./compliance/chain-of-custody";
export { PermitGatePicoBite } from "./compliance/permit-gate";
export { TaxHolidayFlagPicoBite } from "./compliance/tax-holiday-flag";

// --- pico.loyalty.*
export { LoyaltyScanPicoBite } from "./loyalty/loyalty-scan";
export { RewardRedeemPicoBite } from "./loyalty/reward-redeem";
export { GiftCardSwipePicoBite } from "./loyalty/gift-card-swipe";
export { ReferralCapturePicoBite } from "./loyalty/referral-capture";
export { ReviewPromptPicoBite } from "./loyalty/review-prompt";

// --- pico.pay.*
export { CashTenderPicoBite } from "./pay/cash-tender";
export { AchPromptPicoBite } from "./pay/ach-prompt";
export { DepositCapturePicoBite } from "./pay/deposit-capture";
export { WalletPayPicoBite } from "./pay/wallet-pay";
export { SplitTenderPicoBite } from "./pay/split-tender";
export { TipShareSplitPicoBite } from "./pay/tip-share-split";
export { RefundExecutePicoBite } from "./pay/refund-execute";
export { SettlementBatchPicoBite } from "./pay/settlement-batch";
export { CryptoPayPicoBite } from "./pay/crypto-pay";
export { CurrencyConvertPicoBite } from "./pay/currency-convert";
export { InvoiceSendPicoBite } from "./pay/invoice-send";

// --- pico.ops.*
export { SkuLookupPicoBite } from "./ops/sku-lookup";
export { BinScanPicoBite } from "./ops/bin-scan";
export { BatchTrackPicoBite } from "./ops/batch-track";
export { CycleCountInputPicoBite } from "./ops/cycle-count-input";
export { TransferTicketPicoBite } from "./ops/transfer-ticket";
export { TemperatureLogPicoBite } from "./ops/temperature-log";
export { ExpirationFlagPicoBite } from "./ops/expiration-flag";
export { ParAlertPicoBite } from "./ops/par-alert";

// --- pico.crm.*
export { CustomerLookupPicoBite } from "./crm/customer-lookup";
export { ContactCapturePicoBite } from "./crm/contact-capture";
export { NewCustomerPicoBite } from "./crm/new-customer";
export { NotesPinPicoBite } from "./crm/notes-pin";
export { TagCustomerPicoBite } from "./crm/tag-customer";

// --- pico.sched.*
export { BookSlotPicoBite } from "./sched/book-slot";
export { ReminderPicoBite } from "./sched/reminder";
export { NoShowFlagPicoBite } from "./sched/no-show-flag";
export { RosterPickPicoBite } from "./sched/roster-pick";

// --- pico.fleet.*
export { GpsPingPicoBite } from "./fleet/gps-ping";
export { RoutePlanPicoBite } from "./fleet/route-plan";
export { OdometerLogPicoBite } from "./fleet/odometer-log";
export { PodCapturePicoBite } from "./fleet/pod-capture";

// --- pico.health.*
export { VitalCapturePicoBite } from "./health/vital-capture";
export { SymptomInputPicoBite } from "./health/symptom-input";
export { DoseCheckPicoBite } from "./health/dose-check";
export { ConsentFormPicoBite } from "./health/consent-form";

// --- pico.telemetry.*
export { IoTSensorPicoBite } from "./telemetry/iot-sensor";
export { EnergyMeterPicoBite } from "./telemetry/energy-meter";
export { WaterMeterPicoBite } from "./telemetry/water-meter";
export { EmissionsLogPicoBite } from "./telemetry/emissions-log";

// --- pico.logic.*
export { OfflineQueuePicoBite } from "./logic/offline-queue";
export { RetryBackoffPicoBite } from "./logic/retry-backoff";
export { GeoFencePicoBite } from "./logic/geo-fence";
export { DwellTimerPicoBite } from "./logic/dwell-timer";
export { ProvenanceStampPicoBite } from "./logic/provenance-stamp";
export { RulesEnginePicoBite } from "./logic/rules-engine";
export { StateMachinePicoBite } from "./logic/state-machine";
export { SessionLockPicoBite } from "./logic/session-lock";
export { EventPublishPicoBite } from "./logic/event-publish";
export { WebhookEmitPicoBite } from "./logic/webhook-emit";
