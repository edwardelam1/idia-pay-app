/**
 * Payment Pico-Bites.
 */
import { useState } from "react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { ActionButton, PicoCard, Numpad } from "./primitives";

// ---------- 3.1 Contactless Tap (NFC) ------------------------------------
export function ContactlessTap({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ subtitle?: string }, { amount: number; rail: "nfc" }>) {
  const [pad, setPad] = useState(false);
  return (
    <PicoCard title="Contactless Tap" subtitle="NFC / EMV">
      <ActionButton
        onClick={() => setPad(true)}
        disabled={!gateSatisfied}
        className="h-16 text-lg"
      >
        Start Tap
      </ActionButton>
      <Numpad
        open={pad}
        title="Charge amount"
        mode="currency"
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          onAction({ amount: parseFloat(v) || 0, rail: "nfc" });
          setPad(false);
        }}
      />
    </PicoCard>
  );
}

// ---------- 3.2 Offline Fallback -----------------------------------------
export function OfflineFallback({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<Record<string, never>, { amount: number; rail: "offline" }>) {
  const [pad, setPad] = useState(false);
  return (
    <PicoCard title="Offline Fallback" subtitle="Store-and-forward">
      <ActionButton
        variant="warning"
        onClick={() => setPad(true)}
        disabled={!gateSatisfied}
      >
        Queue Offline Charge
      </ActionButton>
      <Numpad
        open={pad}
        title="Offline charge"
        mode="currency"
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          onAction({ amount: parseFloat(v) || 0, rail: "offline" });
          setPad(false);
        }}
      />
    </PicoCard>
  );
}

// ---------- 3.3 Cloud Re-Sync (batch) ------------------------------------
export function CloudReSync({
  onAction,
}: PicoBiteProps<{ pendingCount?: number }, { syncTriggered: true }>) {
  const [busy, setBusy] = useState(false);
  return (
    <PicoCard title="Cloud Re-Sync" subtitle="Batch offline queue">
      <ActionButton
        onClick={() => {
          setBusy(true);
          onAction({ syncTriggered: true });
          setTimeout(() => setBusy(false), 800);
        }}
        disabled={busy}
      >
        {busy ? "Syncing…" : "Sync Now"}
      </ActionButton>
    </PicoCard>
  );
}

// ---------- 3.4 Drawer State ---------------------------------------------
export function DrawerState({
  onAction,
}: PicoBiteProps<Record<string, never>, { state: "open" | "closed"; at: string }>) {
  const [state, setState] = useState<"open" | "closed">("closed");
  const set = (s: "open" | "closed") => {
    setState(s);
    onAction({ state: s, at: new Date().toISOString() });
  };
  return (
    <PicoCard title="Cash Drawer" subtitle={`Currently ${state}`}>
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          variant={state === "open" ? "primary" : "ghost"}
          onClick={() => set("open")}
        >
          Open
        </ActionButton>
        <ActionButton
          variant={state === "closed" ? "primary" : "ghost"}
          onClick={() => set("closed")}
        >
          Closed
        </ActionButton>
      </div>
    </PicoCard>
  );
}
