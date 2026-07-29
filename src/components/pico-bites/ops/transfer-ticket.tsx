/**
 * pico.ops.transfer_ticket — from/to location selector and qty for a stock
 * transfer ticket, sourced from config.locations.
 */
import { useState } from "react";
import { ArrowRightLeft, Boxes } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const TransferTicketPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const locations = (config?.locations as string[]) || [];
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [qty, setQty] = useState("");

  if (locations.length === 0) return <SterileState label="NO LOCATIONS CONFIGURED" icon={<Boxes size={20} />} />;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1">
        <ArrowRightLeft size={12} className="text-violet-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Transfer Ticket</span>
      </div>
      <div className="grid grid-cols-2 gap-1 p-2">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 bg-slate-950 border border-slate-800 text-xs text-white px-2">
          <option value="">From...</option>
          {locations.map((l) => (<option key={l} value={l}>{l}</option>))}
        </select>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="h-9 bg-slate-950 border border-slate-800 text-xs text-white px-2">
          <option value="">To...</option>
          {locations.map((l) => (<option key={l} value={l}>{l}</option>))}
        </select>
      </div>
      <div className="flex items-center px-2 gap-2 pb-2">
        <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty" className="flex-1 h-9 bg-slate-950 border border-slate-800 text-sm text-white font-mono px-2 outline-none" />
        <button
          onClick={() => {
            onAction(telemetryTag, { action: "create_transfer_ticket", from, to, qty: Number(qty) });
            setQty("");
          }}
          disabled={!from || !to || !qty}
          className="h-9 px-3 bg-violet-900/50 hover:bg-violet-800/60 disabled:opacity-40 text-violet-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
        >
          Create
        </button>
      </div>
    </div>
  );
};
