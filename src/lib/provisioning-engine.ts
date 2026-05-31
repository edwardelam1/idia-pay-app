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
        `[STEP] [${LOG_ID}] Querying device_provisioning_blueprints for payload.`,
      );
      const db = supabase as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            eq: (col: string, val: unknown) => {
              maybeSingle: () => Promise<{
                data: BlueprintRow;
                error: { message: string } | null;
              }>;
            };
          };
        };
      };
      const { data, error } = await db
        .from("device_provisioning_blueprints")
        .select("payload, status")
        .eq("code", provisioningCode)
        .maybeSingle();

      if (error) {
        console.error(`[ERROR_BEGIN] [${LOG_ID}] Database query rejected.`);
        console.error(`[ERROR_DETAIL] [${LOG_ID}] ${error.message}`);
        throw new Error(error.message);
      }

      if (!data) {
        console.error(`[ERROR_BEGIN] [${LOG_ID}] No blueprint row found.`);
        console.error(
          `[ERROR_DETAIL] [${LOG_ID}] Code ${provisioningCode} has no manifest. Verify Hub config.`,
        );
        throw new Error(
          `No manifest found for "${provisioningCode}". Please deploy a blueprint from IDIA Hub.`,
        );
      }

      if (data.status !== "active") {
        console.error(`[ERROR_BEGIN] [${LOG_ID}] Blueprint is inactive.`);
        throw new Error(
          `The manifest for "${provisioningCode}" is deactivated in IDIA Hub.`,
        );
      }

      const payloadObj = (data.payload ?? null) as Record<string, unknown> | null;
      if (!payloadObj || Object.keys(payloadObj).length === 0) {
        console.error(`[ERROR_BEGIN] [${LOG_ID}] Payload nullity detected.`);
        throw new Error(
          `No manifest found for "${provisioningCode}". Verify Hub config.`,
        );
      }

      console.info(`[STEP] [${LOG_ID}] Payload validated. Caching to local storage.`);
      const blueprint = payloadObj as unknown as PayAppBlueprint;
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
