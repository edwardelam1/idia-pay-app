/**
 * Universal `pico.input.*` catalog — data entry & hardware capture triggers.
 * Structural UI only; every list-shaped bite falls back to <SterileState/>
 * when its blueprint `config` is empty. No mock data.
 */
import { useState } from "react";
import {
  ScanLine,
  QrCode,
  Wifi,
  CreditCard,
  Camera,
  Mic,
  Scale,
  Contact2,
  Fingerprint,
  ScanFace,
  Keyboard,
  X,
} from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "./_shared";

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

export const SignaturePadPicoBite: React.FC<IP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const [hasInk, setHasInk] = useState(false);
  const title = (config?.title as string) || "CUSTOMER SIGNATURE";
  return (
    <div className="relative w-full h-48 bg-slate-100 border-2 border-slate-300 rounded flex flex-col overflow-hidden select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="bg-slate-200 px-3 py-2 border-b border-slate-300 flex justify-between items-center">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{title}</span>
        <button onClick={() => setHasInk(false)} className="text-xs font-bold text-red-500 uppercase tracking-wider px-2 py-1 active:scale-95">Clear</button>
      </div>
      <div className="flex-1 flex items-center justify-center cursor-crosshair active:bg-slate-200 transition-colors"
        onPointerDown={() => { setHasInk(true); onAction(telemetryTag, { action: "signature_started" }); }}>
        {!hasInk ? <span className="text-slate-300 text-3xl italic pointer-events-none">Sign Here x</span> : <span className="text-slate-800 text-4xl italic pointer-events-none">Signed</span>}
      </div>
      <button disabled={!hasInk} onClick={() => onAction(telemetryTag, { action: "signature_accepted" })}
        className="h-12 bg-blue-600 text-white font-bold uppercase tracking-widest disabled:opacity-50 disabled:bg-slate-400 active:bg-blue-700 transition-colors">
        Accept
      </button>
    </div>
  );
};

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

const HardwareTriggerNode: React.FC<{
  icon: React.ReactNode; label: string; color: string;
  onClick: () => void; gateSatisfied?: boolean; gateReason?: string;
}> = ({ icon, label, color, onClick, gateSatisfied, gateReason }) => (
  <button onClick={onClick} className={`relative w-full h-32 flex flex-col items-center justify-center gap-3 border ${color} transition-all active:scale-[0.98] select-none`}>
    <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
    {icon}
    <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export const BarcodeScanPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<ScanLine size={36} />} label={(p.config?.label as string) || "Scan Barcode"} color="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => p.onAction(p.telemetryTag, { action: "awaiting_barcode" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
export const QrScanPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<QrCode size={36} />} label={(p.config?.label as string) || "Scan QR"} color="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => p.onAction(p.telemetryTag, { action: "awaiting_qr" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
export const NfcTapPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<Wifi size={36} />} label={(p.config?.label as string) || "Tap to Pay"} color="bg-blue-950/30 border-blue-900/50 text-blue-400 hover:bg-blue-900/50 hover:text-blue-300" onClick={() => p.onAction(p.telemetryTag, { action: "poll_nfc" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
export const MagStripePicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<CreditCard size={36} />} label={(p.config?.label as string) || "Swipe Card"} color="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => p.onAction(p.telemetryTag, { action: "poll_msr" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
export const ChipInsertPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<CreditCard size={36} className="rotate-90" />} label={(p.config?.label as string) || "Insert Card"} color="bg-emerald-950/30 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-300" onClick={() => p.onAction(p.telemetryTag, { action: "poll_emv" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
export const CameraCapturePicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<Camera size={36} />} label={(p.config?.label as string) || "Capture Photo"} color="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => p.onAction(p.telemetryTag, { action: "activate_camera" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
export const VoiceCommandPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<Mic size={36} />} label={(p.config?.label as string) || "Hold to Speak"} color="bg-rose-950/30 border-rose-900/50 text-rose-400 hover:bg-rose-900/50 hover:text-rose-300" onClick={() => p.onAction(p.telemetryTag, { action: "activate_mic" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
export const WeightScalePicoBite: React.FC<IP> = (p) => {
  const unit = (p.config?.unit as string) || "lb";
  return (
    <div className="relative w-full h-32 bg-slate-950 border border-slate-800 flex flex-col items-center justify-center select-none" onClick={() => p.onAction(p.telemetryTag, { action: "poll_scale" })}>
      <GateOverlay satisfied={p.gateSatisfied} reason={p.gateReason} />
      <Scale size={24} className="text-amber-500 mb-2 opacity-50" />
      <div className="text-3xl font-mono text-amber-500 tracking-wider">0.00 <span className="text-sm">{unit}</span></div>
      <span className="text-[10px] text-slate-500 uppercase mt-1">Awaiting Scale...</span>
    </div>
  );
};
export const IdScanPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<Contact2 size={36} />} label={(p.config?.label as string) || "Scan ID"} color="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => p.onAction(p.telemetryTag, { action: "awaiting_id" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
export const FingerprintPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<Fingerprint size={36} />} label={(p.config?.label as string) || "Scan Fingerprint"} color="bg-purple-950/30 border-purple-900/50 text-purple-400 hover:bg-purple-900/50 hover:text-purple-300" onClick={() => p.onAction(p.telemetryTag, { action: "poll_fingerprint" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
export const FaceScanPicoBite: React.FC<IP> = (p) => (
  <HardwareTriggerNode icon={<ScanFace size={36} />} label={(p.config?.label as string) || "Scan Face"} color="bg-indigo-950/30 border-indigo-900/50 text-indigo-400 hover:bg-indigo-900/50 hover:text-indigo-300" onClick={() => p.onAction(p.telemetryTag, { action: "poll_facescan" })} gateSatisfied={p.gateSatisfied} gateReason={p.gateReason} />
);
