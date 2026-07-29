/**
 * `pico.ui.tip_selector` — tip percentage presets plus custom entry.
 */
import type React from "react";
import { useState } from "react";
import { HandCoins } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const TipSelectorPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const [active, setActive] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const percentages = (config?.percentages as number[]) || [];
  if (percentages.length === 0) return <SterileState label="No tip presets" icon={<HandCoins size={20} />} />;
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="grid grid-cols-4 gap-2">
        {percentages.map((p) => (
          <button
            key={p}
            onClick={() => {
              setActive(p);
              onAction(telemetryTag, { action: "select_tip", percentage: p });
            }}
            className={`h-12 rounded font-bold text-sm border transition-all active:scale-95 ${
              active === p ? "bg-emerald-700 border-emerald-500 text-white" : "bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-700"
            }`}
          >
            {p}%
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Custom %"
          className="flex-1 h-9 bg-slate-900 border border-slate-700 px-2 text-sm text-white outline-none focus:border-emerald-600"
        />
        <button
          onClick={() => {
            const val = Number(custom) || 0;
            setActive(val);
            onAction(telemetryTag, { action: "select_tip", percentage: val });
            setCustom("");
          }}
          className="px-4 h-9 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase rounded active:scale-95 transition-all"
        >
          Set
        </button>
      </div>
    </div>
  );
};
