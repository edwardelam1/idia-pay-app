/**
 * pico.compliance.manager_override — PIN-gated manager override request.
 */
import { ShieldAlert } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

export const ManagerOverridePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const label = (config?.label as string) || "MANAGER OVERRIDE REQUIRED";
  return (
    <div className="relative w-full bg-red-950/30 border-2 border-red-900/60 p-4 flex flex-col items-center gap-3">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <ShieldAlert size={28} className="text-red-400" />
      <span className="text-xs uppercase tracking-widest font-bold text-red-300">{label}</span>
      <button
        onClick={() => onAction(telemetryTag, { action: "request_override" })}
        className="w-full h-10 bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-bold uppercase tracking-wider text-xs transition-all active:scale-95"
      >
        Enter Manager PIN
      </button>
    </div>
  );
};
