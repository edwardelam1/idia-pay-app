/**
 * pico.output.kitchen_printer — fires a chit to the kitchen printer queue.
 */
import { Utensils } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

type OP = PicoBiteProps<Record<string, unknown>, unknown>;

export const KitchenPrinterPicoBite: React.FC<OP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const queueDepth = config?.queueDepth as number | undefined;
  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "print_kitchen_chit" })}
      className="relative w-full h-24 flex flex-col justify-between bg-amber-950/20 border-2 border-dashed border-amber-800/60 p-3 hover:bg-amber-900/20 active:scale-[0.98] transition-all select-none"
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex items-center gap-2">
        <Utensils size={20} className="text-amber-400" />
        <span className="text-sm font-bold uppercase tracking-widest text-amber-300">Fire Chit</span>
      </div>
      <div className="flex justify-between items-end">
        <span className="text-[10px] uppercase text-amber-600 tracking-wider">Kitchen Chit Printer</span>
        <span className="text-lg font-mono text-amber-400">{typeof queueDepth === "number" ? queueDepth : "—"}</span>
      </div>
    </button>
  );
};
