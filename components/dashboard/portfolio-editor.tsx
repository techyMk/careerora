"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Wand2,
  ArrowUpRight,
  Monitor,
  Tablet,
  Smartphone,
  Loader2,
  Check,
  ArrowLeft,
  Trash2,
  Plus,
  GripVertical,
  Eye,
  Mail,
  Github,
  Twitter,
  Linkedin,
  Globe,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import {
  PortfolioRenderer,
  type PortfolioData,
  type PortfolioProject,
} from "@/components/portfolio/portfolio-renderer";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "minimal", label: "Minimal", colors: ["#0B0F19", "#FFFFFF"] },
  { id: "luxury", label: "Luxury", colors: ["#0B0F19", "#D946EF"] },
  { id: "cyberpunk", label: "Cyberpunk", colors: ["#0B0F19", "#06B6D4"] },
  { id: "glass", label: "Glass", colors: ["#1F2937", "#A78BFA"] },
  { id: "gradient", label: "Gradient", colors: ["#7C3AED", "#EC4899"] },
  { id: "brutalist", label: "Brutalist", colors: ["#FFFFFF", "#000000"] },
];

type UserProp = {
  name?: string | null;
  email?: string | null;
  headline?: string | null;
} | null;

type PortfolioProp = {
  id: string;
  name: string;
  theme: string;
  subdomain: string;
  bio: string;
  published: boolean;
  views: number;
  data: PortfolioData;
};

