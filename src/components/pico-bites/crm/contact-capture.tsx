/**
 * pico.crm.contact_capture — phone + email capture with channel-consent
 * checkboxes.
 */
import { useState } from "react";
import { Contact } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "@/components/pico-bites/_shared";

export const ContactCapturePicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const channels = (config?.channels as string[]) || ["SMS", "Email"];
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState<Record<string, boolean>>({});

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1">
        <Contact size={12} className="text-lime-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-lime-400">Capture Contact</span>
      </div>
      <div className="flex flex-col gap-1 p-2">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="h-9 bg-slate-950 border border-slate-800 text-sm text-white px-2 outline-none" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-9 bg-slate-950 border border-slate-800 text-sm text-white px-2 outline-none" />
        <div className="flex gap-3 py-1">
          {channels.map((c) => (
            <label key={c} className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-widest">
              <input type="checkbox" checked={!!consent[c]} onChange={(e) => setConsent((v) => ({ ...v, [c]: e.target.checked }))} className="accent-lime-500" />
              {c}
            </label>
          ))}
        </div>
        <button
          onClick={() => {
            onAction(telemetryTag, { action: "capture_contact", phone, email, consent });
            setPhone("");
            setEmail("");
            setConsent({});
          }}
          className="h-9 bg-lime-900/40 hover:bg-lime-800/50 text-lime-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
        >
          Save Contact
        </button>
      </div>
    </div>
  );
};
