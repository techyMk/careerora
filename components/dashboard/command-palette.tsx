"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  FileText,
  Globe2,
  ScrollText,
  Mail,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Hit = {
  id: string;
  kind: "resume" | "portfolio" | "case-study" | "cover-letter";
  title: string;
  subtitle?: string;
  href: string;
};

const QUICK_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Command },
  { href: "/dashboard/resumes", label: "All resumes", icon: FileText },
  { href: "/dashboard/portfolios", label: "All portfolios", icon: Globe2 },
  { href: "/dashboard/case-studies", label: "All case studies", icon: ScrollText },
  { href: "/dashboard/cover-letters", label: "All cover letters", icon: Mail },
  { href: "/dashboard/assistant", label: "AI Assistant", icon: Search },
  { href: "/dashboard/templates", label: "Templates", icon: Search },
  { href: "/dashboard/settings", label: "Settings", icon: Search },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  // ⌘K / Ctrl+K opens
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQ(""); setHits([]); setActive(0); }
  }, [open]);

  const search = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
      const json = await res.json();
      setHits(json.hits ?? []);
    } catch {
      setHits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => search(q), 180);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [q, open, search]);

  const filteredQuick = QUICK_NAV.filter((n) =>
    q.trim() === "" || n.label.toLowerCase().includes(q.toLowerCase())
  );

  const combined: Array<{ kind: "hit" | "nav"; data: Hit | (typeof QUICK_NAV)[number] }> = [
    ...hits.map((h) => ({ kind: "hit" as const, data: h })),
    ...(q.trim() === "" ? filteredQuick.map((n) => ({ kind: "nav" as const, data: n })) : []),
  ];

  useEffect(() => {
    setActive(0);
  }, [hits.length, q]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(combined.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = combined[active];
      if (item) {
        router.push(item.kind === "hit" ? (item.data as Hit).href : (item.data as { href: string }).href);
        setOpen(false);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl rounded-2xl glass-strong shadow-soft overflow-hidden border border-white/10">
        <div className="flex items-center gap-2 px-4 h-12 border-b border-white/5">
          <Search className="size-4 text-white/40" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search your resumes, portfolios, case studies…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/35"
          />
          {loading && <Loader2 className="size-3.5 animate-spin text-white/40" />}
          <kbd className="text-[10px] text-white/40 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">esc</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {combined.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-white/55">
                {q.trim() === "" ? "Type to search…" : "No matches."}
              </p>
            </div>
          ) : (
            <ul>
              {combined.map((item, i) => {
                const isHit = item.kind === "hit";
                const hit = isHit ? (item.data as Hit) : null;
                const nav = !isHit ? (item.data as (typeof QUICK_NAV)[number]) : null;
                const Icon = isHit
                  ? hit!.kind === "resume" ? FileText
                    : hit!.kind === "portfolio" ? Globe2
                    : hit!.kind === "case-study" ? ScrollText
                    : Mail
                  : nav!.icon;
                const href = isHit ? hit!.href : nav!.href;
                const title = isHit ? hit!.title : nav!.label;
                const subtitle = isHit ? hit!.subtitle : undefined;
                return (
                  <li key={`${item.kind}-${i}`}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm",
                        active === i ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                      )}
                    >
                      <Icon className="size-4 text-white/55 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{title}</p>
                        {subtitle && <p className="text-[11px] text-white/45 truncate">{subtitle}</p>}
                      </div>
                      <ArrowUpRight className="size-3.5 text-white/30" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="px-4 py-2 border-t border-white/5 flex items-center gap-3 text-[10px] text-white/40">
          <span><kbd className="px-1 py-px rounded bg-white/5">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 py-px rounded bg-white/5">↵</kbd> open</span>
          <span className="ml-auto"><kbd className="px-1 py-px rounded bg-white/5">⌘</kbd>+<kbd className="px-1 py-px rounded bg-white/5">K</kbd></span>
        </div>
      </div>
    </div>
  );
}
