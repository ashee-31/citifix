"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/demo/mode";
import type { User } from "@supabase/supabase-js";

/**
 * Client-side auth context.
 *
 * REAL MODE — Supabase Auth handles the session; the anon browser client
 * (RLS-governed) signs up / signs in / signs out.
 *
 * DEMO MODE — the seeded demo citizen ("demo-reporter") is used so the
 * whole journey works without credentials. The "session" is persisted to
 * localStorage so a reload keeps the demo identity. No password is ever
 * stored; this is not a security boundary, just a UI affordance.
 */

export const DEMO_CITI_EMAIL = "demo@citifix.city";

export interface CitiSession {
  /** Supabase user in real mode; demo identity object in demo mode. */
  user: User | DemoUser;
  /** True when a real Supabase backend is configured. */
  real: boolean;
}

interface DemoUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

interface AuthContextValue {
  /** The current user, or null when logged out. */
  user: User | DemoUser | null;
  /** Supabase access token (real mode). Null in demo mode or when logged out. */
  accessToken: string | null;
  /** True while the initial session restore is in flight. */
  loading: boolean;
  /** True when real Supabase is configured (vs demo mode). */
  real: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_STORAGE_KEY = "citifix.demo.session";

const DEMO_USER: DemoUser = {
  id: "demo-reporter",
  email: DEMO_CITI_EMAIL,
  user_metadata: { display_name: "Demo Citizen" },
};

function readDemoSession(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(DEMO_STORAGE_KEY) ? DEMO_USER : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const demo = isDemoMode();
  const [user, setUser] = useState<User | DemoUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const restored = useRef(false);

    // Restore session once on mount.
    useEffect(() => {
      if (restored.current) return;
      restored.current = true;

      if (demo) {
        setUser(readDemoSession());
        setLoading(false);
        return;
      }

      let client: ReturnType<typeof createBrowserClient> | null = null;
      try {
        client = createBrowserClient();
      } catch {
        setLoading(false);
        return;
      }

      client.auth.getSession().then(({ data }) => {
        setUser(data.session?.user ?? null);
        setAccessToken(data.session?.access_token ?? null);
        setLoading(false);
      });

      const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setAccessToken(session?.access_token ?? null);
      });
      return () => sub.subscription.unsubscribe();
    }, [demo]);

    const signUp = useCallback(
      async (email: string, password: string) => {
        if (demo) {
          setUser(DEMO_USER);
          try {
            localStorage.setItem(DEMO_STORAGE_KEY, "1");
          } catch {
            /* storage unavailable — session stays in memory */
          }
          router.refresh();
          return { error: null };
        }
        const client = createBrowserClient();
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) return { error: error.message };
        // If the user was created but email confirmation is required, keep
        // them signed in for a smooth first-run demo experience.
        if (data.session) {
          setUser(data.session.user);
          setAccessToken(data.session.access_token);
        }
        return { error: null };
      },
      [demo, router],
    );

    const signIn = useCallback(
      async (email: string, password: string) => {
        if (demo) {
          setUser(DEMO_USER);
          try {
            localStorage.setItem(DEMO_STORAGE_KEY, "1");
          } catch {
            /* storage unavailable */
          }
          router.refresh();
          return { error: null };
        }
        const client = createBrowserClient();
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        setUser(data.user);
        setAccessToken(data.session?.access_token ?? null);
        return { error: null };
      },
      [demo, router],
    );

    const signOut = useCallback(async () => {
      if (demo) {
        try {
          localStorage.removeItem(DEMO_STORAGE_KEY);
        } catch {
          /* storage unavailable */
        }
        setUser(null);
        setAccessToken(null);
        router.refresh();
        return;
      }
      const client = createBrowserClient();
      await client.auth.signOut();
      setUser(null);
      setAccessToken(null);
    }, [demo, router]);

    const value = useMemo<AuthContextValue>(
      () => ({
        user,
        accessToken,
        loading,
        real: !demo,
        signUp,
        signIn,
        signOut,
      }),
      [user, accessToken, loading, demo, signUp, signIn, signOut],
    );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

/** Convenience: the complaint ID prefix used when scoping "my" data in demo mode. */
export function currentUserId(user: User | DemoUser | null): string | null {
  return user?.id ?? null;
}