const DEFAULT_DATA: PortfolioData = {
  hero: "",
  about: "",
  skills: [],
  projects: [],
  socials: { github: "", twitter: "", linkedin: "", website: "" },
  contact: { email: "" },
};

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
  const [data, setData] = useState<PortfolioData>({
    ...DEFAULT_DATA,
    ...portfolio.data,
    socials: { ...DEFAULT_DATA.socials, ...portfolio.data.socials },
    contact: { ...DEFAULT_DATA.contact, ...portfolio.data.contact },
  });
  const [device, setDevice] = useState<"desk" | "tab" | "mob">("desk");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(new Date());
  const [generating, setGenerating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirtyRef = useRef(false);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, theme, bio, subdomain, published, data }),
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
    const t = setTimeout(() => dirtyRef.current && save(), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, theme, bio, subdomain, published, data]);

  const streamInto = async (
    key: string,
    body: { kind: string; context: string; instruction: string },
    apply: (text: string) => void
  ) => {
    setGenerating(key);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok || !res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      apply("");
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        apply(acc);
      }
    } finally {
      setGenerating(null);
    }
  };

  const rewriteBio = () =>
    streamInto(
      "bio",
      {
        kind: "portfolio-bio",
        context: JSON.stringify({
          name: user?.name,
          headline: user?.headline,
          currentBio: bio,
        }),
        instruction: "Confident, warm, hint of wit. 1 sentence, 12 words max.",
      },
      setBio
    );

  const rewriteAbout = () =>
    streamInto(
      "about",
      {
        kind: "free",
        context: JSON.stringify({
          name: user?.name,
          headline: user?.headline,
          currentAbout: data.about,
          skills: data.skills,
        }),
        instruction:
          "Write a 3-4 sentence personal About section in first person. Specific, concrete, no clichés.",
      },
      (text) => setData((d) => ({ ...d, about: text }))
    );

  const rewriteProject = (id: string) =>
    streamInto(
      `proj-${id}`,
      {
        kind: "case-study-block",
        context: JSON.stringify({
          project: data.projects?.find((p) => p.id === id),
        }),
        instruction:
          "Rewrite the project description in 2 sentences. Specific outcome with a metric if possible.",
      },
      (text) =>
        setData((d) => ({
          ...d,
          projects: d.projects?.map((p) =>
            p.id === id ? { ...p, description: text } : p
          ),
        }))
    );

  const addProject = () =>
    setData((d) => ({
      ...d,
      projects: [
        ...(d.projects ?? []),
        {
          id: Math.random().toString(36).slice(2),
          name: "Untitled project",
          description: "",
          url: "",
          tags: [],
        },
      ],
    }));

  const updateProject = (id: string, patch: Partial<PortfolioProject>) =>
    setData((d) => ({
      ...d,
      projects: d.projects?.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));

  const removeProject = (id: string) =>
    setData((d) => ({
      ...d,
      projects: d.projects?.filter((p) => p.id !== id),
    }));

  const addSkill = (s: string) => {
    const t = s.trim();
    if (!t || (data.skills ?? []).includes(t)) return;
    setData((d) => ({ ...d, skills: [...(d.skills ?? []), t] }));
  };
  const removeSkill = (s: string) =>
    setData((d) => ({ ...d, skills: d.skills?.filter((x) => x !== s) }));

  const updateSocial = (key: keyof NonNullable<PortfolioData["socials"]>, v: string) =>
    setData((d) => ({ ...d, socials: { ...d.socials, [key]: v } }));

  const onDelete = async () => {
    if (!confirm("Delete this portfolio permanently?")) return;
    setDeleting(true);
    await fetch(`/api/portfolios/${portfolio.id}`, { method: "DELETE" });
    router.push("/dashboard/portfolios");
    router.refresh();
  };

  const meta = useMemo(
    () => ({
      name,
      bio,
      theme,
      ownerName: user?.name ?? null,
      ownerHeadline: user?.headline ?? null,
    }),
    [name, bio, theme, user]
  );

  const publicPath = `/p/${subdomain}`;

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
            <ArrowLeft className="size-3.5" /> All portfolios
          </Button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-[200px] bg-transparent text-xl md:text-2xl font-semibold tracking-tight outline-none border-b border-transparent hover:border-white/10 focus:border-brand-violet/50 transition-colors py-1"
          />
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              variant="secondary"
            >
              <a href={publicPath} target="_blank" rel="noreferrer">
                <Eye className="size-3.5" />
                View live
              </a>
            </Button>
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

        <div className="grid lg:grid-cols-[420px_1fr] gap-5">
          <aside className="space-y-4">
            {/* Basics */}
            <Section title="Basics">
              <Field label="Site name" value={name} onChange={setName} />
              <Field
                label="Path"
                value={subdomain}
                onChange={(v) => setSubdomain(v.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                prefix="/p/"
              />
              {error && (
                <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
                  {error}
                </p>
              )}
            </Section>

            {/* Hero tagline */}
            <Section
              title="Hero tagline"
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={rewriteBio}
                  disabled={generating !== null}
                >
                  {generating === "bio" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="size-3.5" />
                  )}
                  AI
                </Button>
              }
            >
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="One short line that follows 'Hi, I'm ___.'"
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 p-3 text-sm outline-none focus:border-brand-violet/50 resize-none"
              />
              <p className="mt-1 text-[10px] text-white/40">
                Keep it under 12 words — long lines wrap in the hero.
              </p>
            </Section>

            {/* About */}
            <Section
              title="About"
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={rewriteAbout}
                  disabled={generating !== null}
                >
                  {generating === "about" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="size-3.5" />
                  )}
                  AI
                </Button>
              }
            >
              <textarea
                value={data.about ?? ""}
                onChange={(e) => setData({ ...data, about: e.target.value })}
                rows={5}
                placeholder="A few sentences about who you are and what you do."
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 p-3 text-sm outline-none focus:border-brand-violet/50 resize-none"
              />
            </Section>

            {/* Skills */}
            <Section title="Skills">
              <div className="flex items-center flex-wrap gap-1.5">
                {(data.skills ?? []).map((s) => (
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

            {/* Projects */}
            <Section
              title="Projects"
              action={
                <Button size="sm" variant="secondary" onClick={addProject}>
                  <Plus className="size-3.5" /> Add
                </Button>
              }
            >
              <div className="space-y-2">
                {(data.projects ?? []).length === 0 && (
                  <p className="text-xs text-white/45 text-center py-4">
                    No projects yet — add your first.
                  </p>
                )}
                {(data.projects ?? []).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="size-3.5 text-white/30" />
                      <input
                        value={p.name}
                        onChange={(e) => updateProject(p.id, { name: e.target.value })}
                        className="bg-transparent text-sm font-medium outline-none flex-1"
                      />
                      <button
                        onClick={() => removeProject(p.id)}
                        className="size-6 rounded-md text-white/40 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                    <textarea
                      value={p.description}
                      onChange={(e) => updateProject(p.id, { description: e.target.value })}
                      rows={2}
                      placeholder="Outcome-first. Add a metric if you can."
                      className="w-full rounded-lg bg-white/[0.02] border border-white/10 p-2 text-xs outline-none focus:border-brand-violet/50 resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        value={p.url ?? ""}
                        onChange={(e) => updateProject(p.id, { url: e.target.value })}
                        placeholder="https://link-to-project.com"
                        className="flex-1 bg-transparent text-xs outline-none px-2 h-7 rounded border border-white/10 focus:border-brand-violet/50"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => rewriteProject(p.id)}
                        disabled={generating !== null}
                      >
                        {generating === `proj-${p.id}` ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Wand2 className="size-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center flex-wrap gap-1">
                      {(p.tags ?? []).map((tag) => (
                        <span
                          key={tag}
                          className="group inline-flex items-center gap-1 text-[10px] pl-1.5 pr-0.5 py-0.5 rounded-full bg-white/5 border border-white/10"
                        >
                          {tag}
                          <button
                            onClick={() =>
                              updateProject(p.id, {
                                tags: p.tags?.filter((t) => t !== tag),
                              })
                            }
                            className="size-3.5 rounded-full text-white/40 hover:text-rose-300 hover:bg-rose-500/15 flex items-center justify-center"
                          >
                            <Trash2 className="size-2" />
                          </button>
                        </span>
                      ))}
                      <input
                        placeholder="+ tag"
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-transparent border border-dashed border-white/15 outline-none placeholder:text-white/40 w-16 focus:border-brand-violet/50"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const v = (e.target as HTMLInputElement).value.trim();
                            if (!v) return;
                            updateProject(p.id, { tags: [...(p.tags ?? []), v] });
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Contact & socials */}
            <Section title="Contact & socials">
              <SocialField
                icon={Mail}
                label="Email"
                value={data.contact?.email ?? ""}
                onChange={(v) =>
                  setData((d) => ({ ...d, contact: { ...d.contact, email: v } }))
                }
                placeholder="you@example.com"
              />
              <SocialField
                icon={Github}
                label="GitHub"
                value={data.socials?.github ?? ""}
                onChange={(v) => updateSocial("github", v)}
                placeholder="github.com/you"
              />
              <SocialField
                icon={Twitter}
                label="Twitter"
                value={data.socials?.twitter ?? ""}
                onChange={(v) => updateSocial("twitter", v)}
                placeholder="twitter.com/you"
              />
              <SocialField
                icon={Linkedin}
                label="LinkedIn"
                value={data.socials?.linkedin ?? ""}
                onChange={(v) => updateSocial("linkedin", v)}
                placeholder="linkedin.com/in/you"
              />
              <SocialField
                icon={Globe}
                label="Website"
                value={data.socials?.website ?? ""}
                onChange={(v) => updateSocial("website", v)}
                placeholder="you.dev"
              />
            </Section>

            {/* Theme */}
            <Section title="Theme">
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
            </Section>
          </aside>

          {/* Preview */}
          <div className="space-y-4 min-w-0">
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
                href={publicPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 h-9 rounded-full glass text-xs hover:bg-white/10"
                title="Open public URL in a new tab"
              >
                <Globe className="size-3.5 text-brand-violet" />
                {publicPath}
                <ArrowUpRight className="size-3" />
              </a>
              <span className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full glass text-xs text-white/55">
                <Eye className="size-3" />
                {portfolio.views.toLocaleString()} views
              </span>
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
                  "mx-auto rounded-2xl overflow-hidden transition-all duration-500 origin-top max-h-[80vh] overflow-y-auto",
                  device === "desk"
                    ? "max-w-full"
                    : device === "tab"
                      ? "max-w-2xl"
                      : "max-w-sm"
                )}
              >
                <PortfolioRenderer meta={meta} data={data} compact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/45">
        {label}
      </span>
      <div className="mt-1 flex items-center rounded-lg bg-white/[0.02] border border-white/10 focus-within:border-brand-violet/50">
        {prefix && (
          <span className="ml-3 text-xs text-white/40">{prefix}</span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-3 h-9 text-sm outline-none"
        />
      </div>
    </label>
  );
}

function SocialField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 h-10 rounded-xl bg-white/[0.02] border border-white/10 focus-within:border-brand-violet/50">
      <Icon className="size-3.5 text-white/55 shrink-0" />
      <span className="text-[10px] uppercase tracking-wider text-white/45 w-16 shrink-0">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
      />
    </div>
  );
}
