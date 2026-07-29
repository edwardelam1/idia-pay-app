/**
 * pico.input.qr_scan — trigger for connected QR code reader.
 */
import { QrCode } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { HardwareTriggerNode } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const QrScanPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<QrCode size={36} />} label={(p.config?.label as string) || "Scan QR"} color="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => p.onAction(p.telemetryTag, { action: "awaiting_qr" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
