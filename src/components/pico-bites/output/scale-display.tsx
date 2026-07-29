/**
 * pico.output.scale_display — mirrors the certified scale read-out to the
 * guest display (distinct from input/weight-scale.tsx which polls hardware).
 */
import { Gauge } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

type OP = PicoBiteProps<Record<string, unknown>, unknown>;

export const ScaleDisplayPicoBite: React.FC<OP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const weight = config?.weight as number | undefined;
  const unit = (config?.unit as string) || "lb";
  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "mirror_scale_display" })}
      className="relative w-full flex items-center justify-between bg-slate-950 border border-amber-900/40 px-4 py-3 hover:bg-slate-900 active:scale-[0.98] transition-all select-none"
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex items-center gap-2">
        <Gauge size={20} className="text-amber-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Mirror To Guest</span>
      </div>
      <span className="text-2xl font-mono text-amber-400">{typeof weight === "number" ? `${weight.toFixed(2)} ${unit}` : "—"}</span>
    </button>
  );
};
