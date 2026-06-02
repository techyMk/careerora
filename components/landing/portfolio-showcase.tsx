"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Code2, PenTool, Building2, Briefcase } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { cn } from "@/lib/utils";

type Template = {
  id: string;
  name: string;
  tagline: string;
  category: "Developer" | "Designer" | "Agency" | "Freelancer";
  icon: React.ComponentType<{ className?: string }>;
  preview: React.ReactNode;
};

const TEMPLATES: Template[] = [
  {
    id: "minimal",
    name: "Minimal Developer",
    tagline: "Type-led, terminal-clean, fast to read.",
    category: "Developer",
    icon: Code2,
    preview: <MinimalPreview />,
  },
  {
    id: "creative",
    name: "Creative Designer",
    tagline: "Bold gradients & expressive type for makers.",
    category: "Designer",
    icon: PenTool,
    preview: <CreativePreview />,
  },
  {
    id: "agency",
    name: "Modern Agency",
    tagline: "Case-study driven layout with bold metrics.",
    category: "Agency",
    icon: Building2,
    preview: <AgencyPreview />,
  },
  {
    id: "freelancer",
    name: "Freelancer Brief",
    tagline: "Hire-me focused, with availability & rates.",
    category: "Freelancer",
    icon: Briefcase,
    preview: <FreelancerPreview />,
  },
];

export function PortfolioShowcase() {
  const [active, setActive] = useState(TEMPLATES[0].id);
  const current = TEMPLATES.find((t) => t.id === active)!;

  return (
    <Section id="templates" className="relative">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="Portfolio templates"
          title={
            <>
              Pick a vibe.{" "}
              <span className="gradient-text">Ship a portfolio.</span>
            </>
          }
          description="Premium, fully responsive templates — each one tunable with your colors, fonts and animations."
        />

        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-all",
                  active === t.id
                    ? "glass-strong border-white/15 shadow-soft"
                    : "border-white/5 hover:bg-white/[0.02] hover:border-white/10"
                )}
              >
                <div
                  className={cn(
                    "size-10 shrink-0 rounded-xl flex items-center justify-center",
                    active === t.id
                      ? "bg-brand-gradient"
                      : "bg-white/5"
                  )}
                >
                  <t.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-white/55 line-clamp-2 mt-0.5">
                    {t.tagline}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-brand-violet mt-1.5">
                    {t.category}
                  </p>
                </div>
                <ArrowUpRight
                  className={cn(
                    "size-4 ml-auto shrink-0 transition-opacity",
                    active === t.id ? "opacity-100" : "opacity-40"
                  )}
                />
              </button>
            ))}
          </div>

          <div className="relative gradient-border rounded-3xl glass-strong p-3 md:p-4 shadow-soft min-h-[460px]">
            <div className="relative rounded-2xl bg-ink-950/70 overflow-hidden h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  {current.preview}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function MinimalPreview() {
  return (
    <div className="p-8 md:p-10 font-mono text-sm h-full">
      <div className="flex items-center justify-between">
        <span className="text-white/40">~/portfolio</span>
        <span className="text-white/30 text-xs">v2.4 · stable</span>
      </div>
      <div className="mt-10 max-w-xl">
        <p className="text-white/40">$ whoami</p>
        <h3 className="mt-2 text-3xl md:text-4xl font-semibold text-white tracking-tight font-sans">
          Jordan Park
        </h3>
        <p className="mt-1 text-white/60 font-sans">
          Staff engineer · Go, distributed systems, AI infra.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-3 gap-3 max-w-xl">
        {["payments-svc", "rag-eval", "ledger-cli"].map((p) => (
          <div
            key={p}
            className="p-3 rounded-lg border border-white/10 bg-white/[0.02]"
          >
            <div className="size-8 rounded-md bg-white/5 mb-2" />
            <p className="text-xs text-white/80">{p}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Go · ★ 1.2k</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreativePreview() {
  return (
    <div className="relative h-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.4),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(236,72,153,0.4),transparent_50%)]" />
      <div className="relative p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          Designer · Brand · Motion
        </p>
        <h3 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tighter leading-[0.95]">
          Bold ideas,
          <br />
          <span className="gradient-text">soft edges.</span>
        </h3>
        <p className="mt-4 max-w-md text-white/70 text-sm md:text-base">
          I help ambitious teams craft expressive product experiences.
          Currently designing at <span className="text-white">Plume</span>.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AgencyPreview() {
  return (
    <div className="p-8 md:p-10 h-full">
      <div className="flex items-center justify-between">
        <span className="font-semibold tracking-tight">Northwind Studio</span>
        <div className="flex items-center gap-4 text-xs text-white/50">
          <span>Work</span>
          <span>About</span>
          <span>Contact</span>
        </div>
      </div>
      <div className="mt-10 max-w-2xl">
        <h3 className="text-3xl md:text-5xl font-semibold tracking-tight">
          We turn ambitious products into <span className="gradient-text">category leaders.</span>
        </h3>
      </div>
      <div className="mt-10 grid grid-cols-3 gap-3">
        {[
          { v: "+312%", l: "Activation" },
          { v: "8.7s", l: "p99 latency" },
          { v: "4.9★", l: "Client NPS" },
        ].map((m) => (
          <div
            key={m.l}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/10"
          >
            <p className="text-2xl font-semibold gradient-text">{m.v}</p>
            <p className="text-xs text-white/55 mt-1">{m.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FreelancerPreview() {
  return (
    <div className="p-8 md:p-10 h-full">
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-full bg-brand-gradient" />
        <div>
          <h3 className="text-xl md:text-2xl font-semibold">Sana Hassan</h3>
          <p className="text-sm text-white/55">
            Freelance product designer · Brooklyn, NY
          </p>
        </div>
        <span className="ml-auto inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Available · Jun
        </span>
      </div>
      <p className="mt-6 max-w-xl text-white/70 text-sm">
        I partner with early-stage teams to design products people actually
        use. Currently booking 2-week sprints @ $9k.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 max-w-xl">
        {["Brand systems", "Product design", "Webflow build", "Motion"].map(
          (s) => (
            <div
              key={s}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-sm flex items-center justify-between"
            >
              {s}
              <ArrowUpRight className="size-3.5 text-white/40" />
            </div>
          )
        )}
      </div>
    </div>
  );
}
