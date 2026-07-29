## What's wrong

The header count and the rendered tiles come from two different sources:

- The "1 Pico" badge reads `spec.picoBites` straight off the freshly hydrated blueprint (`src/lib/idia/LiquidOS.tsx:509`, mapped in `src/lib/idia/registry.ts:71-93`) — this is correct and current.
- The tiles below come from `NanoBiteHost` → `fetchNanoPicoLayout()` (`src/lib/idia/nano-pico-resolver.ts`), which serves from an in-memory `CACHE` and a `sessionStorage` key `idia.nanoPico.layout.v3:<code>:<nanoId>`. Nothing ever purges those, and if the fresh blueprint has no picos for a nano bite the resolver deliberately falls back to the stale session copy (lines 124-194). So the old 4-pico layout keeps painting after the Hub cleanup.

Also confirmed: `ProvisioningEngine` (`src/lib/provisioning-engine.ts`) has no `invalidateIfStale()` and never reads `manifestVersion`, so the Hub's new versioning is currently ignored on this side.

## Fix

1. **Single source for the dock.** Pass the already-resolved `spec.picoBites` from `LiquidOS` down into `NanoBiteHost` instead of having it re-fetch. The resolver keeps only its conflict logic (weight-per-slot winner, mandatory losers dimmed, non-mandatory losers hidden), refactored into a pure `resolveLayoutFromSpec(nanoBiteId, picos)`. Badge count and tile count then can't diverge.

2. **Delete the stale caches.** Remove the module-level `CACHE` and the `sessionStorage` layout persistence from `nano-pico-resolver.ts` (and the `clearNanoPicoCache` plumbing that exists only to service it). Layout is derived per render from the manifest, so caching buys nothing and is exactly what caused the ghosts. Keep the async `loadPicoCatalog()` UUID→tag lookup for entries the Hub still ships without a `tag`.

3. **Honour `manifestVersion`.** Add `ProvisioningEngine.invalidateIfStale(incomingVersion)`: compare against the version stored alongside the cached blueprint under `idia_blueprint_v1`, and on mismatch clear the blueprint cache plus any leftover `idia.nanoPico.layout.*` session keys before writing the new payload. Call it inside `hydrateFromHub` right after the payload is validated, so a Hub redeploy propagates on the next boot without the operator having to re-pair the device.

4. **Empty state means empty.** When the manifest carries zero picos for a nano bite, render the existing "No Pico-Bites published" state rather than reaching for a previous layout.

## Technical notes

Files touched: `src/lib/idia/nano-pico-resolver.ts`, `src/components/nanobites/NanoBiteHost.tsx`, `src/lib/idia/LiquidOS.tsx`, `src/lib/provisioning-engine.ts`. No DB or edge-function changes — the Hub side is already deployed. Registry, telemetry bus, and the 112 pico components are untouched.

Verification: after the change, load with `IDIA-FRWD-NEUL` and confirm each screen's badge equals the number of tiles rendered (`mobile_pos` = 3, `ops.prep` = 5 per the Hub's saved `picoAssignments`), with `localStorage`/`sessionStorage` pre-populated from the old manifest to prove the invalidation path works.
