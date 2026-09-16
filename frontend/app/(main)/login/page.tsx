import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Sign in · CitiFix",
  description: "Sign in to your CitiFix account to track and manage your citi complaints.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to track your complaints and review resolutions."
      footer={
        <p className="text-sm text-white/55">
          New to CitiFix?{" "}
          <Link href="/signup" className="font-medium text-citi-lavender hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}