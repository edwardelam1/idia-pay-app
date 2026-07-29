/**
 * pico.compliance.hipaa_gate — PHI access acknowledgement with audit warning.
 */
import { ShieldCheck, Eye } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

export const HipaaGatePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  onAction,
  gateSatisfied,
  gateReason,
}) => (
  <div className="relative w-full bg-indigo-950/30 border-2 border-indigo-900/60 p-4 flex flex-col items-center gap-3">
    <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
    <ShieldCheck size={24} className="text-indigo-400" />
    <span className="text-xs uppercase tracking-widest font-bold text-indigo-300">HIPAA-Protected Session</span>
    <div className="flex items-center gap-1 text-[10px] text-indigo-400/70 uppercase tracking-widest">
      <Eye size={12} /> This access will be permanently audit-logged
    </div>
    <button
      onClick={() => onAction(telemetryTag, { action: "acknowledge_hipaa" })}
      className="w-full h-10 bg-indigo-700 hover:bg-indigo-600 text-white font-bold uppercase text-xs active:scale-[0.98]"
    >
      Acknowledge PHI Access
    </button>
  </div>
);
