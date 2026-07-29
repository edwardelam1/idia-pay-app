/**
 * pico.pay.ach_prompt — bank routing/account entry with masked fields and
 * a mandate acknowledgement before submitting an ACH debit.
 */
import { useState } from "react";
import { Landmark } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, PicoFrame } from "../_shared";

export const AchPromptPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const [routing, setRouting] = useState("");
  const [account, setAccount] = useState("");
  const [mandate, setMandate] = useState(false);
  const mandateText = (config?.mandateText as string) || "I authorize this ACH debit.";

  const canSubmit = routing.length >= 4 && account.length >= 4 && mandate;

  return (
    <PicoFrame title="ACH Debit" accent="text-sky-400" gateSatisfied={gateSatisfied} gateReason={gateReason}>
      <div className="p-3 flex flex-col gap-2">
        <Landmark size={16} className="text-sky-400" />
        <input
          value={routing}
          onChange={(e) => setRouting(e.target.value.replace(/\D/g, ""))}
          placeholder="Routing •••• ••••"
          className="h-9 px-2 bg-slate-950 border border-slate-800 text-slate-200 text-sm font-mono tracking-widest"
        />
        <input
          value={account}
          onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))}
          placeholder="Account •••• ••••"
          type="password"
          className="h-9 px-2 bg-slate-950 border border-slate-800 text-slate-200 text-sm font-mono tracking-widest"
        />
        <label className="flex items-start gap-2 mt-1">
          <input type="checkbox" checked={mandate} onChange={(e) => setMandate(e.target.checked)} className="mt-0.5" />
          <span className="text-[10px] text-slate-500 leading-relaxed">{mandateText}</span>
        </label>
        <button
          disabled={!canSubmit}
          onClick={() => onAction(telemetryTag, { action: "submit_ach", routing, account })}
          className="h-10 mt-1 bg-sky-700 hover:bg-sky-600 disabled:opacity-30 text-white font-bold uppercase text-xs tracking-widest active:scale-[0.98]"
        >
          Submit ACH
        </button>
      </div>
    </PicoFrame>
  );
};
