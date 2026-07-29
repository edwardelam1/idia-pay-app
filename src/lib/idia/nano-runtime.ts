/**
 * Nano-Bite runtime — the localized "nervous system" for a Pico-Bite dock.
 *
 * Pico-Bites never talk to each other, never read storage, and never fetch
 * context. They fire `onAction(tag, payload)`. The Nano-Bite container feeds
 * that event into this pure reducer, and the resulting ephemeral state is
 * projected back down into every sibling's `config` prop.
 *
 *   Numpad ──onAction──► reducer ──► state ──► projectConfig ──► CartPane
 *
 * Nothing here persists. Nothing here invents data: every value is derived
 * from a real user action plus the Hub-published manifest config of the bite
 * that emitted it.
 */

export type RuntimeLine = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

export type NanoRuntimeState = {
  lines: RuntimeLine[];
  selectedLineId: string | null;
  /** Raw keypad/entry buffer submitted by an input bite. */
  entryBuffer: string | null;
  taxRate: number;
  subtotal: number;
  discount: number;
  tax: number;
  tipAmount: number;
  total: number;
  tenderAmount: number;
  amountDue: number;
  changeDue: number;
  customer: { id?: string; name?: string } | null;
  lastScan: string | null;
  stage: "building" | "tendering" | "complete";
};

export const initialNanoRuntime: NanoRuntimeState = {
  lines: [],
  selectedLineId: null,
  entryBuffer: null,
  taxRate: 0,
  subtotal: 0,
  discount: 0,
  tax: 0,
  tipAmount: 0,
  total: 0,
  tenderAmount: 0,
  amountDue: 0,
  changeDue: 0,
  customer: null,
  lastScan: null,
  stage: "building",
};

export type NanoRuntimeEvent = {
  /** Canonical `pico.*` telemetry tag of the emitting bite. */
  tag: string;
  payload: unknown;
  /** Manifest config of the emitting bite (catalog lookups, tax rate, …). */
  sourceConfig?: Record<string, unknown>;
};

type Payload = Record<string, unknown>;

const asRecord = (v: unknown): Payload =>
  v && typeof v === "object" ? (v as Payload) : {};

const num = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Recomputes every derived money field from lines + modifiers. */
function recompute(state: NanoRuntimeState): NanoRuntimeState {
  const subtotal = round2(
    state.lines.reduce((sum, l) => sum + l.qty * l.price, 0),
  );
  const discount = Math.min(state.discount, subtotal);
  const taxable = Math.max(subtotal - discount, 0);
  const tax = round2(taxable * state.taxRate);
  const total = round2(taxable + tax + state.tipAmount);
  const amountDue = round2(Math.max(total - state.tenderAmount, 0));
  const changeDue = round2(Math.max(state.tenderAmount - total, 0));
  return {
    ...state,
    subtotal,
    discount,
    tax,
    total,
    amountDue,
    changeDue,
    stage:
      state.tenderAmount > 0 && amountDue === 0 && total > 0
        ? "complete"
        : state.tenderAmount > 0
          ? "tendering"
          : "building",
  };
}

/** Resolves a catalog entry from the emitting bite's manifest config. */
function catalogLookup(
  sourceConfig: Record<string, unknown> | undefined,
  id: string,
): { name: string; price: number } | null {
  const pools = [
    sourceConfig?.items,
    sourceConfig?.results,
    sourceConfig?.tiles,
    sourceConfig?.products,
  ];
  for (const pool of pools) {
    if (!Array.isArray(pool)) continue;
    const hit = (pool as Payload[]).find((i) => String(i?.id) === id);
    if (hit) {
      return {
        name: String(hit.name ?? hit.label ?? id),
        price: num(hit.price) ?? 0,
      };
    }
  }
  return null;
}

function addLine(
  state: NanoRuntimeState,
  line: { id: string; name: string; price: number; qty?: number },
): NanoRuntimeState {
  const qty = line.qty ?? 1;
  const existing = state.lines.find((l) => l.id === line.id);
  const lines = existing
    ? state.lines.map((l) =>
        l.id === line.id ? { ...l, qty: l.qty + qty } : l,
      )
    : [...state.lines, { id: line.id, name: line.name, qty, price: line.price }];
  return { ...state, lines, selectedLineId: line.id };
}

