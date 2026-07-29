/**
 * pico.input.numpad — decimal quantity/amount entry keypad.
 */
import { useState } from "react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const NumpadPicoBite: React.FC<IP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const [buffer, setBuffer] = useState("");
  const title = (config?.title as string) || "QUANTITY / AMOUNT";
  const handlePress = (key: string) => {
    if (gateSatisfied === false) return;
    if (key === "CLR") setBuffer("");
    else if (key === "ENT") { onAction(telemetryTag, { action: "submit_value", value: buffer }); setBuffer(""); }
    else { if (key === "." && buffer.includes(".")) return; setBuffer((p) => p + key); }
  };
  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900 border border-slate-800 select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col justify-end items-end h-24">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</span>
        <span className="text-4xl font-mono text-white tracking-tight">{buffer || "0.00"}</span>
      </div>
      <div className="grid grid-cols-4 flex-1">
        <div className="col-span-3 grid grid-cols-3">
          {["1","2","3","4","5","6","7","8","9",".","0","00"].map((k) => (
            <button key={k} onClick={() => handlePress(k)}
              className="border-b border-r border-slate-800 flex items-center justify-center text-2xl font-semibold text-slate-100 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 active:scale-[0.96] transition-all">
              {k}
            </button>
          ))}
        </div>
        <div className="col-span-1 flex flex-col">
          <button onClick={() => handlePress("CLR")} className="flex-1 border-b border-slate-800 bg-slate-800 text-red-400 font-bold text-lg hover:bg-slate-700 active:scale-[0.96] transition-all">CLR</button>
          <button onClick={() => handlePress("ENT")} className="flex-[2] bg-emerald-600 text-white font-bold text-xl hover:bg-emerald-500 active:bg-emerald-700 active:scale-[0.96] transition-all">ENT</button>
        </div>
      </div>
    </div>
  );
};
