/**
 * Kitchen Display System Pico-Bites.
 * Backed by public.kds_stations / kds_devices / kds_tickets / kds_ticket_items.
 * Realtime updates via Supabase channels. RLS scopes every read/write to the
 * caller's business_id (see migration policies).
 *
 * No mock data. Every action persists.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { supabase } from "@/integrations/supabase/client";
import { useActiveBusinessId } from "@/lib/idia/ActiveBusinessContext";
import { HardwareStorage } from "@/components/nanobites/system/TerminalProvisionGate";
import { ActionButton, PicoCard } from "./primitives";

// ---------- Types --------------------------------------------------------
type Station = {
  id: string;
  name: string;
  is_expediter: boolean;
  sort_order: number;
};
type TicketItem = {
  id: string;
  ticket_id: string;
  name: string;
  quantity: number;
  station_id: string | null;
  status: "pending" | "fulfilled";
  course: number;
  modifiers: unknown;
};
type Ticket = {
  id: string;
  ticket_number: string;
  table_label: string | null;
  server_name: string | null;
  order_type: string | null;
  fired_at: string;
  status: "active" | "fulfilled" | "recalled";
  fulfilled_at: string | null;
};
type DeviceRole = "expediter" | "prep";
type DeviceRow = {
  id: string;
  device_id: string;
  role: DeviceRole;
  station_ids: string[];
};

// ---------- Device identity ---------------------------------------------
function useDeviceId(): string {
  const [id] = useState(() => {
    if (typeof window === "undefined") return "server";
    const stored = HardwareStorage.getItem("idia_kds_device_id");
    if (stored) return stored;
    const fresh =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}`;
    HardwareStorage.setItem("idia_kds_device_id", fresh);
    return fresh;
  });
  return id;
}

// ---------- Shared data hook --------------------------------------------
function useKdsData(businessId: string | null, stationFilter: string[] | null) {
  const [stations, setStations] = useState<Station[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [items, setItems] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!businessId) return;
    const [stRes, tRes, iRes] = await Promise.all([
      supabase
        .from("kds_stations")
        .select("id,name,is_expediter,sort_order")
        .eq("business_id", businessId)
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("kds_tickets")
        .select(
          "id,ticket_number,table_label,server_name,order_type,fired_at,status,fulfilled_at",
        )
        .eq("business_id", businessId)
        .in("status", ["active", "recalled"])
        .order("fired_at", { ascending: true })
        .limit(200),
      supabase
        .from("kds_ticket_items")
        .select("id,ticket_id,name,quantity,station_id,status,course,modifiers")
        .eq("business_id", businessId)
        .eq("status", "pending")
        .limit(1000),
    ]);
    if (stRes.data) setStations(stRes.data as Station[]);
    if (tRes.data) setTickets(tRes.data as Ticket[]);
    if (iRes.data) setItems(iRes.data as TicketItem[]);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!businessId) return;
    const channel = supabase
      .channel(`kds-${businessId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kds_tickets",
          filter: `business_id=eq.${businessId}`,
        },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kds_ticket_items",
          filter: `business_id=eq.${businessId}`,
        },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [businessId, refresh]);

  const visibleItems = useMemo(() => {
    if (!stationFilter || stationFilter.length === 0) return items;
    return items.filter(
      (it) => it.station_id !== null && stationFilter.includes(it.station_id),
    );
  }, [items, stationFilter]);
  const visibleTicketIds = useMemo(
    () => new Set(visibleItems.map((i) => i.ticket_id)),
    [visibleItems],
  );
  const visibleTickets = useMemo(
    () =>
      stationFilter && stationFilter.length > 0
        ? tickets.filter((t) => visibleTicketIds.has(t.id))
        : tickets,
    [tickets, stationFilter, visibleTicketIds],
  );

  return {
    stations,
    tickets: visibleTickets,
    items: visibleItems,
    loading,
    refresh,
  };
}

// ---------- Device role hook --------------------------------------------
function useKdsDevice(businessId: string | null, deviceId: string) {
  const [row, setRow] = useState<DeviceRow | null>(null);
  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("kds_devices")
        .select("id,device_id,role,station_ids")
        .eq("business_id", businessId)
        .eq("device_id", deviceId)
        .maybeSingle();
      if (!cancelled) setRow((data as DeviceRow | null) ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [businessId, deviceId]);
  return [row, setRow] as const;
}

// Explicit INSERT-or-UPDATE (no upsert per project rule).
async function saveDeviceRole(params: {
  businessId: string;
  deviceId: string;
  role: DeviceRole;
  stationIds: string[];
  existingId: string | null;
}) {
  if (params.existingId) {
    const { data, error } = await supabase
      .from("kds_devices")
      .update({
        role: params.role,
        station_ids: params.stationIds,
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", params.existingId)
      .select("id,device_id,role,station_ids")
      .single();
    if (error) throw error;
    return data as DeviceRow;
  }
  const { data, error } = await supabase
    .from("kds_devices")
    .insert({
      business_id: params.businessId,
      device_id: params.deviceId,
      role: params.role,
      station_ids: params.stationIds,
      last_seen_at: new Date().toISOString(),
    })
    .select("id,device_id,role,station_ids")
    .single();
  if (error) throw error;
  return data as DeviceRow;
}

// ---------- KDS Board -----------------------------------------------------
export function KdsBoard({
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<
  Record<string, never>,
  { action: "bump_item" | "bump_ticket"; id: string }
>) {
  const businessId = useActiveBusinessId();
  const deviceId = useDeviceId();
  const [device] = useKdsDevice(businessId, deviceId);
  const filter =
    device && device.role === "prep" && device.station_ids.length > 0
      ? device.station_ids
      : null;
  const { stations, tickets, items, loading } = useKdsData(businessId, filter);
  const [showFulfilled, setShowFulfilled] = useState(false);
  const [recent, setRecent] = useState<Ticket[]>([]);

  useEffect(() => {
    if (!showFulfilled || !businessId) {
      setRecent([]);
      return;
    }
    void (async () => {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("kds_tickets")
        .select(
          "id,ticket_number,table_label,server_name,order_type,fired_at,status,fulfilled_at",
        )
        .eq("business_id", businessId)
        .eq("status", "fulfilled")
        .gte("fulfilled_at", since)
        .order("fulfilled_at", { ascending: false })
        .limit(20);
      setRecent((data as Ticket[] | null) ?? []);
    })();
  }, [showFulfilled, businessId, tickets.length]);

  const bumpItem = async (id: string) => {
    if (!gateSatisfied) return;
    const { error } = await supabase
      .from("kds_ticket_items")
      .update({ status: "fulfilled", fulfilled_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    onAction({ action: "bump_item", id });
    // If it was the last pending item on that ticket, close the ticket.
    const it = items.find((x) => x.id === id);
    if (it) {
      const remaining = items.filter(
        (x) => x.ticket_id === it.ticket_id && x.id !== id,
      );
      if (remaining.length === 0) {
        await supabase
          .from("kds_tickets")
          .update({
            status: "fulfilled",
            fulfilled_at: new Date().toISOString(),
          })
          .eq("id", it.ticket_id);
      }
    }
  };

  const bumpTicket = async (ticketId: string) => {
    if (!gateSatisfied) return;
    const now = new Date().toISOString();
    const { error: e1 } = await supabase
      .from("kds_ticket_items")
      .update({ status: "fulfilled", fulfilled_at: now })
      .eq("ticket_id", ticketId)
      .eq("status", "pending");
    if (e1) return toast.error(e1.message);
    const { error: e2 } = await supabase
      .from("kds_tickets")
      .update({ status: "fulfilled", fulfilled_at: now })
      .eq("id", ticketId);
    if (e2) return toast.error(e2.message);
    onAction({ action: "bump_ticket", id: ticketId });
  };

  const unfulfill = async (ticketId: string) => {
    const { error: e1 } = await supabase
      .from("kds_tickets")
      .update({ status: "active", fulfilled_at: null })
      .eq("id", ticketId);
    if (e1) return toast.error(e1.message);
    await supabase
      .from("kds_ticket_items")
      .update({ status: "pending", fulfilled_at: null })
      .eq("ticket_id", ticketId);
    toast.success("Un-fulfilled");
  };

  const stationName = (sid: string | null) =>
    stations.find((s) => s.id === sid)?.name ?? "—";

  return (
    <PicoCard
      title="KDS Board"
      subtitle={
        device
          ? device.role === "expediter"
            ? "Expediter"
            : `Prep · ${device.station_ids.length} station(s)`
          : "Unassigned device"
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {loading
            ? "Loading…"
            : `${tickets.length} active · ${items.length} pending`}
        </span>
        <button
          onClick={() => setShowFulfilled((s) => !s)}
          className="text-[11px] underline text-muted-foreground"
        >
          {showFulfilled ? "Hide" : "Show"} recently fulfilled
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[520px] overflow-auto">
        {tickets.map((t) => {
          const its = items.filter((i) => i.ticket_id === t.id);
          const age = Math.floor(
            (Date.now() - new Date(t.fired_at).getTime()) / 1000,
          );
          const ageColor =
            age > 600
              ? "text-destructive"
              : age > 300
                ? "text-amber-600"
                : "text-emerald-600";
          return (
            <div
              key={t.id}
              className={`rounded-xl p-2 border ${t.status === "recalled" ? "border-destructive" : "border-border"} bg-secondary/40 flex flex-col gap-1`}
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-[13px] font-bold">
                    #{t.ticket_number}
                    {t.status === "recalled" && (
                      <span className="ml-1 text-[10px] text-destructive">
                        RECALLED
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {t.table_label ?? t.order_type ?? "—"}
                    {t.server_name ? ` · ${t.server_name}` : ""}
                  </div>
                </div>
                <div className={`text-[11px] tabular-nums ${ageColor}`}>
                  {Math.floor(age / 60)}:
                  {String(age % 60).padStart(2, "0")}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {its.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => void bumpItem(it.id)}
                    disabled={!gateSatisfied}
                    className="text-left p-1.5 rounded-md bg-background text-[12px] flex items-center justify-between disabled:opacity-40"
                  >
                    <span>
                      <span className="tabular-nums font-semibold">
                        {it.quantity}×
                      </span>{" "}
                      {it.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {stationName(it.station_id)}
                    </span>
                  </button>
                ))}
                {its.length === 0 && (
                  <span className="text-[11px] text-muted-foreground italic">
                    No items for this station.
                  </span>
                )}
              </div>
              <ActionButton
                onClick={() => void bumpTicket(t.id)}
                disabled={!gateSatisfied || its.length === 0}
                className="text-[12px] py-1 mt-1"
              >
                Bump All
              </ActionButton>
            </div>
          );
        })}
        {!loading && tickets.length === 0 && (
          <span className="text-[12px] text-muted-foreground col-span-full text-center py-6">
            No active tickets.
          </span>
        )}
      </div>

      {showFulfilled && (
        <div className="mt-2 border-t pt-2 flex flex-col gap-1 max-h-[160px] overflow-auto">
          <div className="text-[11px] font-semibold text-emerald-700">
            Recently fulfilled (last hour)
          </div>
          {recent.map((t) => (
            <button
              key={t.id}
              onClick={() => void unfulfill(t.id)}
              className="flex items-center justify-between p-1.5 rounded-md bg-emerald-50 text-[12px]"
            >
              <span>
                #{t.ticket_number} · {t.table_label ?? t.order_type ?? "—"}
              </span>
              <span className="text-[10px] text-muted-foreground">Un-fulfill</span>
            </button>
          ))}
          {recent.length === 0 && (
            <span className="text-[11px] text-muted-foreground italic">
              None in the last hour.
            </span>
          )}
        </div>
      )}
    </PicoCard>
  );
}

// ---------- All Day View --------------------------------------------------
export function KdsAllDayView({
  onAction,
}: PicoBiteProps<Record<string, never>, { totals: Record<string, number> }>) {
  const businessId = useActiveBusinessId();
  const deviceId = useDeviceId();
  const [device] = useKdsDevice(businessId, deviceId);
  const filter =
    device && device.role === "prep" && device.station_ids.length > 0
      ? device.station_ids
      : null;
  const { items, loading } = useKdsData(businessId, filter);

  const totals = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const it of items)
      acc[it.name] = (acc[it.name] ?? 0) + (it.quantity ?? 1);
    return acc;
  }, [items]);

  useEffect(() => {
    onAction({ totals });
  }, [totals, onAction]);

  const rows = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  return (
    <PicoCard title="All Day View" subtitle="Active items">
      {loading ? (
        <span className="text-[11px] text-muted-foreground">Loading…</span>
      ) : rows.length === 0 ? (
        <span className="text-[12px] text-muted-foreground italic">
          Nothing pending.
        </span>
      ) : (
        <div className="flex flex-col gap-1 max-h-[380px] overflow-auto">
          {rows.map(([name, qty]) => (
            <div
              key={name}
              className="flex items-center justify-between p-2 rounded-md bg-secondary text-[13px]"
            >
              <span>{name}</span>
              <span className="tabular-nums font-bold">{qty}</span>
            </div>
          ))}
        </div>
      )}
    </PicoCard>
  );
}

// ---------- Recall ---------------------------------------------------------
export function KdsRecall({
  onAction,
}: PicoBiteProps<Record<string, never>, { ticketId: string }>) {
  const businessId = useActiveBusinessId();
  const [busy, setBusy] = useState(false);

  const recall = async () => {
    if (!businessId) return;
    setBusy(true);
    try {
      const { data } = await supabase
        .from("kds_tickets")
        .select("id,ticket_number")
        .eq("business_id", businessId)
        .eq("status", "fulfilled")
        .order("fulfilled_at", { ascending: false })
        .limit(1);
      const target = data?.[0];
      if (!target) {
        toast.info("No fulfilled tickets to recall.");
        return;
      }
      const { error: e1 } = await supabase
        .from("kds_tickets")
        .update({
          status: "recalled",
          fulfilled_at: null,
          recalled_at: new Date().toISOString(),
        })
        .eq("id", target.id);
      if (e1) throw e1;
      await supabase
        .from("kds_ticket_items")
        .update({ status: "pending", fulfilled_at: null })
        .eq("ticket_id", target.id);
      toast.success(`Recalled #${target.ticket_number}`);
      onAction({ ticketId: target.id });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PicoCard title="Recall" subtitle="Re-open the most recent fulfilled ticket">
      <ActionButton onClick={() => void recall()} disabled={busy} className="h-14">
        {busy ? "Recalling…" : "Recall Last Ticket"}
      </ActionButton>
    </PicoCard>
  );
}

// ---------- Device Setup --------------------------------------------------
export function KdsDeviceSetup({
  onAction,
}: PicoBiteProps<
  Record<string, never>,
  { role: DeviceRole; stationIds: string[] }
>) {
  const businessId = useActiveBusinessId();
  const deviceId = useDeviceId();
  const [device, setDevice] = useKdsDevice(businessId, deviceId);
  const { stations } = useKdsData(businessId, null);
  const [role, setRole] = useState<DeviceRole>(device?.role ?? "expediter");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(device?.station_ids ?? []),
  );

  useEffect(() => {
    if (device) {
      setRole(device.role);
      setSelected(new Set(device.station_ids));
    }
  }, [device]);

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    if (!businessId) return;
    try {
      const stationIds = role === "prep" ? Array.from(selected) : [];
      const saved = await saveDeviceRole({
        businessId,
        deviceId,
        role,
        stationIds,
        existingId: device?.id ?? null,
      });
      setDevice(saved);
      toast.success("Device saved");
      onAction({ role, stationIds });
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <PicoCard title="KDS Device Setup" subtitle={`Device ${deviceId.slice(0, 8)}…`}>
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          variant={role === "expediter" ? "primary" : "ghost"}
          onClick={() => setRole("expediter")}
        >
          Expediter
        </ActionButton>
        <ActionButton
          variant={role === "prep" ? "primary" : "ghost"}
          onClick={() => setRole("prep")}
        >
          Prep Station
        </ActionButton>
      </div>
      {role === "prep" && (
        <div className="flex flex-col gap-1 mt-2">
          <div className="text-[11px] text-muted-foreground">
            Show items routed to:
          </div>
          {stations.map((s) => (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={`flex items-center justify-between p-2 rounded-md text-[12px] ${
                selected.has(s.id) ? "bg-primary/15" : "bg-secondary"
              }`}
            >
              <span>{s.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {selected.has(s.id) ? "✓" : ""}
              </span>
            </button>
          ))}
          {stations.length === 0 && (
            <span className="text-[11px] text-muted-foreground italic">
              No stations yet.
            </span>
          )}
        </div>
      )}
      <ActionButton onClick={() => void save()} className="mt-2">
        Save
      </ActionButton>
    </PicoCard>
  );
}

// ---------- Fire Ticket (POS-side) ---------------------------------------
type FireCartItem = {
  id?: string;
  label: string;
  quantity?: number;
  station_id?: string | null;
};
export function KdsFireTicket({
  config,
  onAction,
  gateSatisfied = true,
}: PicoBiteProps<
  {
    cart?: FireCartItem[];
    table_label?: string;
    server_name?: string;
    order_type?: string;
  },
  { ticketId: string }
>) {
  const businessId = useActiveBusinessId();
  const [busy, setBusy] = useState(false);
  const [firedAt, setFiredAt] = useState<number | null>(null);
  const cart = config.cart ?? [];

  const fire = async () => {
    if (!businessId) {
      toast.error("No business context");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setBusy(true);
    try {
      // 1. Fetch routes + default station in one round-trip.
      const [routesRes, stationsRes] = await Promise.all([
        supabase
          .from("menu_item_station_routes")
          .select("menu_item_id,menu_item_name,station_id")
          .eq("business_id", businessId),
        supabase
          .from("kds_stations")
          .select("id,is_expediter,sort_order")
          .eq("business_id", businessId)
          .eq("active", true)
          .order("sort_order", { ascending: true }),
      ]);
      const routes = routesRes.data ?? [];
      const stations = stationsRes.data ?? [];
      const defaultStation =
        stations.find((s) => !s.is_expediter)?.id ??
        stations[0]?.id ??
        null;

      // 2. Create ticket.
      const ticket_number = `T-${Date.now().toString().slice(-5)}`;
      const { data: t, error: tErr } = await supabase
        .from("kds_tickets")
        .insert({
          business_id: businessId,
          ticket_number,
          source: "pos",
          order_type: config.order_type ?? null,
          table_label: config.table_label ?? null,
          server_name: config.server_name ?? null,
        })
        .select("id")
        .single();
      if (tErr || !t) throw tErr ?? new Error("Ticket insert failed");

      // 3. Resolve station per item + insert items.
      const rows = cart.map((it, idx) => {
        const routed = routes.find(
          (r) =>
            (it.id && r.menu_item_id === it.id) ||
            (!it.id && r.menu_item_name === it.label),
        );
        return {
          ticket_id: t.id,
          business_id: businessId,
          menu_item_id: it.id ?? null,
          name: it.label,
          quantity: it.quantity ?? 1,
          station_id: it.station_id ?? routed?.station_id ?? defaultStation,
          sort_order: idx,
        };
      });
      const { error: iErr } = await supabase
        .from("kds_ticket_items")
        .insert(rows);
      if (iErr) throw iErr;

      setFiredAt(Date.now());
      onAction({ ticketId: t.id });
      toast.success(`Fired ${ticket_number}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PicoCard title="Fire Ticket to KDS" subtitle={`${cart.length} item(s)`}>
      <ActionButton
        onClick={() => void fire()}
        disabled={!gateSatisfied || busy || cart.length === 0}
        className="h-16 text-lg"
      >
        {busy ? "Firing…" : "Fire Ticket"}
      </ActionButton>
      {firedAt && (
        <p className="text-[11px] text-emerald-600">
          Sent {new Date(firedAt).toLocaleTimeString()}
        </p>
      )}
    </PicoCard>
  );
}
