"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth";
import { MyCitiDashboard } from "@/components/myciti/MyCitiDashboard";
import { MyCitiLoading } from "@/components/myciti/MyCitiStates";

/**
 * /my-citi — the private citizen account.
 *
 * Protected route: if there is no auth session (real or demo) after the
 * session restore, redirect to /login. Once authenticated, MyCitiDashboard
 * fetches the citizen's own complaints + notifications from
 * /api/my-citi/complaints and /api/my-citi/notifications.
 */
export default function MyCitiPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) return <MyCitiLoading />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <MyCitiDashboard initialComplaints={[]} />
    </div>
  );
}