/**
 * pico.crm.new_customer — new-profile form (name, phone, email) with a
 * create action.
 */
import { useState } from "react";
import { UserPlus } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "@/components/pico-bites/_shared";

export const NewCustomerPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="relative w-full bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col select-none">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2">
        <UserPlus size={16} className="text-fuchsia-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400">New Customer Profile</span>
      </div>
      <div className="flex flex-col gap-1 p-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="h-9 bg-slate-950 border border-slate-800 text-sm text-white px-2 outline-none" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="h-9 bg-slate-950 border border-slate-800 text-sm text-white px-2 outline-none" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-9 bg-slate-950 border border-slate-800 text-sm text-white px-2 outline-none" />
        <button
          onClick={() => {
            onAction(telemetryTag, { action: "create_customer", name, phone, email });
            setName("");
            setPhone("");
            setEmail("");
          }}
          disabled={!name}
          className="h-10 bg-fuchsia-900/40 hover:bg-fuchsia-800/50 disabled:opacity-40 text-fuchsia-200 text-xs font-bold uppercase tracking-widest active:scale-[0.98]"
        >
          Create Profile
        </button>
      </div>
    </div>
  );
};
