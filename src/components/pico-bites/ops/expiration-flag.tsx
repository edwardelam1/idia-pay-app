/**
 * pico.ops.expiration_flag — items near expiry from config.items with a
 * flag/86 action per item.
 */
import { CalendarX2, FlagOff } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const ExpirationFlagPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const items = (config?.items as Array<{ id: string; label: string; expiresOn?: string }>) || [];

  if (items.length === 0) return <SterileState label="NO ITEMS NEAR EXPIRY" icon={<CalendarX2 size={20} />} />;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 divide-y divide-slate-800 select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 flex items-center gap-1">
        <CalendarX2 size={12} className="text-orange-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Nearing Expiry</span>
      </div>
      {items.map((i) => (
        <div key={i.id} className="flex items-center gap-2 px-3 py-2">
          <div className="flex-1 flex flex-col">
            <span className="text-sm text-slate-200">{i.label}</span>
            <span className="text-[10px] text-slate-500 font-mono">{i.expiresOn ?? "—"}</span>
          </div>
          <button
            onClick={() => onAction(telemetryTag, { action: "flag_expiration", id: i.id })}
            className="h-8 px-3 bg-orange-900/40 hover:bg-orange-800/50 text-orange-200 text-[10px] font-bold uppercase tracking-widest active:scale-[0.98] flex items-center gap-1"
          >
            <FlagOff size={12} /> 86
          </button>
        </div>
      ))}
    </div>
  );
};
