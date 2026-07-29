/**
 * pico.pay.settlement_batch — batch summary with a close-batch action.
 */
import { Archive } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, StatusRow, SterileState } from "../_shared";

export const SettlementBatchPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const count = config?.count as number | undefined;
  const gross = config?.gross as number | undefined;
  const net = config?.net as number | undefined;

  if (count === undefined) return <SterileState label="NO BATCH DATA" icon={<Archive size={20} />} />;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-700 flex flex-col">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-bold uppercase text-slate-300 tracking-widest flex items-center gap-1">
        <Archive size={12} /> Settlement Batch
      </div>
      <div className="p-3 flex flex-col gap-2">
        <StatusRow label="Transaction Count" value={count} />
        <StatusRow label="Gross" value={gross !== undefined ? `$${gross.toFixed(2)}` : "—"} />
        <StatusRow label="Net" value={net !== undefined ? `$${net.toFixed(2)}` : "—"} tone="text-emerald-300" />
        <button
          onClick={() => onAction(telemetryTag, { action: "close_settlement_batch" })}
          className="h-10 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
        >
          Close Batch
        </button>
      </div>
    </div>
  );
};
