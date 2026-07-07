## Temporary Unblocker: Fall Back to `provisioningCode` as Business ID

While Clyde patches the Hub's `hydrate-terminal` edge function to include a proper business identifier in the manifest payload, add a short-term fallback in the Pay terminal so it can boot into its OS using the `provisioningCode` itself as the bound business ID.

### Change

**`src/components/nanobites/system/TerminalProvisionGate.tsx`** — In the extraction block (step 4), extend the `extractedId` assignment with a fallback to `payloadObj.provisioningCode` when the deep-search returns nothing:

```ts
const payloadRecord = (payloadObj && typeof payloadObj === "object")
  ? (payloadObj as Record<string, unknown>)
  : {};

const extractedId =
  deepFind(payloadObj, [
    "businessId",
    "business_id",
    "merchantId",
    "organization_id",
    "org_id",
  ]) ?? payloadRecord.provisioningCode; // TEMP: unblock until Hub adds business_id
```

- Keep the existing `deepFind` name lookup and `"Authorized Terminal"` fallback unchanged.
- Keep `idString` unwrap logic, `PROVISION_MALFORMED` guard, `HardwareStorage.setItem` writes, `onProvisioned` call, and all `logPlanck` markers unchanged.
- Add a `PROVISION_FALLBACK` `logPlanck` marker when the fallback path is taken so it is visible in Planck logs that the terminal booted on a provisioning code, not a real business ID.

### Out of scope

- `src/lib/provisioning-engine.ts` (no fallback needed there — it caches the full blueprint object which already contains `provisioningCode`)
- Hub-side `hydrate-terminal` edge function, manifest vault schema
- Downstream consumers of `idia_provisioned_business_id` (they will receive the provisioning code string until the Hub is patched)

### Files touched

- edit: `src/components/nanobites/system/TerminalProvisionGate.tsx`
