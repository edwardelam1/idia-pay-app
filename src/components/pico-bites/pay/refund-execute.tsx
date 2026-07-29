/**
 * pico.pay.refund_execute — confirm-to-refund with a required hold/confirm
 * step before executing.
 */
import { useState } from "react";
import { Undo2, AlertTriangle } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, StatusRow, SterileState } from "../_shared";

export const RefundExecutePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const amount = config?.amount as number | undefined;
  const destination = config?.destination as string | undefined;
  const [armed, setArmed] = useState(false);

  if (amount === undefined) return <SterileState label="AWAITING REFUND AMOUNT" icon={<Undo2 size={20} />} />;

  return (
    <div className="relative w-full bg-red-950/10 border border-red-900/40 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="text-[10px] font-bold uppercase text-red-400 tracking-widest flex items-center gap-1">
        <Undo2 size={12} /> Refund
      </div>
      <StatusRow label="Amount" value={`$${amount.toFixed(2)}`} tone="text-red-300" />
      <StatusRow label="Destination" value={destination ?? "—"} />
      {!armed ? (
        <button
          onClick={() => setArmed(true)}
          className="h-10 bg-red-800/60 hover:bg-red-700/60 text-white text-xs font-bold uppercase flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <AlertTriangle size={14} /> Hold to Confirm Refund
        </button>
      ) : (
        <button
          onClick={() => onAction(telemetryTag, { action: "execute_refund", amount, destination })}
          className="h-10 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase animate-pulse active:scale-[0.98]"
        >
          Confirm — Execute Refund
        </button>
      )}
    </div>
  );
};
