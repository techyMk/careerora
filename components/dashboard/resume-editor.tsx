"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Download,
  Wand2,
  Plus,
  GripVertical,
  Gauge,
  Mail,
  Phone,
  MapPin,
  Globe,
  Loader2,
  Trash2,
  Check,
  ArrowLeft,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  bullets: string[];
};

type ResumeData = {
  summary: string;
  skills: string[];
  experience: Experience[];
  education?: { school: string; degree: string; period: string }[];
};

type ResumeProp = {
  id: string;
  name: string;
  template: string;
  atsScore: number;
  data: Partial<ResumeData>;
};

type UserProp = {
  name?: string | null;
  email?: string | null;
  headline?: string | null;
  location?: string | null;
  website?: string | null;
  phone?: string | null;
} | null;

const TEMPLATES = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern Split" },
  { id: "executive", label: "Executive" },
];

const DEFAULT_DATA: ResumeData = {
  summary: "",
  skills: [],
  experience: [],
  education: [],
};

export function ResumeEditor({ user, resume }: { user: UserProp; resume: ResumeProp }) {
  const router = useRouter();
  const [name, setName] = useState(resume.name);
  const [template, setTemplate] = useState(resume.template);
  const [data, setData] = useState<ResumeData>({ ...DEFAULT_DATA, ...resume.data });
  const [atsScore, setAtsScore] = useState(resume.atsScore);
  const [savedAt, setSavedAt] = useState<Date | null>(new Date());
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dirtyRef = useRef(false);

  const computeAts = useCallback((d: ResumeData) => {
    let s = 40;
    if (d.summary.length > 80) s += 10;
    if (d.summary.length > 200) s += 5;
    s += Math.min(d.skills.length, 10) * 2;
    s += Math.min(d.experience.length, 4) * 6;
    const totalBullets = d.experience.reduce((sum, e) => sum + e.bullets.length, 0);
    s += Math.min(totalBullets, 10) * 1.5;
    const hasMetrics = d.experience.some((e) =>
      e.bullets.some((b) => /\d+(%|\$|x|k|m|users|customers|revenue)/i.test(b))
    );
    if (hasMetrics) s += 8;
    return Math.min(100, Math.round(s));
  }, []);

  useEffect(() => {
    setAtsScore(computeAts(data));
  }, [data, computeAts]);

  const save = useCallback(
    async (patch?: Partial<ResumeProp>) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/resumes/${resume.id}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: patch?.name ?? name,
            template: patch?.template ?? template,
            atsScore: patch?.atsScore ?? atsScore,
            data,
          }),
        });
        if (res.ok) {
          setSavedAt(new Date());
          dirtyRef.current = false;
          router.refresh();
        }
      } finally {
        setSaving(false);
      }
    },
    [resume.id, name, template, atsScore, data, router]
  );

  useEffect(() => {
    dirtyRef.current = true;
    const t = setTimeout(() => {
      if (dirtyRef.current) save();
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, template, data, atsScore]);

  const rewriteSummary = async (instruction?: string) => {
    setGenerating(true);
    try {
      const context = JSON.stringify({
        currentSummary: data.summary,
        skills: data.skills,
        experience: data.experience,
        headline: user?.headline,
        name: user?.name,
      });
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "resume-summary",
          context,
          instruction: instruction ?? "Make it punchier and more specific.",
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
        setData((d) => ({ ...d, summary: acc }));
      }
    } finally {
      setGenerating(false);
    }
  };

  const addExperience = () => {
    setData((d) => ({
      ...d,
      experience: [
        ...d.experience,
        {
          id: Math.random().toString(36).slice(2),
          role: "Role",
          company: "Company · Location",
          period: "2024 — Present",
          bullets: ["Describe an impactful, measurable outcome."],
        },
      ],
    }));
  };

  const updateExperience = (id: string, patch: Partial<Experience>) =>
    setData((d) => ({
      ...d,
      experience: d.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));

  const removeExperience = (id: string) =>
    setData((d) => ({ ...d, experience: d.experience.filter((e) => e.id !== id) }));

  const addSkill = (s: string) => {
    const t = s.trim();
    if (!t) return;
    if (data.skills.includes(t)) return;
    setData((d) => ({ ...d, skills: [...d.skills, t] }));
  };
  const removeSkill = (s: string) =>
    setData((d) => ({ ...d, skills: d.skills.filter((x) => x !== s) }));

  const onDelete = async () => {
    if (!confirm("Delete this resume permanently?")) return;
    setDeleting(true);
    await fetch(`/api/resumes/${resume.id}`, { method: "DELETE" });
    router.push("/dashboard/resumes");
    router.refresh();
  };

  const subtitle = useMemo(() => {
    if (saving) return "Saving…";
    if (savedAt) return `Saved · autosaves enabled`;
    return "Unsaved";
  }, [saving, savedAt]);

  return (
    <>
      <Topbar title="Resume editor" subtitle={subtitle} user={user ?? undefined} />
      <div className="p-5 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push("/dashboard/resumes")}
          >
            <ArrowLeft className="size-3.5" />
            All resumes
          </Button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-transparent text-xl md:text-2xl font-semibold tracking-tight outline-none border-b border-transparent hover:border-white/10 focus:border-brand-violet/50 transition-colors py-1"
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
              variant="secondary"
              onClick={() => {
                window.print();
              }}
            >
              <Download className="size-3.5" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-5">
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Summary</h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => rewriteSummary()}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="size-3.5" />
                  )}
                  AI rewrite
                </Button>
              </div>
              <textarea
                value={data.summary}
                onChange={(e) =>
                  setData((d) => ({ ...d, summary: e.target.value }))
                }
                rows={6}
                placeholder="Sketch a few sentences — AI will polish."
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 p-3 text-sm outline-none focus:border-brand-violet/50 resize-none"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {["Make punchier", "Add metrics", "Senior tone", "Shorter"].map((c) => (
                  <button
                    key={c}
                    onClick={() => rewriteSummary(c)}
                    disabled={generating}
                    className="px-2.5 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50"
                  >
                    <Sparkles className="inline size-3 mr-1 text-brand-violet" />
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Experience</h3>
                <Button size="sm" variant="secondary" onClick={addExperience}>
                  <Plus className="size-3.5" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {data.experience.length === 0 && (
                  <p className="text-xs text-white/45 text-center py-4">
                    No experience yet — add your first role.
                  </p>
                )}
                {data.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="size-3.5 text-white/30" />
                      <input
                        value={exp.role}
                        onChange={(e) =>
                          updateExperience(exp.id, { role: e.target.value })
                        }
                        className="bg-transparent text-sm font-medium outline-none flex-1"
                      />
                      <input
                        value={exp.period}
                        onChange={(e) =>
                          updateExperience(exp.id, { period: e.target.value })
                        }
                        className="bg-transparent text-[11px] text-white/55 outline-none w-32 text-right"
                      />
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="size-6 rounded-md text-white/40 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                    <input
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(exp.id, { company: e.target.value })
                      }
                      className="bg-transparent text-xs text-white/55 outline-none w-full"
                    />
                    <div className="space-y-1">
                      {exp.bullets.map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-white/30 text-xs mt-1">•</span>
                          <input
                            value={b}
                            onChange={(e) => {
                              const bullets = [...exp.bullets];
                              bullets[i] = e.target.value;
                              updateExperience(exp.id, { bullets });
                            }}
                            className="flex-1 bg-transparent text-xs outline-none"
                          />
                          <button
                            onClick={() => {
                              const bullets = exp.bullets.filter((_, j) => j !== i);
                              updateExperience(exp.id, { bullets });
                            }}
                            className="size-5 text-white/30 hover:text-rose-300"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          updateExperience(exp.id, {
                            bullets: [...exp.bullets, ""],
                          })
                        }
                        className="ml-4 text-xs text-white/45 hover:text-white inline-flex items-center gap-1"
                      >
                        <Plus className="size-3" /> Add bullet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3">Skills</h3>
              <div className="flex items-center flex-wrap gap-1.5">
                {data.skills.map((s) => (
                  <span
                    key={s}
                    className="group inline-flex items-center gap-1 text-xs pl-2.5 pr-1 py-1 rounded-full bg-white/5 border border-white/10"
                  >
                    {s}
                    <button
                      onClick={() => removeSkill(s)}
                      className="size-4 rounded-full text-white/40 hover:text-rose-300 hover:bg-rose-500/15 flex items-center justify-center"
                    >
                      <Trash2 className="size-2.5" />
                    </button>
                  </span>
                ))}
                <input
                  placeholder="+ Add skill (Enter)"
                  className="text-xs px-2.5 py-1 rounded-full bg-transparent border border-dashed border-white/15 outline-none placeholder:text-white/40 w-32 focus:border-brand-violet/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="inline-flex p-1 glass rounded-full text-xs">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full transition-all",
                      template === t.id
                        ? "bg-brand-gradient shadow-glow"
                        : "text-white/55 hover:text-white"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 h-9 rounded-full glass text-xs">
                  <Gauge className="size-3.5 text-brand-violet" />
                  ATS{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      atsScore >= 90
                        ? "text-emerald-300"
                        : atsScore >= 80
                          ? "text-amber-300"
                          : "text-rose-300"
                    )}
                  >
                    {atsScore}
                  </span>{" "}
                  / 100
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full glass text-xs text-white/55">
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
            </div>

            <div
              id="resume-print"
              className="relative gradient-border rounded-3xl glass-strong p-3 md:p-4 shadow-soft"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={template}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.35 }}
                  className="bg-white text-ink-900 rounded-2xl aspect-[1/1.3] md:aspect-[8.5/11] max-w-3xl mx-auto p-8 md:p-12 shadow-soft relative overflow-hidden"
                >
                  {template === "modern" ? (
                    <ModernResume user={user} data={data} resumeName={name} />
                  ) : template === "executive" ? (
                    <ExecutiveResume user={user} data={data} resumeName={name} />
                  ) : (
                    <ClassicResume user={user} data={data} resumeName={name} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          aside, header, .no-print { display: none !important; }
          #resume-print { padding: 0 !important; box-shadow: none !important; border: none !important; background: white !important; }
        }
      `}</style>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-ink-900/70 mb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Contact({
  user,
}: {
  user: UserProp;
}) {
  return (
    <div className="flex items-center gap-3 text-[11px] text-ink-700/85 flex-wrap">
      {user?.email && <span className="inline-flex items-center gap-1"><Mail className="size-3"/>{user.email}</span>}
      {user?.phone && <span className="inline-flex items-center gap-1"><Phone className="size-3"/>{user.phone}</span>}
      {user?.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3"/>{user.location}</span>}
      {user?.website && <span className="inline-flex items-center gap-1"><Globe className="size-3"/>{user.website}</span>}
    </div>
  );
}

function ClassicResume({
  user,
  data,
  resumeName,
}: {
  user: UserProp;
  data: ResumeData;
  resumeName: string;
}) {
  return (
    <div className="font-sans">
      <div className="text-center border-b border-ink-900/15 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {user?.name || resumeName}
        </h1>
        {user?.headline && (
          <p className="text-sm text-ink-700">{user.headline}</p>
        )}
        <div className="mt-2 flex justify-center">
          <Contact user={user} />
        </div>
      </div>
      {data.summary && (
        <Section title="Summary">
          <p className="text-sm leading-relaxed text-ink-700">{data.summary}</p>
        </Section>
      )}
      {data.experience.length > 0 && (
        <Section title="Experience">
          {data.experience.map((e) => (
            <div key={e.id} className="mb-4">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">{e.role}</p>
                <p className="text-xs text-ink-700/70">{e.period}</p>
              </div>
              <p className="text-sm text-ink-700/80">{e.company}</p>
              {e.bullets.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-sm text-ink-700 space-y-1">
                  {e.bullets.filter(Boolean).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}
      {data.skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s) => (
              <span key={s} className="text-xs px-2 py-0.5 rounded bg-ink-900/5 border border-ink-900/10">
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function ModernResume({
  user,
  data,
  resumeName,
}: {
  user: UserProp;
  data: ResumeData;
  resumeName: string;
}) {
  return (
    <div className="font-sans grid grid-cols-[1fr_2fr] gap-6">
      <aside className="bg-ink-900/[0.03] -m-12 mr-0 p-12 pr-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {user?.name || resumeName}
        </h1>
        {user?.headline && (
          <p className="text-sm text-ink-700">{user.headline}</p>
        )}
        <div className="mt-5 space-y-1.5 text-[11px] text-ink-700/85">
          {user?.email && <p className="inline-flex items-center gap-1"><Mail className="size-3"/>{user.email}</p>}
          {user?.phone && <p className="inline-flex items-center gap-1"><Phone className="size-3"/>{user.phone}</p>}
          {user?.location && <p className="inline-flex items-center gap-1"><MapPin className="size-3"/>{user.location}</p>}
          {user?.website && <p className="inline-flex items-center gap-1"><Globe className="size-3"/>{user.website}</p>}
        </div>
        {data.skills.length > 0 && (
          <>
            <h3 className="mt-6 text-[10px] uppercase tracking-wider font-semibold text-ink-900/70">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-1">
              {data.skills.map((s) => (
                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-ink-900/5">
                  {s}
                </span>
              ))}
            </div>
          </>
        )}
      </aside>
      <main>
        {data.summary && (
          <Section title="About">
            <p className="text-sm leading-relaxed text-ink-700">{data.summary}</p>
          </Section>
        )}
        {data.experience.length > 0 && (
          <Section title="Experience">
            {data.experience.map((e) => (
              <div key={e.id} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">{e.role}</p>
                  <p className="text-xs text-ink-700/70">{e.period}</p>
                </div>
                <p className="text-sm text-ink-700/80">{e.company}</p>
                {e.bullets.length > 0 && (
                  <ul className="mt-1 list-disc pl-4 text-sm text-ink-700 space-y-0.5">
                    {e.bullets.filter(Boolean).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}
      </main>
    </div>
  );
}

function ExecutiveResume({
  user,
  data,
  resumeName,
}: {
  user: UserProp;
  data: ResumeData;
  resumeName: string;
}) {
  return (
    <div className="font-serif">
      <h1 className="text-4xl tracking-tight">{user?.name || resumeName}</h1>
      {user?.headline && (
        <p className="text-sm text-ink-700 uppercase tracking-[0.3em]">
          {user.headline}
        </p>
      )}
      <div className="my-3 h-px bg-ink-900/15" />
      <Contact user={user} />
      {data.summary && (
        <p className="mt-4 text-sm leading-relaxed text-ink-700">{data.summary}</p>
      )}
      {data.experience.length > 0 && (
        <Section title="Selected Experience">
          {data.experience.map((e) => (
            <div key={e.id} className="mb-4">
              <p className="font-semibold uppercase tracking-wider text-xs">{e.company}</p>
              <div className="flex items-baseline justify-between">
                <p>{e.role}</p>
                <p className="text-xs italic text-ink-700/70">{e.period}</p>
              </div>
              {e.bullets.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-sm text-ink-700 space-y-1">
                  {e.bullets.filter(Boolean).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
