/**
 * pico.pay.currency_convert — base/quote with rate line and converted amount.
 */
import { Repeat } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, StatusRow, SterileState } from "../_shared";

export const CurrencyConvertPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const base = config?.base as string | undefined;
  const quote = config?.quote as string | undefined;
  const rate = config?.rate as number | undefined;
  const amount = config?.amount as number | undefined;

  if (!base || !quote) return <SterileState label="AWAITING CURRENCY PAIR" icon={<Repeat size={20} />} />;

  const converted = rate !== undefined && amount !== undefined ? amount * rate : undefined;

  return (
    <div className="relative w-full bg-teal-950/10 border border-teal-900/40 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="text-[10px] font-bold uppercase text-teal-400 tracking-widest flex items-center gap-1">
        <Repeat size={12} /> {base} → {quote}
      </div>
      <StatusRow label="Rate" value={rate !== undefined ? rate.toFixed(4) : "—"} />
      <StatusRow label={`Amount (${base})`} value={amount !== undefined ? amount.toFixed(2) : "—"} />
      <StatusRow label={`Converted (${quote})`} value={converted !== undefined ? converted.toFixed(2) : "—"} tone="text-teal-300" />
      <button
        disabled={converted === undefined}
        onClick={() => onAction(telemetryTag, { action: "convert_currency", base, quote, rate, amount, converted })}
        className="h-9 bg-teal-700 hover:bg-teal-600 disabled:opacity-30 text-white text-xs font-bold uppercase active:scale-[0.98]"
      >
        Convert Currency
      </button>
    </div>
  );
};
