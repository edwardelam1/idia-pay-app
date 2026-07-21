/**
 * Universal `pico.display.*` catalog — display + UI structure bites.
 * Every list/grid bite renders <SterileState/> when its blueprint config
 * has no items/tiles/lines. No mock rows.
 */
import { useState } from "react";
import { AlertTriangle, Info, LayoutGrid, ShoppingCart, ScrollText, Utensils, Bell, DollarSign, User, Timer } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "./_shared";

type DP = PicoBiteProps<Record<string, unknown>, unknown>;

export const ItemGridPicoBite: React.FC<DP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const items = (config?.items as Array<{ id: string; label: string; price?: number; color?: string }>) || [];
  if (items.length === 0) return <SterileState label="AWAITING GRID CONFIG" icon={<LayoutGrid size={20} />} />;
  return (
    <div className="relative w-full h-full bg-slate-950 grid grid-cols-3 gap-1 p-1">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {items.map((i) => (
        <button key={i.id} onClick={() => onAction(telemetryTag, { action: "select_item", id: i.id })}
          className="aspect-square flex flex-col items-center justify-center bg-slate-900 border border-slate-800 hover:bg-slate-800 active:bg-slate-700 active:scale-95 transition-all text-slate-100 p-1">
          <div className="w-6 h-6 rounded-full mb-1" style={{ backgroundColor: i.color || "#334155" }} />
          <span className="text-[10px] font-bold uppercase leading-tight text-center">{i.label}</span>
          {typeof i.price === "number" && <span className="text-[9px] text-emerald-400 mt-0.5">${i.price.toFixed(2)}</span>}
        </button>
      ))}
    </div>
  );
};

