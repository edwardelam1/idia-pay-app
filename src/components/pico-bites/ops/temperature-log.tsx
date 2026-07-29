/**
 * pico.ops.temperature_log — temperature entry with a config-supplied safe
 * range and an out-of-range banner.
 */
import { useState } from "react";
import { Thermometer, AlertTriangle } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const TemperatureLogPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const min = config?.min as number | undefined;
  const max = config?.max as number | undefined;
  const unit = (config?.unit as string) || "F";
  const [t, setT] = useState("");

  if (min === undefined || max === undefined) return <SterileState label="NO SAFE RANGE CONFIGURED" icon={<Thermometer size={20} />} />;

  const val = t === "" ? null : Number(t);
  const outOfRange = val !== null && (val < min || val > max);

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 flex items-center gap-1">
          <Thermometer size={12} /> Temperature Log
        </span>
        <span className="text-[10px] text-slate-500 font-mono">{min}–{max}°{unit}</span>
      </div>
      <div className="flex items-center px-3 gap-2 h-12 border-b border-slate-800">
        <input value={t} onChange={(e) => setT(e.target.value)} placeholder={`Reading °${unit}`} className="flex-1 bg-transparent outline-none text-sm text-white font-mono" />
        <button
          onClick={() => {
            onAction(telemetryTag, { action: "log_temperature", value: val, unit, outOfRange });
            setT("");
          }}
          className="h-8 px-3 bg-sky-900/40 hover:bg-sky-800/50 text-sky-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
        >
          Log
        </button>
      </div>
      {outOfRange && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-950/40 text-red-300">
          <AlertTriangle size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Out Of Safe Range</span>
        </div>
      )}
    </div>
  );
};
