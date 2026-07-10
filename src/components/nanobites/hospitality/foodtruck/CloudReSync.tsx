/**
 * Pico-Bite 3.3 · hosp.ft.pay.batch_sync
 * Cloud Re-Sync — force sync button; primarily background but manual trigger
 * emits the batch sync record.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { recordExecution } from "@/lib/idia/executions";
import {
  ActionButton,
  PicoCard,
  SUBMODULE_ID,
  useCartonCode,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.pay.batch_sync";
const SCREEN = "Payment Processing";

export default function CloudReSync() {
  const cartonCode = useCartonCode();
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const sync = () => {
    setSyncing(true);
    console.log("[HARDWARE_STUB]: polling network → transmitting cached tokens");
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: {
        trigger: "manual",
        online,
        at: new Date().toISOString(),
      },
    });
    setLastSync(new Date().toLocaleTimeString());
    toast.success("Batch sync submitted");
    setTimeout(() => setSyncing(false), 300);
  };

  return (
    <PicoCard title="Cloud Re-Sync" subtitle="Force settlement of cached authorizations">
      <div className="flex flex-col gap-1 p-3 rounded-xl bg-secondary">
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Last Sync
        </span>
        <span className="text-[16px] font-semibold">
          {lastSync ?? "Never (this session)"}
        </span>
      </div>
      <ActionButton disabled={syncing || !online} onClick={sync}>
        {online ? (syncing ? "Syncing…" : "Force Sync") : "Waiting for network"}
      </ActionButton>
    </PicoCard>
  );
}
