/**
 * pico.input.weight_scale — polls a connected certified scale for weight.
 */
import { Scale } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const WeightScalePicoBite: React.FC<IP> = (p) => {
  const unit = (p.config?.unit as string) || "lb";
  return (
    <div className="relative w-full h-32 bg-slate-950 border border-slate-800 flex flex-col items-center justify-center select-none" onClick={() => p.onAction(p.telemetryTag, { action: "poll_scale" })}>
      <GateOverlay satisfied={p.gateSatisfied} reason={p.gateReason} />
      <Scale size={24} className="text-amber-500 mb-2 opacity-50" />
      <div className="text-3xl font-mono text-amber-500 tracking-wider">0.00 <span className="text-sm">{unit}</span></div>
      <span className="text-[10px] text-slate-500 uppercase mt-1">Awaiting Scale...</span>
    </div>
  );
};
