"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  ArrowUpRight,
  Lock,
  Check,
  Loader2,
  Crown,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { CATEGORIES, TEMPLATES, type Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

type Tier = "All" | "Free" | "Pro";

export function TemplatesGallery({
  user,
  plan,
}: {
  user: { name?: string | null; email?: string | null };
  plan: string;
}) {
  const router = useRouter();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [tier, setTier] = useState<Tier>("All");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const isPro = plan !== "free";

  const filtered = useMemo(
    () =>
      TEMPLATES.filter(
        (t) =>
          (cat === "All" || t.category === cat) &&
          (tier === "All" || t.tier === tier) &&
          (q === "" ||
            t.name.toLowerCase().includes(q.toLowerCase()) ||
            t.tone.toLowerCase().includes(q.toLowerCase()))
      ),
    [cat, tier, q]
  );

  const useTemplate = async (t: Template) => {
    if (t.tier === "Pro" && !isPro) {
      router.push("/dashboard/settings?tab=billing");
      return;
    }
    setBusy(t.id);
    try {
      if (t.action.kind === "linkedin") {
        router.push("/dashboard/linkedin");
        return;
      }
      if (t.action.kind === "cover") {
        // No cover-letter editor yet — drop the user into the assistant
        // pre-seeded with cover-letter intent.
        router.push("/dashboard/assistant");
        return;
      }
      const endpoint =
        t.action.kind === "resume"
          ? "/api/resumes"
          : t.action.kind === "portfolio"
            ? "/api/portfolios"
            : "/api/case-studies";

      const body: Record<string, string> = {
        name: t.action.defaultName ?? t.name,
      };
      if (t.action.kind === "resume" && t.action.applyId) {
        body.template = t.action.applyId;
      }
      if (t.action.kind === "portfolio" && t.action.applyId) {
        body.theme = t.action.applyId;
      }
      if (t.action.kind === "case-study") {
        body.title = t.action.defaultName ?? t.name;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      const id =
        json?.resume?.id ?? json?.portfolio?.id ?? json?.study?.id;
      if (!id) return;
      const path =
        t.action.kind === "resume"
          ? `/dashboard/resumes/${id}`
          : t.action.kind === "portfolio"
            ? `/dashboard/portfolios/${id}`
            : `/dashboard/case-studies/${id}`;
      router.push(path);
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const freeCount = TEMPLATES.filter((t) => t.tier === "Free").length;
  const proCount = TEMPLATES.filter((t) => t.tier === "Pro").length;

  return (
    <>
      <Topbar
        title="Templates"
        subtitle={`${TEMPLATES.length} starting points · ${freeCount} free, ${proCount} pro`}
        user={user}
      />
      <div className="p-5 md:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 px-3 h-10 rounded-full glass min-w-[260px] text-sm flex-1 max-w-md">
            <Search className="size-4 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search templates…"
              className="flex-1 bg-transparent outline-none placeholder:text-white/30"
            />
          </div>
          <div className="inline-flex p-1 glass rounded-full text-xs overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full transition-all",
                  cat === c
                    ? "bg-brand-gradient shadow-glow"
                    : "text-white/55 hover:text-white"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="inline-flex p-1 glass rounded-full text-xs">
            {(["All", "Free", "Pro"] as Tier[]).map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full transition-all",
                  tier === t
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {!isPro && (
          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="size-9 rounded-xl gradient-border flex items-center justify-center">
              <Crown className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">You&apos;re on the Free plan</p>
              <p className="text-xs text-white/55">
                Unlock {proCount} premium templates, unlimited assets and the
                advanced AI editor.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/dashboard/settings?tab=billing")}
            >
              <Crown className="size-3.5" />
              Upgrade to Pro
            </Button>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t, i) => {
            const locked = t.tier === "Pro" && !isPro;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.025 }}
                whileHover={{ y: -3 }}
                className="group relative glass rounded-2xl overflow-hidden flex flex-col"
              >
                <Preview template={t} />

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.name}</p>
                      <p className="text-[11px] text-white/45 truncate">
                        {t.category} · {t.tone}
                      </p>
                    </div>
                    <TierBadge tier={t.tier} />
                  </div>

                  <Button
                    size="sm"
                    variant={locked ? "secondary" : "primary"}
                    className="mt-1"
                    onClick={() => useTemplate(t)}
                    disabled={busy !== null}
                  >
                    {busy === t.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : locked ? (
                      <>
                        <Lock className="size-3.5" />
                        Upgrade to use
                      </>
                    ) : (
                      <>
                        Use template
                        <ArrowUpRight className="size-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="glass rounded-2xl py-16 text-center">
            <p className="text-sm text-white/60">
              No templates match those filters.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function TierBadge({ tier }: { tier: "Free" | "Pro" }) {
  if (tier === "Free") {
    return (
      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <Check className="inline size-2.5 mr-0.5" />
        Free
      </span>
    );
  }
  return (
    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-brand-gradient-soft text-white border border-brand-violet/30">
      <Crown className="inline size-2.5 mr-0.5" />
      Pro
    </span>
  );
}

/* ──────────────── Category-specific previews ──────────────── */

function Preview({ template }: { template: Template }) {
  const bg = `linear-gradient(135deg, ${template.swatch[0]}, ${template.swatch[1]})`;
  return (
    <div
      className="aspect-[4/3] relative overflow-hidden"
      style={{ background: bg }}
    >
      <div className="absolute inset-0 dotted-bg opacity-25" />
      {template.category === "Resume" && <ResumePreview template={template} />}
      {template.category === "Portfolio" && <PortfolioPreview template={template} />}
      {template.category === "Case Study" && <CaseStudyPreview />}
      {template.category === "LinkedIn" && <LinkedinPreview />}
      {template.category === "Cover letter" && <CoverPreview />}
    </div>
  );
}

function ResumePreview({ template }: { template: Template }) {
  const id = template.action.applyId;
  return (
    <div className="absolute inset-5 rounded-md bg-white text-ink-900 p-3 shadow-soft overflow-hidden flex flex-col">
      {id === "modern" ? (
        <div className="grid grid-cols-[40%_60%] gap-2 h-full">
          <div className="bg-ink-900/[0.05] -m-3 mr-0 p-3 pr-2 flex flex-col">
            <div className="h-2 w-full rounded bg-ink-900/15" />
            <div className="mt-1 h-1.5 w-3/4 rounded bg-ink-900/10" />
            <div className="mt-3 space-y-0.5">
              <div className="h-1 w-full rounded bg-ink-900/10" />
              <div className="h-1 w-3/4 rounded bg-ink-900/10" />
              <div className="h-1 w-2/3 rounded bg-ink-900/10" />
            </div>
            <div className="mt-auto flex flex-wrap gap-0.5">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-6 rounded bg-ink-900/15"
                />
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-1/3 rounded bg-ink-900/30" />
            <div className="space-y-0.5">
              <div className="h-1 w-full rounded bg-ink-900/10" />
              <div className="h-1 w-[90%] rounded bg-ink-900/10" />
              <div className="h-1 w-[75%] rounded bg-ink-900/10" />
            </div>
            <div className="pt-2 space-y-1">
              <div className="flex justify-between">
                <div className="h-1.5 w-1/3 rounded bg-ink-900/25" />
                <div className="h-1.5 w-1/6 rounded bg-ink-900/15" />
              </div>
              <div className="h-1 w-3/4 rounded bg-ink-900/10" />
            </div>
          </div>
        </div>
      ) : id === "executive" ? (
        <div className="font-serif">
          <div className="h-3 w-1/2 rounded bg-ink-900/35" />
          <div className="mt-0.5 h-1 w-1/4 rounded bg-ink-900/25" />
          <div className="my-2 h-px bg-ink-900/15" />
          <div className="space-y-0.5">
            <div className="h-1 w-full rounded bg-ink-900/10" />
            <div className="h-1 w-[88%] rounded bg-ink-900/10" />
            <div className="h-1 w-[70%] rounded bg-ink-900/10" />
          </div>
          <div className="mt-3 space-y-1">
            <div className="h-1.5 w-1/3 rounded bg-ink-900/25" />
            <div className="h-1 w-3/4 rounded bg-ink-900/10" />
            <div className="h-1 w-2/3 rounded bg-ink-900/10" />
          </div>
        </div>
      ) : (
        // classic
        <div>
          <div className="text-center pb-2 border-b border-ink-900/15">
            <div className="mx-auto h-2 w-1/3 rounded bg-ink-900/35" />
            <div className="mt-1 mx-auto h-1 w-1/4 rounded bg-ink-900/20" />
          </div>
          <div className="mt-2 h-1.5 w-1/4 rounded bg-ink-900/25" />
          <div className="mt-1 space-y-0.5">
            <div className="h-1 w-full rounded bg-ink-900/10" />
            <div className="h-1 w-[85%] rounded bg-ink-900/10" />
            <div className="h-1 w-[72%] rounded bg-ink-900/10" />
          </div>
          <div className="mt-2 flex flex-wrap gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="h-1.5 w-5 rounded bg-ink-900/15"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PortfolioPreview({ template }: { template: Template }) {
  const id = template.action.applyId;
  const isBrutalist = id === "brutalist";
  const cardBg = isBrutalist ? "bg-white text-ink-900" : "bg-ink-950/85 backdrop-blur-md";
  const muted = isBrutalist ? "bg-ink-900/15" : "bg-white/15";
  const text = isBrutalist ? "bg-ink-900/40" : "bg-white/40";

  return (
    <div className={`absolute inset-5 rounded-lg ${cardBg} shadow-soft p-3 flex flex-col`}>
      <div className="flex items-center justify-between">
        <div className={`h-1.5 w-12 rounded ${text}`} />
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1 w-3 rounded ${muted}`} />
          ))}
        </div>
      </div>
      <div className="mt-4">
        <div className={`h-1.5 w-10 rounded ${muted}`} />
        <div className={`mt-1.5 h-3 w-3/4 rounded ${text}`} />
        <div className={`mt-1 h-3 w-1/2 rounded ${text}`} />
      </div>
      <div className="mt-auto grid grid-cols-3 gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`aspect-square rounded ${muted}`} />
        ))}
      </div>
    </div>
  );
}

function CaseStudyPreview() {
  return (
    <div className="absolute inset-5 rounded-md bg-ink-950/85 backdrop-blur-md p-3 flex flex-col gap-1.5">
      <div className="h-2 w-2/3 rounded bg-white/30" />
      <div className="h-1 w-1/3 rounded bg-white/15" />
      <div className="mt-2 grid grid-cols-2 gap-1.5 flex-1">
        {[
          ["bg-rose-400/35", "Problem"],
          ["bg-amber-300/35", "Solution"],
          ["bg-emerald-400/35", "Metrics"],
          ["bg-violet-400/35", "Results"],
        ].map(([c]) => (
          <div
            key={c}
            className={`rounded ${c} p-1.5 flex flex-col gap-0.5 justify-end`}
          >
            <div className="h-1 w-1/2 rounded bg-white/40" />
            <div className="h-1 w-3/4 rounded bg-white/25" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkedinPreview() {
  return (
    <div className="absolute inset-5 rounded-md bg-white text-ink-900 p-3 flex flex-col shadow-soft">
      <div className="flex items-center gap-1.5">
        <span className="size-5 rounded-sm bg-[#0A66C2]" />
        <div className="space-y-0.5 flex-1">
          <div className="h-1.5 w-1/2 rounded bg-ink-900/30" />
          <div className="h-1 w-1/3 rounded bg-ink-900/15" />
        </div>
      </div>
      <div className="mt-3 space-y-0.5">
        <div className="h-1.5 w-1/4 rounded bg-ink-900/25" />
        <div className="h-1 w-full rounded bg-ink-900/10" />
        <div className="h-1 w-[88%] rounded bg-ink-900/10" />
        <div className="h-1 w-[70%] rounded bg-ink-900/10" />
      </div>
      <div className="mt-auto flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-1.5 flex-1 rounded bg-[#0A66C2]/30" />
        ))}
      </div>
    </div>
  );
}

function CoverPreview() {
  return (
    <div className="absolute inset-5 rounded-md bg-white text-ink-900 p-3 flex flex-col shadow-soft">
      <div className="flex justify-between">
        <div className="space-y-0.5">
          <div className="h-1.5 w-12 rounded bg-ink-900/30" />
          <div className="h-1 w-8 rounded bg-ink-900/15" />
        </div>
        <div className="h-1 w-10 rounded bg-ink-900/15" />
      </div>
      <div className="mt-3 h-1 w-1/3 rounded bg-ink-900/20" />
      <div className="mt-1 space-y-0.5 flex-1">
        <div className="h-1 w-full rounded bg-ink-900/10" />
        <div className="h-1 w-full rounded bg-ink-900/10" />
        <div className="h-1 w-[85%] rounded bg-ink-900/10" />
        <div className="h-1 w-[60%] rounded bg-ink-900/10" />
      </div>
      <div className="mt-auto flex justify-end">
        <div className="h-1.5 w-10 rounded bg-ink-900/30" />
      </div>
    </div>
  );
}
