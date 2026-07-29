/**
 * `pico.ui.split_check` — split-by-N stepper plus per-share amount.
 */
import type React from "react";
import { useState } from "react";
import { Minus, Plus, SplitSquareHorizontal } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const SplitCheckPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const total = config?.total as number | undefined;
  const [n, setN] = useState(2);
  if (typeof total !== "number") return <SterileState label="No check total" icon={<SplitSquareHorizontal size={20} />} />;
  const share = total / n;
  const update = (next: number) => {
    const val = Math.max(1, next);
    setN(val);
    onAction(telemetryTag, { action: "split_check", n: val, share: total / val });
  };
  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 p-4 flex items-center justify-between">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex items-center gap-3">
        <button onClick={() => update(n - 1)} className="w-9 h-9 flex items-center justify-center bg-slate-800 rounded-full hover:bg-slate-700 active:scale-90 transition-all">
          <Minus size={16} className="text-white" />
        </button>
        <span className="text-2xl font-mono text-white w-8 text-center">{n}</span>
        <button onClick={() => update(n + 1)} className="w-9 h-9 flex items-center justify-center bg-slate-800 rounded-full hover:bg-slate-700 active:scale-90 transition-all">
          <Plus size={16} className="text-white" />
        </button>
      </div>
      <div className="text-right">
        <div className="text-[10px] uppercase tracking-widest text-slate-500">Per Share</div>
        <div className="text-xl font-mono text-orange-400">${share.toFixed(2)}</div>
      </div>
    </div>
  );
};
