/**
 * pico.ops.batch_track — lot/batch id readout with produced/expiry dates.
 */
import { Layers, CalendarDays } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState, StatusRow } from "@/components/pico-bites/_shared";

export const BatchTrackPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const batchId = config?.batchId as string | undefined;
  const produced = config?.produced as string | undefined;
  const expiry = config?.expiry as string | undefined;

  if (!batchId) return <SterileState label="NO BATCH LOADED" icon={<Layers size={20} />} />;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2">
        <Layers size={14} className="text-indigo-400" />
        <span className="text-sm font-mono text-indigo-200 tracking-widest">{batchId}</span>
      </div>
      <div className="p-2 flex flex-col gap-1">
        <StatusRow icon={<CalendarDays size={12} />} label="Produced" value={produced ?? "—"} />
        <StatusRow icon={<CalendarDays size={12} />} label="Expiry" value={expiry ?? "—"} tone="text-amber-300" />
      </div>
      <button
        onClick={() => onAction(telemetryTag, { action: "track_batch", batchId, produced, expiry })}
        className="h-11 bg-indigo-900/40 hover:bg-indigo-800/50 text-indigo-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
      >
        Track Batch
      </button>
    </div>
  );
};
