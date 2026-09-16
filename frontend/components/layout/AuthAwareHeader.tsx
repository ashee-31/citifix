"use client";

import { useAuth } from "@/lib/supabase/auth";
import { SiteHeader } from "./SiteHeader";

/**
 * Wraps SiteHeader so it can react to auth state.
 *
 * Layout.tsx is a server component; this is the smallest client boundary
 * we need for auth-aware navigation.
 */
export function AuthAwareHeader() {
  return <SiteHeader />;
}
