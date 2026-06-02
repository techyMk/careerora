"use client";

import { motion } from "framer-motion";
import { UserPlus, Wand2, Rocket } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";

const STEPS = [
  {
    n: "01",
    title: "Enter your details",
    desc: "Skills, experience, projects, links. Or paste a rough LinkedIn export — we'll handle the rest.",
    icon: UserPlus,
  },
  {
    n: "02",
    title: "AI generates assets",
    desc: "Resumes, portfolios, LinkedIn summaries, case studies — all written in your tone, polished and on-brand.",
    icon: Wand2,
  },
  {
    n: "03",
    title: "Customize & publish",
    desc: "Tweak with a built-in AI editor. Deploy to a subdomain or export as pixel-perfect PDFs.",
    icon: Rocket,
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="relative">
      <div className="absolute inset-0 -z-10 dotted-bg opacity-30" />
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="How it works"
          title={
            <>
              From zero to{" "}
              <span className="gradient-text">hire-ready</span> in three steps
            </>
          }
        />

        <div className="relative grid md:grid-cols-3 gap-4 md:gap-6">
          <div className="absolute hidden md:block left-[12%] right-[12%] top-12 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="relative glass rounded-2xl p-6 md:p-7"
            >
              <div className="flex items-start gap-4">
                <div className="size-12 shrink-0 rounded-2xl gradient-border flex items-center justify-center">
                  <s.icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-brand-violet font-semibold">
                    Step {s.n}
                  </p>
                  <h3 className="text-xl font-semibold tracking-tight mt-0.5">
                    {s.title}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/65">{s.desc}</p>

              <div className="mt-6 flex items-center gap-2 text-xs text-white/40">
                <span className="size-1.5 rounded-full bg-brand-violet animate-pulse-soft" />
                <span>Avg time: {["30s", "45s", "20s"][i]}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
