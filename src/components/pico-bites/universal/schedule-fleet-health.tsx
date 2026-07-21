/**
 * Universal `pico.schedule.*` + `pico.fleet.*` + `pico.health.*` catalog.
 * Configurable slots/routes/vitals; sterile fallback when config is missing.
 */
import { useState } from "react";
import { Clock, MapPin, Route, Truck, HeartPulse, Thermometer, Activity, Radio } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "./_shared";

type SP = PicoBiteProps<Record<string, unknown>, unknown>;

export const BookSlotPicoBite: React.FC<SP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const slots = (config?.slots as Array<{ id: string; time: string; available?: boolean }>) || [];
  if (slots.length === 0) return <SterileState label="NO SLOTS PUBLISHED" icon={<Clock size={20} />} />;
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 grid grid-cols-3 gap-1 p-1">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {slots.map((s) => (
        <button key={s.id} disabled={s.available === false} onClick={() => onAction(telemetryTag, { action: "book_slot", id: s.id })}
          className={`h-10 text-xs font-mono border ${s.available === false ? "bg-slate-900 border-slate-800 text-slate-600" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"}`}>
          {s.time}
        </button>
      ))}
    </div>
  );
};

export const RescheduleFlowPicoBite: React.FC<SP> = (p) => (
  <button onClick={() => p.onAction(p.telemetryTag, { action: "start_reschedule" })} className="relative w-full h-12 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-100 flex items-center justify-center gap-2">
    <GateOverlay satisfied={p.gateSatisfied} reason={p.gateReason} />
    <Clock size={16} /><span className="text-xs font-bold uppercase tracking-widest">Reschedule</span>
  </button>
);

export const CheckInPicoBite: React.FC<SP> = (p) => (
  <button onClick={() => p.onAction(p.telemetryTag, { action: "check_in" })} className="relative w-full h-12 bg-emerald-950/30 border border-emerald-900/50 hover:bg-emerald-900/40 text-emerald-300 flex items-center justify-center gap-2">
    <GateOverlay satisfied={p.gateSatisfied} reason={p.gateReason} />
    <MapPin size={16} /><span className="text-xs font-bold uppercase tracking-widest">Check In</span>
  </button>
);

export const GpsPingPicoBite: React.FC<SP> = ({ config }) => {
  const label = (config?.label as string) || "GPS PING";
  const value = (config?.value as string) || "--";
  return (
    <div className="w-full flex justify-between items-center px-3 py-2 bg-slate-950 border border-slate-800">
      <span className="text-[10px] uppercase text-slate-500 tracking-widest flex items-center gap-1"><Radio size={12} /> {label}</span>
      <span className="text-xs font-mono text-emerald-400">{value}</span>
    </div>
  );
};

export const RouteMapPicoBite: React.FC<SP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const stops = (config?.stops as Array<{ id: string; label: string; status?: string }>) || [];
  if (stops.length === 0) return <SterileState label="NO ROUTE ASSIGNED" icon={<Route size={20} />} />;
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 divide-y divide-slate-900">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {stops.map((s, i) => (
        <button key={s.id} onClick={() => onAction(telemetryTag, { action: "select_stop", id: s.id })} className="w-full flex justify-between items-center px-3 py-2 hover:bg-slate-900">
          <span className="text-sm text-slate-200">{i + 1}. {s.label}</span>
          <span className="text-[10px] uppercase text-slate-500">{s.status || "pending"}</span>
        </button>
      ))}
    </div>
  );
};

export const VehicleStatusPicoBite: React.FC<SP> = ({ config }) => {
  const plate = (config?.plate as string) || "—";
  const status = (config?.status as string) || "unknown";
  return (
    <div className="w-full flex justify-between items-center px-3 py-2 bg-slate-950 border border-slate-800">
      <span className="flex items-center gap-2 text-slate-200 text-xs"><Truck size={14} />{plate}</span>
      <span className="text-[10px] uppercase text-slate-500 tracking-widest">{status}</span>
    </div>
  );
};

export const VitalCapturePicoBite: React.FC<SP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const [val, setVal] = useState("");
  const kind = (config?.kind as string) || "value";
  const unit = (config?.unit as string) || "";
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 flex items-center px-3 gap-2 h-12">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <HeartPulse size={16} className="text-rose-400" />
      <input value={val} onChange={(e) => setVal(e.target.value)} placeholder={`${kind}${unit ? ` (${unit})` : ""}`} className="flex-1 bg-transparent outline-none text-sm text-white font-mono" />
      <button onClick={() => { onAction(telemetryTag, { action: "log_vital", kind, value: val, unit }); setVal(""); }} className="h-8 px-3 bg-rose-900/40 hover:bg-rose-800/50 text-rose-200 text-xs font-bold uppercase">Log</button>
    </div>
  );
};

export const SymptomInputPicoBite: React.FC<SP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const symptoms = (config?.symptoms as string[]) || [];
  if (symptoms.length === 0) return <SterileState label="NO SYMPTOM PANEL CONFIGURED" icon={<Activity size={20} />} />;
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 grid grid-cols-3 gap-1 p-1">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {symptoms.map((s) => (<button key={s} onClick={() => onAction(telemetryTag, { action: "toggle_symptom", label: s })} className="h-10 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase">{s}</button>))}
    </div>
  );
};

export const IoTSensorPicoBite: React.FC<SP> = ({ config }) => {
  const label = (config?.label as string) || "SENSOR";
  const reading = (config?.reading as string) || "--";
  return (
    <div className="w-full flex justify-between items-center px-3 py-2 bg-slate-950 border border-slate-800">
      <span className="flex items-center gap-2 text-slate-300 text-[10px] uppercase tracking-widest"><Thermometer size={12} />{label}</span>
      <span className="text-sm font-mono text-cyan-400">{reading}</span>
    </div>
  );
};

export const EnergyMeterPicoBite: React.FC<SP> = ({ config }) => {
  const kwh = (config?.kwh as string) || "0.00";
  return (
    <div className="w-full flex justify-between items-center px-3 py-2 bg-slate-950 border border-slate-800">
      <span className="text-[10px] uppercase text-slate-500 tracking-widest flex items-center gap-1"><Activity size={12} /> Energy</span>
      <span className="text-sm font-mono text-yellow-400">{kwh} kWh</span>
    </div>
  );
};
