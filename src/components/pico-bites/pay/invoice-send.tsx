/**
 * pico.pay.invoice_send — invoice number + delivery channel selector.
 */
import { useState } from "react";
import { FileText, Mail, MessageSquare } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "../_shared";

export const InvoiceSendPicoBite: React.FC<PicoBiteProps<Record<string, unknown>, unknown>> = ({
  telemetryTag,
  config,
  onAction,
  gateSatisfied,
  gateReason,
}) => {
  const invoiceNumber = config?.invoiceNumber as string | undefined;
  const [channel, setChannel] = useState<"email" | "sms" | null>(null);

  if (!invoiceNumber) return <SterileState label="NO INVOICE NUMBER" icon={<FileText size={20} />} />;

  return (
    <div className="relative w-full bg-violet-950/10 border border-violet-900/40 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="text-[10px] font-bold uppercase text-violet-400 tracking-widest flex items-center gap-1">
        <FileText size={12} /> Invoice #{invoiceNumber}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setChannel("email")}
          className={`h-10 flex items-center justify-center gap-2 text-xs font-bold uppercase border ${channel === "email" ? "bg-violet-700 border-violet-500 text-white" : "bg-slate-950 border-slate-800 text-slate-300"}`}
        >
          <Mail size={14} /> Email
        </button>
        <button
          onClick={() => setChannel("sms")}
          className={`h-10 flex items-center justify-center gap-2 text-xs font-bold uppercase border ${channel === "sms" ? "bg-violet-700 border-violet-500 text-white" : "bg-slate-950 border-slate-800 text-slate-300"}`}
        >
          <MessageSquare size={14} /> SMS
        </button>
      </div>
      <button
        disabled={!channel}
        onClick={() => onAction(telemetryTag, { action: "send_invoice", invoiceNumber, channel })}
        className="h-10 bg-violet-700 hover:bg-violet-600 disabled:opacity-30 text-white text-xs font-bold uppercase active:scale-[0.98]"
      >
        Send Invoice
      </button>
    </div>
  );
};
