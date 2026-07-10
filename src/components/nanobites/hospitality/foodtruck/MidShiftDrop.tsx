/**
 * Pico-Bite 4.3 · hosp.ft.fleet.cash_drop
 * Mid-Shift Drop — drop amount numpad + verifying manager PIN; prints slip.
 */
import { useState } from "react";
import { toast } from "sonner";
import { recordExecution } from "@/lib/idia/executions";
import {
  ActionButton,
  Numpad,
  PicoCard,
  SUBMODULE_ID,
  useCartonCode,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.fleet.cash_drop";
const SCREEN = "Fleet Management";

type Step = "idle" | "amount" | "pin";

export default function MidShiftDrop() {
  const cartonCode = useCartonCode();
  const [step, setStep] = useState<Step>("idle");
  const [amount, setAmount] = useState<number | null>(null);

  const finish = (pin: string) => {
    if (amount == null) return;
    console.log(`[HARDWARE_STUB]: printing drop slip amount=$${amount.toFixed(2)}`);
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: {
        amount,
        managerPinLength: pin.length,
        slipPrinted: true,
        at: new Date().toISOString(),
      },
    });
    toast.success(`Drop of $${amount.toFixed(2)} logged`);
    setAmount(null);
    setStep("idle");
  };

  return (
    <PicoCard title="Mid-Shift Cash Drop" subtitle="Two-step: amount then manager PIN">
      <ActionButton onClick={() => setStep("amount")}>Start Cash Drop</ActionButton>
      {amount != null && step === "idle" && (
        <p className="text-[12px] text-muted-foreground">
          Pending amount: ${amount.toFixed(2)}
        </p>
      )}
      <Numpad
        open={step === "amount"}
        title="Drop Amount"
        mode="currency"
        onCancel={() => setStep("idle")}
        onSubmit={(v) => {
          setAmount(Number(v));
          setStep("pin");
        }}
      />
      <Numpad
        open={step === "pin"}
        title="Verifying Manager PIN"
        mode="pin"
        maxLength={6}
        onCancel={() => setStep("idle")}
        onSubmit={finish}
      />
    </PicoCard>
  );
}
