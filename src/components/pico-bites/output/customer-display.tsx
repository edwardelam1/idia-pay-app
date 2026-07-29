/**
 * pico.output.customer_display — pushes the current total/message to the
 * guest-facing screen. Shows "—" when no amount is configured.
 */
import { PanelTop } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

type OP = PicoBiteProps<Record<string, unknown>, unknown>;

export const CustomerDisplayPicoBite: React.FC<OP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const amount = config?.amount as number | undefined;
  const message = (config?.message as string) || "";
  return (
    <div className="relative w-full bg-black border-2 border-slate-700 rounded-sm select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-1 flex items-center gap-2 border-b border-slate-800">
        <PanelTop size={14} className="text-lime-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-lime-500">Guest Display</span>
      </div>
      <div className="px-4 py-3 flex flex-col items-end">
        <span className="text-3xl font-mono text-lime-400 tracking-wider">{typeof amount === "number" ? `$${amount.toFixed(2)}` : "—"}</span>
        {message && <span className="text-xs font-mono text-lime-600 mt-1">{message}</span>}
      </div>
      <button
        onClick={() => onAction(telemetryTag, { action: "push_customer_display", amount, message })}
        className="w-full py-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-800"
      >
        Push To Screen
      </button>
    </div>
  );
};
