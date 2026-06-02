"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Wand2,
  Linkedin,
  Eye,
  TrendingUp,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UserProp = {
  name?: string | null;
  email?: string | null;
  headline?: string | null;
} | null;

export function LinkedinEditor({
  user,
  initial,
}: {
  user: UserProp;
  initial: { headline: string; about: string; postIdeas: string[] };
}) {
  const router = useRouter();
  const [headline, setHeadline] = useState(initial.headline);
  const [about, setAbout] = useState(initial.about);
  const [postIdeas, setPostIdeas] = useState(initial.postIdeas);
  const [saving, setSaving] = useState(false);
  const [genHeadline, setGenHeadline] = useState(false);
  const [genAbout, setGenAbout] = useState(false);
  const [genIdeas, setGenIdeas] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const dirtyRef = useRef(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/linkedin", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ headline, about, postIdeas }),
      });
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
  }, [headline, about, postIdeas]);

  const copy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const streamTo = async (
    kind: string,
    context: string,
    instruction: string,
    setter: (v: string) => void,
    setLoading: (v: boolean) => void
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, context, instruction }),
      });
      if (!res.ok || !res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setter("");
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setter(acc);
      }
    } finally {
      setLoading(false);
    }
  };

  const regenHeadline = () =>
    streamTo(
      "linkedin-headline",
      JSON.stringify({ name: user?.name, headline: user?.headline }),
      "Return a single 1-line headline under 220 chars. No numbering, no quotes.",
      setHeadline,
      setGenHeadline
    );

  const regenAbout = () =>
    streamTo(
      "linkedin-about",
      JSON.stringify({ name: user?.name, headline: user?.headline, currentAbout: about }),
      "Make it warmer and more specific. End with a soft CTA.",
      setAbout,
      setGenAbout
    );

  const regenIdeas = async () => {
    setGenIdeas(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "free",
          context: JSON.stringify({ name: user?.name, headline: user?.headline }),
          instruction:
            "Give 4 LinkedIn post ideas as a plain newline-separated list. One per line, no numbers, no markdown.",
        }),
      });
      if (!res.ok || !res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
      }
      const ideas = acc
        .split("\n")
        .map((s) => s.replace(/^[\d.\-*]+\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 6);
      setPostIdeas(ideas);
    } finally {
      setGenIdeas(false);
    }
  };

  return (
    <>
      <Topbar
        title="LinkedIn optimizer"
        subtitle={saving ? "Saving…" : "Saved · autosaves enabled"}
        user={user ?? undefined}
      />
      <div className="p-5 md:p-8 grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="glass rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold inline-flex items-center gap-2">
                  <Linkedin className="size-4 text-brand-blue" /> Headline ({headline.length}/220)
                </h3>
                <p className="text-xs text-white/55">Recruiters scan in 2 seconds — keep it sharp.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={regenHeadline}
                  disabled={genHeadline}
                >
                  {genHeadline ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
                  AI write
                </Button>
                <Button size="sm" onClick={() => copy("h", headline)}>
                  {copied === "h" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  Copy
                </Button>
              </div>
            </div>
            <textarea
              value={headline}
              onChange={(e) => setHeadline(e.target.value.slice(0, 220))}
              rows={2}
              placeholder="e.g. Senior Product Designer · Shipping expressive SaaS at Plume"
              className="mt-3 w-full rounded-xl bg-white/[0.02] border border-white/10 p-3 text-sm outline-none focus:border-brand-violet/50 resize-none"
            />
          </div>

          <div className="glass rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">About ({about.length} chars)</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={regenAbout}
                  disabled={genAbout}
                >
                  {genAbout ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                  Rewrite with AI
                </Button>
                <Button size="sm" onClick={() => copy("about", about)}>
                  {copied === "about" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  Copy
                </Button>
              </div>
            </div>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={11}
              placeholder="Tell your story. Be specific. AI will polish."
              className="mt-3 w-full rounded-xl bg-white/[0.02] border border-white/10 p-4 text-sm leading-relaxed outline-none focus:border-brand-violet/50 resize-none"
            />
            <div className="mt-3 flex items-center gap-2 text-xs text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    about.length > 800 ? "bg-emerald-400" : "bg-amber-300"
                  )}
                />
                {about.length > 800 ? "Strong length" : "Aim for 800+ chars"}
              </span>
              <span className="size-1 rounded-full bg-white/20" />
              <span>Reading time: {Math.max(1, Math.round(about.split(/\s+/).length / 200))}m</span>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Content ideas</h3>
              <Button
                size="sm"
                variant="secondary"
                onClick={regenIdeas}
                disabled={genIdeas}
              >
                {genIdeas ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
                Generate ideas
              </Button>
            </div>
            <p className="text-xs text-white/55">Posts that match your voice and audience.</p>
            <div className="mt-4 space-y-2">
              {postIdeas.length === 0 && (
                <p className="text-xs text-white/45 text-center py-3">
                  Click <span className="text-white/80 font-medium">Generate ideas</span> to draft 4 fresh angles.
                </p>
              )}
              {postIdeas.map((p, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-white/5 hover:bg-white/[0.02] flex items-start gap-3"
                >
                  <span className="size-7 shrink-0 rounded-lg gradient-border flex items-center justify-center text-xs font-semibold">
                    {i + 1}
                  </span>
                  <p className="text-sm flex-1">{p}</p>
                  <button
                    onClick={() => copy(`p${i}`, p)}
                    className="text-xs text-white/40 hover:text-white"
                  >
                    {copied === `p${i}` ? (
                      <Check className="size-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-white/55">Projected reach</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-semibold gradient-text">
                +{Math.max(0, Math.min(400, Math.round((headline.length + about.length) / 4)))}%
              </span>
              <span className="text-xs text-white/45">vs. baseline</span>
            </div>
            <div className="mt-4 space-y-2">
              <Row icon={Eye} label="Headline strength" value={`${Math.min(100, Math.round(headline.length / 2.2))}/100`} />
              <Row icon={TrendingUp} label="About depth" value={`${Math.min(100, Math.round(about.length / 16))}/100`} />
              <Row icon={Linkedin} label="Post ideas" value={`${postIdeas.length}`} />
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold">Profile checklist</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ["Headline filled", headline.length > 30],
                ["About 800+ chars", about.length > 800],
                ["At least 3 post ideas", postIdeas.length >= 3],
                ["Headline mentions role", /designer|engineer|founder|manager|writer|marketer/i.test(headline)],
              ].map(([label, done]) => (
                <li
                  key={label as string}
                  className="flex items-center gap-2"
                >
                  <span
                    className={cn(
                      "size-4 rounded-full flex items-center justify-center",
                      done
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/5 text-white/40"
                    )}
                  >
                    {done ? <Check className="size-2.5" /> : null}
                  </span>
                  <span className={done ? "text-white/85" : "text-white/55"}>
                    {label as string}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="inline-flex items-center gap-2 text-white/65">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
