/**
 * Universal `pico.ops.*` + `pico.crm.*` catalog — inventory ops, CRM lookups,
 * temperature/expiration/shift logging.
 */
import { useState } from "react";
import { Search, PackageSearch, Thermometer, User, ClipboardList, CalendarClock, TimerOff, FileClock } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "./_shared";

type OC = PicoBiteProps<Record<string, unknown>, unknown>;

export const SkuLookupPicoBite: React.FC<OC> = ({ telemetryTag, onAction, gateSatisfied, gateReason }) => {
  const [q, setQ] = useState("");
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 flex items-center px-3 gap-2 h-12">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <Search size={16} className="text-slate-500" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="SKU / UPC" className="flex-1 bg-transparent outline-none text-sm text-white font-mono" />
      <button onClick={() => { onAction(telemetryTag, { action: "sku_lookup", query: q }); setQ(""); }} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase">Go</button>
    </div>
  );
};

export const CycleCountInputPicoBite: React.FC<OC> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const items = (config?.items as Array<{ id: string; label: string; expected?: number }>) || [];
  if (items.length === 0) return <SterileState label="NO COUNT SHEET LOADED" icon={<ClipboardList size={20} />} />;
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 divide-y divide-slate-900">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {items.map((i) => (
        <div key={i.id} className="flex items-center gap-2 px-3 py-2">
          <span className="flex-1 text-sm text-slate-200">{i.label}</span>
          {typeof i.expected === "number" && <span className="text-[10px] text-slate-500 font-mono">exp {i.expected}</span>}
          <button onClick={() => onAction(telemetryTag, { action: "count_item", id: i.id })} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase">Count</button>
        </div>
      ))}
    </div>
  );
};

export const StockAdjustPicoBite: React.FC<OC> = ({ telemetryTag, onAction, gateSatisfied, gateReason }) => (
  <button onClick={() => onAction(telemetryTag, { action: "adjust_stock" })} className="relative w-full h-14 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-100 flex items-center justify-center gap-2">
    <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
    <PackageSearch size={16} /><span className="text-xs font-bold uppercase tracking-widest">Adjust Stock</span>
  </button>
);

export const TemperatureLogPicoBite: React.FC<OC> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const [t, setT] = useState("");
  const unit = (config?.unit as string) || "F";
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 flex items-center px-3 gap-2 h-12">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <Thermometer size={16} className="text-red-400" />
      <input value={t} onChange={(e) => setT(e.target.value)} placeholder={`Temp °${unit}`} className="flex-1 bg-transparent outline-none text-sm text-white font-mono" />
      <button onClick={() => { onAction(telemetryTag, { action: "log_temp", value: t, unit }); setT(""); }} className="h-8 px-3 bg-red-900/40 hover:bg-red-800/50 text-red-200 text-xs font-bold uppercase">Log</button>
    </div>
  );
};

export const ExpirationFlagPicoBite: React.FC<OC> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const options = (config?.options as string[]) || ["Damaged", "Expired", "Recalled"];
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 grid grid-cols-3 gap-1 p-1">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {options.map((o) => (<button key={o} onClick={() => onAction(telemetryTag, { action: "flag_stock", reason: o })} className="h-9 bg-red-950/30 hover:bg-red-900/40 text-red-300 text-[10px] font-bold uppercase tracking-widest">{o}</button>))}
    </div>
  );
};

export const CustomerLookupPicoBite: React.FC<OC> = ({ telemetryTag, onAction, gateSatisfied, gateReason }) => {
  const [q, setQ] = useState("");
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 flex items-center px-3 gap-2 h-12">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <User size={16} className="text-slate-500" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Phone / Email / Name" className="flex-1 bg-transparent outline-none text-sm text-white" />
      <button onClick={() => { onAction(telemetryTag, { action: "customer_lookup", query: q }); setQ(""); }} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase">Find</button>
    </div>
  );
};

export const GuestNotePicoBite: React.FC<OC> = ({ telemetryTag, onAction, gateSatisfied, gateReason }) => {
  const [note, setNote] = useState("");
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 p-2 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Guest note..." className="w-full bg-slate-900 border border-slate-800 text-sm text-white p-2 outline-none focus:border-blue-500" />
      <button onClick={() => { onAction(telemetryTag, { action: "save_note", note }); setNote(""); }} className="h-9 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase">Save Note</button>
    </div>
  );
};

export const ShiftPunchPicoBite: React.FC<OC> = ({ telemetryTag, onAction, gateSatisfied, gateReason }) => (
  <div className="relative w-full bg-slate-950 border border-slate-800 grid grid-cols-2 gap-1 p-1">
    <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
    <button onClick={() => onAction(telemetryTag, { action: "punch_in" })} className="h-11 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold uppercase"><CalendarClock size={14} className="inline mr-1" />Punch In</button>
    <button onClick={() => onAction(telemetryTag, { action: "punch_out" })} className="h-11 bg-red-900 hover:bg-red-800 text-white text-xs font-bold uppercase"><TimerOff size={14} className="inline mr-1" />Punch Out</button>
  </div>
);

export const AuditTrailPicoBite: React.FC<OC> = ({ config }) => {
  const entries = (config?.entries as Array<{ ts: string; label: string }>) || [];
  if (entries.length === 0) return <SterileState label="NO AUDIT ENTRIES" icon={<FileClock size={20} />} />;
  return (
    <div className="w-full bg-slate-950 border border-slate-800 divide-y divide-slate-900 max-h-40 overflow-y-auto">
      {entries.map((e, i) => (<div key={i} className="flex justify-between items-center px-3 py-2 text-[11px]"><span className="text-slate-300">{e.label}</span><span className="text-slate-600 font-mono">{e.ts}</span></div>))}
    </div>
  );
};
