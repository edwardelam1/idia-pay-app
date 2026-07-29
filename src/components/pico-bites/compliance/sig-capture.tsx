/**
 * pico.compliance.sig_capture — compliance signature capture bound to a
 * document title; locks after accept. Distinct from input/signature-pad.tsx.
 */
import { useState } from "react";
import { PenLine, Lock } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

export const SigCapturePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const documentTitle = config?.documentTitle as string | undefined;
  const [locked, setLocked] = useState(false);

  if (!documentTitle) return <SterileState label="NO BOUND DOCUMENT" icon={<PenLine size={20} />} />;

  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 flex flex-col">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
        Signature — {documentTitle}
      </div>
      <div className={`h-24 mx-3 mt-3 border ${locked ? "border-emerald-700 bg-emerald-950/10" : "border-dashed border-slate-700 bg-slate-900"} flex items-center justify-center`}>
        {locked ? (
          <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Lock size={14} /> Signature Locked
          </span>
        ) : (
          <span className="text-slate-600 text-xs uppercase tracking-widest">Sign Here</span>
        )}
      </div>
      <div className="p-3">
        <button
          disabled={locked}
          onClick={() => {
            setLocked(true);
            onAction(telemetryTag, { action: "capture_compliance_signature", documentTitle });
          }}
          className="w-full h-9 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-bold uppercase active:scale-[0.98]"
        >
          Accept &amp; Lock Signature
        </button>
      </div>
    </div>
  );
};
