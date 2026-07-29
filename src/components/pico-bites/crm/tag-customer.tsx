/**
 * pico.crm.tag_customer — tag chips from config.tags with add/remove
 * toggling.
 */
import { Tags, X } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const TagCustomerPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const tags = (config?.tags as Array<{ id: string; label: string; active?: boolean }>) || [];

  if (tags.length === 0) return <SterileState label="NO TAGS CONFIGURED" icon={<Tags size={20} />} />;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1">
        <Tags size={12} className="text-pink-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400">Customer Tags</span>
      </div>
      <div className="flex flex-wrap gap-1 p-2">
        {tags.map((t) => (
          <button
            key={t.id}
            onClick={() => onAction(telemetryTag, { action: "toggle_customer_tag", id: t.id, active: !t.active })}
            className={`flex items-center gap-1 h-8 px-3 text-[10px] font-bold uppercase tracking-widest rounded-full active:scale-[0.98] ${t.active ? "bg-pink-900/50 text-pink-200 border border-pink-700" : "bg-slate-950 text-slate-500 border border-slate-800"}`}
          >
            {t.label}
            {t.active && <X size={10} />}
          </button>
        ))}
      </div>
    </div>
  );
};
