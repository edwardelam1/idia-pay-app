/**
 * pico.telemetry.energy_meter — kWh consumption with peak-demand line.
 */
import { Zap } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const EnergyMeterPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const kwh = config?.kwh as number | undefined;
  const peakKw = config?.peakKw as number | undefined;

  if (kwh === undefined) {
    return <SterileState label="NO ENERGY DATA" icon={<Zap size={20} />} />;
  }

  return (
    <div className="relative w-full bg-gradient-to-br from-slate-950 to-yellow-950/20 border border-yellow-900/40 flex flex-col gap-1 px-3 py-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-yellow-400">
          <Zap size={12} /> Energy Consumption
        </span>
        <button
          onClick={() => onAction(telemetryTag, { action: "read_energy_meter", kwh, peakKw })}
          className="text-[10px] font-bold uppercase text-yellow-300 hover:text-yellow-100 active:scale-[0.98]"
        >
          Read
        </button>
      </div>
      <span className="text-2xl font-mono text-white">
        {kwh.toFixed(2)} <span className="text-xs text-slate-500">kWh</span>
      </span>
      <div className="flex justify-between text-[10px] font-mono text-slate-500 border-t border-yellow-900/30 pt-1">
        <span>Peak Demand</span>
        <span className="text-yellow-300">{peakKw !== undefined ? `${peakKw} kW` : "—"}</span>
      </div>
    </div>
  );
};
