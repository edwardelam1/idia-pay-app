/**
 * pico.telemetry.water_meter — gallons/litres flow readout with leak-suspect flag.
 */
import { Droplets, AlertOctagon } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const WaterMeterPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const flow = config?.flow as number | undefined;
  const unit = (config?.unit as string) || "gal";
  const leakSuspect = Boolean(config?.leakSuspect);

  if (flow === undefined) {
    return <SterileState label="NO WATER FLOW DATA" icon={<Droplets size={20} />} />;
  }

  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "read_water_meter", flow, unit, leakSuspect })}
      className={`relative w-full flex items-center justify-between px-3 py-3 border active:scale-[0.98] transition-all ${
        leakSuspect ? "bg-red-950/30 border-red-900/50" : "bg-sky-950/20 border-sky-900/40 hover:bg-sky-950/30"
      }`}
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex items-center gap-3">
        <Droplets size={22} className={leakSuspect ? "text-red-400" : "text-sky-400"} />
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">Flow Rate</span>
          <span className="text-lg font-mono text-white">{flow} <span className="text-xs text-slate-500">{unit}/min</span></span>
        </div>
      </div>
      {leakSuspect && (
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-red-300">
          <AlertOctagon size={14} /> Leak Suspect
        </span>
      )}
    </button>
  );
};
