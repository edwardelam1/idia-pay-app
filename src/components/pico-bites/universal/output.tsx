/**
 * Universal `pico.output.*` catalog — hardware outputs & digital notifiers.
 * Buttons trigger backend intents; no direct hardware I/O in the browser.
 */
import { Printer, Utensils, Volume2, Lightbulb, Radio, Wifi, Bell, Mail, MessageSquare, DollarSign, Vibrate } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "./_shared";

type OP = PicoBiteProps<Record<string, unknown>, unknown>;

const HardwareOutputNode: React.FC<{
  icon: React.ReactNode; label: string; color: string; onClick: () => void;
  gateSatisfied?: boolean; gateReason?: string; disabled?: boolean;
}> = ({ icon, label, color, onClick, gateSatisfied, gateReason, disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`relative w-full h-20 flex items-center justify-start px-4 gap-4 border ${color} transition-all active:scale-[0.98] disabled:opacity-40 select-none`}>
    <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
    <div className="w-12 h-12 flex items-center justify-center bg-slate-950/50 rounded">{icon}</div>
    <div className="flex flex-col items-start"><span className="text-xs text-slate-500 uppercase">Trigger</span><span className="text-sm font-bold uppercase tracking-wider">{label}</span></div>
  </button>
);

export const ReceiptPrinterPicoBite: React.FC<OP> = (p) => (<HardwareOutputNode icon={<Printer size={20} className="text-slate-300" />} label="Print Receipt" color="bg-slate-900 border-slate-800 text-slate-100 hover:bg-slate-800" onClick={() => p.onAction(p.telemetryTag, { action: "print_receipt" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />);
export const KitchenPrinterPicoBite: React.FC<OP> = (p) => (<HardwareOutputNode icon={<Utensils size={20} className="text-amber-500" />} label="Fire to Kitchen" color="bg-amber-950/20 border-amber-900/50 text-amber-400 hover:bg-amber-900/30" onClick={() => p.onAction(p.telemetryTag, { action: "print_kitchen" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />);
export const LabelPrinterPicoBite: React.FC<OP> = (p) => (<HardwareOutputNode icon={<Printer size={20} className="text-blue-400" />} label="Print Label" color="bg-blue-950/20 border-blue-900/50 text-blue-400 hover:bg-blue-900/30" onClick={() => p.onAction(p.telemetryTag, { action: "print_label" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />);
export const CashDrawerPicoBite: React.FC<OP> = (p) => (<HardwareOutputNode icon={<DollarSign size={20} className="text-emerald-400" />} label={(p.config?.label as string) || "Open Drawer"} color="bg-emerald-950/20 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/30" onClick={() => p.onAction(p.telemetryTag, { action: "pulse_drawer" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />);
export const BuzzerPicoBite: React.FC<OP> = (p) => (<HardwareOutputNode icon={<Volume2 size={20} className="text-red-400" />} label="Sound Buzzer" color="bg-red-950/20 border-red-900/50 text-red-400 hover:bg-red-900/30" onClick={() => p.onAction(p.telemetryTag, { action: "sound_buzzer" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />);
export const HapticPulsePicoBite: React.FC<OP> = (p) => (<HardwareOutputNode icon={<Vibrate size={20} className="text-purple-400" />} label="Pulse Haptic" color="bg-purple-950/20 border-purple-900/50 text-purple-400 hover:bg-purple-900/30" onClick={() => p.onAction(p.telemetryTag, { action: "pulse_haptic" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />);
export const IndicatorLightPicoBite: React.FC<OP> = (p) => (<HardwareOutputNode icon={<Lightbulb size={20} className="text-yellow-400" />} label={(p.config?.label as string) || "Toggle Light"} color="bg-yellow-950/20 border-yellow-900/50 text-yellow-400 hover:bg-yellow-900/30" onClick={() => p.onAction(p.telemetryTag, { action: "toggle_light" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />);
export const AlarmBellPicoBite: React.FC<OP> = (p) => (<HardwareOutputNode icon={<Bell size={20} className="text-orange-400" />} label="Ring Bell" color="bg-orange-950/20 border-orange-900/50 text-orange-400 hover:bg-orange-900/30" onClick={() => p.onAction(p.telemetryTag, { action: "ring_bell" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />);
export const RelaySwitchPicoBite: React.FC<OP> = (p) => (<HardwareOutputNode icon={<Radio size={20} className="text-teal-400" />} label={(p.config?.label as string) || "Toggle Relay"} color="bg-teal-950/20 border-teal-900/50 text-teal-400 hover:bg-teal-900/30" onClick={() => p.onAction(p.telemetryTag, { action: "toggle_relay" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />);
export const RfidWritePicoBite: React.FC<OP> = (p) => (<HardwareOutputNode icon={<Wifi size={20} className="text-indigo-400" />} label="Write RFID" color="bg-indigo-950/20 border-indigo-900/50 text-indigo-400 hover:bg-indigo-900/30" onClick={() => p.onAction(p.telemetryTag, { action: "write_rfid" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />);
export const EmailBlastPicoBite: React.FC<OP> = (p) => (<HardwareOutputNode icon={<Mail size={20} className="text-sky-400" />} label="Send Email" color="bg-sky-950/20 border-sky-900/50 text-sky-400 hover:bg-sky-900/30" onClick={() => p.onAction(p.telemetryTag, { action: "queue_email" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />);
export const SmsBlastPicoBite: React.FC<OP> = (p) => (<HardwareOutputNode icon={<MessageSquare size={20} className="text-pink-400" />} label="Send SMS" color="bg-pink-950/20 border-pink-900/50 text-pink-400 hover:bg-pink-900/30" onClick={() => p.onAction(p.telemetryTag, { action: "queue_sms" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />);
export const PushNotifyPicoBite: React.FC<OP> = (p) => (<HardwareOutputNode icon={<Bell size={20} className="text-violet-400" />} label="Push Notify" color="bg-violet-950/20 border-violet-900/50 text-violet-400 hover:bg-violet-900/30" onClick={() => p.onAction(p.telemetryTag, { action: "queue_push" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />);
