/**
 * pico.compliance.audit_stamp — actor/time/action readout with a
 * "stamp now" action.
 */
import { Stamp } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, StatusRow } from "../_shared";

export const AuditStampPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const actor = config?.actor as string | undefined;
  const action = config?.action as string | undefined;

  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 flex flex-col">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1">
        <Stamp size={12} /> Audit Stamp
      </div>
      <div className="p-3 flex flex-col gap-2">
        <StatusRow label="Actor" value={actor ?? "—"} />
        <StatusRow label="Action" value={action ?? "—"} />
        <StatusRow label="Time" value={new Date().toLocaleTimeString()} />
        <button
          onClick={() => onAction(telemetryTag, { action: "write_audit_stamp", actor, actionLabel: action, at: Date.now() })}
          className="h-9 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold uppercase active:scale-[0.98]"
        >
          Stamp Now
        </button>
      </div>
    </div>
  );
};
