/**
 * `pico.ui.upsell_carousel` — swipeable card row with add affordance.
 */
import type React from "react";
import { Sparkles, Plus } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const UpsellCarouselPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const suggestions = (config?.suggestions as Array<{ id: string; name: string; price?: number }>) || [];
  if (suggestions.length === 0) return <SterileState label="No suggestions" icon={<Sparkles size={20} />} />;
  return (
    <div className="relative w-full h-28 bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-900/50 flex items-center gap-2 px-2 overflow-x-auto">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {suggestions.map((s) => (
        <div key={s.id} className="shrink-0 w-32 h-20 bg-slate-900 border border-amber-800/50 rounded flex flex-col justify-between p-2">
          <span className="text-[10px] font-bold uppercase text-amber-300 leading-tight">{s.name}</span>
          <div className="flex items-center justify-between">
            {typeof s.price === "number" && <span className="text-[10px] font-mono text-slate-400">${s.price.toFixed(2)}</span>}
            <button
              onClick={() => onAction(telemetryTag, { action: "accept_upsell", id: s.id })}
              className="w-6 h-6 rounded-full bg-amber-600 hover:bg-amber-500 active:scale-90 transition-all flex items-center justify-center"
            >
              <Plus size={14} className="text-white" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
