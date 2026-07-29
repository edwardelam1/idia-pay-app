/**
 * pico.input.chip_insert — trigger for EMV chip card reader.
 */
import { CreditCard } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { HardwareTriggerNode } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const ChipInsertPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<CreditCard size={36} className="rotate-90" />} label={(p.config?.label as string) || "Insert Card"} color="bg-emerald-950/30 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-300" onClick={() => p.onAction(p.telemetryTag, { action: "poll_emv" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
