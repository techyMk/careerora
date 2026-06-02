"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Rocket,
  Wand2,
  Globe,
  ArrowUpRight,
  Monitor,
  Tablet,
  Smartphone,
  Loader2,
  Check,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "minimal", label: "Minimal", colors: ["#0B0F19", "#FFFFFF"] },
  { id: "luxury", label: "Luxury Dark", colors: ["#0B0F19", "#D946EF"] },
  { id: "cyberpunk", label: "Cyberpunk", colors: ["#0B0F19", "#06B6D4"] },
  { id: "glass", label: "Glass", colors: ["#1F2937", "#A78BFA"] },
  { id: "gradient", label: "Gradient", colors: ["#7C3AED", "#EC4899"] },
  { id: "brutalist", label: "Brutalist", colors: ["#FFFFFF", "#000000"] },
];

type PortfolioProp = {
  id: string;
  name: string;
  theme: string;
  subdomain: string;
  bio: string;
  published: boolean;
};

type UserProp = {
  name?: string | null;
  email?: string | null;
  headline?: string | null;
} | null;

export function PortfolioEditor({
  user,
  portfolio,
}: {
  user: UserProp;
  portfolio: PortfolioProp;
}) {
  const router = useRouter();
  const [name, setName] = useState(portfolio.name);
  const [theme, setTheme] = useState(portfolio.theme);
  const [bio, setBio] = useState(portfolio.bio);
  const [subdomain, setSubdomain] = useState(portfolio.subdomain);
  const [published, setPublished] = useState(portfolio.published);
  const [device, setDevice] = useState<"desk" | "tab" | "mob">("desk");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(new Date());
  const [error, setError] = useState<string | null>(null);
  const dirtyRef = useRef(false);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, theme, bio, subdomain, published }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Couldn't save");
        return;
      }
      setSavedAt(new Date());
      dirtyRef.current = false;
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    dirtyRef.current = true;
    const t = setTimeout(() => {
      if (dirtyRef.current) save();
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, theme, bio, subdomain, published]);

  const rewriteBio = async () => {
    setGenerating(true);
    try {
      const context = JSON.stringify({
        currentBio: bio,
        name: user?.name,
        headline: user?.headline,
      });
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "portfolio-bio",
          context,
          instruction: "Confident, warm, hint of wit, 2-3 sentences.",
        }),
      });
      if (!res.ok || !res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setBio("");
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setBio(acc);
      }
    } finally {
      setGenerating(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this portfolio permanently?")) return;
    setDeleting(true);
    await fetch(`/api/portfolios/${portfolio.id}`, { method: "DELETE" });
    router.push("/dashboard/portfolios");
    router.refresh();
  };

  return (
    <>
      <Topbar
        title="Portfolio editor"
        subtitle={saving ? "Saving…" : savedAt ? "Saved · autosaves enabled" : "Unsaved"}
        user={user ?? undefined}
      />
      <div className="p-5 md:p-8">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <Button size="sm" variant="ghost" onClick={() => router.push("/dashboard/portfolios")}>
            <ArrowLeft className="size-3.5" />
            All portfolios
          </Button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-[200px] bg-transparent text-xl md:text-2xl font-semibold tracking-tight outline-none border-b border-transparent hover:border-white/10 focus:border-brand-violet/50 transition-colors py-1"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              disabled={deleting}
              className="text-rose-300 hover:bg-rose-500/10"
            >
              {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              Delete
            </Button>
            <Button
              size="sm"
              variant={published ? "secondary" : "primary"}
              onClick={() => setPublished((p) => !p)}
            >
              {published ? <Check className="size-3.5" /> : <Rocket className="size-3.5" />}
              {published ? "Live" : "Publish"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-5">
          <aside className="space-y-4">
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold">Basics</h3>
              <Field
                label="Site name"
                value={name}
                onChange={setName}
              />
              <Field
                label="Subdomain"
                value={subdomain}
                onChange={(v) =>
                  setSubdomain(v.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
                suffix=".careerora.app"
              />
              {error && (
                <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
                  {error}
                </p>
              )}
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Hero bio</h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={rewriteBio}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="size-3.5" />
                  )}
                  Rewrite
                </Button>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                placeholder="Tell the world what you do — AI will polish."
                className="mt-3 w-full rounded-xl bg-white/[0.02] border border-white/10 p-3 text-sm outline-none focus:border-brand-violet/50 resize-none"
              />
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3">Theme</h3>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "rounded-xl p-2 border transition-all text-left",
                      theme === t.id
                        ? "border-white/30 ring-2 ring-brand-violet/40"
                        : "border-white/5 hover:border-white/15"
                    )}
                  >
                    <div
                      className="h-12 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`,
                      }}
                    />
                    <p className="mt-2 text-xs">{t.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex p-1 glass rounded-full">
                {(["desk", "tab", "mob"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs inline-flex items-center gap-1.5 transition-all",
                      device === d ? "bg-brand-gradient" : "text-white/55"
                    )}
                  >
                    {d === "desk" ? <Monitor className="size-3.5" /> : d === "tab" ? <Tablet className="size-3.5" /> : <Smartphone className="size-3.5" />}
                    {d === "desk" ? "Desktop" : d === "tab" ? "Tablet" : "Mobile"}
                  </button>
                ))}
              </div>
              <a
                href={`https://${subdomain}.careerora.app`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 h-9 rounded-full glass text-xs hover:bg-white/10"
              >
                <Globe className="size-3.5 text-brand-violet" />
                {subdomain}.careerora.app
                <ArrowUpRight className="size-3" />
              </a>
              <div className="ml-auto inline-flex items-center gap-1.5 px-3 h-9 rounded-full glass text-xs text-white/55">
                {saving ? (
                  <>
                    <Loader2 className="size-3 animate-spin" /> Saving
                  </>
                ) : (
                  <>
                    <Check className="size-3 text-emerald-400" /> Saved
                  </>
                )}
              </div>
            </div>

            <div className="relative gradient-border rounded-3xl glass-strong p-3 shadow-soft overflow-hidden">
              <div
                className={cn(
                  "mx-auto rounded-2xl bg-ink-950 overflow-hidden transition-all duration-500 origin-top",
                  device === "desk"
                    ? "max-w-full"
                    : device === "tab"
                      ? "max-w-2xl"
                      : "max-w-sm"
                )}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                  >
                    <PortfolioPreview
                      theme={theme}
                      bio={bio}
                      name={user?.name ?? name}
                      headline={user?.headline ?? "Builder"}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/45">
        {label}
      </span>
      <div className="mt-1 flex items-center rounded-lg bg-white/[0.02] border border-white/10 focus-within:border-brand-violet/50">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-3 h-9 text-sm outline-none"
        />
        {suffix && (
          <span className="mr-3 text-xs text-white/40">{suffix}</span>
        )}
      </div>
    </label>
  );
}

