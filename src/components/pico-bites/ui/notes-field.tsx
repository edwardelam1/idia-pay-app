/**
 * `pico.ui.notes_field` — multiline textarea with char count.
 */
import type React from "react";
import { useState } from "react";
import { StickyNote } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "@/components/pico-bites/_shared";

export const NotesFieldPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const [text, setText] = useState("");
  const maxLen = (config?.maxLength as number) || 200;
  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 p-2 flex flex-col gap-1.5">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500">
        <StickyNote size={12} /> Order Note
      </div>
      <textarea
        value={text}
        maxLength={maxLen}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a note..."
        rows={3}
        className="w-full bg-slate-950 border border-slate-700 text-sm text-slate-100 p-2 outline-none focus:border-yellow-600 resize-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-500">{text.length}/{maxLen}</span>
        <button
          onClick={() => onAction(telemetryTag, { action: "save_note", text })}
          className="px-3 py-1 bg-yellow-700 hover:bg-yellow-600 text-white text-[10px] font-bold uppercase rounded active:scale-95 transition-all"
        >
          Save
        </button>
      </div>
    </div>
  );
};
