/**
 * `pico.ui.modifier_sheet` — modifier chips grouped by category.
 */
import type React from "react";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const ModifierSheetPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const groups = (config?.groups as Array<{ id: string; name: string; options: Array<{ id: string; label: string }> }>) || [];
  if (groups.length === 0) return <SterileState label="No modifier groups" icon={<SlidersHorizontal size={20} />} />;
  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      onAction(telemetryTag, { action: "toggle_modifier", id, selected: next });
      return next;
    });
  };
  return (
    <div className="relative w-full h-full bg-slate-950 border border-slate-800 flex flex-col gap-3 p-3 overflow-y-auto">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {groups.map((g) => (
        <div key={g.id}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">{g.name}</div>
          <div className="flex flex-wrap gap-1.5">
            {g.options.map((o) => (
              <button
                key={o.id}
                onClick={() => toggle(o.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                  selected.includes(o.id)
                    ? "bg-fuchsia-800 border-fuchsia-500 text-fuchsia-100"
                    : "bg-slate-900 border-slate-700 text-slate-300 hover:border-fuchsia-700"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
