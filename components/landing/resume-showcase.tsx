"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Check } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { cn } from "@/lib/utils";

const RESUMES = [
  { id: "classic", name: "Classic ATS" },
  { id: "modern", name: "Modern Split" },
  { id: "executive", name: "Executive" },
];

export function ResumeShowcase() {
  const [active, setActive] = useState(RESUMES[0].id);
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
            {RESUMES.map((r) => (
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

          <div className="relative w-full max-w-5xl">
            <div className="absolute -inset-6 bg-brand-gradient blur-3xl opacity-20 rounded-[3rem]" />
            <div className="relative grid md:grid-cols-2 gap-6 items-start">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active + (dark ? "d" : "l")}
                  initial={{ opacity: 0, rotateY: -8 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 8 }}
                  transition={{ duration: 0.5 }}
                  className="md:col-span-2 grid md:grid-cols-2 gap-6"
                  style={{ perspective: 1200 }}
                >
                  <ResumeMock variant={active} dark={dark} />
                  <ResumeMock
                    variant={active}
                    dark={dark}
                    flipped
                    sideB
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/55">
            {[
              "ATS verified",
              "Custom fonts",
              "Multi-page",
              "1-click export",
            ].map((f) => (
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

function ResumeMock({
  variant,
  dark,
  flipped,
  sideB,
}: {
  variant: string;
  dark: boolean;
  flipped?: boolean;
  sideB?: boolean;
}) {
  const base = dark
    ? "bg-ink-900 text-white border-white/10"
    : "bg-white text-ink-900 border-black/10";
  const muted = dark ? "text-white/60" : "text-ink-700/70";
  return (
    <motion.div
      whileHover={{ y: -6, rotateZ: flipped ? 0.5 : -0.5 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-2xl border shadow-soft aspect-[1/1.3] p-6 md:p-7 relative overflow-hidden",
        base
      )}
    >
      {variant === "modern" && (
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1/3",
            dark ? "bg-white/[0.025]" : "bg-black/[0.04]"
          )}
        />
      )}
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg md:text-xl font-semibold tracking-tight">
              {sideB ? "Maya Kapoor" : "Jordan Park"}
            </h4>
            <p className={cn("text-xs mt-0.5", muted)}>
              {sideB
                ? "Product Designer · Brooklyn"
                : "Senior Backend Engineer · SF"}
            </p>
          </div>
          {variant === "executive" && (
            <span
              className={cn(
                "text-[10px] uppercase tracking-wider px-2 py-1 rounded",
                dark ? "bg-white/5" : "bg-black/5"
              )}
            >
              CV · 2026
            </span>
          )}
        </div>

        <div className="mt-4 space-y-1.5">
          <div className={cn("h-2 rounded w-full", dark ? "bg-white/10" : "bg-black/10")} />
          <div className={cn("h-2 rounded w-[88%]", dark ? "bg-white/10" : "bg-black/10")} />
          <div className={cn("h-2 rounded w-[70%]", dark ? "bg-white/10" : "bg-black/10")} />
        </div>

        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-wider font-semibold gradient-text">
            Experience
          </p>
          {[1, 2].map((i) => (
            <div key={i} className="mt-3">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium">
                  {sideB ? "Senior Designer" : "Staff Engineer"}
                </p>
                <p className={cn("text-[10px]", muted)}>
                  {2024 - i}–{2025 - i}
                </p>
              </div>
              <p className={cn("text-[11px]", muted)}>
                {sideB ? "Plume" : "Foundry"} · Remote
              </p>
              <div className="mt-1.5 space-y-1">
                <div
                  className={cn(
                    "h-1.5 rounded",
                    dark ? "bg-white/10" : "bg-black/10"
                  )}
                  style={{ width: "92%" }}
                />
                <div
                  className={cn(
                    "h-1.5 rounded",
                    dark ? "bg-white/10" : "bg-black/10"
                  )}
                  style={{ width: "76%" }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-wider font-semibold gradient-text">
            Skills
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(sideB
              ? ["Figma", "Tokens", "Motion", "Webflow", "Brand"]
              : ["Go", "AWS", "Kafka", "K8s", "Postgres"]
            ).map((s) => (
              <span
                key={s}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded",
                  dark
                    ? "bg-white/5 border border-white/10"
                    : "bg-black/5 border border-black/10"
                )}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
