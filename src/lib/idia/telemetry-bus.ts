/**
 * Central Telemetry Bus for IDIA Pay Pico-Bites.
 *
 * Every user tap emitted by a Pico-Bite flows here. The bus:
 *   1. Enriches the event with OS-provided context (cartonCode, businessId, screen)
 *   2. Persists a flat row to public.nano_bite_executions via recordExecution
 *   3. Notifies subscribers so reactive Pico-Bites (e.g. AutoDeduct) can react
 *
 * No mock data. No per-domain tables. One flat ledger.
 */

import { recordExecution } from "@/lib/idia/executions";

export type TelemetryEvent = {
  telemetryTag: string;
  picoBite: string;
  cartonCode: string;
  businessId?: string | null;
  screen: string;
  subModuleId: string;
  nanoBiteId: string;
  payload: unknown;
  ts: string;
};

type Subscriber = (evt: TelemetryEvent) => void;

const subscribers = new Set<Subscriber>();

export const TelemetryBus = {
  emit(evt: Omit<TelemetryEvent, "ts">): TelemetryEvent {
    const full: TelemetryEvent = { ...evt, ts: new Date().toISOString() };

    // Flat ledger insert (fire-and-forget).
    recordExecution({
      cartonCode: full.cartonCode,
      subModuleId: full.subModuleId,
      nanoBiteId: full.nanoBiteId,
      screen: full.screen,
      action: full.telemetryTag,
      payload: {
        picoBite: full.picoBite,
        businessId: full.businessId ?? null,
        ...(typeof full.payload === "object" && full.payload
          ? (full.payload as Record<string, unknown>)
          : { value: full.payload }),
      },
    });

    // Fan-out to reactive bites.
    subscribers.forEach((fn) => {
      try {
        fn(full);
      } catch (err) {
        console.warn("[TelemetryBus] subscriber threw", err);
      }
    });

    return full;
  },

  subscribe(fn: Subscriber): () => void {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
};
