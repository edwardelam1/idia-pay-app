/**
 * `pico.ui.ticket_ribbon` — horizontal scrolling ribbon of open ticket chips.
 */
import type React from "react";
import { Ticket } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const TicketRibbonPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const tickets = (config?.tickets as Array<{ id: string; label: string }>) || [];
  if (tickets.length === 0) return <SterileState label="No open tickets" icon={<Ticket size={20} />} />;
  return (
    <div className="relative w-full h-16 bg-slate-900 border border-slate-800 flex items-center gap-2 px-2 overflow-x-auto">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {tickets.map((t) => (
        <button
          key={t.id}
          onClick={() => onAction(telemetryTag, { action: "focus_ticket", id: t.id })}
          className="shrink-0 flex items-center gap-1.5 px-3 h-9 rounded-full bg-slate-950 border border-slate-700 hover:border-amber-600 active:scale-[0.97] transition-all"
        >
          <Ticket size={12} className="text-amber-500" />
          <span className="text-xs font-semibold text-slate-200 whitespace-nowrap">{t.label}</span>
        </button>
      ))}
    </div>
  );
};
