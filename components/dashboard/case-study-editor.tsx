"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Wand2,
  AlertCircle,
  Lightbulb,
  Layers,
  Gauge,
  Calendar,
  TrendingUp,
  Eye,
  Loader2,
  Check,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Study = {
  id: string;
  title: string;
  role: string | null;
  problem: string | null;
  solution: string | null;
  techStack: string | null;
  metrics: string | null;
  timeline: string | null;
  results: string | null;
  published: boolean;
  views: number;
};

type UserProp = {
  name?: string | null;
  email?: string | null;
} | null;

const BLOCKS = [
  { key: "problem", icon: AlertCircle, label: "Problem" },
  { key: "solution", icon: Lightbulb, label: "Solution" },
  { key: "techStack", icon: Layers, label: "Tech & tools" },
  { key: "metrics", icon: Gauge, label: "Metrics" },
  { key: "timeline", icon: Calendar, label: "Timeline" },
  { key: "results", icon: TrendingUp, label: "Results" },
] as const;

export function CaseStudyEditor({
  user,
  study,
}: {
  user: UserProp;
  study: Study;
}) {
  const router = useRouter();
  const [data, setData] = useState({
    title: study.title,
    role: study.role ?? "",
    problem: study.problem ?? "",
    solution: study.solution ?? "",
    techStack: study.techStack ?? "",
    metrics: study.metrics ?? "",
    timeline: study.timeline ?? "",
    results: study.results ?? "",
    published: study.published,
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(new Date());
  const [generating, setGenerating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const dirtyRef = useRef(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/case-studies/${study.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      setSavedAt(new Date());
      dirtyRef.current = false;
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    dirtyRef.current = true;
    const t = setTimeout(() => dirtyRef.current && save(), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const generateBlock = async (
    key: (typeof BLOCKS)[number]["key"],
    label: string
  ) => {
    setGenerating(key);
    try {
      const context = JSON.stringify({
        title: data.title,
        role: data.role,
        currentText: (data as any)[key],
        otherBlocks: Object.fromEntries(
          BLOCKS.filter((b) => b.key !== key).map((b) => [b.key, (data as any)[b.key]])
        ),
      });
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "case-study-block",
          context,
          instruction: `Write the "${label}" section. Be specific, measurable, narrative.`,
        }),
      });
      if (!res.ok || !res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setData((d) => ({ ...d, [key]: "" }));
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setData((d) => ({ ...d, [key]: acc }));
      }
    } finally {
      setGenerating(null);
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this case study permanently?")) return;
    setDeleting(true);
    await fetch(`/api/case-studies/${study.id}`, { method: "DELETE" });
    router.push("/dashboard/case-studies");
    router.refresh();
  };

  const filled = BLOCKS.filter((b) => (data as any)[b.key]?.length > 20).length;
  const score = Math.min(100, 40 + filled * 9);

  return (
    <>
      <Topbar
        title="Case study editor"
        subtitle={saving ? "Saving…" : savedAt ? "Saved · autosaves enabled" : "Unsaved"}
        user={user ?? undefined}
      />
      <div className="p-5 md:p-8 grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Button size="sm" variant="ghost" onClick={() => router.push("/dashboard/case-studies")}>
              <ArrowLeft className="size-3.5" /> All case studies
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              disabled={deleting}
              className="text-rose-300 hover:bg-rose-500/10 ml-auto"
            >
              {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              Delete
            </Button>
          </div>

          <div className="glass rounded-2xl p-5 md:p-6">
            <input
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="w-full bg-transparent text-2xl md:text-3xl font-semibold tracking-tight outline-none border-b border-transparent hover:border-white/10 focus:border-brand-violet/50 py-1"
            />
            <input
              value={data.role}
              onChange={(e) => setData({ ...data, role: e.target.value })}
              placeholder="Your role · timeframe · team size"
              className="mt-2 w-full bg-transparent text-sm text-white/65 outline-none border-b border-transparent hover:border-white/10 focus:border-brand-violet/50 py-1"
            />
            <div className="mt-4 flex items-center gap-2 flex-wrap text-xs">
              <button
                onClick={() => setData((d) => ({ ...d, published: !d.published }))}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                  data.published
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "bg-white/5 border border-white/10 text-white/70"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    data.published ? "bg-emerald-400" : "bg-white/40"
                  )}
                />
                {data.published ? "Published" : "Draft"}
              </button>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                <Sparkles className="size-3 text-brand-violet" />
                Story score {score}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                <Eye className="size-3" />
                {study.views} views
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {BLOCKS.map((b) => (
              <div key={b.key} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl gradient-border flex items-center justify-center">
                    <b.icon className="size-4" />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/45 font-semibold flex-1">
                    {b.label}
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => generateBlock(b.key, b.label)}
                    disabled={generating !== null}
                  >
                    {generating === b.key ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="size-3.5" />
                    )}
                    AI
                  </Button>
                </div>
                <textarea
                  value={(data as any)[b.key]}
                  onChange={(e) => setData({ ...data, [b.key]: e.target.value })}
                  rows={4}
                  placeholder={`Sketch the ${b.label.toLowerCase()}…`}
                  className="mt-3 w-full rounded-xl bg-white/[0.02] border border-white/10 p-3 text-sm outline-none focus:border-brand-violet/50 resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-white/55">Section completion</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-semibold gradient-text">{filled}/6</span>
              <span className="text-xs text-white/45">filled</span>
            </div>
            <div className="mt-4 space-y-1.5">
              {BLOCKS.map((b) => (
                <div key={b.key} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{b.label}</span>
                  <span
                    className={cn(
                      "size-4 rounded-full flex items-center justify-center",
                      ((data as any)[b.key]?.length ?? 0) > 20
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/5 text-white/40"
                    )}
                  >
                    {((data as any)[b.key]?.length ?? 0) > 20 ? <Check className="size-2.5" /> : null}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold">Tips</h3>
            <ul className="mt-3 space-y-2 text-xs text-white/70">
              <li>• Quantify outcomes — % lifts, $ saved, time reduced.</li>
              <li>• Pair every problem with a measurable result.</li>
              <li>• Keep solution narrative — what you decided & why.</li>
              <li>• AI can polish each block independently.</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
