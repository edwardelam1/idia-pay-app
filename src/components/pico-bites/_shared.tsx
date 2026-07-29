/**
 * Shared chrome for the universal `pico.*` Pico-Bite catalog.
 *
 * These are layout/skin primitives only — they carry NO business data.
 * Every list-shaped bite falls back to <SterileState/> when its blueprint
 * `config` is missing. No mock data, ever.
 */
import type React from "react";
import { Lock } from "lucide-react";

export const GateOverlay: React.FC<{ satisfied?: boolean; reason?: string }> = ({
  satisfied,
  reason,
}) => {
  if (satisfied !== false) return null;
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center text-red-500 rounded-inherit border-2 border-red-900/50 backdrop-blur-sm">
      <Lock size={24} className="mb-2" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">
        {reason || "LOCKED"}
      </span>
    </div>
  );
};

export const SterileState: React.FC<{ label: string; icon?: React.ReactNode }> = ({
  label,
  icon,
}) => (
  <div className="w-full h-full min-h-[5rem] flex flex-col items-center justify-center bg-slate-950 border border-slate-800 text-slate-600 select-none p-4 text-center">
    {icon && <div className="mb-2 opacity-50">{icon}</div>}
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </div>
);

export const SterileStatus: React.FC<{ label: string; icon?: React.ReactNode }> = ({
  label,
  icon,
}) => (
  <div className="relative h-8 px-3 flex items-center gap-2 bg-slate-950 border border-slate-800 text-slate-600 select-none">
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </div>
);

/** Tall square trigger used by hardware-capture bites (scanners, sensors). */
export const HardwareTriggerNode: React.FC<{
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
  gateSatisfied?: boolean;
  gateReason?: string;
}> = ({ icon, label, color, onClick, gateSatisfied, gateReason }) => (
  <button
    onClick={onClick}
    className={`relative w-full h-32 flex flex-col items-center justify-center gap-3 border ${color} transition-all active:scale-[0.98] select-none`}
  >
    <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
    {icon}
    <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
  </button>
);

/** Wide row trigger used by peripheral-output bites (printers, relays). */
export const HardwareOutputNode: React.FC<{
  icon: React.ReactNode;
  kicker?: string;
  label: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
  gateSatisfied?: boolean;
  gateReason?: string;
}> = ({ icon, kicker, label, color, onClick, disabled, gateSatisfied, gateReason }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative w-full h-20 flex items-center justify-start px-4 gap-4 border ${color} transition-all active:scale-[0.98] disabled:opacity-40 select-none`}
  >
    <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
    <div className="w-12 h-12 flex items-center justify-center bg-slate-950/50 rounded">{icon}</div>
    <div className="flex flex-col items-start">
      <span className="text-[10px] text-slate-500 uppercase tracking-widest">{kicker ?? "Trigger"}</span>
      <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
    </div>
  </button>
);

/** Compact label/value strip used by read-out bites (meters, counters). */
export const StatusRow: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone?: string;
}> = ({ icon, label, value, tone = "text-slate-200" }) => (
  <div className="w-full flex justify-between items-center px-3 py-2 bg-slate-950 border border-slate-800">
    <span className="text-[10px] uppercase text-slate-500 tracking-widest flex items-center gap-1">
      {icon}
      {label}
    </span>
    <span className={`text-sm font-mono ${tone}`}>{value}</span>
  </div>
);

/** Titled panel shell for multi-control bites. */
export const PicoFrame: React.FC<{
  title: string;
  accent?: string;
  children: React.ReactNode;
  gateSatisfied?: boolean;
  gateReason?: string;
}> = ({ title, accent = "text-slate-400", children, gateSatisfied, gateReason }) => (
  <div className="relative w-full flex flex-col bg-slate-900 border border-slate-800 select-none">
    <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
    <div className="px-3 py-2 bg-slate-950 border-b border-slate-800">
      <span className={`text-[10px] font-bold uppercase tracking-widest ${accent}`}>{title}</span>
    </div>
    <div className="flex-1">{children}</div>
  </div>
);
