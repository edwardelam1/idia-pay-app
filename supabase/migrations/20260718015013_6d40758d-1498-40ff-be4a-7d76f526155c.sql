-- Retire legacy Nano↔Pico relationship + flat pico registry tables.
-- The authoritative source is now the hydrated blueprint payload in
-- public.idia_schema_manifest_vault (schema_payload.modules.bundles[].nanoBites[].picoBites[]).
-- Client resolver reads gate_policy / default_config from the in-app PICO_BITE_REGISTRY
-- (src/components/pico-bites/registry.ts) instead of these tables.

DROP TABLE IF EXISTS public.idia_nano_pico_relations CASCADE;
DROP TABLE IF EXISTS public.idia_nano_bites CASCADE;
DROP TABLE IF EXISTS public.idia_pico_bites CASCADE;