/**
 * `pico.ui.kanban_board` — column board of cards.
 */
import type React from "react";
import { Columns3 } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const KanbanBoardPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const columns = (config?.columns as Array<{ id: string; name: string; cards: Array<{ id: string; label: string }> }>) || [];
  if (columns.length === 0) return <SterileState label="No board columns" icon={<Columns3 size={20} />} />;
  return (
    <div className="relative w-full h-full bg-slate-950 border border-slate-800 flex gap-2 p-2 overflow-x-auto">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {columns.map((c) => (
        <div key={c.id} className="w-40 shrink-0 flex flex-col bg-slate-900 border border-slate-800">
          <div className="px-2 py-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400">{c.name}</div>
          <div className="flex-1 flex flex-col gap-1.5 p-1.5">
            {c.cards.map((card) => (
              <button
                key={card.id}
                onClick={() => onAction(telemetryTag, { action: "move_card", cardId: card.id, columnId: c.id })}
                className="text-left px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 hover:border-cyan-600 active:scale-[0.98] transition-all"
              >
                {card.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
