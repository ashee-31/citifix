"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils/format";
import { NotificationBell } from "../layout/NotificationBell";

/**
 * AuthNav — the right-hand cluster of the header. Renders differently
 * depending on auth state:
 *
 *   signed out → "Login" + "Report Issue" CTA
 *   signed in  → "My Citi" + "Report Issue" CTA + avatar menu w/ Sign out
 *
 * Kept small and focused; the heavy lifting (session restore, demo login)
 * lives in AuthProvider.
 */
export function AuthNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {loading ? (
        <span className="h-8 w-24 animate-pulse rounded-lg bg-white/5" aria-hidden />
      ) : user ? (
        <>
                <NotificationBell />
                <Link
            href="/my-citi"
            onClick={onNavigate}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-citi-lavender"
          >
            My Citi
          </Link>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="rounded-lg px-3 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-rose-300 focus-visible:outline-2 focus-visible:outline-citi-lavender"
          >
            Sign out
          </button>
        </>
      ) : (
        <Link
          href="/login"
          onClick={onNavigate}
          className="rounded-lg px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-citi-lavender"
        >
          Login
        </Link>
      )}
      <Link
        href="/report"
        onClick={onNavigate}
        className="inline-flex items-center gap-2 rounded-lg border border-citi-lavender/40 bg-citi-lavender/10 px-4 py-2 text-sm font-semibold text-citi-lavender transition-all hover:bg-citi-lavender/20 hover:shadow-[0_0_20px_rgba(196,168,255,0.25)] focus-visible:outline-2 focus-visible:outline-citi-lavender"
      >
        <span aria-hidden>◈</span>
        Report Issue
      </Link>
    </div>
  );
}