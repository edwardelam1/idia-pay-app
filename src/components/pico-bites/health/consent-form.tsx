/**
 * pico.health.consent_form — scrollable clause text with initial-to-accept control.
 */
import { useState } from "react";
import { FileSignature } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const ConsentFormPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const clauses = (config?.clauses as string[]) || [];
  const title = (config?.title as string) || "Treatment Consent";
  const [initials, setInitials] = useState("");

  if (clauses.length === 0) {
    return <SterileState label="NO CONSENT TEXT PROVIDED" icon={<FileSignature size={20} />} />;
  }

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1">
          <FileSignature size={12} /> {title}
        </span>
      </div>
      <div className="max-h-32 overflow-y-auto px-3 py-2 flex flex-col gap-2 text-[11px] text-slate-400 leading-relaxed">
        {clauses.map((c, i) => (
          <p key={i}>{c}</p>
        ))}
      </div>
      <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-800">
        <input
          value={initials}
          onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 4))}
          placeholder="INITIALS"
          className="w-20 bg-slate-950 border border-slate-800 px-2 h-8 text-xs font-mono text-white outline-none uppercase tracking-widest"
        />
        <button
          disabled={!initials}
          onClick={() => onAction(telemetryTag, { action: "sign_consent_form", initials })}
          className="flex-1 h-8 bg-indigo-900/40 hover:bg-indigo-800/50 disabled:opacity-40 text-indigo-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
        >
          Accept & Sign
        </button>
      </div>
    </div>
  );
};
