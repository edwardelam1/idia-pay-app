/**
 * Customer Pico-Bites — Toast "Manage Customers" coverage.
 * All lookups flow through onAction; the OS resolves the actual record
 * (e.g. profiles table read) via the telemetry bus + downstream handler.
 */
import { useState } from "react";
import { toast } from "sonner";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { ActionButton, PicoCard, Numpad } from "./primitives";

// ---------- 6.1 Guest Lookup ---------------------------------------------
export function GuestLookup({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<Record<string, never>, { query: string; kind: "phone" | "name" }>) {
  const [q, setQ] = useState("");
  return (
    <PicoCard title="Guest Lookup" subtitle="Phone or name">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search guest…"
        className="w-full p-3 rounded-xl bg-secondary text-[14px] outline-none"
      />
      <ActionButton
        disabled={!gateSatisfied || q.trim().length < 2}
        onClick={() => {
          const kind = /^\+?\d[\d\s-]+$/.test(q) ? "phone" : "name";
          onAction({ query: q.trim(), kind });
        }}
      >
        Search
      </ActionButton>
    </PicoCard>
  );
}

// ---------- 6.2 Loyalty Scan ---------------------------------------------
export function LoyaltyScan({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<Record<string, never>, { code: string; source: "scan" | "manual" }>) {
  const [pad, setPad] = useState(false);
  return (
    <PicoCard title="Loyalty" subtitle="Scan card or enter code">
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          disabled={!gateSatisfied}
          onClick={() => onAction({ code: `SCAN-${Date.now()}`, source: "scan" })}
        >
          Scan Card
        </ActionButton>
        <ActionButton variant="ghost" disabled={!gateSatisfied} onClick={() => setPad(true)}>
          Enter Code
        </ActionButton>
      </div>
      <Numpad
        open={pad}
        title="Loyalty code"
        mode="pin"
        maxLength={10}
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          onAction({ code: v, source: "manual" });
          setPad(false);
        }}
      />
    </PicoCard>
  );
}

// ---------- 6.3 Email Receipt --------------------------------------------
export function EmailReceipt({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ ticketId?: string }, { email: string; ticketId?: string }>) {
  const [email, setEmail] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return (
    <PicoCard title="Email Receipt" subtitle="Send digital receipt">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="guest@example.com"
        className="w-full p-3 rounded-xl bg-secondary text-[14px] outline-none"
      />
      <ActionButton
        disabled={!gateSatisfied || !valid}
        onClick={() => {
          onAction({ email, ticketId: undefined });
          toast.success(`Receipt sent to ${email}`);
          setEmail("");
        }}
      >
        Send Receipt
      </ActionButton>
    </PicoCard>
  );
}
