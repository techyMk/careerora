"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Check, Mail, Phone, MapPin, Globe } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { cn } from "@/lib/utils";

type TemplateId = "classic" | "modern" | "executive";

const TEMPLATES: { id: TemplateId; name: string; tagline: string }[] = [
  { id: "classic", name: "Classic ATS", tagline: "Centered header · single column" },
  { id: "modern", name: "Modern Split", tagline: "Sidebar + main content" },
  { id: "executive", name: "Executive", tagline: "Serif · long-form" },
];

const RESUMES = [
  {
    name: "Jordan Park",
    title: "Senior Backend Engineer",
    email: "jordan@careerora.app",
    phone: "+1 415 555 0124",
    location: "San Francisco, CA",
    website: "jordan.dev",
    summary:
      "Senior backend engineer with 6+ years architecting low-latency, cloud-native systems. Recently led a re-platform that cut p99 latency by 42% while halving infrastructure cost.",
    skills: ["Go", "AWS", "Kafka", "Kubernetes", "Postgres"],
    roles: [
      { role: "Staff Engineer", company: "Foundry · Remote", period: "2023 — Present", bullet: "Led ledger re-platform · −42% p99 latency · halved infra cost." },
      { role: "Senior Engineer", company: "Northwind", period: "2020 — 2023", bullet: "Built event pipeline processing 3.2B events/day on Kafka + Go." },
    ],
  },
  {
    name: "Maya Kapoor",
    title: "Senior Product Designer",
    email: "maya@careerora.app",
    phone: "+1 718 555 0188",
    location: "Brooklyn, NY",
    website: "maya.design",
    summary:
      "Senior product designer with 6+ years shaping data-rich SaaS. At Plume, I led an analytics redesign that lifted activation +38% and unlocked a $1.4M ARR enterprise tier.",
    skills: ["Figma", "Design systems", "Motion", "Webflow", "Brand"],
    roles: [
      { role: "Senior Designer", company: "Plume · Remote", period: "2023 — Present", bullet: "Led analytics redesign · +38% activation · −41% support tickets." },
      { role: "Product Designer", company: "Foundry", period: "2020 — 2023", bullet: "Onboarding flows that lifted trial-to-paid 22% → 31%." },
    ],
  },
];

