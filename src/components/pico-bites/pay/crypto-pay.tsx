/**
 * pico.pay.crypto_pay — chain/asset with address/QR frame and a
 * confirmations counter.
 */
import { Bitcoin, QrCode } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, StatusRow, SterileState } from "../_shared";

export const CryptoPayPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const asset = config?.asset as string | undefined;
  const chain = config?.chain as string | undefined;
  const address = config?.address as string | undefined;
  const confirmations = config?.confirmations as number | undefined;

  if (!asset) return <SterileState label="NO ASSET CONFIGURED" icon={<Bitcoin size={20} />} />;

  return (
    <div className="relative w-full bg-orange-950/10 border border-orange-900/40 flex flex-col">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 border-b border-orange-900/30 text-[10px] font-bold uppercase text-orange-400 tracking-widest">
        {chain ? `${chain} · ` : ""}{asset}
      </div>
      <div className="p-3 flex flex-col gap-2">
        <div className="w-full aspect-square max-h-32 flex items-center justify-center bg-slate-950 border border-orange-900/40 text-orange-500">
          <QrCode size={48} />
        </div>
        <span className="text-[10px] font-mono text-slate-500 break-all">{address ?? "Awaiting address"}</span>
        <StatusRow label="Confirmations" value={confirmations ?? "—"} tone="text-orange-300" />
        <button
          onClick={() => onAction(telemetryTag, { action: "request_crypto_payment", asset, chain })}
          className="h-10 bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold uppercase active:scale-[0.98]"
        >
          Request Payment
        </button>
      </div>
    </div>
  );
};
