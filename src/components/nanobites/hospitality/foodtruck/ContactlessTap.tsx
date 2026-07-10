/**
 * Pico-Bite 3.1 · hosp.ft.pay.init_nfc
 * Contactless Tap — Pay → Card/Tap; simulates Bluetooth/USB reader handshake.
 */
import { useState } from "react";
import { toast } from "sonner";
import { recordExecution } from "@/lib/idia/executions";
import {
  ActionButton,
  PicoCard,
  SUBMODULE_ID,
  useCartonCode,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.pay.init_nfc";
const SCREEN = "Payment Processing";

export default function ContactlessTap() {
  const cartonCode = useCartonCode();
  const [amount] = useState(12.5);
  const [state, setState] = useState<"idle" | "awaiting" | "done">("idle");

  const startPay = () => setState("awaiting");
  const tap = (method: "nfc" | "emv") => {
    console.log(`[HARDWARE_STUB]: reader open method=${method}`);
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: { amount, method, simulated: true },
    });
    toast.success("Payment authorized");
    setState("done");
  };

  return (
    <PicoCard title="Contactless Tap" subtitle="Hand off from screen to reader hardware">
      <div className="p-4 rounded-2xl bg-secondary flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">Total Due</span>
        <span className="text-[24px] font-semibold tabular-nums">
          ${amount.toFixed(2)}
        </span>
      </div>
      {state === "idle" && <ActionButton onClick={startPay}>Pay</ActionButton>}
      {state === "awaiting" && (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] text-muted-foreground text-center">
            Choose input on the reader
          </p>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton onClick={() => tap("nfc")}>Card / Tap</ActionButton>
            <ActionButton variant="ghost" onClick={() => tap("emv")}>
              EMV Dip
            </ActionButton>
          </div>
        </div>
      )}
      {state === "done" && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[13px] text-center">
          Authorized · reader closed
        </div>
      )}
    </PicoCard>
  );
}
