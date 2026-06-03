"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const json = await res.json();
      setItems(json.notifications ?? []);
      setUnread(json.unread ?? 0);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    void load();
    const t = setInterval(load, 60000); // poll every 60s
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (open) {
      setLoading(true);
      load().finally(() => setLoading(false));
    }
  }, [open]);

  const markAllRead = async () => {
    setBusy(true);
    try {
      await fetch("/api/notifications", { method: "PUT" });
      setUnread(0);
      setItems((xs) => xs.map((x) => ({ ...x, read: true })));
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const clearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    setBusy(true);
    try {
      await fetch("/api/notifications", { method: "DELETE" });
      setItems([]);
      setUnread(0);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="size-9 rounded-full glass flex items-center justify-center relative hover:bg-white/[0.06]"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-brand-pink text-[9px] font-semibold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 max-h-[70vh] overflow-y-auto glass-strong rounded-2xl shadow-soft border border-white/10">
            <div className="sticky top-0 backdrop-blur-xl bg-ink-950/80 p-3 flex items-center justify-between border-b border-white/5">
              <p className="text-sm font-semibold">Notifications</p>
              <div className="flex items-center gap-1.5">
                {items.length > 0 && (
                  <>
                    {unread > 0 && (
                      <button
                        onClick={markAllRead}
                        disabled={busy}
                        className="text-[10px] px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 inline-flex items-center gap-1"
                      >
                        <Check className="size-2.5" />
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={clearAll}
                      disabled={busy}
                      className="text-[10px] px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 inline-flex items-center gap-1 text-rose-300"
                    >
                      <X className="size-2.5" />
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>
            {loading && items.length === 0 ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="size-4 animate-spin text-white/40" />
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto size-10 rounded-2xl glass flex items-center justify-center">
                  <Bell className="size-4 text-white/40" />
                </div>
                <p className="mt-3 text-sm text-white/55">You&apos;re all caught up.</p>
                <p className="text-xs text-white/35">Portfolio views and plan changes show up here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {items.map((n) => {
                  const inner = (
                    <div className={cn("p-3 hover:bg-white/[0.04] transition-colors flex gap-3", !n.read && "bg-brand-violet/[0.05]")}>
                      <span className={cn("mt-1 size-1.5 rounded-full shrink-0", n.read ? "bg-white/15" : "bg-brand-violet")} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-tight">{n.title}</p>
                        {n.body && <p className="text-xs text-white/55 mt-0.5">{n.body}</p>}
                        <p className="text-[10px] text-white/35 mt-1">{relativeTime(n.createdAt)}</p>
                      </div>
                    </div>
                  );
                  return (
                    <li key={n.id}>
                      {n.link ? (
                        <Link
                          href={n.link}
                          onClick={() => setOpen(false)}
                          className="block"
                        >
                          {inner}
                        </Link>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function relativeTime(d: string) {
  const diff = (Date.now() - +new Date(d)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString();
}
