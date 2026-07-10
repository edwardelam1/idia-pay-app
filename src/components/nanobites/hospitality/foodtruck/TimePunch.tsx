/**
 * Pico-Bite 4.2 · hosp.ft.fleet.time_punch
 * Time Punch — employee PIN modal + clock-in/out toggle.
 */
import { useState } from "react";
import { toast } from "sonner";
import { recordExecution } from "@/lib/idia/executions";
import {
  ActionButton,
  Numpad,
  PicoCard,
  SUBMODULE_ID,
  setShiftClockedIn,
  useCartonCode,
  useShiftLock,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.fleet.time_punch";
const SCREEN = "Fleet Management";

export default function TimePunch() {
  const cartonCode = useCartonCode();
  const { clockedIn } = useShiftLock();
  const [padOpen, setPadOpen] = useState(false);

  const punch = (pin: string) => {
    const next = !clockedIn;
    setShiftClockedIn(next);
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: {
        direction: next ? "in" : "out",
        employeePinLength: pin.length,
        at: new Date().toISOString(),
      },
    });
    toast.success(next ? "Clocked in" : "Clocked out");
    setPadOpen(false);
  };

  return (
    <PicoCard title="Time Punch" subtitle="Employee PIN gates every clock action">
      <div className="p-3 rounded-xl bg-secondary flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">Status</span>
        <span
          className={`text-[13px] font-semibold ${clockedIn ? "text-emerald-600" : "text-muted-foreground"}`}
        >
          {clockedIn ? "Clocked In" : "Clocked Out"}
        </span>
      </div>
      <ActionButton onClick={() => setPadOpen(true)}>
        {clockedIn ? "Clock Out" : "Clock In"}
      </ActionButton>
      <Numpad
        open={padOpen}
        title="Employee PIN"
        mode="pin"
        maxLength={6}
        onCancel={() => setPadOpen(false)}
        onSubmit={punch}
      />
    </PicoCard>
  );
}
