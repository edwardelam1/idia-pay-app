/**
 * pico.compliance.consent_prompt — consent statement with accept/decline.
 */
import { FileSignature } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

export const ConsentPromptPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const statement = config?.statement as string | undefined;
  if (!statement) return <SterileState label="AWAITING CONSENT STATEMENT" icon={<FileSignature size={20} />} />;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 p-4 flex flex-col gap-3">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
        <FileSignature size={14} /> Consent Required
      </div>
      <p className="text-xs text-slate-300 leading-relaxed border-l-2 border-slate-700 pl-3">{statement}</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onAction(telemetryTag, { action: "record_consent", accepted: true })}
          className="h-10 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase active:scale-[0.98]"
        >
          Accept
        </button>
        <button
          onClick={() => onAction(telemetryTag, { action: "record_consent", accepted: false })}
          className="h-10 bg-red-800 hover:bg-red-700 text-white text-xs font-bold uppercase active:scale-[0.98]"
        >
          Decline
        </button>
      </div>
    </div>
  );
};
