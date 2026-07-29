/**
 * pico.pay.wallet_pay — wallet provider chips with a tap-to-authorize state.
 */
import { useState } from "react";
import { Wallet, Loader2 } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

export const WalletPayPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const wallets = (config?.wallets as string[]) || [];
  const [selected, setSelected] = useState<string | null>(null);

  if (wallets.length === 0) return <SterileState label="NO WALLETS CONFIGURED" icon={<Wallet size={20} />} />;

  return (
    <div className="relative w-full bg-purple-950/10 border border-purple-900/40 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="text-[10px] font-bold uppercase text-purple-400 tracking-widest">Wallet Pay</div>
      <div className="flex flex-wrap gap-2">
        {wallets.map((w) => (
          <button
            key={w}
            onClick={() => setSelected(w)}
            className={`px-3 h-8 rounded-full text-xs font-bold uppercase border ${
              selected === w ? "bg-purple-700 border-purple-500 text-white" : "bg-slate-900 border-slate-700 text-slate-300"
            }`}
          >
            {w}
          </button>
        ))}
      </div>
      <button
        disabled={!selected}
        onClick={() => onAction(telemetryTag, { action: "authorize_wallet", wallet: selected })}
        className="h-10 bg-purple-700 hover:bg-purple-600 disabled:opacity-30 text-white font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        {selected ? <Loader2 size={14} className="animate-spin" /> : null}
        {selected ? `Tap to Authorize ${selected}` : "Select a Wallet"}
      </button>
    </div>
  );
};