export const CartPanePicoBite: React.FC<DP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const lines = (config?.lines as Array<{ id: string; label: string; qty: number; price: number }>) || [];
  if (lines.length === 0) return <SterileState label="CART EMPTY" icon={<ShoppingCart size={20} />} />;
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  return (
    <div className="relative w-full h-full bg-slate-950 border border-slate-800 flex flex-col">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 border-b border-slate-800 text-xs font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2"><ShoppingCart size={14} /> Cart</div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
        {lines.map((l) => (
          <button key={l.id} onClick={() => onAction(telemetryTag, { action: "select_line", id: l.id })} className="w-full flex justify-between items-center px-3 py-2 hover:bg-slate-900 text-left">
            <div><div className="text-sm text-slate-100">{l.label}</div><div className="text-[10px] text-slate-500">×{l.qty}</div></div>
            <div className="text-sm text-slate-300 font-mono">${(l.qty * l.price).toFixed(2)}</div>
          </button>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-slate-800 flex justify-between items-center bg-slate-900">
        <span className="text-xs uppercase font-bold text-slate-500">Total</span>
        <span className="text-lg font-mono text-emerald-400">${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export const SummaryBarPicoBite: React.FC<DP> = ({ config }) => {
  const label = (config?.label as string) || "TOTAL";
  const value = (config?.value as string) ?? "--";
  return (
    <div className="w-full h-12 bg-slate-900 border-y border-slate-800 flex justify-between items-center px-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      <span className="text-lg font-mono text-white">{value}</span>
    </div>
  );
};

export const OrderTicketPicoBite: React.FC<DP> = ({ config, gateSatisfied, gateReason }) => {
  const items = (config?.items as string[]) || [];
  const orderNo = (config?.orderNo as string) || "--";
  if (items.length === 0) return <SterileState label="AWAITING ORDER" icon={<ScrollText size={20} />} />;
  return (
    <div className="relative w-full bg-white text-slate-900 font-mono p-3 border-2 border-slate-300 shadow">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="border-b border-dashed border-slate-400 pb-1 mb-2 flex justify-between text-xs"><span>#{orderNo}</span><span>{new Date().toLocaleTimeString()}</span></div>
      <ul className="text-sm space-y-0.5">{items.map((it, i) => <li key={i}>• {it}</li>)}</ul>
    </div>
  );
};

export const TableMapPicoBite: React.FC<DP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const tables = (config?.tables as Array<{ id: string; label: string; status?: "open" | "seated" | "dirty" }>) || [];
  if (tables.length === 0) return <SterileState label="AWAITING FLOOR PLAN" icon={<LayoutGrid size={20} />} />;
  const color = (s?: string) => s === "seated" ? "bg-emerald-800 text-emerald-200 border-emerald-600" : s === "dirty" ? "bg-red-900 text-red-200 border-red-700" : "bg-slate-800 text-slate-300 border-slate-700";
  return (
    <div className="relative w-full h-full bg-slate-950 grid grid-cols-4 gap-2 p-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {tables.map((t) => (
        <button key={t.id} onClick={() => onAction(telemetryTag, { action: "select_table", id: t.id })}
          className={`aspect-square flex items-center justify-center border-2 rounded font-bold text-sm ${color(t.status)} active:scale-95 transition-all`}>
          {t.label}
        </button>
      ))}
    </div>
  );
};

export const NotificationBarPicoBite: React.FC<DP> = ({ config }) => {
  const message = (config?.message as string) || "";
  const level = ((config?.level as string) || "info") as "info" | "warn" | "error";
  if (!message) return <SterileState label="NO NOTICES" icon={<Bell size={20} />} />;
  const style = level === "error" ? "bg-red-950 border-red-900 text-red-300" : level === "warn" ? "bg-amber-950 border-amber-900 text-amber-300" : "bg-blue-950 border-blue-900 text-blue-300";
  const Icon = level === "info" ? Info : AlertTriangle;
  return (
    <div className={`w-full flex items-center gap-3 px-4 py-2 border ${style}`}>
      <Icon size={16} /><span className="text-xs font-semibold uppercase tracking-wider">{message}</span>
    </div>
  );
};

export const CountdownTimerPicoBite: React.FC<DP> = ({ config }) => {
  const label = (config?.label as string) || "COUNTDOWN";
  const value = (config?.value as string) ?? "--:--";
  return (
    <div className="w-full h-16 bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
      <span className="text-[10px] uppercase text-slate-500 tracking-widest flex items-center gap-1"><Timer size={10} /> {label}</span>
      <span className="text-2xl font-mono text-amber-400">{value}</span>
    </div>
  );
};

export const ModifierGridPicoBite: React.FC<DP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const mods = (config?.modifiers as Array<{ id: string; label: string; delta?: number }>) || [];
  if (mods.length === 0) return <SterileState label="AWAITING MODIFIERS" icon={<Utensils size={20} />} />;
  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      onAction(telemetryTag, { action: "toggle_modifier", id, selected: next });
      return next;
    });
  };
  return (
    <div className="relative w-full h-full bg-slate-950 grid grid-cols-2 gap-1 p-1">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {mods.map((m) => (
        <button key={m.id} onClick={() => toggle(m.id)}
          className={`h-12 border font-semibold text-xs uppercase transition-all ${selected.includes(m.id) ? "bg-emerald-800 border-emerald-600 text-emerald-100" : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"}`}>
          {m.label}{typeof m.delta === "number" && <span className="ml-2 opacity-70">{m.delta > 0 ? "+" : ""}${m.delta.toFixed(2)}</span>}
        </button>
      ))}
    </div>
  );
};

export const RoleBadgePicoBite: React.FC<DP> = ({ config }) => {
  const name = (config?.name as string) || "—";
  const role = (config?.role as string) || "—";
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-200">
      <User size={14} /><span className="text-xs font-bold">{name}</span><span className="text-[10px] uppercase text-slate-500 tracking-widest">· {role}</span>
    </div>
  );
};

export const PriceDisplayPicoBite: React.FC<DP> = ({ config }) => {
  const label = (config?.label as string) || "Amount";
  const value = typeof config?.value === "number" ? (config.value as number).toFixed(2) : "0.00";
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 border border-slate-800">
      <span className="text-xs uppercase text-slate-500 tracking-widest">{label}</span>
      <span className="text-2xl font-mono text-emerald-400 flex items-center"><DollarSign size={16} className="opacity-60" />{value}</span>
    </div>
  );
};
