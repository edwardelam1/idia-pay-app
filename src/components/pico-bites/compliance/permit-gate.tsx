/**
 * pico.compliance.permit_gate — permit id/expiry with valid/expired banner,
 * blocks the action when expired.
 */
import { BadgeAlert, BadgeCheck } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

export const PermitGatePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const permitId = config?.permitId as string | undefined;
  const expiry = config?.expiry as string | undefined;

  if (!permitId || !expiry) return <SterileState label="NO PERMIT ON FILE" icon={<BadgeAlert size={20} />} />;

  const expired = new Date(expiry).getTime() < Date.now();

  return (
    <div className={`relative w-full border-2 p-4 flex flex-col items-center gap-3 ${expired ? "bg-red-950/30 border-red-900/60" : "bg-emerald-950/20 border-emerald-900/50"}`}>
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {expired ? <BadgeAlert size={26} className="text-red-400" /> : <BadgeCheck size={26} className="text-emerald-400" />}
      <span className={`text-xs font-bold uppercase tracking-widest ${expired ? "text-red-300" : "text-emerald-300"}`}>
        {expired ? "Permit Expired" : "Permit Valid"}
      </span>
      <span className="text-[10px] font-mono text-slate-400">#{permitId} · exp {expiry}</span>
      <button
        disabled={expired}
        onClick={() => onAction(telemetryTag, { action: "verify_permit", permitId, expiry })}
        className="w-full h-9 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-30 text-white text-xs font-bold uppercase active:scale-[0.98]"
      >
        Verify Permit
      </button>
    </div>
  );
};
