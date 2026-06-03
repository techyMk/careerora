"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Globe2,
  ScrollText,
  Linkedin,
  Mail,
  Palette,
  Gauge,
  Download,
  Rocket,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";

const FEATURES = [
  {
    title: "AI Resume Builder",
    desc: "Generate ATS-friendly resumes in seconds from your skills, experience and goals.",
    icon: FileText,
    badge: "Most loved",
    span: "md:col-span-2 md:row-span-2",
    accent: "from-brand-blue/50 to-brand-violet/40",
  },
  {
    title: "Portfolio Generator",
    desc: "Spin up a stunning personal website. Deploy in one click.",
    icon: Globe2,
    span: "md:col-span-2",
    accent: "from-brand-violet/40 to-brand-pink/40",
  },
  {
    title: "Case Study Writer",
    desc: "Structure projects into compelling problem → solution → impact stories.",
    icon: ScrollText,
    span: "",
    accent: "from-brand-cyan/40 to-brand-blue/40",
  },
  {
    title: "LinkedIn Optimizer",
    desc: "Headlines, About sections and posts that actually convert recruiters.",
    icon: Linkedin,
    span: "",
    accent: "from-brand-blue/40 to-brand-violet/40",
  },
  {
    title: "Cover Letter AI",
    desc: "Personalised letters per job, written in your authentic voice.",
    icon: Mail,
    span: "md:col-span-2",
    accent: "from-brand-pink/40 to-brand-fuchsia/40",
  },
  {
    title: "Theme Customizer",
    desc: "Fonts, gradients, dark/light — make every asset uniquely yours.",
    icon: Palette,
    span: "",
    accent: "from-brand-violet/40 to-brand-blue/40",
  },
  {
    title: "ATS Analyzer",
    desc: "Score your resume against any job description with actionable fixes.",
    icon: Gauge,
    span: "",
    accent: "from-emerald-500/30 to-brand-cyan/40",
  },
  {
    title: "Export to PDF",
    desc: "Pixel-perfect PDFs, beautifully typeset, ready to send.",
    icon: Download,
    span: "",
    accent: "from-brand-blue/40 to-brand-cyan/40",
  },
  {
    title: "One-click Deploy",
    desc: "Publish your portfolio to a custom subdomain — instantly.",
    icon: Rocket,
    span: "",
    accent: "from-brand-fuchsia/40 to-brand-pink/40",
  },
];

export function Features() {
  return (
    <Section id="features">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="Everything you need"
          title={
            <>
              A complete{" "}
              <span className="gradient-text">career operating system</span>
            </>
          }
          description="One platform, every asset. Built for creators who care about how their work is presented."
        />

        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} index={i} {...f} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function FeatureCard({
  title,
  desc,
  icon: Icon,
  badge,
  span,
  accent,
  index,
}: {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  span: string;
  accent: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: 0.04 * index, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className={`group relative rounded-2xl glass overflow-hidden p-5 md:p-6 ${span}`}
    >
      <div
        className={`absolute -top-24 -right-20 size-64 rounded-full bg-gradient-to-br ${accent} blur-3xl opacity-50 transition-opacity duration-500 group-hover:opacity-90`}
      />
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.12)]" />

      <div className="relative flex items-start justify-between">
        <div className="size-10 rounded-xl glass flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Icon className="size-5 text-white" />
        </div>
        {badge && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            {badge}
          </span>
        )}
      </div>

      <div className="relative mt-auto pt-6">
        <h3 className="text-lg md:text-xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="mt-1.5 text-sm text-white/60 max-w-md">{desc}</p>
      </div>
    </motion.div>
  );
}
