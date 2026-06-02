"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Lightbulb,
  Layers,
  Gauge,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";

const BLOCKS = [
  {
    icon: AlertCircle,
    label: "Problem",
    text: "The legacy dashboard had a 22% bounce rate on first session — users couldn't find core insights.",
  },
  {
    icon: Lightbulb,
    label: "Solution",
    text: "Re-architected the IA around 3 focal jobs, with progressive disclosure and a guided first-run.",
  },
  {
    icon: Layers,
    label: "Tech stack",
    text: "Next.js · TypeScript · tRPC · Postgres · Vercel · Posthog",
    pill: true,
  },
  {
    icon: Gauge,
    label: "Metrics",
    text: "Activation +38%. p99 load 8.7s → 1.9s. Support tickets −41%.",
  },
  {
    icon: Calendar,
    label: "Timeline",
    text: "6 weeks · 1 designer · 2 engineers · weekly user testing.",
  },
  {
    icon: TrendingUp,
    label: "Results",
    text: "Drove an additional $1.4M ARR within Q1 and unlocked a new enterprise tier.",
  },
];

export function CaseStudy() {
  return (
    <Section className="relative">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="Case study writer"
          title={
            <>
              Turn projects into{" "}
              <span className="gradient-text">stories that hire you</span>
            </>
          }
          description="AI structures messy notes into professional case studies — problem, solution, metrics, results."
        />

        <div className="grid md:grid-cols-3 gap-4">
          {BLOCKS.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative glass rounded-2xl p-5 md:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl gradient-border flex items-center justify-center">
                  <b.icon className="size-4 text-white" />
                </div>
                <p className="text-[11px] uppercase tracking-wider text-white/45 font-semibold">
                  {b.label}
                </p>
              </div>
              {b.pill ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {b.text.split(" · ").map((p) => (
                    <span
                      key={p}
                      className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/80 leading-relaxed">
                  {b.text}
                </p>
              )}
              <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.12)]" />
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
