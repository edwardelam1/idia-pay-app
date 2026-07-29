/**
 * pico.input.pin_pad — numeric PIN entry keypad.
 */
import { useState } from "react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const PinPadPicoBite: React.FC<IP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const [buffer, setBuffer] = useState("");
  const title = (config?.title as string) || "ENTER PIN";
  const handlePress = (key: string) => {
    if (gateSatisfied === false) return;
    if (key === "CLR") setBuffer("");
    else if (key === "ENT") { onAction(telemetryTag, { action: "submit_pin", value: buffer }); setBuffer(""); }
    else { setBuffer((p) => p + key); onAction(telemetryTag, { action: "keypress", key }); }
  };
  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900 border border-slate-800 select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col justify-end items-center h-24">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</span>
        <span className="text-4xl font-mono text-white tracking-[0.5em]">{buffer.length > 0 ? "•".repeat(buffer.length) : "-"}</span>
      </div>
      <div className="grid grid-cols-3 flex-1">
        {["1","2","3","4","5","6","7","8","9","CLR","0","ENT"].map((k) => (
          <button key={k} onClick={() => handlePress(k)}
            className={`border-b border-r border-slate-800 flex items-center justify-center text-2xl font-bold transition-colors active:scale-[0.96] active:bg-slate-700
              ${k === "ENT" ? "bg-blue-600 text-white hover:bg-blue-500" : k === "CLR" ? "bg-red-950/30 text-red-400 hover:bg-red-900/50" : "bg-slate-900 text-slate-100 hover:bg-slate-800"}`}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
};
