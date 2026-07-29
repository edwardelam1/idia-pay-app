/**
 * `pico.ui.calendar_view` — day strip with slot counts.
 */
import type React from "react";
import { CalendarDays } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const CalendarViewPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const days = (config?.days as Array<{ id: string; label: string; slots: number }>) || [];
  if (days.length === 0) return <SterileState label="No calendar data" icon={<CalendarDays size={20} />} />;
  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex divide-x divide-slate-800 overflow-x-auto">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {days.map((d) => (
        <button
          key={d.id}
          onClick={() => onAction(telemetryTag, { action: "select_day", id: d.id })}
          className="flex flex-col items-center justify-center min-w-[3.5rem] py-3 hover:bg-slate-800 active:scale-[0.97] transition-all"
        >
          <span className="text-[9px] uppercase tracking-widest text-slate-500">{d.label}</span>
          <span className="text-lg font-mono text-violet-400">{d.slots}</span>
        </button>
      ))}
    </div>
  );
};
