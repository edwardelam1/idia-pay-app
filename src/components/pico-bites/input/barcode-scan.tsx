/**
 * pico.input.barcode_scan — trigger for connected barcode reader.
 */
import { ScanLine } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { HardwareTriggerNode } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const BarcodeScanPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<ScanLine size={36} />} label={(p.config?.label as string) || "Scan Barcode"} color="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => p.onAction(p.telemetryTag, { action: "awaiting_barcode" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
