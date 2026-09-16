"use client";

import { AuthProvider } from "@/lib/supabase/auth";

/**
 * Client boundary so the server-rendered (main) layout can provide the
 * auth context to the whole tree (header, footer, pages).
 */
export function AuthRoot({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}