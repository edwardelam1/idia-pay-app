/**
 * pico.logic.retry_backoff — retry attempt count with next-attempt countdown and retry-now action.
 */
import { RotateCw } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const RetryBackoffPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const attempts = config?.attempts as number | undefined;
  const nextInSec = config?.nextInSec as number | undefined;

  if (attempts === undefined) {
    return <SterileState label="NO RETRY STATE" icon={<RotateCw size={20} />} />;
  }

  return (
    <div className="relative w-full bg-slate-950 border border-orange-900/40 flex items-center justify-between px-3 py-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-widest text-orange-400 flex items-center gap-1">
          <RotateCw size={12} /> Retry Attempts
        </span>
        <span className="text-lg font-mono text-white">{attempts}</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] font-mono text-slate-500">
          {nextInSec !== undefined ? `Next in ${nextInSec}s` : "Awaiting schedule"}
        </span>
        <button
          onClick={() => onAction(telemetryTag, { action: "force_retry", attempts })}
          className="px-2 h-7 bg-orange-900/40 hover:bg-orange-800/50 text-orange-200 text-[10px] font-bold uppercase tracking-widest active:scale-[0.98]"
        >
          Retry Now
        </button>
      </div>
    </div>
  );
};
