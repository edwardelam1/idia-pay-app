/**
 * NANO-BITE ID: sys.core.provision
 * NANO-BITE NAME: Terminal Provision Gate
 * ROLE: Device-to-Business Hardware Binding
 * INDUSTRY: agnostic
 */

import React, { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { LiquidOSErrorBoundary } from "@/lib/error-boundary";
import { logPlanck } from "@/lib/error-capture";

// ============================================================================
// NATIVE KOTLIN/SWIFT HARDWARE BRIDGE CONTRACT
// ============================================================================
declare global {
  interface Window {
    IDIA_Hardware_Bridge?: {
      setSecureItem: (key: string, value: string) => void;
      getSecureItem: (key: string) => string | null;
      removeSecureItem: (key: string) => void;
    };
  }
}

export const HardwareStorage = {
  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined" && window.IDIA_Hardware_Bridge) {
      window.IDIA_Hardware_Bridge.setSecureItem(key, value);
    } else if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
  },
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    if (window.IDIA_Hardware_Bridge) {
      return window.IDIA_Hardware_Bridge.getSecureItem(key);
    }
    return window.localStorage.getItem(key);
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    if (window.IDIA_Hardware_Bridge) {
      window.IDIA_Hardware_Bridge.removeSecureItem(key);
    } else {
      window.localStorage.removeItem(key);
    }
  },
};

function formatProvisioningCode(
  raw: string,
  cursor = raw.length,
): { value: string; cursor: number } {
  const cleaned = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const chunks: string[] = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    chunks.push(cleaned.slice(i, i + 4));
  }
  const value = chunks.join("-");

  const alnumBefore = raw.slice(0, cursor).replace(/[^A-Za-z0-9]/g, "").length;
  let newCursor = value.length;
  let count = 0;
  for (let i = 0; i < value.length; i++) {
    if (/[A-Z0-9]/.test(value[i])) count++;
    if (count === alnumBefore) {
      newCursor = i + 1;
      break;
    }
  }
  return { value, cursor: newCursor };
}

interface TerminalProvisionGateProps {
  onProvisioned: (businessId: string, name: string) => void;
}


