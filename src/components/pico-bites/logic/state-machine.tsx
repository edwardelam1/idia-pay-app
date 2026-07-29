/**
 * pico.logic.state_machine — current state from config.state with allowed transitions as buttons.
 */
import { GitBranch } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const StateMachinePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const state = config?.state as string | undefined;
  const transitions = (config?.transitions as string[]) || [];

  if (!state) {
    return <SterileState label="NO STATE MACHINE BOUND" icon={<GitBranch size={20} />} />;
  }

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col gap-2 px-3 py-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-purple-400">
        <GitBranch size={12} /> Current State
      </span>
      <span className="self-start px-2 py-1 bg-purple-900/30 border border-purple-800 text-purple-200 text-xs font-mono uppercase">{state}</span>
      {transitions.length === 0 ? (
        <span className="text-[10px] text-slate-600 uppercase tracking-widest">No transitions available</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {transitions.map((t) => (
            <button
              key={t}
              onClick={() => onAction(telemetryTag, { action: "request_transition", from: state, to: t })}
              className="px-2 h-8 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold uppercase text-slate-300 active:scale-[0.98]"
            >
              → {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
