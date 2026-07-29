/**
 * pico.fleet.route_plan — ordered stops from config.stops with an ETA
 * column.
 */
import { Route } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const RoutePlanPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const stops = (config?.stops as Array<{ id: string; label: string; eta?: string }>) || [];
  if (stops.length === 0) return <SterileState label="NO ROUTE ASSIGNED" icon={<Route size={20} />} />;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1">
        <Route size={12} className="text-green-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">Route Stops</span>
      </div>
      <div className="divide-y divide-slate-800">
        {stops.map((s, i) => (
          <div key={s.id} className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-slate-200">{i + 1}. {s.label}</span>
            <span className="text-[10px] font-mono text-green-300">{s.eta ?? "—"}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => onAction(telemetryTag, { action: "plan_route", stops: stops.map((s) => s.id) })}
        className="h-10 bg-green-900/40 hover:bg-green-800/50 text-green-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
      >
        Plan Route
      </button>
    </div>
  );
};
