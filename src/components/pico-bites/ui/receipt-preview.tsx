/**
 * `pico.ui.receipt_preview` — narrow monospace paper-style receipt preview.
 */
import type React from "react";
import { Scroll } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const ReceiptPreviewPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const lines = (config?.lines as Array<{ id: string; name: string; qty: number; price: number }>) || [];
  const totals = (config?.totals as { subtotal?: number; tax?: number; total?: number }) || {};
  if (lines.length === 0) return <SterileState label="No receipt data" icon={<Scroll size={20} />} />;
  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "preview_receipt" })}
      className="relative w-56 mx-auto bg-white text-slate-900 font-mono text-[11px] p-3 shadow-lg text-left"
      style={{ clipPath: "polygon(0 0,100% 0,100% 98%,95% 100%,90% 98%,85% 100%,80% 98%,75% 100%,70% 98%,65% 100%,60% 98%,55% 100%,50% 98%,45% 100%,40% 98%,35% 100%,30% 98%,25% 100%,20% 98%,15% 100%,10% 98%,5% 100%,0 98%)" }}
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="text-center font-bold uppercase tracking-widest mb-2">Receipt</div>
      <div className="border-t border-dashed border-slate-400 my-1" />
      {lines.map((l) => (
        <div key={l.id} className="flex justify-between">
          <span>{l.qty}x {l.name}</span>
          <span>{(l.qty * l.price).toFixed(2)}</span>
        </div>
      ))}
      <div className="border-t border-dashed border-slate-400 my-1" />
      <div className="flex justify-between"><span>Subtotal</span><span>{(totals.subtotal ?? 0).toFixed(2)}</span></div>
      <div className="flex justify-between"><span>Tax</span><span>{(totals.tax ?? 0).toFixed(2)}</span></div>
      <div className="flex justify-between font-bold"><span>Total</span><span>{(totals.total ?? 0).toFixed(2)}</span></div>
    </button>
  );
};
