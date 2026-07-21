/**
 * Universal `pico.compliance.*` catalog — manager overrides, age checks,
 * ID verification, HIPAA gates, refund/void reason capture.
 */
import { useState } from "react";
import { ShieldAlert, ScanLine, ShieldCheck, Lock, FileWarning } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "./_shared";

type CP = PicoBiteProps<Record<string, unknown>, unknown>;

export const ManagerOverridePicoBite: React.FC<CP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const label = (config?.label as string) || "MANAGER OVERRIDE REQUIRED";
  return (
    <div className="relative w-full bg-red-950/30 border-2 border-red-900/60 p-4 flex flex-col items-center gap-3">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <ShieldAlert size={28} className="text-red-400" />
      <span className="text-xs uppercase tracking-widest font-bold text-red-300">{label}</span>
      <button onClick={() => onAction(telemetryTag, { action: "request_override" })}
        className="w-full h-10 bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-bold uppercase tracking-wider text-xs transition-all active:scale-95">
        Enter Manager PIN
      </button>
    </div>
  );
};

export const AgeVerifyPicoBite: React.FC<CP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const min = (config?.minAge as number) || 21;
  return (
    <div className="relative w-full bg-amber-950/30 border-2 border-amber-900/60 p-4 flex flex-col items-center gap-3">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <FileWarning size={24} className="text-amber-400" />
      <span className="text-xs uppercase tracking-widest font-bold text-amber-300">CUSTOMER {min}+</span>
      <div className="grid grid-cols-2 gap-2 w-full">
        <button onClick={() => onAction(telemetryTag, { action: "age_confirmed", ok: true })} className="h-10 bg-emerald-700 hover:bg-emerald-600 text-white font-bold uppercase text-xs">Confirm</button>
        <button onClick={() => onAction(telemetryTag, { action: "age_confirmed", ok: false })} className="h-10 bg-red-800 hover:bg-red-700 text-white font-bold uppercase text-xs">Deny</button>
      </div>
    </div>
  );
};

export const IdCheckPicoBite: React.FC<CP> = ({ telemetryTag, onAction, gateSatisfied, gateReason }) => (
  <button onClick={() => onAction(telemetryTag, { action: "await_id_scan" })} className="relative w-full h-24 bg-slate-900 border border-slate-800 hover:bg-slate-800 flex flex-col items-center justify-center gap-2 text-slate-300 active:scale-[0.98]">
    <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
    <ScanLine size={24} /><span className="text-xs font-bold uppercase tracking-widest">Scan Photo ID</span>
  </button>
);

export const HipaaGatePicoBite: React.FC<CP> = ({ telemetryTag, onAction, gateSatisfied, gateReason }) => (
  <div className="relative w-full bg-indigo-950/30 border-2 border-indigo-900/60 p-4 flex flex-col items-center gap-3">
    <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
    <ShieldCheck size={24} className="text-indigo-400" />
    <span className="text-xs uppercase tracking-widest font-bold text-indigo-300">HIPAA-Protected Session</span>
    <button onClick={() => onAction(telemetryTag, { action: "hipaa_acknowledged" })} className="w-full h-10 bg-indigo-700 hover:bg-indigo-600 text-white font-bold uppercase text-xs">Acknowledge</button>
  </div>
);

export const ConsentCheckboxPicoBite: React.FC<CP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const [checked, setChecked] = useState(false);
  const label = (config?.label as string) || "I consent to the terms above.";
  return (
    <div className="relative w-full flex items-start gap-3 p-3 bg-slate-950 border border-slate-800">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <button onClick={() => { const v = !checked; setChecked(v); onAction(telemetryTag, { action: "consent_toggle", value: v }); }}
        className={`w-5 h-5 border-2 flex items-center justify-center ${checked ? "bg-emerald-600 border-emerald-500" : "border-slate-600"}`}>
        {checked && <span className="text-white text-xs">✓</span>}
      </button>
      <span className="text-xs text-slate-300 leading-relaxed">{label}</span>
    </div>
  );
};

export const RefundReasonPicoBite: React.FC<CP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const options = (config?.reasons as string[]) || [];
  if (options.length === 0) return <SterileState label="AWAITING REFUND REASONS" icon={<Lock size={20} />} />;
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 divide-y divide-slate-900">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {options.map((r) => (
        <button key={r} onClick={() => onAction(telemetryTag, { action: "refund_reason", reason: r })}
          className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-900">{r}</button>
      ))}
    </div>
  );
};

export const VoidReasonPicoBite: React.FC<CP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const options = (config?.reasons as string[]) || [];
  if (options.length === 0) return <SterileState label="AWAITING VOID REASONS" icon={<Lock size={20} />} />;
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 divide-y divide-slate-900">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {options.map((r) => (
        <button key={r} onClick={() => onAction(telemetryTag, { action: "void_reason", reason: r })}
          className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-slate-900">{r}</button>
      ))}
    </div>
  );
};

export const DiscountAuthPicoBite: React.FC<CP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const max = (config?.maxPct as number) || 0;
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 p-3 flex justify-between items-center">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div><div className="text-[10px] uppercase text-slate-500 tracking-widest">Comp / Discount</div><div className="text-xs text-slate-300">Max {max}% without manager</div></div>
      <button onClick={() => onAction(telemetryTag, { action: "apply_discount" })} className="h-9 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase">Apply</button>
    </div>
  );
};
