"use client";

import { Bell, Check } from "lucide-react";
import type { Notification } from "@/lib/types";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";

export function MyCitiNotifications({
  notifications,
  onMarkRead,
}: {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
}) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <Bell className="h-4 w-4 text-citi-lavender" aria-hidden />
          Notifications
          {unread > 0 ? (
            <span className="rounded-full bg-citi-lavender/20 px-2 py-0.5 font-mono text-[10px] text-citi-lavender">
              {unread} unread
            </span>
          ) : null}
        </h2>
      </div>

      <ul className="divide-y divide-white/[0.06]">
        {notifications.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-white/40">
            No notifications yet.
          </li>
        ) : (
          notifications.map((n) => (
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
                <p className="mt-0.5 text-sm text-white/50 line-clamp-2">
                  {n.body}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/35">
                  {timeAgo(n.created_at)}
                </p>
              </div>
              {!n.read && onMarkRead ? (
                <button
                  type="button"
                  onClick={() => onMarkRead(n.id)}
                  className="rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/50 transition-colors hover:border-citi-lavender/30 hover:text-citi-lavender"
                >
                  <Check className="mr-1 inline h-3 w-3" aria-hidden />
                  Mark read
                </button>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}