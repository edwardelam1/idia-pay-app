/**
 * Pico-Bite 5.4 · hosp.ft.rpt.export_ledger
 * Ledger Export — End of Day + Export & Sync; batch transmits all execution
 * records for the active carton.
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

const NANO_BITE_ID = "hosp.ft.rpt.export_ledger";
const SCREEN = "Mobile Analytics";
const STORE_KEY = "idia.pay.executions.v1";

export default function LedgerExport() {
  const cartonCode = useCartonCode();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const eodPrep = () => setConfirmOpen(true);

  const exportSync = () => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(STORE_KEY) : null;
    const all = raw ? (JSON.parse(raw) as unknown[]) : [];
    const forCarton = (all as { cartonCode: string }[]).filter(
      (r) => r.cartonCode === cartonCode,
    );
    console.log(
      `[HARDWARE_STUB]: batch transmit ledger records=${forCarton.length}`,
    );
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: {
        transmittedCount: forCarton.length,
        at: new Date().toISOString(),
      },
    });
    toast.success(`Exported ${forCarton.length} records`);
    setConfirmOpen(false);
  };

  return (
    <PicoCard title="Ledger Export" subtitle="End of Day → Export & Sync">
      <ActionButton onClick={eodPrep}>End of Day</ActionButton>
      {confirmOpen && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
            <p className="text-[13px] font-semibold">Export today's ledger?</p>
            <p className="text-[12px] text-muted-foreground mt-1">
              All ExecutionRecords for carton {cartonCode} will batch to the Hub.
            </p>
            <div className="mt-4 flex gap-2">
              <ActionButton
                variant="ghost"
                className="flex-1"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton className="flex-1" onClick={exportSync}>
                Export & Sync
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </PicoCard>
  );
}
