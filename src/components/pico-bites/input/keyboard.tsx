/**
 * pico.input.keyboard — free-text entry field with submit.
 */
import { useState } from "react";
import { Keyboard, X } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

type IP = PicoBiteProps<Record<string, unknown>, unknown>;

export const KeyboardPicoBite: React.FC<IP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const [text, setText] = useState("");
  const placeholder = (config?.placeholder as string) || "Enter text...";
  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 p-2 flex gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="flex-1 relative">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder}
          className="w-full h-14 bg-slate-950 border border-slate-700 text-white px-4 font-mono text-lg outline-none focus:border-blue-500 transition-colors" />
        {text && (<button onClick={() => setText("")} className="absolute right-4 top-4 text-slate-500 hover:text-white"><X size={20} /></button>)}
      </div>
      <button onClick={() => { onAction(telemetryTag, { action: "text_submit", text }); setText(""); }}
        className="w-24 h-14 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white font-bold transition-all active:scale-95">
        <Keyboard size={24} className="mx-auto" />
      </button>
    </div>
  );
};
