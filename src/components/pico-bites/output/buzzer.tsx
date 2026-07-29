/**
 * pico.output.buzzer — sounds an audible alert buzzer.
 */
import { Volume2 } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

type OP = PicoBiteProps<Record<string, unknown>, unknown>;

export const BuzzerPicoBite: React.FC<OP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const tone = (config?.tone as string) || "ALERT";
  return (
    <button
      onClick={() => onAction(telemetryTag, { action: "sound_buzzer" })}
      className="relative w-20 h-20 rounded-full flex flex-col items-center justify-center bg-red-950/30 border-2 border-red-800/70 hover:bg-red-900/40 active:scale-[0.92] transition-all select-none mx-auto"
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <Volume2 size={26} className="text-red-400" />
      <span className="text-[9px] font-bold uppercase tracking-widest text-red-500 mt-1">{tone}</span>
    </button>
  );
};