export function nanoRuntimeReducer(
  state: NanoRuntimeState,
  event: NanoRuntimeEvent,
): NanoRuntimeState {
  const p = asRecord(event.payload);
  const action = typeof p.action === "string" ? p.action : "";
  const cfg = event.sourceConfig;

  // A bite may publish the tax rate the terminal should apply.
  const declaredTax = num(cfg?.taxRate);
  const base =
    declaredTax !== null && declaredTax !== state.taxRate
      ? { ...state, taxRate: declaredTax }
      : state;

  switch (event.tag) {
    // ── Value entry ───────────────────────────────────────────────
    case "pico.input.numpad":
    case "pico.input.pin_pad":
    case "pico.input.keyboard": {
      if (action !== "submit_value" && action !== "submit") return base;
      const raw = p.value;
      const value = num(raw);
      const next: NanoRuntimeState = {
        ...base,
        entryBuffer: raw === undefined || raw === null ? null : String(raw),
      };
      // A numeric entry during tender is a tender amount; otherwise it is a
      // quantity override for the selected line.
      if (value === null) return recompute(next);
      if (base.stage !== "building" || base.total === 0 || !base.selectedLineId) {
        return recompute({ ...next, tenderAmount: round2(value) });
      }
      return recompute({
        ...next,
        lines: next.lines.map((l) =>
          l.id === next.selectedLineId ? { ...l, qty: value } : l,
        ),
      });
    }

    // ── Cart building ─────────────────────────────────────────────
    case "pico.ui.item_grid":
    case "pico.ops.sku_lookup":
    case "pico.ui.upsell_carousel": {
      if (action !== "add_item" && action !== "select_sku" && action !== "add")
        return base;
      const id = String(p.id ?? p.sku ?? "");
      if (!id) return base;
      const found = catalogLookup(cfg, id);
      return recompute(
        addLine(base, {
          id,
          name: found?.name ?? String(p.name ?? id),
          price: found?.price ?? num(p.price) ?? 0,
          qty: num(p.qty) ?? 1,
        }),
      );
    }

    case "pico.ui.cart_pane": {
      if (action === "select_line")
        return { ...base, selectedLineId: String(p.id ?? "") || null };
      if (action === "remove_line")
        return recompute({
          ...base,
          lines: base.lines.filter((l) => l.id !== String(p.id ?? "")),
          selectedLineId: null,
        });
      return base;
    }

    // ── Modifiers ─────────────────────────────────────────────────
    case "pico.ui.discount_prompt": {
      const pct = num(p.percentage ?? p.percent);
      const amt = num(p.amount);
      if (pct !== null)
        return recompute({ ...base, discount: round2(base.subtotal * (pct / 100)) });
      if (amt !== null) return recompute({ ...base, discount: round2(amt) });
      return base;
    }

    case "pico.ui.tip_selector": {
      const pct = num(p.percentage ?? p.percent);
      const amt = num(p.amount);
      if (pct !== null)
        return recompute({ ...base, tipAmount: round2(base.subtotal * (pct / 100)) });
      if (amt !== null) return recompute({ ...base, tipAmount: round2(amt) });
      return base;
    }

    // ── Tender ────────────────────────────────────────────────────
    case "pico.pay.cash_tender":
    case "pico.pay.split_tender":
    case "pico.pay.wallet_pay":
    case "pico.pay.crypto_pay": {
      const amt = num(p.amount);
      if (amt === null) return base;
      return recompute({
        ...base,
        tenderAmount: round2(base.tenderAmount + amt),
      });
    }

    // ── Identity ──────────────────────────────────────────────────
    case "pico.crm.customer_lookup":
    case "pico.crm.new_customer":
    case "pico.crm.contact_capture": {
      const id = p.id ?? p.customerId;
      const name = p.name ?? p.label;
      if (id === undefined && name === undefined) return base;
      return {
        ...base,
        customer: {
          id: id === undefined ? undefined : String(id),
          name: name === undefined ? undefined : String(name),
        },
      };
    }

    // ── Scans ─────────────────────────────────────────────────────
    case "pico.input.barcode_scan":
    case "pico.input.qr_scan":
    case "pico.ops.bin_scan": {
      const code = p.value ?? p.code ?? p.data;
      return code === undefined ? base : { ...base, lastScan: String(code) };
    }

    default:
      return base;
  }
}

/**
 * Merges runtime-derived values over the Hub-published config for the
 * consuming bite. The manifest stays the base so Hub authorship wins for
 * anything the runtime does not own.
 */
export function projectConfig(
  tag: string,
  manifestConfig: Record<string, unknown> | undefined,
  state: NanoRuntimeState,
): Record<string, unknown> | undefined {
  const base = manifestConfig ?? {};
  const totals = {
    subtotal: state.subtotal,
    tax: state.tax,
    total: state.total,
  };

  switch (tag) {
    case "pico.ui.cart_pane":
      return { ...base, lines: state.lines, selectedLineId: state.selectedLineId };

    case "pico.ui.summary_bar":
      return { ...base, totals };

    case "pico.ui.receipt_preview":
      return { ...base, lines: state.lines, totals };

    case "pico.output.customer_display":
      return {
        ...base,
        amount: state.total || undefined,
        message: state.customer?.name ?? base.message,
      };

    case "pico.output.receipt_printer":
    case "pico.output.kitchen_printer":
      return { ...base, lines: state.lines, totals };

    case "pico.pay.cash_tender":
    case "pico.pay.split_tender":
    case "pico.pay.wallet_pay":
    case "pico.pay.crypto_pay":
      return { ...base, amountDue: state.amountDue || state.total || undefined };

    case "pico.input.numpad":
      return {
        ...base,
        title:
          state.stage === "building" && state.selectedLineId
            ? "QUANTITY"
            : state.total > 0
              ? "TENDER AMOUNT"
              : (base.title as string | undefined),
      };

    case "pico.ui.tip_selector":
      return { ...base, tipAmount: state.tipAmount, subtotal: state.subtotal };

    default:
      return manifestConfig;
  }
}
