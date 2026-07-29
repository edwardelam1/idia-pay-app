/**
 * `pico.ui.cart_pane` — vertical scrolling line-item list.
 */
import type React from "react";
import { ListOrdered } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const CartPanePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const lines = (config?.lines as Array<{ id: string; name: string; qty: number; price: number }>) || [];
  if (lines.length === 0) return <SterileState label="Cart is empty" icon={<ListOrdered size={20} />} />;
  return (
    <div className="relative w-full h-full bg-slate-950 border border-slate-800 flex flex-col">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500">Line Items</div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
        {lines.map((l) => (
          <button
            key={l.id}
            onClick={() => onAction(telemetryTag, { action: "select_line", id: l.id })}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-900 text-left"
          >
            <span className="text-xs text-slate-200">
              <span className="text-slate-500 mr-2">{l.qty}×</span>
              {l.name}
            </span>
            <span className="text-xs font-mono text-slate-300">${(l.qty * l.price).toFixed(2)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
