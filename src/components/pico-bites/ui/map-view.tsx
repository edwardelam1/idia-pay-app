/**
 * `pico.ui.map_view` — geo panel showing center + pins as a coordinate list.
 */
import type React from "react";
import { MapPin, Crosshair } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const MapViewPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const center = config?.center as { lat: number; lng: number } | undefined;
  const pins = (config?.pins as Array<{ id: string; label: string; lat: number; lng: number }>) || [];
  if (!center && pins.length === 0) return <SterileState label="No geo data" icon={<MapPin size={20} />} />;
  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "recenter_map" })}
      className="relative w-full h-full bg-slate-950 border border-slate-800 flex flex-col text-left"
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex-1 relative flex items-center justify-center border-b border-slate-800">
        <Crosshair size={28} className="text-teal-500" />
        <span className="absolute bottom-1 right-1 text-[9px] font-mono text-slate-500">
          {center ? `${center.lat.toFixed(3)}, ${center.lng.toFixed(3)}` : "—"}
        </span>
      </div>
      <div className="flex flex-col divide-y divide-slate-900 max-h-24 overflow-y-auto">
        {pins.map((p) => (
          <div key={p.id} className="flex items-center gap-2 px-2 py-1 text-[10px] text-slate-300">
            <MapPin size={10} className="text-teal-500 shrink-0" />
            <span className="truncate flex-1">{p.label}</span>
            <span className="font-mono text-slate-500">{p.lat.toFixed(2)},{p.lng.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </button>
  );
};