function TerminalProvisionGateCore({ onProvisioned }: TerminalProvisionGateProps) {
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    const LOG_ID = `PROV_GATE_${Date.now()}`;
    logPlanck(
      "START",
      "DEVICE_PROVISIONING",
      `[BEGIN] [${LOG_ID}] Attempting to bind terminal with code: ${code}`,
    );

    const strippedCode = code.replace(/-/g, "");
    if (!strippedCode.trim() || strippedCode.length < 5) {
      logPlanck(
        "STALL",
        "VALIDATION_FAIL",
        `[ERROR_BEGIN] [${LOG_ID}] Invalid provisioning code format.`,
      );
      toast.error("Invalid provisioning code format.");
      return;
    }

    setIsProcessing(true);
    const sanitizedCode = code.trim().toUpperCase();

    try {
      logPlanck(
        "PROCESS",
        "PROVISION_LOOKUP",
        `[STEP] [${LOG_ID}] Invoking hydrate-terminal edge function for secure RLS bypass.`,
      );

      const { data, error } = await supabase.functions.invoke("hydrate-terminal", {
        body: { pairing_code: sanitizedCode },
      });

      if (error) {
        logPlanck(
          "STALL",
          "PROVISION_FAILED",
          `[ERROR_BEGIN] [${LOG_ID}] Edge function invocation failed. [ERROR_DETAIL] ${error.message} [ERROR_END]`,
        );
        toast.error("System Error: Could not verify provisioning code.");
        setIsProcessing(false);
        return;
      }

      const envelope = data as
        | { success?: boolean; payload?: Record<string, unknown> }
        | null;

      if (!envelope || !envelope.success || !envelope.payload) {
        logPlanck(
          "STALL",
          "PROVISION_FAILED",
          `[ERROR_BEGIN] [${LOG_ID}] Edge function rejected code or payload was empty. [ERROR_DETAIL] Invalid payload received from Hub. [ERROR_END]`,
        );
        toast.error("Provisioning code not recognized. Verify with your Org Admin.");
        setIsProcessing(false);
        return;
      }

      // 1. Handle stringified JSON defensively
      let payloadObj: unknown = envelope.payload;
      if (typeof payloadObj === "string") {
        try {
          payloadObj = JSON.parse(payloadObj);
          logPlanck(
            "PROCESS",
            "PROVISION_PARSE",
            `[STEP] [${LOG_ID}] Successfully parsed stringified payload.`,
          );
        } catch {
          logPlanck(
            "PROCESS",
            "PROVISION_PARSE",
            `[STEP] [${LOG_ID}] Payload is a string but failed to parse as JSON.`,
          );
        }
      }

      // 2. Inspection logging — root keys to Planck + full dump to DevTools
      const rootKeys =
        payloadObj && typeof payloadObj === "object"
          ? Object.keys(payloadObj as Record<string, unknown>).join(", ")
          : "(non-object)";
      logPlanck(
        "PROCESS",
        "PROVISION_INSPECT",
        `[STEP] [${LOG_ID}] Inspecting payload structure from Hub. Root keys: ${rootKeys}`,
      );
      // eslint-disable-next-line no-console
      console.dir(payloadObj, { depth: null });

      // 3. Recursive deep-search for identifiers, however deeply nested
      const deepFind = (obj: unknown, targetKeys: string[]): unknown => {
        if (!obj || typeof obj !== "object") return undefined;
        const record = obj as Record<string, unknown>;
        for (const key of targetKeys) {
          const val = record[key];
          if (val !== undefined && val !== null && val !== "") return val;
        }
        for (const key of Object.keys(record)) {
          const found = deepFind(record[key], targetKeys);
          if (found !== undefined) return found;
        }
        return undefined;
      };

      // 4. Extract with broad key net
      const payloadRecord =
        payloadObj && typeof payloadObj === "object"
          ? (payloadObj as Record<string, unknown>)
          : {};

      const deepExtractedId = deepFind(payloadObj, [
        "businessId",
        "business_id",
        "merchantId",
        "organization_id",
        "org_id",
      ]);
      // TEMP: unblock terminal boot until Hub manifest includes business_id
      const extractedId = deepExtractedId ?? payloadRecord.provisioningCode;
      if (deepExtractedId === undefined && payloadRecord.provisioningCode) {
        logPlanck(
          "PROCESS",
          "PROVISION_FALLBACK",
          `[STEP] [${LOG_ID}] No business ID in manifest; falling back to provisioningCode as bound ID.`,
        );
      }
      const extractedName =
        deepFind(payloadObj, [
          "clientOrganization",
          "business_name",
          "merchantName",
          "org_name",
          "name",
        ]) ?? "Authorized Terminal";

      const idString =
        typeof extractedId === "string"
          ? extractedId
          : extractedId &&
              typeof extractedId === "object" &&
              typeof (extractedId as { id?: unknown }).id !== "undefined"
            ? String((extractedId as { id: unknown }).id)
            : undefined;

      const targetBusiness = {
        id: idString,
        name: String(extractedName),
      };

      if (!targetBusiness.id) {
        logPlanck(
          "STALL",
          "PROVISION_MALFORMED",
          `[ERROR_BEGIN] [${LOG_ID}] Manifest corrupted. Missing Business ID. [ERROR_DETAIL] Deep search failed. Root keys: ${rootKeys} [ERROR_END]`,
        );
        toast.error("Manifest corrupted. Missing Business ID.");
        setIsProcessing(false);
        return;
      }

      logPlanck(
        "END",
        "PROVISION_SUCCESS",
        `[SUCCESS] [${LOG_ID}] Device bound to Business: ${targetBusiness.id}`,
      );

      HardwareStorage.setItem("idia_provisioned_business_id", targetBusiness.id);
      HardwareStorage.setItem("idia_provisioned_business_name", targetBusiness.name);
      HardwareStorage.setItem("idia_provisioned_code", sanitizedCode);

      toast.success(`Terminal successfully linked to ${targetBusiness.name}`);
      onProvisioned(targetBusiness.id, targetBusiness.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logPlanck(
        "STALL",
        "PROVISION_EXCEPTION",
        `[ERROR_BEGIN] [${LOG_ID}] Unhandled exception during provision. [ERROR_DETAIL] ${msg} [ERROR_END]`,
        err,
      );
      toast.error("System Error: Unexpected failure during provisioning.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-2xl border-none">
        <CardContent className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
              <img
                src="/idia-pay-logo.png"
                alt="IDIA Pay"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-black text-foreground">Provision Terminal</h1>
            <p className="text-sm text-muted-foreground">Unlinked Hardware Detected</p>
          </div>

          <form onSubmit={handleProvision} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="prov-code" className="text-base font-semibold flex items-center gap-2">
                <ScanLine className="w-4 h-4" /> Organization Code
              </Label>
              <Input
                id="prov-code"
                ref={inputRef}
                type="text"
                placeholder="IDIA-XXXX-XXXX"
                value={code}
                onChange={(e) => {
                  const start = e.target.selectionStart ?? e.target.value.length;
                  const { value: formatted, cursor } = formatProvisioningCode(
                    e.target.value,
                    start,
                  );
                  setCode(formatted);
                  window.setTimeout(() => {
                    inputRef.current?.setSelectionRange(cursor, cursor);
                  }, 0);
                }}
                className="h-[72px] min-h-[44px] rounded-2xl bg-background border-none text-center text-2xl font-black tracking-widest shadow-sm px-6 uppercase"
                disabled={isProcessing}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full min-h-[72px] text-xl font-black rounded-3xl shadow-lg active:scale-[0.98] transition-transform"
            >
              {isProcessing ? "LINKING HARDWARE..." : "BIND TERMINAL"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TerminalProvisionGate(props: TerminalProvisionGateProps) {
  return (
    <LiquidOSErrorBoundary>
      <TerminalProvisionGateCore {...props} />
    </LiquidOSErrorBoundary>
  );
}
