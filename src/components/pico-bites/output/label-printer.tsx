/**
 * pico.output.label_printer — prints an adhesive label (weights, SKUs).
 */
import { Tag } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

type OP = PicoBiteProps<Record<string, unknown>, unknown>;

export const LabelPrinterPicoBite: React.FC<OP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const labelType = (config?.labelType as string) || "STANDARD";
  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "print_label" })}
      className="relative w-full h-16 flex items-center bg-blue-950/20 border border-blue-900/50 hover:bg-blue-900/30 active:scale-[0.98] transition-all select-none overflow-hidden"
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="w-2 h-full bg-blue-500" />
      <div className="flex-1 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Tag size={18} className="text-blue-400" />
          <span className="text-sm font-bold uppercase tracking-widest text-blue-200">Print Label</span>
        </div>
        <span className="text-[10px] font-mono uppercase text-blue-500">{labelType}</span>
      </div>
    </button>
  );
};
