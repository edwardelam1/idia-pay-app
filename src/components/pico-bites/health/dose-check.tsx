/**
 * pico.health.dose_check — medication + dose entry validated against config.maxDose.
 */
import { useState } from "react";
import { Pill, AlertTriangle } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const DoseCheckPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const medication = (config?.medication as string) || "";
  const maxDose = config?.maxDose as number | undefined;
  const unit = (config?.unit as string) || "mg";
  const [dose, setDose] = useState("");

  if (!medication) {
    return <SterileState label="NO MEDICATION CONFIGURED" icon={<Pill size={20} />} />;
  }

  const numeric = Number(dose);
  const overLimit = maxDose !== undefined && !Number.isNaN(numeric) && numeric > maxDose;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 p-2 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400 flex items-center gap-1">
        <Pill size={12} /> {medication}
      </span>
      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-2 h-10">
        <input
          value={dose}
          onChange={(e) => setDose(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder={`Dose (${unit})`}
          className="flex-1 bg-transparent outline-none text-sm font-mono text-white"
        />
        <span className="text-[10px] text-slate-500 uppercase">{unit}</span>
      </div>
      {overLimit && (
        <div className="flex items-center gap-1 bg-red-950/40 border border-red-900/60 text-red-300 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
          <AlertTriangle size={12} /> Exceeds max dose ({maxDose}{unit})
        </div>
      )}
      <button
        disabled={!dose}
        onClick={() => onAction(telemetryTag, { action: "verify_dose", medication, dose: numeric, unit, overLimit })}
        className={`h-8 text-xs font-bold uppercase tracking-widest active:scale-[0.98] disabled:opacity-40 ${
          overLimit ? "bg-red-900/40 hover:bg-red-800/50 text-red-200" : "bg-fuchsia-900/40 hover:bg-fuchsia-800/50 text-fuchsia-200"
        }`}
      >
        Verify Dose
      </button>
    </div>
  );
};
