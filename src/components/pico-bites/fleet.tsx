/**
 * Fleet Pico-Bites.
 */
import { useState } from "react";
import { toast } from "sonner";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import {
  ActionButton,
  ManagerAuth,
  Numpad,
  PicoCard,
  setShiftClockedIn,
  setShiftLocation,
  useShiftLock,
} from "./primitives";

// ---------- 4.1 GPS Check-In ---------------------------------------------
export function GpsCheckIn({
  config,
  onAction,
}: PicoBiteProps<{ locations?: string[] }, { location: string; coords?: { lat: number; lng: number } }>) {
  const { location } = useShiftLock();
  const [busy, setBusy] = useState(false);
  const lock = (label: string) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setShiftLocation(label);
      onAction({ location: label });
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const coords = { lat: p.coords.latitude, lng: p.coords.longitude };
        setShiftLocation(label, coords);
        onAction({ location: label, coords });
        setBusy(false);
      },
      () => {
        setShiftLocation(label);
        onAction({ location: label });
        setBusy(false);
        toast.warning("GPS unavailable — locked without coordinates.");
      },
      { timeout: 8000 },
    );
  };
  const list = config.locations ?? [];
  return (
    <PicoCard title="GPS Check-In" subtitle={location ? `Locked · ${location}` : "Pick a location"}>
      <div className="flex flex-col gap-2">
        {list.map((l) => (
          <ActionButton
            key={l}
            variant={location === l ? "primary" : "ghost"}
            disabled={busy}
            onClick={() => lock(l)}
          >
            {location === l ? `✓ ${l}` : l}
          </ActionButton>
        ))}
        {location && (
          <ActionButton
            variant="ghost"
            onClick={() => {
              setShiftLocation(null);
              onAction({ location: "" });
            }}
          >
            Clear
          </ActionButton>
        )}
      </div>
    </PicoCard>
  );
}

// ---------- 4.2 Time Punch -----------------------------------------------
export function TimePunch({
  onAction,
}: PicoBiteProps<Record<string, never>, { clockedIn: boolean; at: string }>) {
  const { clockedIn } = useShiftLock();
  const toggle = () => {
    const next = !clockedIn;
    setShiftClockedIn(next);
    onAction({ clockedIn: next, at: new Date().toISOString() });
  };
  return (
    <PicoCard title="Time Punch" subtitle={clockedIn ? "Clocked in" : "Off shift"}>
      <ActionButton
        variant={clockedIn ? "danger" : "primary"}
        onClick={toggle}
        className="h-16 text-lg"
      >
        {clockedIn ? "Clock Out" : "Clock In"}
      </ActionButton>
    </PicoCard>
  );
}

// ---------- 4.3 Mid-Shift Cash Drop --------------------------------------
export function MidShiftDrop({
  onAction,
}: PicoBiteProps<Record<string, never>, { amount: number; managerAuthed: true }>) {
  const [pad, setPad] = useState(false);
  const [auth, setAuth] = useState<number | null>(null);
  return (
    <PicoCard title="Mid-Shift Drop" subtitle="Manager approval required">
      <ActionButton onClick={() => setPad(true)}>Enter Drop Amount</ActionButton>
      <Numpad
        open={pad}
        title="Cash drop"
        mode="currency"
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          setPad(false);
          setAuth(parseFloat(v) || 0);
        }}
      />
      <ManagerAuth
        open={auth !== null}
        title="Approve cash drop"
        onCancel={() => setAuth(null)}
        onAuthed={() => {
          if (auth != null) onAction({ amount: auth, managerAuthed: true });
          setAuth(null);
        }}
      />
    </PicoCard>
  );
}

// ---------- 4.4 Shift Review (close-out) ---------------------------------
export function ShiftReview({
  onAction,
}: PicoBiteProps<{ sales?: number; drops?: number }, { closedAt: string; managerAuthed: true }>) {
  const [auth, setAuth] = useState(false);
  return (
    <PicoCard title="Shift Review" subtitle="End-of-shift close-out">
      <ActionButton variant="danger" onClick={() => setAuth(true)}>
        Close Shift
      </ActionButton>
      <ManagerAuth
        open={auth}
        title="Close shift"
        onCancel={() => setAuth(false)}
        onAuthed={() => {
          onAction({ closedAt: new Date().toISOString(), managerAuthed: true });
          setAuth(false);
        }}
      />
    </PicoCard>
  );
}

