/**
 * pico.sched.no_show_flag — mark a booking as no-show with a grace-window
 * countdown sourced from config.
 */
import { TimerReset } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const NoShowFlagPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const bookingId = config?.bookingId as string | undefined;
  const graceRemaining = config?.graceRemaining as string | undefined;

  if (!bookingId) return <SterileState label="NO BOOKING SELECTED" icon={<TimerReset size={20} />} />;

  return (
    <div className="relative w-full bg-slate-900 border border-red-900/40 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Booking {bookingId}</span>
        <span className="flex items-center gap-1 text-[10px] font-mono text-red-300">
          <TimerReset size={12} /> {graceRemaining ?? "—"}
        </span>
      </div>
      <button
        onClick={() => onAction(telemetryTag, { action: "flag_no_show", bookingId })}
        className="h-12 bg-red-900/40 hover:bg-red-800/50 text-red-200 text-sm font-bold uppercase tracking-widest active:scale-[0.98]"
      >
        Mark No-Show
      </button>
    </div>
  );
};
