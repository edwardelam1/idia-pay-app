/**
 * pico.logic.session_lock — lock/unlock the terminal session with idle-timeout readout.
 */
import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "@/components/pico-bites/_shared";

export const SessionLockPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const idleTimeoutSec = config?.idleTimeoutSec as number | undefined;
  const [locked, setLocked] = useState(Boolean(config?.locked));

  return (
    <div className={`relative w-full flex items-center justify-between px-3 py-3 border ${locked ? "bg-red-950/30 border-red-900/50" : "bg-slate-950 border-slate-800"}`}>
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex flex-col">
        <span className={`flex items-center gap-1 text-xs font-bold uppercase tracking-widest ${locked ? "text-red-300" : "text-slate-300"}`}>
          {locked ? <Lock size={14} /> : <Unlock size={14} />} {locked ? "Session Locked" : "Session Active"}
        </span>
        <span className="text-[10px] font-mono text-slate-500 mt-1">
          {idleTimeoutSec !== undefined ? `Idle timeout ${idleTimeoutSec}s` : "Awaiting idle policy"}
        </span>
      </div>
      <button
        onClick={() => {
          const next = !locked;
          setLocked(next);
          onAction(telemetryTag, { action: "toggle_session_lock", locked: next });
        }}
        className="px-3 h-9 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-[10px] font-bold uppercase text-slate-200 active:scale-[0.98]"
      >
        {locked ? "Unlock" : "Lock"}
      </button>
    </div>
  );
};
