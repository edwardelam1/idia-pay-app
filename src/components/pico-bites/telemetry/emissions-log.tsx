/**
 * pico.telemetry.emissions_log — CO2e log entry with scope 1/2/3 selector.
 */
import { useState } from "react";
import { Leaf } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

const SCOPES = [1, 2, 3];

export const EmissionsLogPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const co2e = config?.co2e as number | undefined;
  const [scope, setScope] = useState<number>((config?.defaultScope as number) || 1);

  if (co2e === undefined) {
    return <SterileState label="NO EMISSIONS DATA" icon={<Leaf size={20} />} />;
  }

  return (
    <div className="relative w-full bg-slate-900 border border-emerald-900/40 flex flex-col gap-2 px-3 py-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-emerald-400">
        <Leaf size={12} /> CO2e Emissions
      </span>
      <span className="text-2xl font-mono text-white">{co2e.toFixed(1)} <span className="text-xs text-slate-500">kg</span></span>
      <div className="flex gap-1">
        {SCOPES.map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`flex-1 h-8 text-[10px] font-bold uppercase border transition-all active:scale-[0.98] ${
              scope === s
                ? "bg-emerald-900/50 border-emerald-700 text-emerald-100"
                : "bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-800"
            }`}
          >
            Scope {s}
          </button>
        ))}
      </div>
      <button
        onClick={() => onAction(telemetryTag, { action: "log_emissions", co2e, scope })}
        className="h-8 bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
      >
        Log Entry
      </button>
    </div>
  );
};
