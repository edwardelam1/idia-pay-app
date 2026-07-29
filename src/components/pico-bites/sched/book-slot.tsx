/**
 * pico.sched.book_slot — available slots from config.slots with a book
 * action per slot.
 */
import { CalendarCheck2 } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const BookSlotPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const slots = (config?.slots as Array<{ id: string; time: string; available?: boolean }>) || [];
  if (slots.length === 0) return <SterileState label="NO SLOTS PUBLISHED" icon={<CalendarCheck2 size={20} />} />;
  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1">
        <CalendarCheck2 size={12} className="text-emerald-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Available Slots</span>
      </div>
      <div className="grid grid-cols-3 gap-1 p-2">
        {slots.map((s) => (
          <button
            key={s.id}
            disabled={s.available === false}
            onClick={() => onAction(telemetryTag, { action: "book_slot", id: s.id, time: s.time })}
            className={`h-10 text-xs font-mono border active:scale-[0.98] ${s.available === false ? "bg-slate-950 border-slate-800 text-slate-600" : "bg-emerald-900/40 hover:bg-emerald-800/50 border-emerald-800 text-emerald-100"}`}
          >
            {s.time}
          </button>
        ))}
      </div>
    </div>
  );
};
