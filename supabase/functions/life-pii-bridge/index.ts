// life-pii-bridge
// Returns PII (first_name, last_name, full_name, display_name, email) for the
// authenticated caller, sourced from auth.users user_metadata. Non-fatal for
// the client — TenancyProvider treats a failure here as a soft stall.
//
// NOTE: no supabase-js client is constructed here on purpose. Legacy JWT keys
// are disabled on this project and the newer sb_* keys may not be present in
// this function's env, which made createClient() throw "supabaseKey is
// required". We verify the caller by calling GoTrue directly instead.

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
    if (!SUPABASE_URL) {
      console.error("[life-pii-bridge] SUPABASE_URL missing");
      return json({ error: "Server misconfigured" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return json({ error: "Unauthorized" }, 401);

    // apikey: prefer whatever the caller sent (it already passed the gateway),
    // else any non-legacy key available in env.
    const apikey =
      req.headers.get("apikey") ??
      [
        Deno.env.get("IDIA_PUBLISHABLE_KEY"),
        Deno.env.get("SUPABASE_PUBLISHABLE_KEY"),
        Deno.env.get("IDIA_SECRET_KEY"),
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
        Deno.env.get("SUPABASE_ANON_KEY"),
      ].find((k): k is string => !!k && !isLegacySupabaseJwtKey(k)) ??
      "";

    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(apikey ? { apikey } : {}),
      },
    });

    if (!res.ok) {
      console.error("[life-pii-bridge] getUser failed", res.status, await res.text());
      return json({ error: "Unauthorized" }, 401);
    }

    const user = (await res.json()) as {
      email?: string | null;
      user_metadata?: Record<string, unknown> | null;
    };

    const meta = user.user_metadata ?? {};
    const first_name = (meta.first_name as string | undefined) ?? null;
    const last_name = (meta.last_name as string | undefined) ?? null;
    const full_name =
      (meta.full_name as string | undefined) ??
      (meta.display_name as string | undefined) ??
      ([first_name, last_name].filter(Boolean).join(" ") || null);
    const display_name =
      (meta.display_name as string | undefined) ?? full_name ?? null;
    const email = user.email ?? (meta.email as string | undefined) ?? null;

    return json({ first_name, last_name, full_name, display_name, email });
  } catch (err) {
    console.error("[life-pii-bridge] Unhandled error", err);
    return json({ error: "Internal server error" }, 500);
  }
});

