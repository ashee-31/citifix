"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAuth, DEMO_CITI_EMAIL } from "@/lib/supabase/auth";

/**
 * AuthForm — email/password form wired to the auth context.
 * In demo mode any credentials are accepted and the demo citizen session is
 * created; in real mode Supabase Auth validates the credentials.
 *
 * Honors a `?next=` return URL so a sign-in from a support prompt returns
 * the citizen to the complaint they wanted to support.
 */
export function AuthForm({
  mode,
}: {
  mode: "login" | "signup";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    const fn = mode === "login" ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    if (error) {
      setStatus("error");
      setMessage(error);
      return;
    }
    setStatus("success");
        // Short delay so the success state is visible, then continue.
        const destination = next && next.startsWith("/") ? next : "/my-citi";
        setTimeout(() => router.push(destination), 400);
      }

      async function handleDemo() {
        setStatus("loading");
        setMessage(null);
        const { error } = await signIn(DEMO_CITI_EMAIL, "demo-pass");
        if (error) {
          setStatus("error");
          setMessage(error);
          return;
        }
        setStatus("success");
        const destination = next && next.startsWith("/") ? next : "/my-citi";
        setTimeout(() => router.push(destination), 400);
      }

  const busy = status === "loading";

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor={`${mode}-email`}
            className="mb-1.5 block text-sm font-medium text-white/70"
          >
            Email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
              aria-hidden
            />
            <input
              id={`${mode}-email`}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-citi-black/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-citi-lavender/50"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`${mode}-password`}
            className="mb-1.5 block text-sm font-medium text-white/70"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
              aria-hidden
            />
            <input
              id={`${mode}-password`}
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-citi-black/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-citi-lavender/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/50 transition-colors hover:text-white/80"
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>

        {message ? (
          <p
            role="alert"
            className={
              status === "error"
                ? "rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                : "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
            }
          >
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-citi-lavender/40 bg-citi-lavender/10 px-4 py-2.5 text-sm font-semibold text-citi-lavender transition-all hover:bg-citi-lavender/20 hover:shadow-[0_0_20px_rgba(196,168,255,0.25)] disabled:opacity-60"
        >
          {busy ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-citi-lavender/40 border-t-citi-lavender" aria-hidden />
          ) : (
            <>
              {mode === "login" ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={handleDemo}
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-all hover:bg-emerald-400/20 disabled:opacity-60"
      >
        <ShieldCheck className="h-4 w-4" aria-hidden />
        Continue as Demo Citizen
      </button>
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
        Demo mode — no credentials required
      </p>
    </div>
  );
}