/**
 * pico.input.id_scan — trigger for ID document scanner.
 */
import { Contact2 } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { HardwareTriggerNode } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const IdScanPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<Contact2 size={36} />} label={(p.config?.label as string) || "Scan ID"} color="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => p.onAction(p.telemetryTag, { action: "awaiting_id" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
