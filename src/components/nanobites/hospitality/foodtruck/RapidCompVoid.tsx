/**
 * Pico-Bite 1.4 · hosp.ft.pos.void_comp
 * Rapid Comp/Void — swipe-left on cart item reveals Void/Comp; requires
 * manager PIN + biometric + reason code.
 */
import { useRef, useState } from "react";
import { recordExecution } from "@/lib/idia/executions";
import {
  ActionButton,
  ManagerAuth,
  type ManagerAuthResult,
  PicoCard,
  SUBMODULE_ID,
  useCartonCode,
} from "@/components/foodtruck-inputs/shared";

const NANO_BITE_ID = "hosp.ft.pos.void_comp";
const SCREEN = "POS & Order Routing";
const REASONS = ["Customer complaint", "Wrong item", "Manager comp", "Employee meal"];

type CartRow = { id: string; label: string; price: number };

const CART: CartRow[] = [
  { id: "c1", label: "Taco · Al Pastor", price: 4.5 },
  { id: "c2", label: "Burrito · Carne", price: 9.0 },
  { id: "c3", label: "Horchata", price: 3.0 },
];

export default function RapidCompVoid() {
  const cartonCode = useCartonCode();
  const [items, setItems] = useState<CartRow[]>(CART);
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const startX = useRef<Record<string, number>>({});
  const [target, setTarget] = useState<{ row: CartRow; kind: "void" | "comp" } | null>(
    null,
  );
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [authOpen, setAuthOpen] = useState(false);

  const onTouchStart = (id: string, e: React.TouchEvent) => {
    startX.current[id] = e.touches[0].clientX;
  };
  const onTouchMove = (id: string, e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - (startX.current[id] ?? 0);
    if (dx < 0) setOffsets((o) => ({ ...o, [id]: Math.max(dx, -160) }));
  };
  const onTouchEnd = (id: string) => {
    setOffsets((o) => ({ ...o, [id]: (o[id] ?? 0) < -80 ? -160 : 0 }));
  };

  const openAction = (row: CartRow, kind: "void" | "comp") => {
    setTarget({ row, kind });
  };

  const confirm = (auth: ManagerAuthResult) => {
    if (!target) return;
    recordExecution({
      cartonCode,
      subModuleId: SUBMODULE_ID,
      nanoBiteId: NANO_BITE_ID,
      screen: SCREEN,
      action: NANO_BITE_ID,
      payload: {
        cartItemId: target.row.id,
        label: target.row.label,
        kind: target.kind,
        reason,
        authMethod: `pin+${auth.method}`,
        managerPinLength: auth.pinLength,
        credentialId: auth.credentialId ?? null,
      },
    });
    setItems((cur) => cur.filter((r) => r.id !== target.row.id));
    setTarget(null);
    setAuthOpen(false);
  };

  return (
    <PicoCard title="Rapid Comp / Void" subtitle="Swipe a line item left to reveal actions">
      <div className="flex flex-col gap-2">
        {items.map((row) => {
          const off = offsets[row.id] ?? 0;
          return (
            <div key={row.id} className="relative overflow-hidden rounded-2xl bg-secondary">
              <div className="absolute inset-y-0 right-0 flex">
                <button
                  onClick={() => openAction(row, "comp")}
                  className="w-20 bg-amber-500 text-white font-semibold text-[13px]"
                >
                  Comp
                </button>
                <button
                  onClick={() => openAction(row, "void")}
                  className="w-20 bg-destructive text-destructive-foreground font-semibold text-[13px]"
                >
                  Void
                </button>
              </div>
              <div
                className="relative bg-white p-4 flex items-center justify-between transition-transform touch-pan-y"
                style={{ transform: `translateX(${off}px)` }}
                onTouchStart={(e) => onTouchStart(row.id, e)}
                onTouchMove={(e) => onTouchMove(row.id, e)}
                onTouchEnd={() => onTouchEnd(row.id)}
              >
                <span className="text-[14px] font-medium">{row.label}</span>
                <span className="text-[14px] tabular-nums">${row.price.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-[13px] text-muted-foreground text-center py-4">
            Cart cleared.
          </p>
        )}
      </div>

      {target && (
        <>
          <p className="text-[12px] font-semibold mt-2">Reason</p>
          <select
            className="h-11 rounded-xl border px-3 text-[14px] bg-white"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <ActionButton
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setTarget(null);
                setAuthOpen(false);
              }}
            >
              Cancel
            </ActionButton>
            <ActionButton
              variant="danger"
              className="flex-1"
              onClick={() => setAuthOpen(true)}
            >
              Authorize {target.kind}
            </ActionButton>
          </div>
        </>
      )}

      <ManagerAuth
        open={authOpen}
        title={`Manager · ${target?.kind.toUpperCase() ?? ""}`}
        onCancel={() => setAuthOpen(false)}
        onAuthed={confirm}
      />
    </PicoCard>
  );
}
