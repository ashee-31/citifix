/**
 * Demo-mode detection and environment helpers.
 *
 * CitiFix runs in DEMO MODE by default when real services are not
 * configured. Demo mode uses seeded, deterministic data and local fallbacks
 * so the full journey works without credentials. When environment variables
 * are present, real Supabase / AI / blockchain integrations activate.
 */

export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === "true") return true;
  return !(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NODE_ENV !== "production")
  );
}

/** True when a real Supabase backend is configured. */
export function hasSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !isDemoMode(),
  );
}

/** True when a real AI provider is configured. */
export function hasAi(): boolean {
  return Boolean(
    process.env.AI_PROVIDER_API_KEY && !isDemoMode(),
  );
}

/** True when a real blockchain RPC + wallet is configured. */
export function hasBlockchain(): boolean {
  return Boolean(
    process.env.BLOCKCHAIN_RPC_URL &&
      process.env.BLOCKCHAIN_PRIVATE_KEY &&
      process.env.BLOCKCHAIN_CONTRACT_ADDRESS &&
      !isDemoMode(),
  );
}

export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.RENDER_EXTERNAL_URL ??
      (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000"))
  );
}

export const DEMO_MODE_LABEL =
  "DEMO MODE — showing seeded city data. Connect Supabase + AI + blockchain for live operation.";