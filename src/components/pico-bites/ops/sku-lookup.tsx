/**
 * pico.ops.sku_lookup — SKU/UPC entry with result card sourced from config.result.
 */
import { useState } from "react";
import { ScanLine, PackageCheck } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const SkuLookupPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const [q, setQ] = useState("");
  const result = config?.result as { sku?: string; name?: string; price?: string; stock?: number } | undefined;

  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex items-center px-3 gap-2 h-12 border-b border-slate-800">
        <ScanLine size={16} className="text-cyan-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Enter SKU / UPC"
          className="flex-1 bg-transparent outline-none text-sm text-white font-mono"
        />
        <button
          onClick={() => onAction(telemetryTag, { action: "lookup_sku", query: q })}
          className="h-8 px-3 bg-cyan-900/50 hover:bg-cyan-800/60 text-cyan-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
        >
          Lookup
        </button>
      </div>
      {result ? (
        <div className="flex items-center justify-between px-3 py-3 gap-2">
          <div className="flex items-center gap-2">
            <PackageCheck size={16} className="text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-sm text-slate-100">{result.name ?? "—"}</span>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{result.sku ?? "—"}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-mono text-cyan-300">{result.price ?? "—"}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">stk {result.stock ?? "—"}</span>
          </div>
        </div>
      ) : (
        <SterileState label="NO SKU RESULT LOADED" icon={<PackageCheck size={20} />} />
      )}
    </div>
  );
};
