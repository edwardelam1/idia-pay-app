/**
 * Pico-Bite 3.4 · hosp.ft.pay.drawer_state
 * Drawer State — No Sale / Pause Till gated by manager PIN; pulses cash drawer.
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

const NANO_BITE_ID = "hosp.ft.pay.drawer_state";
const SCREEN = "Payment Processing";

export default function DrawerState() {
  const cartonCode = useCartonCode();
  const [pending, setPending] = useState<"no_sale" | "pause_till" | null>(null);
  const [paused, setPaused] = useState(false);

  const confirm = (pin: string) => {
    if (!pending) return;
    console.log(`[HARDWARE_STUB]: RJ11 pulse → cash drawer action=${pending}`);
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: { state: pending, managerPinLength: pin.length, simulated: true },
    });
    if (pending === "pause_till") setPaused((p) => !p);
    toast.success(pending === "no_sale" ? "Drawer opened" : "Till state toggled");
    setPending(null);
  };

  return (
    <PicoCard title="Drawer State" subtitle="No Sale open or Pause Till (PIN required)">
      <div className="p-3 rounded-xl bg-secondary flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">Till</span>
        <span
          className={`text-[13px] font-semibold ${paused ? "text-amber-600" : "text-emerald-600"}`}
        >
          {paused ? "Paused" : "Active"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ActionButton onClick={() => setPending("no_sale")}>No Sale</ActionButton>
        <ActionButton variant="warning" onClick={() => setPending("pause_till")}>
          {paused ? "Resume Till" : "Pause Till"}
        </ActionButton>
      </div>
      <Numpad
        open={pending !== null}
        title="Manager PIN"
        mode="pin"
        maxLength={6}
        onCancel={() => setPending(null)}
        onSubmit={confirm}
      />
    </PicoCard>
  );
}