// ---------- 4.5 Cash Pay-Out ---------------------------------------------
const PAYOUT_CATEGORIES = ["Tips", "Vendor", "Supplies", "Petty Cash"] as const;
export function CashPayout({
  onAction,
}: PicoBiteProps<Record<string, never>, { amount: number; category: string; managerAuthed: true }>) {
  const [pad, setPad] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [auth, setAuth] = useState(false);
  return (
    <PicoCard title="Cash Pay-Out" subtitle="Log cash out of drawer">
      <ActionButton onClick={() => setPad(true)}>
        {amount != null ? `Amount $${amount.toFixed(2)}` : "Enter Amount"}
      </ActionButton>
      <div className="grid grid-cols-2 gap-1">
        {PAYOUT_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`p-2 rounded-lg text-[12px] font-semibold ${
              category === c ? "bg-primary text-primary-foreground" : "bg-secondary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <ActionButton
        variant="warning"
        disabled={amount == null || amount <= 0 || !category}
        onClick={() => setAuth(true)}
      >
        Approve Pay-Out
      </ActionButton>
      <Numpad
        open={pad}
        title="Pay-out amount"
        mode="currency"
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          setAmount(parseFloat(v) || 0);
          setPad(false);
        }}
      />
      <ManagerAuth
        open={auth}
        title="Approve pay-out"
        onCancel={() => setAuth(false)}
        onAuthed={() => {
          if (amount != null && category) {
            onAction({ amount, category, managerAuthed: true });
            toast.success(`Pay-out logged $${amount.toFixed(2)}`);
          }
          setAuth(false);
          setAmount(null);
          setCategory(null);
        }}
      />
    </PicoCard>
  );
}

// ---------- 4.6 Deposit Envelope -----------------------------------------
export function DepositEnvelope({
  onAction,
}: PicoBiteProps<Record<string, never>, { total: number; envelopeNo: string; managerAuthed: true }>) {
  const [pad, setPad] = useState<null | "total" | "env">(null);
  const [total, setTotal] = useState<number | null>(null);
  const [envelope, setEnvelope] = useState<string | null>(null);
  const [auth, setAuth] = useState(false);
  return (
    <PicoCard title="Deposit Envelope" subtitle="Finalize bank deposit">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setPad("total")} className="p-3 rounded-xl bg-secondary text-left">
          <div className="text-[10px] uppercase text-muted-foreground">Total</div>
          <div className="text-[16px] font-semibold tabular-nums">
            {total != null ? `$${total.toFixed(2)}` : "—"}
          </div>
        </button>
        <button onClick={() => setPad("env")} className="p-3 rounded-xl bg-secondary text-left">
          <div className="text-[10px] uppercase text-muted-foreground">Envelope #</div>
          <div className="text-[14px] font-semibold">{envelope ?? "Enter"}</div>
        </button>
      </div>
      <ActionButton
        variant="danger"
        disabled={total == null || total <= 0 || !envelope}
        onClick={() => setAuth(true)}
      >
        Seal & Finalize
      </ActionButton>
      <Numpad
        open={pad === "total"}
        title="Deposit total"
        mode="currency"
        onCancel={() => setPad(null)}
        onSubmit={(v) => {
          setTotal(parseFloat(v) || 0);
          setPad(null);
        }}
      />
      <Numpad
        open={pad === "env"}
        title="Envelope number"
        mode="pin"
        maxLength={8}
        onCancel={() => setPad(null)}
        onSubmit={(v) => {
          setEnvelope(v);
          setPad(null);
        }}
      />
      <ManagerAuth
        open={auth}
        title="Seal deposit"
        onCancel={() => setAuth(false)}
        onAuthed={() => {
          if (total != null && envelope) {
            onAction({ total, envelopeNo: envelope, managerAuthed: true });
            toast.success("Deposit sealed");
          }
          setAuth(false);
          setTotal(null);
          setEnvelope(null);
        }}
      />
    </PicoCard>
  );
}
