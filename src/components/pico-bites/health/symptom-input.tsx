/**
 * pico.health.symptom_input — symptom chips + severity scale.
 */
import { useState } from "react";
import { Stethoscope } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const SymptomInputPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const symptoms = (config?.symptoms as string[]) || [];
  const [selected, setSelected] = useState<string | null>(null);
  const [severity, setSeverity] = useState(3);

  if (symptoms.length === 0) {
    return <SterileState label="NO SYMPTOM PANEL CONFIGURED" icon={<Stethoscope size={20} />} />;
  }

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 p-2 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 flex items-center gap-1">
        <Stethoscope size={12} /> Symptom Log
      </span>
      <div className="flex flex-wrap gap-1">
        {symptoms.map((s) => (
          <button
            key={s}
            onClick={() => setSelected(s)}
            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border transition-all active:scale-[0.98] ${
              selected === s
                ? "bg-teal-900/50 border-teal-700 text-teal-200"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 px-1">
        <span className="text-[10px] uppercase text-slate-500 tracking-widest">Severity</span>
        <input
          type="range"
          min={1}
          max={5}
          value={severity}
          onChange={(e) => setSeverity(Number(e.target.value))}
          className="flex-1 accent-teal-500"
        />
        <span className="text-xs font-mono text-teal-300 w-4">{severity}</span>
      </div>
      <button
        disabled={!selected}
        onClick={() => selected && onAction(telemetryTag, { action: "record_symptom", symptom: selected, severity })}
        className="h-8 bg-teal-900/40 hover:bg-teal-800/50 disabled:opacity-40 text-teal-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
      >
        Record
      </button>
    </div>
  );
};
