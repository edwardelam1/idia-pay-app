/**
 * pico.loyalty.gift_card_swipe — card capture with balance-check readout.
 */
import { useState } from "react";
import { CreditCard } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, StatusRow } from "../_shared";

export const GiftCardSwipePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const [swiped, setSwiped] = useState(false);
  const balance = config?.balance as number | undefined;

  return (
    <div className="relative w-full bg-pink-950/10 border border-pink-900/40 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <button
        onClick={() => {
          setSwiped(true);
          onAction(telemetryTag, { action: "swipe_gift_card" });
        }}
        className="h-16 flex items-center justify-center gap-3 bg-pink-900/30 hover:bg-pink-900/40 border border-pink-900/50 text-pink-200 active:scale-[0.98]"
      >
        <CreditCard size={20} />
        <span className="text-xs font-bold uppercase tracking-widest">Swipe Gift Card</span>
      </button>
      <StatusRow
        label="Balance"
        value={!swiped ? "—" : balance === undefined ? "Checking…" : `$${balance.toFixed(2)}`}
        tone="text-pink-300"
      />
    </div>
  );
};
