/**
 * pico.output.cash_drawer — pulses the cash drawer solenoid, with a
 * pulse animation state on interaction.
 */
import { useState } from "react";
import { DollarSign } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

type OP = PicoBiteProps<Record<string, unknown>, unknown>;

export const CashDrawerPicoBite: React.FC<OP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const [pulsing, setPulsing] = useState(false);
  const label = (config?.label as string) || "Open Drawer";
  const handleClick = () => {
    if (gateSatisfied === false) return;
    onAction(telemetryTag, { action: "pulse_drawer" });
    setPulsing(true);
    window.setTimeout(() => setPulsing(false), 600);
  };
  return (
    <button
      onClick={handleClick}
      className="relative w-full h-24 flex flex-col items-center justify-center gap-1 bg-emerald-950/20 border border-emerald-900/50 hover:bg-emerald-900/30 active:scale-[0.98] transition-all select-none"
    >
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <span className={`absolute inset-0 border-2 border-emerald-400 rounded pointer-events-none transition-opacity ${pulsing ? "opacity-100 animate-ping" : "opacity-0"}`} />
      <DollarSign size={28} className={`text-emerald-400 transition-transform ${pulsing ? "scale-125" : ""}`} />
      <span className="text-sm font-bold uppercase tracking-widest text-emerald-300">{label}</span>
    </button>
  );
};
