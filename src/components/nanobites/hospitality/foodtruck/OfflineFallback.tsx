/**
 * Pico-Bite 3.2 · hosp.ft.pay.offline_auth
 * Offline Fallback — network-disconnected modal; cashier accepts offline risk.
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

const NANO_BITE_ID = "hosp.ft.pay.offline_auth";
const SCREEN = "Payment Processing";

export default function OfflineFallback() {
  const cartonCode = useCartonCode();
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [modal, setModal] = useState(false);

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

  const accept = () => {
    const tokenId = `off_${Date.now().toString(36)}`;
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: { tokenId, cached: true, network: online ? "online" : "offline" },
    });
    console.log(`[HARDWARE_STUB]: encrypted token cached id=${tokenId}`);
    toast.success("Offline authorization cached");
    setModal(false);
  };

  return (
    <PicoCard title="Offline Fallback" subtitle="Cache authorization when network is down">
      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
        <span className="text-[12px] text-muted-foreground">Network</span>
        <span
          className={`text-[13px] font-semibold ${online ? "text-emerald-600" : "text-destructive"}`}
        >
          {online ? "Online" : "Offline"}
        </span>
      </div>
      <ActionButton variant="warning" onClick={() => setModal(true)}>
        Simulate Offline Authorization
      </ActionButton>

      {modal && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
            <p className="text-[13px] font-semibold text-destructive">
              Network Disconnected
            </p>
            <p className="text-[12px] text-muted-foreground mt-2">
              The reader will store an encrypted token locally and settle when the
              connection returns. Chargebacks are on the operator.
            </p>
            <div className="mt-4 flex gap-2">
              <ActionButton
                variant="ghost"
                className="flex-1"
                onClick={() => setModal(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton variant="warning" className="flex-1" onClick={accept}>
                Accept Offline Risk
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </PicoCard>
  );
}
