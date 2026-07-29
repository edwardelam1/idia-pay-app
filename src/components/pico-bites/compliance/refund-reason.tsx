/**
 * pico.compliance.refund_reason — reason codes for a refund decision.
 */
import { ReceiptText } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

export const RefundReasonPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const options = (config?.reasons as string[]) || [];
  if (options.length === 0) return <SterileState label="AWAITING REFUND REASONS" icon={<ReceiptText size={20} />} />;
  return (
    <div className="relative w-full bg-rose-950/10 border border-rose-900/40 divide-y divide-rose-900/20">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-4 py-2 text-[10px] font-bold uppercase text-rose-400 tracking-widest flex items-center gap-1">
        <ReceiptText size={12} /> Refund Reason
      </div>
      {options.map((r) => (
        <button
          key={r}
          onClick={() => onAction(telemetryTag, { action: "select_refund_reason", reason: r })}
          className="w-full text-left px-4 py-3 text-sm text-slate-200 hover:bg-rose-900/10"
        >
          {r}
        </button>
      ))}
    </div>
  );
};
