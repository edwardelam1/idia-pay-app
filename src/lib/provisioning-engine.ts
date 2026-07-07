import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// IDIA Provisioning Engine — Sovereign Hydration Layer
// ============================================================================

export interface BlueprintModule {
  id: string;
  name: string;
}

export interface PayAppBlueprint {
  provisioningCode: string;
  clientOrganization: string;
  verticals: string[];
  modules: {
    default: BlueprintModule[];
    custom: BlueprintModule[];
  };
  issuedAt: string;
}

// Local seed blueprint — fallback for demo / dev only.
const SEED_BLUEPRINT: PayAppBlueprint = {
  provisioningCode: "IDIA-2026-DEMO01",
  clientOrganization: "IDIA Demo Terminal",
  verticals: ["Hospitality", "Retail"],
  modules: {
    default: [
      { id: "default-pos", name: "Point of Sale" },
      { id: "default-reports", name: "Reports" },
      { id: "default-inventory", name: "Inventory" },
      { id: "default-team", name: "Team" },
      { id: "default-menu", name: "Menu" },
      { id: "default-recipes", name: "Recipes" },
      { id: "default-timesheets", name: "Timesheets" },
      { id: "default-tax", name: "Tax Center" },
    ],
    custom: [
      { id: "role-owner", name: "Owner Console" },
      { id: "role-manager", name: "Manager Console" },
      { id: "role-employee", name: "Employee Console" },
      { id: "role-warehouse", name: "Warehouse Console" },
    ],
  },
  issuedAt: new Date().toISOString(),
};

type BlueprintRow = { payload: unknown; status: string } | null;

export class ProvisioningEngine {
  static readonly STORAGE_KEY = "idia_blueprint_v1";

  static async hydrateFromHub(provisioningCode: string): Promise<PayAppBlueprint> {
    const LOG_ID = `HYDRATE_${Date.now()}`;
    console.info(
      `[BEGIN] [${LOG_ID}] ProvisioningEngine.hydrateFromHub | code: ${provisioningCode}`,
    );

    try {
      console.info(
        `[STEP] [${LOG_ID}] Invoking 'hydrate-terminal' edge function for secure RLS bypass.`,
      );

      const { data, error } = await supabase.functions.invoke("hydrate-terminal", {
        body: { pairing_code: provisioningCode },
      });

      if (error) {
        console.error(
          `[ERROR_BEGIN] [${LOG_ID}] Edge function invocation failed. [ERROR_DETAIL] ${error.message} [ERROR_END]`,
        );
        throw new Error(`Edge function invocation failed: ${error.message}`);
      }

      const envelope = data as
        | { success?: boolean; payload?: Record<string, unknown> }
        | null;

      if (!envelope || !envelope.success) {
        console.error(
          `[ERROR_BEGIN] [${LOG_ID}] Provisioning failed at Hub. [ERROR_DETAIL] success flag missing or false. [ERROR_END]`,
        );
        throw new Error(
          `No manifest found for "${provisioningCode}". Verify Hub config.`,
        );
      }

      if (!envelope.payload || Object.keys(envelope.payload).length === 0) {
        console.error(
          `[ERROR_BEGIN] [${LOG_ID}] Empty payload returned. [ERROR_DETAIL] Hub returned success but omitted the blueprint payload. [ERROR_END]`,
        );
        throw new Error("Manifest corrupted: Empty payload returned.");
      }

      console.info(
        `[STEP] [${LOG_ID}] Payload validated. Caching to local storage.`,
      );
      const blueprint = envelope.payload as unknown as PayAppBlueprint;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(blueprint));
      }

      console.info(`[SUCCESS] [${LOG_ID}] Hydration successful from Hub.`);
      return blueprint;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[ERROR_BEGIN] [${LOG_ID}] Hydration stalled.`);
      console.error(`[ERROR_DETAIL] [${LOG_ID}] ${msg}`);

      // Local seed fallback (demo / dev only)
      if (
        provisioningCode === SEED_BLUEPRINT.provisioningCode ||
        provisioningCode === "DEMO"
      ) {
        console.info(`[STEP] [${LOG_ID}] Falling back to local seed blueprint.`);
        const blueprint: PayAppBlueprint = { ...SEED_BLUEPRINT, provisioningCode };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(blueprint));
        }
        console.info(`[SUCCESS] [${LOG_ID}] Hydration successful from local seed.`);
        return blueprint;
      }

      console.error(`[ERROR_END] [${LOG_ID}] Terminal hydration routine terminated.`);
      throw err instanceof Error ? err : new Error(msg);
    }
  }

  static loadCached(): PayAppBlueprint | null {
    try {
      if (typeof window === "undefined") return null;
      const raw = window.localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PayAppBlueprint;
    } catch (err) {
      console.error("[ProvisioningEngine.loadCached] Cache parse failure", err);
      return null;
    }
  }

  static wipeDevice(): void {
    const LOG_ID = `WIPE_${Date.now()}`;
    console.info(`[BEGIN] [${LOG_ID}] Operator initiated terminal uncoupling.`);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(this.STORAGE_KEY);
    }
    console.info(`[SUCCESS] [${LOG_ID}] Local blueprint cache cleared.`);
  }
}
