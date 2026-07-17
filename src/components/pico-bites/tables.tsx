/**
 * Table Service Pico-Bites — Toast FOH "Manage Tables" coverage.
 * Stateless: derive table state from `config.tables` (Hub-provided) or
 * default demo layout. All intent flows through `onAction`.
 */
import { useState } from "react";
import { toast } from "sonner";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { ActionButton, PicoCard, Numpad, ManagerAuth } from "./primitives";

type TableStatus = "open" | "seated" | "paid";
type Table = { id: string; label: string; status: TableStatus; seatedAt?: number };

const STATUS_CLASSES: Record<TableStatus, string> = {
  open: "bg-secondary text-foreground",
  seated: "bg-primary text-primary-foreground",
  paid: "bg-emerald-500/20 text-emerald-700",
};

// ---------- 2.1 Floor Plan -----------------------------------------------
export function FloorPlan({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ tables?: Table[] }, { tableId: string; status: TableStatus }>) {
  const tables: Table[] = config.tables ?? [
    { id: "T1", label: "T1", status: "open" },
    { id: "T2", label: "T2", status: "seated", seatedAt: Date.now() - 600_000 },
    { id: "T3", label: "T3", status: "paid" },
    { id: "T4", label: "T4", status: "open" },
    { id: "T5", label: "T5", status: "seated", seatedAt: Date.now() - 1_200_000 },
    { id: "T6", label: "T6", status: "open" },
  ];
  return (
    <PicoCard title="Floor Plan" subtitle="Tap a table to open">
      <div className="grid grid-cols-3 gap-2">
        {tables.map((t) => (
          <button
            key={t.id}
            disabled={!gateSatisfied}
            onClick={() => onAction({ tableId: t.id, status: t.status })}
            className={`aspect-square rounded-2xl font-semibold text-[15px] flex flex-col items-center justify-center ${STATUS_CLASSES[t.status]}`}
          >
            <span>{t.label}</span>
            <span className="text-[10px] opacity-70 uppercase">{t.status}</span>
          </button>
        ))}
      </div>
    </PicoCard>
  );
}

// ---------- 2.2 Table Timer ----------------------------------------------
export function TableTimer({
  config,
  onAction,
}: PicoBiteProps<{ tables?: Table[]; thresholdSec?: number }, { tableId: string; alert: true }>) {
  const threshold = config.thresholdSec ?? 1800;
  const tables = (config.tables ?? []).filter((t) => t.status === "seated");
  const [now] = useState(Date.now());
  return (
    <PicoCard title="Table Timers" subtitle="Seated duration">
      <div className="flex flex-col gap-2">
        {tables.length === 0 && (
          <p className="text-[12px] text-muted-foreground text-center py-4">No seated tables</p>
        )}
        {tables.map((t) => {
          const age = t.seatedAt ? Math.floor((now - t.seatedAt) / 1000) : 0;
          const late = age > threshold;
          return (
            <button
              key={t.id}
              onClick={() => late && onAction({ tableId: t.id, alert: true })}
              className={`min-h-[40px] rounded-xl px-3 flex items-center justify-between ${
                late ? "bg-destructive text-destructive-foreground" : "bg-secondary"
              }`}
            >
              <span className="font-semibold">{t.label}</span>
              <span className="tabular-nums text-[12px]">
                {Math.floor(age / 60)}:{String(age % 60).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>
    </PicoCard>
  );
}

// ---------- 2.3 Seat Assignment ------------------------------------------
export function SeatAssignment({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ partySize?: number }, { seat: number }>) {
  const partySize = config.partySize ?? 4;
  const [active, setActive] = useState<number | null>(null);
  return (
    <PicoCard title="Order by Seat" subtitle={`Party of ${partySize}`}>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: partySize }).map((_, i) => {
          const n = i + 1;
          const on = active === n;
          return (
            <button
              key={n}
              disabled={!gateSatisfied}
              onClick={() => {
                setActive(n);
                onAction({ seat: n });
              }}
              className={`aspect-square rounded-xl font-semibold ${on ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </PicoCard>
  );
}

// ---------- 2.4 Party Size -----------------------------------------------
export function PartySize({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<Record<string, never>, { size: number }>) {
  const [pad, setPad] = useState(false);
  const [size, setSize] = useState<number | null>(null);
  return (
    <PicoCard title="Party Size" subtitle="Guest count for the table">
      <ActionButton disabled={!gateSatisfied} onClick={() => setPad(true)}>
        {size ? `Party of ${size}` : "Enter Party Size"}
      </ActionButton>
      <Numpad
        open={pad}
        title="Guest count"
        mode="pin"
        maxLength={2}
        onCancel={() => setPad(false)}
        onSubmit={(v) => {
          const n = parseInt(v, 10) || 0;
          setSize(n);
          onAction({ size: n });
          setPad(false);
        }}
      />
    </PicoCard>
  );
}

// ---------- 2.5 Table Transfer -------------------------------------------
export function TableTransfer({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<{ tables?: Table[] }, { fromTable: string; toTable: string; managerAuthed: true }>) {
  const tables = config.tables ?? [
    { id: "T1", label: "T1", status: "open" as TableStatus },
    { id: "T2", label: "T2", status: "seated" as TableStatus },
    { id: "T3", label: "T3", status: "open" as TableStatus },
    { id: "T4", label: "T4", status: "open" as TableStatus },
  ];
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [auth, setAuth] = useState(false);
  const pick = (id: string) => {
    if (!from) setFrom(id);
    else if (id !== from) setTo(id);
  };
  return (
    <PicoCard title="Table Transfer" subtitle="Manager PIN required">
      <p className="text-[11px] text-muted-foreground">
        {from ? (to ? `${from} → ${to}` : `From ${from} · pick destination`) : "Pick source table"}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {tables.map((t) => (
          <button
            key={t.id}
            disabled={!gateSatisfied}
            onClick={() => pick(t.id)}
            className={`aspect-square rounded-xl font-semibold ${
              t.id === from || t.id === to ? "bg-primary text-primary-foreground" : "bg-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          variant="ghost"
          onClick={() => {
            setFrom(null);
            setTo(null);
          }}
        >
          Reset
        </ActionButton>
        <ActionButton disabled={!from || !to} onClick={() => setAuth(true)}>
          Transfer
        </ActionButton>
      </div>
      <ManagerAuth
        open={auth}
        title="Approve transfer"
        onCancel={() => setAuth(false)}
        onAuthed={() => {
          if (from && to) {
            onAction({ fromTable: from, toTable: to, managerAuthed: true });
            toast.success(`Transferred ${from} → ${to}`);
          }
          setAuth(false);
          setFrom(null);
          setTo(null);
        }}
      />
    </PicoCard>
  );
}