export function ResumeShowcase() {
  const [active, setActive] = useState<TemplateId>("modern");
  const [dark, setDark] = useState(true);

  return (
    <Section className="relative">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="Resume previews"
          title={
            <>
              ATS-friendly, beautifully{" "}
              <span className="gradient-text">typeset</span>
            </>
          }
          description="Recruiter-tested templates that pass ATS filters and read like they were crafted, not generated."
        />

        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 p-1.5 glass rounded-full">
            {TEMPLATES.map((r) => (
              <button
                key={r.id}
                onClick={() => setActive(r.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm transition-all",
                  active === r.id
                    ? "bg-brand-gradient text-white shadow-glow"
                    : "text-white/60 hover:text-white"
                )}
              >
                {r.name}
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-white/10" />
            <button
              onClick={() => setDark((d) => !d)}
              className="px-3 py-2 rounded-full text-sm text-white/70 hover:text-white inline-flex items-center gap-1.5"
            >
              {dark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
              {dark ? "Dark" : "Light"}
            </button>
          </div>

          <p className="-mt-3 text-xs text-white/45">
            {TEMPLATES.find((t) => t.id === active)?.tagline}
          </p>

          <div className="relative w-full max-w-5xl">
            <div className="absolute -inset-6 bg-brand-gradient blur-3xl opacity-20 rounded-[3rem]" />
            <div className="relative grid md:grid-cols-2 gap-6 items-start">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active + (dark ? "d" : "l")}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4 }}
                  className="md:col-span-2 grid md:grid-cols-2 gap-6"
                >
                  <ResumeCard data={RESUMES[0]} variant={active} dark={dark} />
                  <ResumeCard data={RESUMES[1]} variant={active} dark={dark} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/55">
            {["ATS verified", "Custom fonts", "Multi-page", "1-click export"].map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-400" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

type Resume = (typeof RESUMES)[number];

function ResumeCard({
  data,
  variant,
  dark,
}: {
  data: Resume;
  variant: TemplateId;
  dark: boolean;
}) {
  const base = dark
    ? "bg-ink-900 text-white border-white/10"
    : "bg-white text-ink-900 border-black/10";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-2xl border shadow-soft aspect-[1/1.3] relative overflow-hidden",
        base
      )}
    >
      {variant === "classic" && <ClassicLayout data={data} dark={dark} />}
      {variant === "modern" && <ModernSplitLayout data={data} dark={dark} />}
      {variant === "executive" && <ExecutiveLayout data={data} dark={dark} />}
    </motion.div>
  );
}

/* ──────────────── Classic — centered, single column ──────────────── */

function ClassicLayout({ data, dark }: { data: Resume; dark: boolean }) {
  const muted = dark ? "text-white/55" : "text-ink-700/70";
  const rule = dark ? "border-white/10" : "border-ink-900/10";
  const chip = dark ? "bg-white/5 border border-white/10" : "bg-black/5 border border-black/10";

  return (
    <div className="p-6 md:p-7 h-full flex flex-col">
      <div className={cn("text-center pb-3 border-b", rule)}>
        <h4 className="text-lg md:text-xl font-semibold tracking-tight">{data.name}</h4>
        <p className={cn("text-xs mt-0.5", muted)}>{data.title}</p>
        <div className={cn("mt-1.5 flex items-center justify-center gap-2 flex-wrap text-[10px]", muted)}>
          <span className="inline-flex items-center gap-1"><Mail className="size-2.5"/>{data.email}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><MapPin className="size-2.5"/>{data.location}</span>
        </div>
      </div>

      <SectionLabel label="Summary" dark={dark} />
      <p className={cn("text-[11px] leading-snug", muted)}>{data.summary}</p>

      <SectionLabel label="Experience" dark={dark} />
      <div className="space-y-2">
        {data.roles.map((r, i) => (
          <div key={i}>
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-medium">{r.role}</p>
              <p className={cn("text-[9px]", muted)}>{r.period}</p>
            </div>
            <p className={cn("text-[10px]", muted)}>{r.company}</p>
            <p className={cn("text-[10px] mt-0.5", muted)}>• {r.bullet}</p>
          </div>
        ))}
      </div>

      <SectionLabel label="Skills" dark={dark} />
      <div className="flex flex-wrap gap-1">
        {data.skills.map((s) => (
          <span key={s} className={cn("text-[9px] px-1.5 py-0.5 rounded", chip)}>{s}</span>
        ))}
      </div>
    </div>
  );
}

/* ──────────────── Modern Split — sidebar + main ──────────────── */

function ModernSplitLayout({ data, dark }: { data: Resume; dark: boolean }) {
  const sideBg = dark ? "bg-white/[0.04]" : "bg-ink-900/[0.05]";
  const muted = dark ? "text-white/55" : "text-ink-700/70";
  const rule = dark ? "bg-white/10" : "bg-ink-900/10";
  const chip = dark ? "bg-white/5 border border-white/10" : "bg-black/5 border border-black/10";

  return (
    <div className="grid grid-cols-[38%_62%] h-full">
      <aside className={cn("p-4 md:p-5 flex flex-col", sideBg)}>
        <div>
          <h4 className="text-base font-semibold tracking-tight leading-tight">{data.name}</h4>
          <p className={cn("text-[11px] mt-0.5", muted)}>{data.title}</p>
        </div>
        <div className={cn("my-3 h-px", rule)} />
        <div className="space-y-1 text-[10px]">
          <p className={cn("inline-flex items-center gap-1", muted)}><Mail className="size-2.5"/>{data.email}</p>
          <p className={cn("inline-flex items-center gap-1", muted)}><Phone className="size-2.5"/>{data.phone}</p>
          <p className={cn("inline-flex items-center gap-1", muted)}><MapPin className="size-2.5"/>{data.location}</p>
          <p className={cn("inline-flex items-center gap-1", muted)}><Globe className="size-2.5"/>{data.website}</p>
        </div>
        <p className="mt-4 text-[10px] uppercase tracking-[0.18em] font-semibold gradient-text">
          Skills
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {data.skills.map((s) => (
            <span key={s} className={cn("text-[9px] px-1.5 py-0.5 rounded", chip)}>{s}</span>
          ))}
        </div>
        <div className="mt-auto pt-4">
          <p className={cn("text-[9px] uppercase tracking-wider", muted)}>Languages</p>
          <p className="text-[10px] mt-0.5">English · Hindi</p>
        </div>
      </aside>

      <main className="p-4 md:p-5 flex flex-col">
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold gradient-text">About</p>
        <p className={cn("mt-1 text-[11px] leading-snug", muted)}>{data.summary}</p>

        <p className="mt-3 text-[10px] uppercase tracking-[0.18em] font-semibold gradient-text">
          Experience
        </p>
        <div className="mt-1 space-y-2">
          {data.roles.map((r, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-medium">{r.role}</p>
                <p className={cn("text-[9px]", muted)}>{r.period}</p>
              </div>
              <p className={cn("text-[10px]", muted)}>{r.company}</p>
              <p className={cn("text-[10px] mt-0.5", muted)}>• {r.bullet}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ──────────────── Executive — serif, long-form ──────────────── */

function ExecutiveLayout({ data, dark }: { data: Resume; dark: boolean }) {
  const muted = dark ? "text-white/55" : "text-ink-700/70";
  const rule = dark ? "bg-white/10" : "bg-ink-900/10";

  return (
    <div className="p-6 md:p-7 h-full flex flex-col font-serif">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-xl md:text-2xl tracking-tight leading-none">{data.name}</h4>
          <p className={cn("text-[10px] uppercase tracking-[0.3em] mt-1.5", muted)}>
            {data.title}
          </p>
        </div>
        <span className={cn("text-[9px] uppercase tracking-wider px-2 py-1 rounded font-sans", dark ? "bg-white/5" : "bg-black/5")}>
          CV · 2026
        </span>
      </div>

      <div className={cn("my-3 h-px", rule)} />

      <div className={cn("text-[10px] flex items-center gap-2 font-sans", muted)}>
        <span>{data.email}</span>
        <span>·</span>
        <span>{data.location}</span>
        <span>·</span>
        <span>{data.website}</span>
      </div>

      <p className={cn("mt-4 text-[11px] leading-relaxed italic", muted)}>
        {data.summary}
      </p>

      <p className="mt-4 text-[10px] uppercase tracking-[0.3em] font-semibold">
        Selected Experience
      </p>
      <div className="mt-2 space-y-3">
        {data.roles.map((r, i) => (
          <div key={i}>
            <p className={cn("text-[9px] uppercase tracking-[0.25em] font-semibold", muted)}>
              {r.company}
            </p>
            <div className="flex items-baseline justify-between">
              <p className="text-xs">{r.role}</p>
              <p className={cn("text-[9px] italic", muted)}>{r.period}</p>
            </div>
            <p className={cn("text-[10px] mt-0.5", muted)}>{r.bullet}</p>
          </div>
        ))}
      </div>

      <div className={cn("mt-auto pt-3 border-t text-[9px] tracking-[0.25em] uppercase font-sans text-center", muted, dark ? "border-white/10" : "border-ink-900/10")}>
        References available on request
      </div>
    </div>
  );
}

function SectionLabel({ label, dark }: { label: string; dark: boolean }) {
  return (
    <p
      className={cn(
        "mt-3 mb-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold gradient-text"
      )}
    >
      {label}
    </p>
  );
}
