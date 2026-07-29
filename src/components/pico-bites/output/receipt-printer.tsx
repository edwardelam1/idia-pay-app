/**
 * pico.output.receipt_printer — sends the current order to the receipt
 * printer, with a paper-strip affordance and a printed-count from config.
 */
import { Printer } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay } from "../_shared";

type OP = PicoBiteProps<Record<string, unknown>, unknown>;

export const ReceiptPrinterPicoBite: React.FC<OP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const printed = config?.printedCount as number | undefined;
  return (
    <div className="relative w-full flex flex-col items-center bg-slate-900 border border-slate-800 select-none overflow-hidden">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="w-10 h-3 bg-slate-100/90 rounded-t-sm mt-2" />
      <button
        onClick={() => onAction(telemetryTag, { action: "print_receipt" })}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-800 active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <Printer size={22} className="text-slate-300" />
          <span className="text-sm font-bold uppercase tracking-widest text-slate-100">Print Receipt</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          {typeof printed === "number" ? `${printed} printed` : "Queue"}
        </span>
      </button>
    </div>
  );
};
