/**
 * pico.loyalty.reward_redeem — redeemable rewards list with point cost.
 */
import { Gift } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

export const RewardRedeemPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const rewards = (config?.rewards as Array<{ id: string; label: string; cost: number }>) || [];
  if (rewards.length === 0) return <SterileState label="NO REWARDS AVAILABLE" icon={<Gift size={20} />} />;
  return (
    <div className="relative w-full bg-fuchsia-950/10 border border-fuchsia-900/40 divide-y divide-fuchsia-900/30">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {rewards.map((r) => (
        <button
          key={r.id}
          onClick={() => onAction(telemetryTag, { action: "redeem_reward", id: r.id })}
          className="w-full flex justify-between items-center px-4 py-3 hover:bg-fuchsia-900/20 active:scale-[0.99]"
        >
          <span className="text-sm text-slate-200 flex items-center gap-2">
            <Gift size={14} className="text-fuchsia-400" /> {r.label}
          </span>
          <span className="text-xs text-fuchsia-300 font-mono">{r.cost} pts</span>
        </button>
      ))}
    </div>
  );
};
