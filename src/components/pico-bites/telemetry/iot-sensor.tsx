/**
 * pico.telemetry.iot_sensor — generic sensor channel readout with signal freshness.
 */
import { Radio } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const IoTSensorPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const channel = config?.channel as string | undefined;
  const value = config?.value;
  const ageSec = config?.ageSec as number | undefined;

  if (!channel) {
    return <SterileState label="NO SENSOR CHANNEL BOUND" icon={<Radio size={20} />} />;
  }

  const fresh = ageSec !== undefined && ageSec < 10;

  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "poll_iot_sensor", channel })}
      className="relative w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 flex flex-col gap-1 px-3 py-2 active:scale-[0.98] transition-all"
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-lime-400">
          <Radio size={12} /> {channel}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${fresh ? "bg-lime-400 animate-pulse" : "bg-slate-600"}`} />
      </div>
      <div className="flex justify-between items-baseline">
        <span className="text-lg font-mono text-white">{value !== undefined ? String(value) : "—"}</span>
        <span className="text-[10px] text-slate-500 font-mono">{ageSec !== undefined ? `${ageSec}s ago` : "Awaiting signal"}</span>
      </div>
    </button>
  );
};
