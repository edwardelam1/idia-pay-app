/**
 * `pico.ui.summary_bar` — horizontal subtotal/tax/total strip.
 */
import type React from "react";
import { Receipt } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "@/components/pico-bites/_shared";

export const SummaryBarPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const totals = (config?.totals as { subtotal?: number; tax?: number; total?: number }) || {};
  const fmt = (n?: number) => (typeof n === "number" ? `$${n.toFixed(2)}` : "—");
  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "open_summary" })}
      className="relative w-full h-14 bg-slate-900 border border-slate-800 flex items-stretch active:scale-[0.99] transition-all"
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex items-center justify-center px-3 border-r border-slate-800 text-slate-500">
        <Receipt size={16} />
      </div>
      <div className="flex-1 flex divide-x divide-slate-800">
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-[9px] uppercase tracking-widest text-slate-500">Subtotal</span>
          <span className="text-sm font-mono text-slate-200">{fmt(totals.subtotal)}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-[9px] uppercase tracking-widest text-slate-500">Tax</span>
          <span className="text-sm font-mono text-slate-200">{fmt(totals.tax)}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950">
          <span className="text-[9px] uppercase tracking-widest text-emerald-500">Total</span>
          <span className="text-sm font-mono text-emerald-400">{fmt(totals.total)}</span>
        </div>
      </div>
    </button>
  );
};
