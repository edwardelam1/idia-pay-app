/**
 * pico.pay.cash_tender — cash amount entry with quick-cash denominations
 * and a change-due readout. No invented denominations or totals.
 */
import { useState } from "react";
import { Banknote } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState, StatusRow } from "../_shared";

export const CashTenderPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const denominations = (config?.denominations as number[]) || [];
  const amountDue = config?.amountDue as number | undefined;
  const [tendered, setTendered] = useState<number | null>(null);

  if (denominations.length === 0) {
    return <SterileState label="AWAITING DENOMINATIONS" icon={<Banknote size={20} />} />;
  }

  const changeDue = tendered !== null && amountDue !== undefined ? tendered - amountDue : null;

  return (
    <div className="relative w-full bg-emerald-950/10 border border-emerald-900/40 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest flex items-center gap-1">
        <Banknote size={12} /> Cash Tender
      </div>
      <div className="grid grid-cols-4 gap-2">
        {denominations.map((d) => (
          <button
            key={d}
            onClick={() => {
              setTendered(d);
              if (gateSatisfied === false) return;
              onAction(telemetryTag, { action: "tender_cash", amount: d });
            }}
            className="h-10 bg-emerald-900/40 hover:bg-emerald-800/50 active:scale-[0.98] text-emerald-200 text-sm font-mono border border-emerald-900/60"
          >
            ${d}
          </button>
        ))}
      </div>
      <StatusRow
        label="Change Due"
        value={changeDue === null ? "—" : `$${changeDue.toFixed(2)}`}
        tone={changeDue !== null && changeDue < 0 ? "text-red-400" : "text-emerald-300"}
      />
    </div>
  );
};
