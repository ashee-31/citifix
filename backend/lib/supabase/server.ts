import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase admin client. ONLY used inside route handlers / server
 * code — the service role key must never be exposed to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase service credentials not configured on the server");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}