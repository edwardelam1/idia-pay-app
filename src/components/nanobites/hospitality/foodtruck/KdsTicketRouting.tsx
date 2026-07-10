/**
 * Pico-Bite 1.3 · hosp.ft.pos.kds_fire
 * KDS Ticket Routing — Send Order button; simulates local KDS network POST.
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

const NANO_BITE_ID = "hosp.ft.pos.kds_fire";
const SCREEN = "POS & Order Routing";

export default function KdsTicketRouting() {
  const cartonCode = useCartonCode();
  const [ticketNo, setTicketNo] = useState(1001);
  const [firing, setFiring] = useState(false);

  const send = () => {
    setFiring(true);
    console.log(
      `[HARDWARE_STUB]: KDS POST → http://kds.local:8080/tickets ticket=${ticketNo}`,
    );
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: {
        ticket: ticketNo,
        stations: ["grill", "expo"],
        simulated: true,
      },
    });
    toast.success(`Ticket #${ticketNo} routed to KDS`);
    setTicketNo((n) => n + 1);
    setTimeout(() => setFiring(false), 250);
  };

  return (
    <PicoCard title="KDS Ticket Routing" subtitle="Send order to Kitchen Display System">
      <div className="p-4 rounded-2xl bg-secondary flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">Next Ticket</span>
        <span className="text-[24px] font-semibold tabular-nums">#{ticketNo}</span>
      </div>
      <ActionButton className="w-full" disabled={firing} onClick={send}>
        {firing ? "Firing…" : "Send Order"}
      </ActionButton>
    </PicoCard>
  );
}
