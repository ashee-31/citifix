"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth";
import { AuthorityDashboard } from "@/components/authority/AuthorityDashboard";
import { AuthorityLoading } from "@/components/authority/AuthorityStates";

/**
 * /authority — the Authority Intelligence AI console.
 *
 * Decision-support dashboard: priority recommendations, safety risks,
 * budget estimates, category growth, resource allocation, and disputed
 * complaints. AI never changes statuses or financial records automatically.
 *
 * Protected route — redirects unauthenticated visitors to /login (one-click
 * demo login in demo mode). In real mode the underlying API validates the
 * session token before returning authority insights.
 */
export default function AuthorityPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) return <AuthorityLoading />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <AuthorityDashboard />
    </div>
  );
}