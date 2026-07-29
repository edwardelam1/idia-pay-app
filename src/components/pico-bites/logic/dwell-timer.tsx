/**
 * pico.logic.dwell_timer — mm:ss dwell counter with start/stop.
 */
import { useState } from "react";
import { Hourglass, Play, Square } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const DwellTimerPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const seconds = config?.seconds as number | undefined;
  const [running, setRunning] = useState(Boolean(config?.running));

  if (seconds === undefined) {
    return <SterileState label="NO DWELL DATA" icon={<Hourglass size={20} />} />;
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="relative w-full bg-slate-950 border border-cyan-900/40 flex items-center justify-between px-3 py-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex items-center gap-2">
        <Hourglass size={16} className="text-cyan-400" />
        <span className="text-xl font-mono text-white">{mm}:{ss}</span>
      </div>
      <button
        onClick={() => {
          const next = !running;
          setRunning(next);
          onAction(telemetryTag, { action: "toggle_dwell_timer", running: next });
        }}
        className={`w-9 h-9 flex items-center justify-center rounded-full active:scale-[0.98] ${
          running ? "bg-red-900/40 text-red-300" : "bg-cyan-900/40 text-cyan-300"
        }`}
      >
        {running ? <Square size={14} /> : <Play size={14} />}
      </button>
    </div>
  );
};