function PortfolioPreview({
  theme,
  bio,
  name,
  headline,
}: {
  theme: string;
  bio: string;
  name: string;
  headline: string;
}) {
  const cls = {
    minimal: "bg-ink-950 text-white",
    luxury: "bg-ink-950 text-white",
    cyberpunk: "bg-ink-950 text-white",
    glass: "bg-ink-900 text-white",
    gradient:
      "bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.4),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.45),transparent_50%)] bg-ink-950 text-white",
    brutalist: "bg-white text-ink-900",
  }[theme] || "bg-ink-950 text-white";

  return (
    <div className={`${cls} min-h-[520px] p-8 md:p-12`}>
      <div className="flex items-center justify-between text-xs opacity-70">
        <span>{name} · Portfolio</span>
        <div className="flex items-center gap-3">
          <span>Work</span>
          <span>About</span>
          <span>Contact</span>
        </div>
      </div>
      <div className="mt-12 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] opacity-60">
          {headline}
        </p>
        <h2 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
          {theme === "gradient" ? (
            <>
              Hi, I&apos;m {name.split(" ")[0]}. I build{" "}
              <span className="gradient-text">bold</span>, useful products.
            </>
          ) : theme === "brutalist" ? (
            <>HI. I&apos;M {name.split(" ")[0].toUpperCase()}. I MAKE THINGS.</>
          ) : (
            <>Hi, I&apos;m {name.split(" ")[0]}. I craft thoughtful product experiences.</>
          )}
        </h2>
        {bio && <p className="mt-4 opacity-75 max-w-xl">{bio}</p>}
        <div className="mt-6 flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-brand-gradient text-white text-sm shadow-glow">
            See work <ArrowUpRight className="size-3.5" />
          </button>
          <button
            className={cn(
              "inline-flex items-center gap-2 px-4 h-10 rounded-full text-sm border",
              theme === "brutalist"
                ? "border-ink-900 text-ink-900"
                : "border-white/15 text-white"
            )}
          >
            Get in touch
          </button>
        </div>
      </div>
      <div className="mt-14 grid grid-cols-3 gap-3 max-w-3xl">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-2xl border",
              theme === "brutalist"
                ? "bg-ink-900/[0.04] border-ink-900/15"
                : "bg-white/5 border-white/10"
            )}
          />
        ))}
      </div>
    </div>
  );
}
