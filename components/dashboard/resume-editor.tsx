"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ──────────────── Types ──────────────── */

type Experience = {
  id: string;
  role: string;
  company: string;
  location?: string;
  period: string;
  bullets: string[];
};

type Education = {
  id: string;
  school: string;
  degree: string;
  period: string;
  details?: string;
};

type ProjectItem = {
  id: string;
  name: string;
  description: string;
  tech?: string;
  url?: string;
};

type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
};

type Award = { id: string; name: string; issuer: string; date: string };
type Language = { id: string; name: string; level: string };
type LinkItem = { id: string; label: string; url: string };

type ResumeData = {
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: ProjectItem[];
  certifications: Certification[];
  awards: Award[];
  languages: Language[];
  links: LinkItem[];
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
  avatar?: string | null;
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
  projects: [],
  certifications: [],
  awards: [],
  languages: [],
  links: [],
};

const rid = () => Math.random().toString(36).slice(2, 9);

/* ──────────────── Component ──────────────── */

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
    let s = 30;
    if (d.summary.length > 100) s += 10;
    if (d.summary.length > 250) s += 5;
    s += Math.min(d.skills.length, 12) * 1.5;
    s += Math.min(d.experience.length, 4) * 6;
    const totalBullets = d.experience.reduce((sum, e) => sum + e.bullets.length, 0);
    s += Math.min(totalBullets, 12) * 1;
    const hasMetrics = d.experience.some((e) =>
      e.bullets.some((b) => /\d+(%|\$|x|k|m|users|customers|revenue)/i.test(b))
    );
    if (hasMetrics) s += 8;
    if (d.education.length > 0) s += 8;
    if (d.projects.length > 0) s += 5;
    if (d.certifications.length > 0) s += 4;
    if (d.languages.length > 0) s += 3;
    if (d.awards.length > 0) s += 3;
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

  /* ──── Skills ──── */
  const addSkill = (s: string) => {
    const t = s.trim();
    if (!t || data.skills.includes(t)) return;
    setData((d) => ({ ...d, skills: [...d.skills, t] }));
  };
  const removeSkill = (s: string) =>
    setData((d) => ({ ...d, skills: d.skills.filter((x) => x !== s) }));

  /* ──── Experience ──── */
  const addExperience = () =>
    setData((d) => ({
      ...d,
      experience: [
        ...d.experience,
        { id: rid(), role: "Role", company: "Company", location: "", period: "2024 — Present", bullets: ["Describe an impactful, measurable outcome."] },
      ],
    }));
  const updateExperience = (id: string, patch: Partial<Experience>) =>
    setData((d) => ({ ...d, experience: d.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  const removeExperience = (id: string) =>
    setData((d) => ({ ...d, experience: d.experience.filter((e) => e.id !== id) }));

  /* ──── Education ──── */
  const addEducation = () =>
    setData((d) => ({
      ...d,
      education: [
        ...d.education,
        { id: rid(), school: "School", degree: "Degree", period: "2018 — 2022", details: "" },
      ],
    }));
  const updateEducation = (id: string, patch: Partial<Education>) =>
    setData((d) => ({ ...d, education: d.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  const removeEducation = (id: string) =>
    setData((d) => ({ ...d, education: d.education.filter((e) => e.id !== id) }));

  /* ──── Projects ──── */
  const addProject = () =>
    setData((d) => ({
      ...d,
      projects: [
        ...d.projects,
        { id: rid(), name: "Project name", description: "", tech: "", url: "" },
      ],
    }));
  const updateProject = (id: string, patch: Partial<ProjectItem>) =>
    setData((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const removeProject = (id: string) =>
    setData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));

  /* ──── Certifications ──── */
  const addCert = () =>
    setData((d) => ({
      ...d,
      certifications: [
        ...d.certifications,
        { id: rid(), name: "Certification name", issuer: "Issuer", date: "2025", url: "" },
      ],
    }));
  const updateCert = (id: string, patch: Partial<Certification>) =>
    setData((d) => ({ ...d, certifications: d.certifications.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const removeCert = (id: string) =>
    setData((d) => ({ ...d, certifications: d.certifications.filter((c) => c.id !== id) }));

  /* ──── Awards ──── */
  const addAward = () =>
    setData((d) => ({
      ...d,
      awards: [...d.awards, { id: rid(), name: "Award name", issuer: "Issuer", date: "2025" }],
    }));
  const updateAward = (id: string, patch: Partial<Award>) =>
    setData((d) => ({ ...d, awards: d.awards.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
  const removeAward = (id: string) =>
    setData((d) => ({ ...d, awards: d.awards.filter((a) => a.id !== id) }));

  /* ──── Languages ──── */
  const addLanguage = () =>
    setData((d) => ({
      ...d,
      languages: [...d.languages, { id: rid(), name: "Language", level: "Fluent" }],
    }));
  const updateLanguage = (id: string, patch: Partial<Language>) =>
    setData((d) => ({ ...d, languages: d.languages.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  const removeLanguage = (id: string) =>
    setData((d) => ({ ...d, languages: d.languages.filter((l) => l.id !== id) }));

  /* ──── Links ──── */
  const addLink = () =>
    setData((d) => ({
      ...d,
      links: [...d.links, { id: rid(), label: "Label", url: "" }],
    }));
  const updateLink = (id: string, patch: Partial<LinkItem>) =>
    setData((d) => ({ ...d, links: d.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  const removeLink = (id: string) =>
    setData((d) => ({ ...d, links: d.links.filter((l) => l.id !== id) }));

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
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <Button size="sm" variant="ghost" onClick={() => router.push("/dashboard/resumes")}>
            <ArrowLeft className="size-3.5" />
            All resumes
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
            <Button size="sm" variant="secondary" onClick={() => window.print()}>
              <Download className="size-3.5" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-5">
          {/* ─────── Sidebar editor ─────── */}
          <div className="space-y-4">
            {/* Summary */}
            <Section
              title="Summary"
              action={
                <Button size="sm" variant="secondary" onClick={() => rewriteSummary()} disabled={generating}>
                  {generating ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
                  AI rewrite
                </Button>
              }
            >
              <textarea
                value={data.summary}
                onChange={(e) => setData((d) => ({ ...d, summary: e.target.value }))}
                rows={6}
                placeholder="Sketch a few sentences — AI will polish."
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 p-3 text-sm outline-none focus:border-brand-violet/50 resize-none"
              />
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                {["Make punchier", "Add metrics", "Senior tone", "Shorter"].map((c) => (
                  <button
                    key={c}
                    onClick={() => rewriteSummary(c)}
                    disabled={generating}
                    className="px-2.5 py-1 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50"
                  >
                    <Wand2 className="inline size-3 mr-1 text-brand-violet" />
                    {c}
                  </button>
                ))}
              </div>
            </Section>

            {/* Experience */}
            <Section title="Experience" count={data.experience.length} action={<AddButton onClick={addExperience} />}>
              {data.experience.length === 0 && <Empty msg="No experience yet — add your first role." />}
              <div className="space-y-2">
                {data.experience.map((exp) => (
                  <Card key={exp.id} onDelete={() => removeExperience(exp.id)}>
                    <Row>
                      <GripVertical className="size-3.5 text-white/30 shrink-0" />
                      <Input value={exp.role} onChange={(v) => updateExperience(exp.id, { role: v })} placeholder="Role" className="font-medium" />
                      <Input value={exp.period} onChange={(v) => updateExperience(exp.id, { period: v })} placeholder="2024 — Present" className="w-32 text-right text-[11px] text-white/55" />
                    </Row>
                    <Input value={exp.company} onChange={(v) => updateExperience(exp.id, { company: v })} placeholder="Company" className="text-xs text-white/55" />
                    <Input value={exp.location ?? ""} onChange={(v) => updateExperience(exp.id, { location: v })} placeholder="Location (optional)" className="text-xs text-white/55" />
                    <Bullets
                      bullets={exp.bullets}
                      onChange={(bullets) => updateExperience(exp.id, { bullets })}
                    />
                  </Card>
                ))}
              </div>
            </Section>

            {/* Education */}
            <Section title="Education" count={data.education.length} action={<AddButton onClick={addEducation} />}>
              {data.education.length === 0 && <Empty msg="Add your degree." />}
              <div className="space-y-2">
                {data.education.map((ed) => (
                  <Card key={ed.id} onDelete={() => removeEducation(ed.id)}>
                    <Row>
                      <Input value={ed.school} onChange={(v) => updateEducation(ed.id, { school: v })} placeholder="School" className="font-medium" />
                      <Input value={ed.period} onChange={(v) => updateEducation(ed.id, { period: v })} placeholder="2018 — 2022" className="w-32 text-right text-[11px] text-white/55" />
                    </Row>
                    <Input value={ed.degree} onChange={(v) => updateEducation(ed.id, { degree: v })} placeholder="Degree" className="text-xs text-white/55" />
                    <Input value={ed.details ?? ""} onChange={(v) => updateEducation(ed.id, { details: v })} placeholder="GPA, honors, thesis (optional)" className="text-xs text-white/55" />
                  </Card>
                ))}
              </div>
            </Section>

            {/* Projects */}
            <Section title="Projects" count={data.projects.length} action={<AddButton onClick={addProject} />}>
              {data.projects.length === 0 && <Empty msg="Add a notable side project." />}
              <div className="space-y-2">
                {data.projects.map((p) => (
                  <Card key={p.id} onDelete={() => removeProject(p.id)}>
                    <Row>
                      <Input value={p.name} onChange={(v) => updateProject(p.id, { name: v })} placeholder="Project name" className="font-medium" />
                    </Row>
                    <Textarea value={p.description} onChange={(v) => updateProject(p.id, { description: v })} placeholder="1–2 sentence summary." rows={2} />
                    <Row>
                      <Input value={p.tech ?? ""} onChange={(v) => updateProject(p.id, { tech: v })} placeholder="Tech / tools" className="text-xs text-white/55" />
                      <Input value={p.url ?? ""} onChange={(v) => updateProject(p.id, { url: v })} placeholder="link.com" className="text-xs text-white/55" />
                    </Row>
                  </Card>
                ))}
              </div>
            </Section>

            {/* Skills */}
            <Section title="Skills" count={data.skills.length}>
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
            </Section>

            {/* Certifications */}
            <Section title="Certifications" count={data.certifications.length} action={<AddButton onClick={addCert} />}>
              {data.certifications.length === 0 && <Empty msg="Add a course or credential." />}
              <div className="space-y-2">
                {data.certifications.map((c) => (
                  <Card key={c.id} onDelete={() => removeCert(c.id)}>
                    <Row>
                      <Input value={c.name} onChange={(v) => updateCert(c.id, { name: v })} placeholder="Certification" className="font-medium" />
                      <Input value={c.date} onChange={(v) => updateCert(c.id, { date: v })} placeholder="2025" className="w-20 text-right text-[11px] text-white/55" />
                    </Row>
                    <Input value={c.issuer} onChange={(v) => updateCert(c.id, { issuer: v })} placeholder="Issuer" className="text-xs text-white/55" />
                    <Input value={c.url ?? ""} onChange={(v) => updateCert(c.id, { url: v })} placeholder="link.com (optional)" className="text-xs text-white/55" />
                  </Card>
                ))}
              </div>
            </Section>

            {/* Awards */}
            <Section title="Awards" count={data.awards.length} action={<AddButton onClick={addAward} />}>
              {data.awards.length === 0 && <Empty msg="Add recognition or wins." />}
              <div className="space-y-2">
                {data.awards.map((a) => (
                  <Card key={a.id} onDelete={() => removeAward(a.id)}>
                    <Row>
                      <Input value={a.name} onChange={(v) => updateAward(a.id, { name: v })} placeholder="Award" className="font-medium" />
                      <Input value={a.date} onChange={(v) => updateAward(a.id, { date: v })} placeholder="2025" className="w-20 text-right text-[11px] text-white/55" />
                    </Row>
                    <Input value={a.issuer} onChange={(v) => updateAward(a.id, { issuer: v })} placeholder="Issuer" className="text-xs text-white/55" />
                  </Card>
                ))}
              </div>
            </Section>

            {/* Languages */}
            <Section title="Languages" count={data.languages.length} action={<AddButton onClick={addLanguage} />}>
              {data.languages.length === 0 && <Empty msg="List what you speak." />}
              <div className="space-y-2">
                {data.languages.map((l) => (
                  <Card key={l.id} onDelete={() => removeLanguage(l.id)} compact>
                    <Row>
                      <Input value={l.name} onChange={(v) => updateLanguage(l.id, { name: v })} placeholder="Language" />
                      <Input value={l.level} onChange={(v) => updateLanguage(l.id, { level: v })} placeholder="Native / Fluent / Basic" className="w-44 text-[11px] text-white/55" />
                    </Row>
                  </Card>
                ))}
              </div>
            </Section>

            {/* Links */}
            <Section title="Links" count={data.links.length} action={<AddButton onClick={addLink} />}>
              {data.links.length === 0 && <Empty msg="Add portfolio, GitHub, LinkedIn." />}
              <div className="space-y-2">
                {data.links.map((l) => (
                  <Card key={l.id} onDelete={() => removeLink(l.id)} compact>
                    <Row>
                      <Input value={l.label} onChange={(v) => updateLink(l.id, { label: v })} placeholder="Label" className="w-32" />
                      <Input value={l.url} onChange={(v) => updateLink(l.id, { url: v })} placeholder="link.com" className="text-xs text-white/55" />
                    </Row>
                  </Card>
                ))}
              </div>
            </Section>
          </div>

          {/* ─────── Preview ─────── */}
          <div className="space-y-4 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="inline-flex p-1 glass rounded-full text-xs">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full transition-all",
                      template === t.id ? "bg-brand-gradient shadow-glow" : "text-white/55 hover:text-white"
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
                      atsScore >= 90 ? "text-emerald-300" : atsScore >= 80 ? "text-amber-300" : "text-rose-300"
                    )}
                  >
                    {atsScore}
                  </span>{" "}
                  / 100
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full glass text-xs text-white/55">
                  {saving ? <><Loader2 className="size-3 animate-spin" /> Saving</> : <><Check className="size-3 text-emerald-400" /> Saved</>}
                </div>
              </div>
            </div>

            <div id="resume-print" className="relative gradient-border rounded-3xl glass-strong p-3 md:p-4 shadow-soft">
              <AnimatePresence mode="wait">
                <motion.div
                  key={template}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.35 }}
                  className="bg-white text-ink-900 rounded-2xl aspect-[8.5/11] max-w-3xl mx-auto p-8 md:p-12 shadow-soft relative overflow-hidden"
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

/* ──────────────── Editor primitives ──────────────── */

function Section({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-sm font-semibold hover:text-white text-white/85"
        >
          {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          {title}
          {typeof count === "number" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/55">{count}</span>
          )}
        </button>
        <div className="ml-auto">{action}</div>
      </div>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button size="sm" variant="secondary" onClick={onClick}>
      <Plus className="size-3.5" /> Add
    </Button>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p className="text-xs text-white/45 text-center py-3">{msg}</p>;
}

function Card({
  children,
  onDelete,
  compact,
}: {
  children: React.ReactNode;
  onDelete?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border border-white/10 bg-white/[0.02] space-y-2", compact ? "p-2.5" : "p-3")}>
      <div className="space-y-1.5">{children}</div>
      {onDelete && (
        <div className="flex justify-end">
          <button onClick={onDelete} className="text-[10px] text-white/40 hover:text-rose-300 inline-flex items-center gap-1">
            <Trash2 className="size-2.5" /> Remove
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}

function Input({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "flex-1 bg-transparent text-sm outline-none placeholder:text-white/30 focus:placeholder:text-white/50",
        className
      )}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg bg-white/[0.01] border border-white/5 p-2 text-xs outline-none focus:border-brand-violet/40 resize-none placeholder:text-white/30"
    />
  );
}

function Bullets({ bullets, onChange }: { bullets: string[]; onChange: (b: string[]) => void }) {
  return (
    <div className="space-y-1">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-white/30 text-xs mt-1">•</span>
          <input
            value={b}
            onChange={(e) => {
              const next = [...bullets];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder="Quantifiable, action-led bullet"
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-white/30"
          />
          <button
            onClick={() => onChange(bullets.filter((_, j) => j !== i))}
            className="size-5 text-white/30 hover:text-rose-300"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...bullets, ""])}
        className="ml-4 text-xs text-white/45 hover:text-white inline-flex items-center gap-1"
      >
        <Plus className="size-3" /> Add bullet
      </button>
    </div>
  );
}

/* ──────────────── Template renderers ──────────────── */

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-4 mb-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold gradient-text">
      {children}
    </h2>
  );
}

function Contact({ user, data }: { user: UserProp; data: ResumeData }) {
  const items: string[] = [];
  if (user?.email) items.push(user.email);
  if (user?.phone) items.push(user.phone);
  if (user?.location) items.push(user.location);
  if (user?.website) items.push(user.website);
  data.links.forEach((l) => l.url && items.push(`${l.label}: ${l.url}`));
  return (
    <div className="text-[10px] text-ink-700/85 flex items-center gap-1.5 flex-wrap">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-ink-700/40">·</span>}
          {it}
        </span>
      ))}
    </div>
  );
}

function ClassicResume({ user, data, resumeName }: { user: UserProp; data: ResumeData; resumeName: string }) {
  return (
    <div className="font-sans text-[11px] leading-snug">
      <div className="text-center border-b border-ink-900/15 pb-2.5">
        <h1 className="text-2xl font-semibold tracking-tight">{user?.name || resumeName}</h1>
        {user?.headline && <p className="text-xs text-ink-700">{user.headline}</p>}
        <div className="mt-1.5 flex justify-center">
          <Contact user={user} data={data} />
        </div>
      </div>

      {data.summary && (
        <>
          <Heading>Summary</Heading>
          <p className="text-ink-700">{data.summary}</p>
        </>
      )}

      {data.experience.length > 0 && (
        <>
          <Heading>Experience</Heading>
          {data.experience.map((e) => (
            <div key={e.id} className="mb-2.5">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">{e.role}</p>
                <p className="text-[10px] text-ink-700/70">{e.period}</p>
              </div>
              <p className="text-ink-700/85">
                {e.company}
                {e.location ? ` · ${e.location}` : ""}
              </p>
              {e.bullets.length > 0 && (
                <ul className="mt-0.5 list-disc pl-4 text-ink-700 space-y-0.5">
                  {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {data.education.length > 0 && (
        <>
          <Heading>Education</Heading>
          {data.education.map((ed) => (
            <div key={ed.id} className="mb-1.5">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">{ed.school}</p>
                <p className="text-[10px] text-ink-700/70">{ed.period}</p>
              </div>
              <p className="text-ink-700/85">{ed.degree}</p>
              {ed.details && <p className="text-[10px] text-ink-700/70">{ed.details}</p>}
            </div>
          ))}
        </>
      )}

      {data.projects.length > 0 && (
        <>
          <Heading>Projects</Heading>
          {data.projects.map((p) => (
            <div key={p.id} className="mb-1.5">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">{p.name}</p>
                {p.url && <p className="text-[10px] text-ink-700/70">{p.url}</p>}
              </div>
              {p.description && <p className="text-ink-700">{p.description}</p>}
              {p.tech && <p className="text-[10px] text-ink-700/70">{p.tech}</p>}
            </div>
          ))}
        </>
      )}

      {data.skills.length > 0 && (
        <>
          <Heading>Skills</Heading>
          <div className="flex flex-wrap gap-1">
            {data.skills.map((s) => (
              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-ink-900/[0.04] border border-ink-900/10">{s}</span>
            ))}
          </div>
        </>
      )}

      {data.certifications.length > 0 && (
        <>
          <Heading>Certifications</Heading>
          {data.certifications.map((c) => (
            <div key={c.id} className="mb-1 flex items-baseline justify-between">
              <p>
                <span className="font-medium">{c.name}</span>
                {c.issuer && <span className="text-ink-700/70"> · {c.issuer}</span>}
              </p>
              <p className="text-[10px] text-ink-700/70">{c.date}</p>
            </div>
          ))}
        </>
      )}

      <div className="grid grid-cols-2 gap-x-4">
        {data.languages.length > 0 && (
          <div>
            <Heading>Languages</Heading>
            {data.languages.map((l) => (
              <p key={l.id} className="text-ink-700"><span className="font-medium">{l.name}</span> · <span className="text-ink-700/70">{l.level}</span></p>
            ))}
          </div>
        )}
        {data.awards.length > 0 && (
          <div>
            <Heading>Awards</Heading>
            {data.awards.map((a) => (
              <p key={a.id} className="text-ink-700">
                <span className="font-medium">{a.name}</span>
                <span className="text-ink-700/70"> · {a.issuer} · {a.date}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ModernResume({ user, data, resumeName }: { user: UserProp; data: ResumeData; resumeName: string }) {
  return (
    <div className="font-sans text-[11px] leading-snug grid grid-cols-[34%_66%] gap-5">
      <aside className="bg-ink-900/[0.03] -m-12 mr-0 p-12 pr-5 space-y-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{user?.name || resumeName}</h1>
          {user?.headline && <p className="text-[11px] text-ink-700/85">{user.headline}</p>}
        </div>

        <div className="space-y-1 text-[10px] text-ink-700/85">
          {user?.email && <p className="break-all">{user.email}</p>}
          {user?.phone && <p>{user.phone}</p>}
          {user?.location && <p>{user.location}</p>}
          {user?.website && <p>{user.website}</p>}
        </div>

        {data.links.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-ink-900/70 mb-1">Links</p>
            <div className="space-y-0.5 text-[10px]">
              {data.links.map((l) => (
                <p key={l.id} className="text-ink-700">
                  <span className="font-medium">{l.label}:</span> <span className="text-ink-700/70 break-all">{l.url}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {data.skills.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-ink-900/70 mb-1">Skills</p>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((s) => (
                <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-ink-900/[0.05]">{s}</span>
              ))}
            </div>
          </div>
        )}

        {data.languages.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-ink-900/70 mb-1">Languages</p>
            <div className="space-y-0.5 text-[10px]">
              {data.languages.map((l) => (
                <p key={l.id} className="text-ink-700"><span className="font-medium">{l.name}</span> · <span className="text-ink-700/70">{l.level}</span></p>
              ))}
            </div>
          </div>
        )}

        {data.certifications.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-ink-900/70 mb-1">Certifications</p>
            <div className="space-y-1 text-[10px]">
              {data.certifications.map((c) => (
                <div key={c.id}>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-ink-700/70">{c.issuer} · {c.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.awards.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-ink-900/70 mb-1">Awards</p>
            <div className="space-y-1 text-[10px]">
              {data.awards.map((a) => (
                <div key={a.id}>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-ink-700/70">{a.issuer} · {a.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="min-w-0">
        {data.summary && (
          <>
            <Heading>About</Heading>
            <p className="text-ink-700">{data.summary}</p>
          </>
        )}

        {data.experience.length > 0 && (
          <>
            <Heading>Experience</Heading>
            {data.experience.map((e) => (
              <div key={e.id} className="mb-2.5">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">{e.role}</p>
                  <p className="text-[10px] text-ink-700/70">{e.period}</p>
                </div>
                <p className="text-ink-700/85">
                  {e.company}{e.location ? ` · ${e.location}` : ""}
                </p>
                {e.bullets.length > 0 && (
                  <ul className="mt-0.5 list-disc pl-4 text-ink-700 space-y-0.5">
                    {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        {data.projects.length > 0 && (
          <>
            <Heading>Projects</Heading>
            {data.projects.map((p) => (
              <div key={p.id} className="mb-1.5">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">{p.name}</p>
                  {p.url && <p className="text-[10px] text-ink-700/70">{p.url}</p>}
                </div>
                {p.description && <p className="text-ink-700">{p.description}</p>}
                {p.tech && <p className="text-[10px] text-ink-700/70">{p.tech}</p>}
              </div>
            ))}
          </>
        )}

        {data.education.length > 0 && (
          <>
            <Heading>Education</Heading>
            {data.education.map((ed) => (
              <div key={ed.id} className="mb-1.5">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">{ed.school}</p>
                  <p className="text-[10px] text-ink-700/70">{ed.period}</p>
                </div>
                <p className="text-ink-700/85">{ed.degree}</p>
                {ed.details && <p className="text-[10px] text-ink-700/70">{ed.details}</p>}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

function ExecutiveResume({ user, data, resumeName }: { user: UserProp; data: ResumeData; resumeName: string }) {
  return (
    <div className="font-serif text-[11px] leading-snug">
      <h1 className="text-3xl tracking-tight">{user?.name || resumeName}</h1>
      {user?.headline && <p className="text-[10px] text-ink-700 uppercase tracking-[0.3em] mt-1">{user.headline}</p>}
      <div className="my-2.5 h-px bg-ink-900/15" />
      <div className="font-sans">
        <Contact user={user} data={data} />
      </div>

      {data.summary && (
        <p className="mt-3 italic text-ink-700">{data.summary}</p>
      )}

      {data.experience.length > 0 && (
        <>
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] font-semibold font-sans">Selected Experience</p>
          {data.experience.map((e) => (
            <div key={e.id} className="mt-2">
              <p className="text-[9px] uppercase tracking-[0.25em] font-semibold font-sans text-ink-700">{e.company}{e.location ? ` · ${e.location}` : ""}</p>
              <div className="flex items-baseline justify-between">
                <p>{e.role}</p>
                <p className="text-[10px] italic text-ink-700/70">{e.period}</p>
              </div>
              {e.bullets.length > 0 && (
                <ul className="mt-0.5 list-disc pl-4 text-ink-700 space-y-0.5">
                  {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {data.education.length > 0 && (
        <>
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] font-semibold font-sans">Education</p>
          {data.education.map((ed) => (
            <div key={ed.id} className="mt-1 flex items-baseline justify-between">
              <p>
                <span className="font-semibold">{ed.school}</span>
                <span className="text-ink-700/85"> — {ed.degree}</span>
                {ed.details && <span className="text-ink-700/70"> · {ed.details}</span>}
              </p>
              <p className="text-[10px] italic text-ink-700/70">{ed.period}</p>
            </div>
          ))}
        </>
      )}

      {data.projects.length > 0 && (
        <>
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] font-semibold font-sans">Notable Projects</p>
          {data.projects.map((p) => (
            <div key={p.id} className="mt-1">
              <p><span className="font-semibold">{p.name}</span>{p.tech && <span className="text-ink-700/70"> · {p.tech}</span>}</p>
              {p.description && <p className="text-ink-700/85">{p.description}</p>}
            </div>
          ))}
        </>
      )}

      <div className="mt-4 grid grid-cols-2 gap-x-4 font-sans">
        {data.certifications.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold">Certifications</p>
            {data.certifications.map((c) => (
              <p key={c.id} className="mt-0.5 text-ink-700"><span className="font-medium">{c.name}</span> · <span className="text-ink-700/70">{c.issuer} · {c.date}</span></p>
            ))}
          </div>
        )}
        {data.awards.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold">Awards</p>
            {data.awards.map((a) => (
              <p key={a.id} className="mt-0.5 text-ink-700"><span className="font-medium">{a.name}</span> · <span className="text-ink-700/70">{a.issuer} · {a.date}</span></p>
            ))}
          </div>
        )}
        {data.skills.length > 0 && (
          <div className="col-span-2">
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold mt-3">Skills</p>
            <p className="mt-0.5 text-ink-700">{data.skills.join(" · ")}</p>
          </div>
        )}
        {data.languages.length > 0 && (
          <div className="col-span-2">
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold mt-2">Languages</p>
            <p className="mt-0.5 text-ink-700">{data.languages.map((l) => `${l.name} (${l.level})`).join(" · ")}</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-2 border-t border-ink-900/15 text-center text-[9px] uppercase tracking-[0.25em] font-sans text-ink-700/55">
        References available on request
      </div>
    </div>
  );
}
