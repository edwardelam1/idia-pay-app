/**
 * `pico.ui.chart_pane` — labelled bar/sparkline pane, plain divs only.
 */
import type React from "react";
import { BarChart3 } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const ChartPanePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const series = (config?.series as Array<{ label: string; value: number }>) || [];
  if (series.length === 0) return <SterileState label="No series data" icon={<BarChart3 size={20} />} />;
  const max = Math.max(...series.map((s) => s.value), 1);
  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "inspect_series" })}
      className="relative w-full h-full bg-slate-950 border border-slate-800 flex items-end gap-2 p-3 text-left"
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {series.map((s, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
          <span className="text-[9px] font-mono text-slate-400">{s.value}</span>
          <div
            className="w-full bg-indigo-600/70 rounded-t"
            style={{ height: `${Math.max(4, (s.value / max) * 100)}%` }}
          />
          <span className="text-[8px] uppercase tracking-widest text-slate-500 truncate w-full text-center">{s.label}</span>
        </div>
      ))}
    </button>
  );
};
