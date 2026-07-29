/**
 * pico.sched.roster_pick — staff roster from config.staff with role badges
 * and a select action.
 */
import { Users } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const RosterPickPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const staff = (config?.staff as Array<{ id: string; name: string; role: string }>) || [];
  if (staff.length === 0) return <SterileState label="NO ROSTER LOADED" icon={<Users size={20} />} />;

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 divide-y divide-slate-800 select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 flex items-center gap-1">
        <Users size={12} className="text-orange-300" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-300">Roster</span>
      </div>
      {staff.map((s) => (
        <button
          key={s.id}
          onClick={() => onAction(telemetryTag, { action: "pick_roster_member", id: s.id })}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-950 active:scale-[0.98]"
        >
          <span className="text-sm text-slate-200">{s.name}</span>
          <span className="text-[9px] uppercase tracking-widest text-orange-200 bg-orange-900/40 border border-orange-800 px-2 py-1 rounded">{s.role}</span>
        </button>
      ))}
    </div>
  );
};
