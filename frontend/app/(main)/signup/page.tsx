import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Create account · CitiFix",
  description: "Create a CitiFix account to report issues, track progress, and verify resolutions.",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Join CitiFix"
      subtitle="Create an account to report issues and stay accountable."
      footer={
        <p className="text-sm text-white/55">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-citi-lavender hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthShell>
  );
}