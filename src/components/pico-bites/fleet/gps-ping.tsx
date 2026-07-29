/**
 * pico.fleet.gps_ping — current fix (lat/lng/accuracy from config) with a
 * ping-now action.
 */
import { Satellite, Radar } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, StatusRow } from "@/components/pico-bites/_shared";

export const GpsPingPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const lat = config?.lat as number | undefined;
  const lng = config?.lng as number | undefined;
  const accuracy = config?.accuracy as number | undefined;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1">
        <Satellite size={12} className="text-cyan-300" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">GPS Fix</span>
      </div>
      <div className="p-2 flex flex-col gap-1">
        <StatusRow label="Lat / Lng" value={lat !== undefined && lng !== undefined ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : "—"} />
        <StatusRow icon={<Radar size={12} />} label="Accuracy" value={accuracy !== undefined ? `${accuracy}m` : "—"} tone={accuracy === undefined ? "text-slate-500" : "text-cyan-300"} />
      </div>
      <button
        onClick={() => onAction(telemetryTag, { action: "ping_gps" })}
        className="h-11 bg-cyan-900/40 hover:bg-cyan-800/50 text-cyan-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
      >
        Ping Now
      </button>
    </div>
  );
};
