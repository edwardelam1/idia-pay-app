/**
 * pico.health.vital_capture — grid of live vitals driven by config.vitals.
 */
import { HeartPulse, Activity, Droplet, Thermometer } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

type VitalEntry = { key: string; label: string; value: string | number; unit?: string };

const ICONS: Record<string, React.ReactNode> = {
  bp: <Activity size={14} className="text-rose-400" />,
  hr: <HeartPulse size={14} className="text-red-400" />,
  spo2: <Droplet size={14} className="text-sky-400" />,
  temp: <Thermometer size={14} className="text-amber-400" />,
};

export const VitalCapturePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const vitals = (config?.vitals as VitalEntry[]) || [];

  if (vitals.length === 0) {
    return <SterileState label="NO VITALS CONFIGURED" icon={<HeartPulse size={20} />} />;
  }

  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 grid grid-cols-2 gap-1 p-1">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {vitals.map((v) => (
        <button
          key={v.key}
          onClick={() => gateSatisfied !== false && onAction(telemetryTag, { action: "capture_vitals", key: v.key, value: v.value })}
          className="flex flex-col items-start gap-1 bg-slate-900 border border-slate-800 px-3 py-2 hover:bg-slate-800 active:scale-[0.98] transition-all"
        >
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-slate-500">
            {ICONS[v.key] || <Activity size={14} className="text-slate-400" />}
            {v.label}
          </span>
          <span className="text-lg font-mono text-white">
            {v.value}
            {v.unit && <span className="text-xs text-slate-500 ml-1">{v.unit}</span>}
          </span>
        </button>
      ))}
    </div>
  );
};
