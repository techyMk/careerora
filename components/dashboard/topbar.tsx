"use client";

import { useRouter } from "next/navigation";
import { Bell, Command, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({
  title,
  subtitle,
  user,
}: {
  title: string;
  subtitle?: string;
  user?: { name?: string | null; email?: string | null } | null;
}) {
  const router = useRouter();
  const initials = ((user?.name || user?.email || "U")
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase());

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-ink-950/60 border-b border-white/5">
      <div className="flex items-center gap-4 px-5 md:px-8 h-16">
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-semibold tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-white/50 truncate">{subtitle}</p>
          )}
        </div>
        <div className="hidden md:flex items-center gap-2 ml-6 px-3 h-9 rounded-full glass min-w-[260px] text-sm text-white/50">
          <Search className="size-3.5" />
          <span className="flex-1">Search…</span>
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">
            <Command className="size-2.5" />K
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="hidden md:inline-flex"
            onClick={() => router.push("/dashboard/assistant")}
          >
            <Sparkles className="size-3.5" />
            Ask AI
          </Button>
          <button className="size-9 rounded-full glass flex items-center justify-center relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2.5 size-1.5 rounded-full bg-brand-pink" />
          </button>
          <div className="size-9 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
