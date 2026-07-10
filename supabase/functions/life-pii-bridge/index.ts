// life-pii-bridge
// Returns PII (first_name, last_name, full_name, display_name, email) for the
// authenticated caller, sourced from auth.users user_metadata. Non-fatal for
// the client — TenancyProvider treats a failure here as a soft stall.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

function isLegacySupabaseJwtKey(key: string) {
  return key.trim().startsWith("eyJ");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const candidates = [
      Deno.env.get("IDIA_SECRET_KEY"),
      Deno.env.get("IDIA_PUBLISHABLE_KEY"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      Deno.env.get("SUPABASE_ANON_KEY"),
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY"),
    ];
    const SUPABASE_KEY = candidates.find(
      (k): k is string => !!k && !isLegacySupabaseJwtKey(k),
    );

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error("[life-pii-bridge] No usable Supabase key in env (IDIA_SECRET_KEY / IDIA_PUBLISHABLE_KEY missing or legacy JWT)");
      return json({ error: "Server misconfigured: set IDIA_SECRET_KEY edge function secret" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      console.error("[life-pii-bridge] getUser failed", userErr);
      return json({ error: "Unauthorized" }, 401);
    }

    const meta = (userData.user.user_metadata ?? {}) as Record<string, unknown>;
    const first_name =
      (meta.first_name as string | undefined) ?? null;
    const last_name =
      (meta.last_name as string | undefined) ?? null;
    const full_name =
      (meta.full_name as string | undefined) ??
      (meta.display_name as string | undefined) ??
      ([first_name, last_name].filter(Boolean).join(" ") || null);
    const display_name =
      (meta.display_name as string | undefined) ?? full_name ?? null;
    const email = userData.user.email ?? (meta.email as string | undefined) ?? null;

    return json({ first_name, last_name, full_name, display_name, email });
  } catch (err) {
    console.error("[life-pii-bridge] Unhandled error", err);
    return json({ error: "Internal server error" }, 500);
  }
});
