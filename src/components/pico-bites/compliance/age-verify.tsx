/**
 * pico.compliance.age_verify — DOB entry against a minimum age with a
 * pass/fail state readout.
 */
import { useState } from "react";
import { CalendarClock } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, StatusRow } from "../_shared";

export const AgeVerifyPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const minimumAge = (config?.minimumAge as number) ?? undefined;
  const [dob, setDob] = useState("");

  let age: number | null = null;
  if (dob) {
    const d = new Date(dob);
    if (!isNaN(d.getTime())) {
      age = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
    }
  }
  const pass = age !== null && minimumAge !== undefined ? age >= minimumAge : null;

  return (
    <div className="relative w-full bg-orange-950/10 border border-orange-900/40 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="text-[10px] font-bold uppercase text-orange-400 tracking-widest flex items-center gap-1">
        <CalendarClock size={12} /> Age Verification {minimumAge !== undefined ? `(${minimumAge}+)` : ""}
      </div>
      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="h-9 px-2 bg-slate-950 border border-slate-800 text-slate-200 text-sm font-mono" />
      <StatusRow
        label="Result"
        value={pass === null ? "—" : pass ? "PASS" : "FAIL"}
        tone={pass === null ? "text-slate-500" : pass ? "text-emerald-400" : "text-red-400"}
      />
      <button
        disabled={pass === null}
        onClick={() => onAction(telemetryTag, { action: "verify_age", dob, pass })}
        className="h-9 bg-orange-700 hover:bg-orange-600 disabled:opacity-30 text-white text-xs font-bold uppercase active:scale-[0.98]"
      >
        Verify Age
      </button>
    </div>
  );
};
