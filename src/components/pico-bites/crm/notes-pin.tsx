/**
 * pico.crm.notes_pin — pinned guest notes list from config.notes with a
 * pin/unpin action.
 */
import { Pin, PinOff, StickyNote } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const NotesPinPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const notes = (config?.notes as Array<{ id: string; text: string; pinned?: boolean }>) || [];

  if (notes.length === 0) return <SterileState label="NO GUEST NOTES" icon={<StickyNote size={20} />} />;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 divide-y divide-slate-800 select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 flex items-center gap-1">
        <StickyNote size={12} className="text-yellow-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400">Guest Notes</span>
      </div>
      {notes.map((n) => (
        <div key={n.id} className="flex items-center gap-2 px-3 py-2">
          <span className="flex-1 text-sm text-slate-200">{n.text}</span>
          <button
            onClick={() => onAction(telemetryTag, { action: "pin_guest_note", id: n.id, pinned: !n.pinned })}
            className={`h-8 px-3 text-[10px] font-bold uppercase tracking-widest active:scale-[0.98] flex items-center gap-1 ${n.pinned ? "bg-yellow-900/40 text-yellow-200" : "bg-slate-800 text-slate-300"}`}
          >
            {n.pinned ? <PinOff size={12} /> : <Pin size={12} />}
            {n.pinned ? "Unpin" : "Pin"}
          </button>
        </div>
      ))}
    </div>
  );
};
