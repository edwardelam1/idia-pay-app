/**
 * pico.compliance.void_reason — reason codes plus a required manager note.
 */
import { useState } from "react";
import { Ban } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

export const VoidReasonPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const options = (config?.reasons as string[]) || [];
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");

  if (options.length === 0) return <SterileState label="AWAITING VOID REASONS" icon={<Ban size={20} />} />;

  return (
    <div className="relative w-full bg-zinc-900 border border-zinc-700 flex flex-col">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 border-b border-zinc-800 text-[10px] font-bold uppercase text-zinc-300 tracking-widest flex items-center gap-1">
        <Ban size={12} /> Void Reason
      </div>
      <div className="p-3 flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {options.map((r) => (
            <button
              key={r}
              onClick={() => setSelected(r)}
              className={`px-3 h-8 text-xs font-bold uppercase border ${selected === r ? "bg-zinc-600 border-zinc-400 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-400"}`}
            >
              {r}
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Required manager note…"
          className="h-16 px-2 py-1 bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs resize-none"
        />
        <button
          disabled={!selected || note.trim().length === 0}
          onClick={() => onAction(telemetryTag, { action: "select_void_reason", reason: selected, note })}
          className="h-9 bg-zinc-600 hover:bg-zinc-500 disabled:opacity-30 text-white text-xs font-bold uppercase active:scale-[0.98]"
        >
          Submit Void
        </button>
      </div>
    </div>
  );
};
