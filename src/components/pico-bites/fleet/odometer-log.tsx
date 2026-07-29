/**
 * pico.fleet.odometer_log — odometer reading entry vs config.lastReading
 * with a delta and unit readout.
 */
import { useState } from "react";
import { Gauge } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const OdometerLogPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const lastReading = config?.lastReading as number | undefined;
  const unit = (config?.unit as string) || "mi";
  const [reading, setReading] = useState("");

  if (lastReading === undefined) return <SterileState label="NO PRIOR READING ON FILE" icon={<Gauge size={20} />} />;

  const delta = reading === "" ? null : Number(reading) - lastReading;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 flex items-center gap-1">
          <Gauge size={12} /> Odometer
        </span>
        <span className="text-[10px] text-slate-500 font-mono">last {lastReading} {unit}</span>
      </div>
      <div className="flex items-center px-3 gap-2 h-12 border-b border-slate-800">
        <input value={reading} onChange={(e) => setReading(e.target.value)} placeholder={`Reading (${unit})`} className="flex-1 bg-transparent outline-none text-sm text-white font-mono" />
        <span className="text-[10px] font-mono text-slate-500">Δ {delta === null ? "—" : delta}</span>
      </div>
      <button
        onClick={() => {
          onAction(telemetryTag, { action: "log_odometer", reading: Number(reading), unit, delta });
          setReading("");
        }}
        className="h-10 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
      >
        Log Reading
      </button>
    </div>
  );
};
