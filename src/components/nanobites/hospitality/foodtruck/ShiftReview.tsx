/**
 * Pico-Bite 4.4 · hosp.ft.fleet.shift_review
 * Shift Review — declared cash tips + read-only tip pool split + sign & close.
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
  setShiftLocation,
  useCartonCode,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.fleet.shift_review";
const SCREEN = "Fleet Management";

const POOL = [
  { name: "Cashier", share: 0.5 },
  { name: "Cook", share: 0.3 },
  { name: "Runner", share: 0.2 },
];

export default function ShiftReview() {
  const cartonCode = useCartonCode();
  const [tips, setTips] = useState<number | null>(null);
  const [padOpen, setPadOpen] = useState(false);

  const close = () => {
    if (tips == null) {
      toast.error("Declare cash tips first.");
      return;
    }
    const split = POOL.map((p) => ({ ...p, amount: +(tips * p.share).toFixed(2) }));
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: { declaredCashTips: tips, split, closedAt: new Date().toISOString() },
    });
    setShiftClockedIn(false);
    setShiftLocation(null);
    toast.success("Shift closed");
    setTips(null);
  };

  const split = tips != null ? POOL.map((p) => ({ ...p, amount: tips * p.share })) : POOL.map((p) => ({ ...p, amount: 0 }));

  return (
    <PicoCard title="Shift Review" subtitle="Declare tips, review split, sign & close">
      <button
        onClick={() => setPadOpen(true)}
        className="h-16 rounded-2xl bg-secondary text-left px-4"
      >
        <p className="text-[11px] text-muted-foreground">Declared Cash Tips</p>
        <p className="text-[18px] font-semibold tabular-nums">
          {tips != null ? `$${tips.toFixed(2)}` : "Tap to enter"}
        </p>
      </button>
      <div className="rounded-2xl border overflow-hidden">
        <div className="grid grid-cols-3 bg-secondary text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-2">
          <span>Role</span>
          <span className="text-right">Share</span>
          <span className="text-right">Amount</span>
        </div>
        {split.map((r) => (
          <div key={r.name} className="grid grid-cols-3 px-4 py-2 text-[13px]">
            <span>{r.name}</span>
            <span className="text-right tabular-nums">{(r.share * 100).toFixed(0)}%</span>
            <span className="text-right tabular-nums">${r.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <ActionButton onClick={close}>Sign & Close Shift</ActionButton>
      <Numpad
        open={padOpen}
        title="Declared Cash Tips"
        mode="currency"
        onCancel={() => setPadOpen(false)}
        onSubmit={(v) => {
          setTips(Number(v));
          setPadOpen(false);
        }}
      />
    </PicoCard>
  );
}
