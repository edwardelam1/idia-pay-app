/**
 * pico.ops.cycle_count_input — counted-qty entry vs config.expected with
 * a live variance readout.
 */
import { useState } from "react";
import { Calculator, ClipboardList } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const CycleCountInputPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const expected = config?.expected as number | undefined;
  const label = (config?.label as string) ?? undefined;
  const [counted, setCounted] = useState("");

  if (expected === undefined) return <SterileState label="NO EXPECTED COUNT LOADED" icon={<ClipboardList size={20} />} />;

  const variance = counted === "" ? null : Number(counted) - expected;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 flex items-center gap-1">
          <Calculator size={12} /> Cycle Count
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{label ?? "item"}</span>
      </div>
      <div className="flex items-center px-3 gap-2 h-12 border-b border-slate-800">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Expected {expected}</span>
        <input
          value={counted}
          onChange={(e) => setCounted(e.target.value)}
          placeholder="Counted qty"
          className="flex-1 bg-transparent outline-none text-sm text-white font-mono text-right"
        />
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Variance</span>
        <span className={`text-sm font-mono ${variance === null ? "text-slate-500" : variance === 0 ? "text-emerald-400" : "text-red-400"}`}>
          {variance === null ? "—" : variance > 0 ? `+${variance}` : variance}
        </span>
      </div>
      <button
        onClick={() => {
          onAction(telemetryTag, { action: "submit_cycle_count", expected, counted: Number(counted), variance });
          setCounted("");
        }}
        className="h-11 bg-teal-900/40 hover:bg-teal-800/50 text-teal-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
      >
        Submit Count
      </button>
    </div>
  );
};
