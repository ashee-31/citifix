"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth";
import type { Notification } from "@/lib/types";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";

/**
 * NotificationBell — header dropdown showing the signed-in citizen's
 * notifications with unread state and mark-read behavior.
 *
 * Signed out → renders null (the header shows Login/Report instead).
 * Loading  → a subtle pulse placeholder.
 * Error    → a dismissible "couldn't load" state (never fakes data).
 * Empty    → "No notifications yet."
 */
export function NotificationBell() {
  const { user, loading: authLoading, real, accessToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit =
        real && accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      const res = await fetch("/api/my-citi/notifications", { headers, cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = (await res.json()) as { notifications: Notification[] };
      setNotifications(Array.isArray(json.notifications) ? json.notifications : []);
    } catch {
      setError("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, [user, real, accessToken]);

  // Load once when the user becomes available.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setNotifications(null);
      return;
    }
    void fetchNotifications();
  }, [authLoading, user, fetchNotifications]);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const unread = (notifications ?? []).filter((n) => !n.read).length;

  const markRead = useCallback(
    async (id: string) => {
      if (!user) return;
      setBusyId(id);
      try {
        const headers: HeadersInit =
          real && accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
        const res = await fetch(`/api/my-citi/notifications/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        setNotifications((prev) =>
          (prev ?? []).map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
      } catch {
        // Leave unread; user can retry by reopening.
      } finally {
        setBusyId(null);
      }
    },
    [user, real, accessToken],
  );

  const markAllRead = useCallback(async () => {
    const unreadIds = (notifications ?? []).filter((n) => !n.read).map((n) => n.id);
    await Promise.all(unreadIds.map((id) => markRead(id)));
  }, [notifications, markRead]);

  if (!user) return null;
  if (authLoading) {
    return (
      <span
        className="inline-flex h-9 w-9 animate-pulse items-center justify-center rounded-lg bg-white/5"
        aria-hidden
      />
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open && notifications === null) void fetchNotifications();
        }}
        aria-label={`Notifications${unread > 0 ? ` — ${unread} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
          "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-citi-lavender",
          open && "border-citi-lavender/40 text-citi-lavender",
        )}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-citi-lavender px-1 font-mono text-[9px] font-bold text-citi-black">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Notifications"
          className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-citi-black/95 shadow-[0_0_40px_rgba(196,168,255,0.12)] backdrop-blur-xl sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-white/70">
              Notifications
              {unread > 0 ? (
                <span className="ml-2 rounded-full bg-citi-lavender/20 px-2 py-0.5 text-[10px] text-citi-lavender">
                  {unread} unread
                </span>
              ) : null}
            </p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="font-mono text-[10px] uppercase tracking-wider text-citi-lavender/70 transition-colors hover:text-citi-lavender"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[min(60vh,24rem)] overflow-y-auto">
            {loading && notifications === null ? (
              <div className="flex items-center justify-center gap-2 px-4 py-10 text-white/40">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span className="font-mono text-[11px] uppercase tracking-wider">
                  Loading…
                </span>
              </div>
            ) : error && notifications === null ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-rose-300/70">{error}</p>
                <button
                  type="button"
                  onClick={() => void fetchNotifications()}
                  className="mt-3 font-mono text-[11px] uppercase tracking-wider text-citi-lavender/70 transition-colors hover:text-citi-lavender"
                >
                  Retry
                </button>
              </div>
            ) : (notifications ?? []).length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-white/40">
                No notifications yet.
              </p>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {(notifications ?? []).map((n) => (
                  <li key={n.id} className="flex items-start gap-3 px-4 py-3.5">
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        n.read ? "bg-white/15" : "bg-citi-lavender",
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/80">{n.title}</p>
                      <p className="mt-0.5 text-sm text-white/50 line-clamp-2">{n.body}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/35">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {!n.read ? (
                      <button
                        type="button"
                        onClick={() => void markRead(n.id)}
                        disabled={busyId === n.id}
                        aria-label={`Mark "${n.title}" as read`}
                        className="rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/50 transition-colors hover:border-citi-lavender/30 hover:text-citi-lavender disabled:opacity-50"
                      >
                        {busyId === n.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                        ) : (
                          <Check className="h-3 w-3" aria-hidden />
                        )}
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href="/my-citi"
            onClick={() => setOpen(false)}
            className="block border-t border-white/[0.06] px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-citi-lavender/70 transition-colors hover:text-citi-lavender"
          >
            View all in My Citi
          </Link>
        </div>
      ) : null}
    </div>
  );
}