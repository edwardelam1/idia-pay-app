/**
 * `pico.ui.discount_prompt` — preset discount buttons plus custom amount entry.
 */
import type React from "react";
import { useState } from "react";
import { BadgePercent } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const DiscountPromptPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const [custom, setCustom] = useState("");
  const presets = (config?.presets as Array<{ id: string; label: string; value: number }>) || [];
  if (presets.length === 0) return <SterileState label="No discount presets" icon={<BadgePercent size={20} />} />;
  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => onAction(telemetryTag, { action: "apply_discount", id: p.id, value: p.value })}
            className="flex-1 h-11 bg-lime-900/40 border border-lime-700 text-lime-200 font-bold text-sm rounded hover:bg-lime-800/50 active:scale-95 transition-all"
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Custom %"
          className="flex-1 h-9 bg-slate-950 border border-slate-700 px-2 text-sm text-white outline-none focus:border-lime-600"
        />
        <button
          onClick={() => {
            onAction(telemetryTag, { action: "apply_discount", id: "custom", value: Number(custom) || 0 });
            setCustom("");
          }}
          className="px-4 h-9 bg-lime-700 hover:bg-lime-600 text-white text-xs font-bold uppercase rounded active:scale-95 transition-all"
        >
          Apply
        </button>
      </div>
    </div>
  );
};
