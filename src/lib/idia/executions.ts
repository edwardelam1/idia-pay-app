// IDIA Pay LiquidOS - flat execution log.
// Every Pico-Bite tap is persisted as one row in public.nano_bite_executions.
// No mock data. No per-domain tables. One flat ledger keyed by tag.

import { supabase } from "@/integrations/supabase/client";

export type ExecutionRecord = {
  id: string;
  cartonCode: string;
  subModuleId: string;
  nanoBiteId: string;
  screen: string;
  action: string;
  payload?: Record<string, unknown>;
  createdAt: string;
};

type RecordInput = Omit<ExecutionRecord, "id" | "createdAt">;

const CACHE_KEY = "idia.pay.executions.cache.v2";
const CACHE_LIMIT = 500;

function readCache(): ExecutionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as ExecutionRecord[]) : [];
  } catch {
    return [];
  }
}

function writeCache(records: ExecutionRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify(records.slice(-CACHE_LIMIT)),
    );
  } catch {
    /* quota — ignore */
  }
}

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function recordExecution(rec: RecordInput): ExecutionRecord {
  const full: ExecutionRecord = {
    ...rec,
    id: makeId(),
    createdAt: new Date().toISOString(),
  };

  // Optimistic local cache — UI updates instantly.
  const all = readCache();
  all.push(full);
  writeCache(all);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("idia:execution", { detail: full }));
  }

  // Fire-and-forget flat insert.
  void (async () => {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const { error } = await supabase.from("nano_bite_executions").insert({
        id: full.id,
        carton_code: full.cartonCode,
        sub_module_id: full.subModuleId,
        nano_bite_id: full.nanoBiteId,
        screen: full.screen,
        action: full.action,
        payload: full.payload ?? {},
        user_id: userRes?.user?.id ?? null,
        created_at: full.createdAt,
      });
      if (error) {
        console.warn(
          `[EXECUTION_FLUSH_FAIL] nb=${rec.nanoBiteId} action=${rec.action}: ${error.message}`,
        );
      }
    } catch (err) {
      console.warn("[EXECUTION_FLUSH_ERR]", err);
    }
  })();

  return full;
}

export function getExecutionsFor(
  nanoBiteId: string,
  cartonCode: string,
): ExecutionRecord[] {
  return readCache().filter(
    (r) => r.nanoBiteId === nanoBiteId && r.cartonCode === cartonCode,
  );
}

export function subscribeExecutions(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("idia:execution", handler);
  return () => window.removeEventListener("idia:execution", handler);
}
