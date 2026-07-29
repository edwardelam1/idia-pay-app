/**
 * pico.pay.tip_share_split — tip pool distribution across roles with
 * percentage adjustment steppers.
 */
import { useState } from "react";
import { Users } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

export const TipShareSplitPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const roles = (config?.roles as Array<{ id: string; name: string; pct: number }>) || [];
  const [pcts, setPcts] = useState<Record<string, number>>(() => Object.fromEntries(roles.map((r) => [r.id, r.pct])));

  if (roles.length === 0) return <SterileState label="NO TIP ROLES CONFIGURED" icon={<Users size={20} />} />;

  const total = roles.reduce((s, r) => s + (pcts[r.id] ?? 0), 0);

  const bump = (id: string, delta: number) =>
    setPcts((p) => ({ ...p, [id]: Math.max(0, Math.min(100, (p[id] ?? 0) + delta)) }));

  return (
    <div className="relative w-full bg-rose-950/10 border border-rose-900/40 flex flex-col">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 text-[10px] font-bold uppercase text-rose-400 tracking-widest border-b border-rose-900/30 flex items-center gap-1">
        <Users size={12} /> Tip Pool Split
      </div>
      <div className="divide-y divide-rose-900/20">
        {roles.map((r) => (
          <div key={r.id} className="flex justify-between items-center px-3 py-2">
            <span className="text-sm text-slate-200">{r.name}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => bump(r.id, -5)} className="w-7 h-7 bg-slate-800 text-white text-xs">−</button>
              <span className="w-10 text-center text-xs font-mono text-rose-300">{pcts[r.id] ?? 0}%</span>
              <button onClick={() => bump(r.id, 5)} className="w-7 h-7 bg-slate-800 text-white text-xs">+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 flex flex-col gap-2">
        <span className={`text-[10px] uppercase tracking-widest ${total === 100 ? "text-rose-300" : "text-amber-400"}`}>
          Total {total}% {total !== 100 ? "(must equal 100%)" : ""}
        </span>
        <button
          disabled={total !== 100}
          onClick={() => onAction(telemetryTag, { action: "distribute_tip_pool", pcts })}
          className="h-9 bg-rose-700 hover:bg-rose-600 disabled:opacity-30 text-white text-xs font-bold uppercase active:scale-[0.98]"
        >
          Distribute Tip Pool
        </button>
      </div>
    </div>
  );
};
