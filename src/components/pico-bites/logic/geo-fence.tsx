/**
 * pico.logic.geo_fence — inside/outside state with distance-from-centre.
 */
import { MapPinned } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const GeoFencePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const inside = config?.inside;
  const distanceM = config?.distanceM as number | undefined;

  if (inside === undefined) {
    return <SterileState label="NO GEOFENCE BOUND" icon={<MapPinned size={20} />} />;
  }

  const isInside = Boolean(inside);

  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "evaluate_geofence", inside: isInside, distanceM })}
      className={`relative w-full flex items-center justify-between px-3 py-3 border active:scale-[0.98] transition-all ${
        isInside ? "bg-emerald-950/30 border-emerald-900/50" : "bg-red-950/30 border-red-900/50"
      }`}
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <span className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${isInside ? "text-emerald-300" : "text-red-300"}`}>
        <MapPinned size={16} /> {isInside ? "Inside Fence" : "Outside Fence"}
      </span>
      <span className="text-[10px] font-mono text-slate-400">
        {distanceM !== undefined ? `${distanceM}m from centre` : "—"}
      </span>
    </button>
  );
};
