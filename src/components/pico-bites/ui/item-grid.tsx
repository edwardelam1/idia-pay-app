/**
 * `pico.ui.item_grid` — dense tile grid of catalog items.
 */
import type React from "react";
import { LayoutGrid } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const ItemGridPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const items = (config?.items as Array<{ id: string; name: string; price?: number }>) || [];
  if (items.length === 0) return <SterileState label="No item catalog provisioned" icon={<LayoutGrid size={20} />} />;
  return (
    <div className="relative w-full h-full bg-slate-950 grid grid-cols-4 gap-1 p-1">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {items.map((i) => (
        <button
          key={i.id}
          onClick={() => onAction(telemetryTag, { action: "add_item", id: i.id })}
          className="flex flex-col items-center justify-center aspect-square bg-slate-900 border border-slate-800 hover:border-emerald-700 active:scale-[0.98] transition-all p-1"
        >
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-200 text-center leading-tight">{i.name}</span>
          {typeof i.price === "number" && (
            <span className="text-[10px] font-mono text-emerald-400 mt-1">${i.price.toFixed(2)}</span>
          )}
        </button>
      ))}
    </div>
  );
};
