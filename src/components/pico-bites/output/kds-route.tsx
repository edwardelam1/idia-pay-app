/**
 * pico.output.kds_route — routes a ticket to a specific KDS station
 * declared in blueprint config. Sterile when no station configured.
 */
import { Monitor } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

type OP = PicoBiteProps<Record<string, unknown>, unknown>;

export const KdsRoutePicoBite: React.FC<OP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const station = config?.station as string | undefined;
  if (!station) return <SterileState label="No KDS Station Configured" icon={<Monitor size={22} />} />;
  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "route_to_kds", station })}
      className="relative w-full h-20 flex items-center gap-3 bg-cyan-950/20 border border-cyan-900/50 px-4 hover:bg-cyan-900/30 active:scale-[0.98] transition-all select-none"
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <Monitor size={26} className="text-cyan-400" />
      <div className="flex flex-col items-start">
        <span className="text-[10px] uppercase text-cyan-600 tracking-widest">Route Ticket</span>
        <span className="text-base font-bold uppercase tracking-wider text-cyan-300">{station}</span>
      </div>
    </button>
  );
};
