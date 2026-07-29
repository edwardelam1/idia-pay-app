/**
 * pico.pay.split_tender — multiple tender legs with remaining-due tracker.
 */
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, StatusRow, SterileState } from "../_shared";
import { SplitSquareHorizontal } from "lucide-react";

export const SplitTenderPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const tenders = (config?.tenders as Array<{ id: string; type: string; amount: number }>) || [];
  const totalDue = config?.totalDue as number | undefined;

  if (tenders.length === 0) return <SterileState label="NO TENDER LEGS" icon={<SplitSquareHorizontal size={20} />} />;

  const applied = tenders.reduce((s, t) => s + t.amount, 0);
  const remaining = totalDue !== undefined ? totalDue - applied : undefined;

  return (
    <div className="relative w-full bg-lime-950/10 border border-lime-900/40 flex flex-col">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 text-[10px] font-bold uppercase text-lime-400 tracking-widest border-b border-lime-900/30">
        Split Tender
      </div>
      <div className="divide-y divide-lime-900/20">
        {tenders.map((t) => (
          <div key={t.id} className="flex justify-between items-center px-3 py-2">
            <span className="text-sm text-slate-200 capitalize">{t.type}</span>
            <span className="text-xs font-mono text-lime-300">${t.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="p-3 flex flex-col gap-2">
        <StatusRow label="Remaining Due" value={remaining === undefined ? "—" : `$${remaining.toFixed(2)}`} tone="text-lime-300" />
        <button
          onClick={() => onAction(telemetryTag, { action: "add_tender_leg" })}
          className="h-9 bg-lime-800/60 hover:bg-lime-700/60 text-white text-xs font-bold uppercase active:scale-[0.98]"
        >
          Add Tender Leg
        </button>
      </div>
    </div>
  );
};
