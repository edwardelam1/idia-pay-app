/**
 * pico.logic.webhook_emit — emits to config.endpoint, shows method + last delivery status.
 */
import { Webhook } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "@/components/pico-bites/_shared";

export const WebhookEmitPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const endpoint = config?.endpoint as string | undefined;
  const method = (config?.method as string) || "POST";
  const lastStatus = config?.lastStatus as number | string | undefined;

  if (!endpoint) {
    return <SterileState label="NO WEBHOOK ENDPOINT BOUND" icon={<Webhook size={20} />} />;
  }

  const ok = typeof lastStatus === "number" && lastStatus >= 200 && lastStatus < 300;

  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "emit_webhook", endpoint, method })}
      className="relative w-full flex items-center justify-between px-3 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-900 active:scale-[0.98] transition-all"
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex items-center gap-2 overflow-hidden">
        <Webhook size={18} className="text-pink-400 shrink-0" />
        <div className="flex flex-col items-start overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-widest text-pink-300">{method}</span>
          <span className="text-[10px] font-mono text-slate-500 truncate max-w-[10rem]">{endpoint}</span>
        </div>
      </div>
      <span className={`text-[10px] font-bold uppercase px-2 py-1 border ${
        lastStatus === undefined
          ? "border-slate-700 text-slate-500"
          : ok
          ? "border-emerald-800 text-emerald-300 bg-emerald-950/30"
          : "border-red-800 text-red-300 bg-red-950/30"
      }`}>
        {lastStatus !== undefined ? lastStatus : "—"}
      </span>
    </button>
  );
};
