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
  const list = config.locations ?? ["Downtown Lot", "Stadium", "Market"];
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
