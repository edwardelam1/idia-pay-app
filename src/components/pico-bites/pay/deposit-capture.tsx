/**
 * pico.pay.deposit_capture — deposit amount vs balance due with a
 * remaining-balance readout.
 */
import { useState } from "react";
import { PiggyBank } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, StatusRow, SterileState } from "../_shared";

export const DepositCapturePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const balanceDue = config?.balanceDue as number | undefined;
  const [deposit, setDeposit] = useState<number | undefined>(undefined);

  if (balanceDue === undefined) return <SterileState label="AWAITING BALANCE DUE" icon={<PiggyBank size={20} />} />;

  const remaining = deposit !== undefined ? balanceDue - deposit : balanceDue;

  return (
    <div className="relative w-full bg-cyan-950/10 border border-cyan-900/40 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="text-[10px] font-bold uppercase text-cyan-400 tracking-widest flex items-center gap-1">
        <PiggyBank size={12} /> Deposit Capture
      </div>
      <input
        type="number"
        placeholder="Deposit amount"
        onChange={(e) => setDeposit(e.target.value === "" ? undefined : Number(e.target.value))}
        className="h-9 px-2 bg-slate-950 border border-slate-800 text-slate-200 text-sm font-mono"
      />
      <StatusRow label="Balance Due" value={`$${balanceDue.toFixed(2)}`} />
      <StatusRow label="Remaining After Deposit" value={`$${remaining.toFixed(2)}`} tone="text-cyan-300" />
      <button
        disabled={!deposit}
        onClick={() => onAction(telemetryTag, { action: "capture_deposit", amount: deposit })}
        className="h-10 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-30 text-white font-bold uppercase text-xs tracking-widest active:scale-[0.98]"
      >
        Capture Deposit
      </button>
    </div>
  );
};
