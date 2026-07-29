/**
 * `pico.ui.category_tabs` — horizontal tab bar with active state.
 */
import type React from "react";
import { useState } from "react";
import { Tags } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const CategoryTabsPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const categories = (config?.categories as Array<{ id: string; label: string }>) || [];
  const [active, setActive] = useState<string | null>(categories[0]?.id ?? null);
  if (categories.length === 0) return <SterileState label="No categories" icon={<Tags size={20} />} />;
  return (
    <div className="relative w-full h-11 bg-slate-900 border-b-2 border-slate-800 flex overflow-x-auto">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => {
            setActive(c.id);
            onAction(telemetryTag, { action: "select_category", id: c.id });
          }}
          className={`relative shrink-0 px-4 h-full text-xs font-bold uppercase tracking-wider transition-colors ${
            active === c.id ? "text-sky-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {c.label}
          {active === c.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />}
        </button>
      ))}
    </div>
  );
};
