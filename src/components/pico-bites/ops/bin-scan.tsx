/**
 * pico.ops.bin_scan — warehouse bin/location scan trigger with last-scanned
 * bin context from config. Distinct from the generic barcode-scan input.
 */
import { Warehouse, MapPinned } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "@/components/pico-bites/_shared";

export const BinScanPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const lastBin = config?.lastBin as string | undefined;
  const zone = config?.zone as string | undefined;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1">
          <Warehouse size={12} /> Bin Scanner
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{zone ?? "—"}</span>
      </div>
      <div className="px-3 py-2 flex items-center gap-2">
        <MapPinned size={14} className="text-slate-500" />
        <span className="text-xs text-slate-400 uppercase tracking-widest">Last Bin</span>
        <span className="ml-auto text-sm font-mono text-amber-300">{lastBin ?? "—"}</span>
      </div>
      <button
        onClick={() => onAction(telemetryTag, { action: "scan_bin", lastBin, zone })}
        className="h-14 bg-amber-900/40 hover:bg-amber-800/50 text-amber-200 text-sm font-bold uppercase tracking-widest active:scale-[0.98]"
      >
        Scan Bin Location
      </button>
    </div>
  );
};
