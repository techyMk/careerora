"use client";

import { useRouter } from "next/navigation";
import { Wand2, Search, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/dashboard/notification-bell";

export function Topbar({
  title,
  subtitle,
  user,
}: {
  title: string;
  subtitle?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
  } | null;
}) {
  const router = useRouter();

  const triggerSearch = () => {
    // dispatch a fake ⌘K so the global palette opens
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true })
    );
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-ink-950/60 border-b border-white/5">
      <div className="flex items-center gap-4 px-5 md:px-8 h-16">
        <div className="min-w-0 flex-1">
          <h1 className="text-base md:text-lg font-semibold tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-white/50 truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={triggerSearch}
            className="hidden md:flex items-center gap-2 px-3 h-9 rounded-full glass text-xs text-white/55 hover:bg-white/[0.06] transition-colors"
            title="Search (⌘K)"
          >
            <Search className="size-3.5" />
            Search…
            <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">
              <Command className="size-2.5" />K
            </span>
          </button>
          <Button
            size="sm"
            variant="secondary"
            className="hidden md:inline-flex"
            onClick={() => router.push("/dashboard/assistant")}
          >
            <Wand2 className="size-3.5" />
            Ask AI
          </Button>
          <NotificationBell />
          <button
            onClick={() => router.push("/dashboard/settings")}
            className="rounded-full hover:scale-105 transition-transform"
            title="Account settings"
          >
            <Avatar
              src={user?.avatar}
              name={user?.name}
              email={user?.email}
              size={36}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
