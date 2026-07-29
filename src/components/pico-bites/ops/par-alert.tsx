/**
 * pico.ops.par_alert — below-par items from config.items showing on-hand
 * vs par level with a raise-alert action.
 */
import { TrendingDown, Siren } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const ParAlertPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const items = (config?.items as Array<{ id: string; label: string; onHand: number; par: number }>) || [];

  if (items.length === 0) return <SterileState label="ALL ITEMS AT PAR" icon={<TrendingDown size={20} />} />;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 divide-y divide-slate-800 select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 flex items-center gap-1">
        <Siren size={12} className="text-rose-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Below Par</span>
      </div>
      {items.map((i) => (
        <div key={i.id} className="flex items-center gap-2 px-3 py-2">
          <span className="flex-1 text-sm text-slate-200">{i.label}</span>
          <span className="text-[11px] font-mono text-rose-300">{i.onHand} / {i.par}</span>
          <button
            onClick={() => onAction(telemetryTag, { action: "raise_par_alert", id: i.id, onHand: i.onHand, par: i.par })}
            className="h-8 px-3 bg-rose-900/40 hover:bg-rose-800/50 text-rose-200 text-[10px] font-bold uppercase tracking-widest active:scale-[0.98]"
          >
            Alert
          </button>
        </div>
      ))}
    </div>
  );
};
