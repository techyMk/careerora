"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Globe2,
  Briefcase,
  BarChart3,
  Target,
  Download,
  ScrollText,
  Mail,
  Command,
} from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";

const HIGHLIGHTS = [
  {
    icon: FileText,
    metric: "9 sections",
    title: "Comprehensive resume editor",
    body: "Summary, experience, education, projects, skills, certifications, awards, languages, links — collapsible per-section editor with autosave.",
  },
  {
    icon: Download,
    metric: "Real PDF",
    title: "Server-rendered PDF export",
    body: "Not a browser-print hack — actual PDF documents rendered with @react-pdf, downloadable in one click, every section preserved.",
  },
  {
    icon: Target,
    metric: "Keyword match",
    title: "ATS scoring against any JD",
    body: "Paste a job description, get a real keyword-coverage score with matched and missing terms surfaced as actionable chips.",
  },
  {
    icon: Globe2,
    metric: "/p/yourname",
    title: "Public portfolios with real URLs",
    body: "Six themes, 6 device-frame preview, published at a real URL — track every view by country, referrer, dwell time and scroll depth.",
  },
  {
    icon: BarChart3,
    metric: "30-day analytics",
    title: "Recruiter tracking that actually tracks",
    body: "Per-view events with country flags, top referrers, time-on-page, and scroll percentage — surfaced in a real analytics dashboard.",
  },
  {
    icon: Briefcase,
    metric: "Multi-turn AI",
    title: "Mock interview prep",
    body: "Pick role + level + length, AI asks alternating-type questions, evaluates each answer, and writes a debrief with strengths and gaps.",
  },
  {
    icon: ScrollText,
    metric: "6-block writer",
    title: "Case-study editor",
    body: "Structured problem → solution → tech → metrics → timeline → results, with per-block AI rewrite trained on your voice.",
  },
  {
    icon: Mail,
    metric: "JD-tailored",
    title: "Cover letter generator",
    body: "Paste the JD, pick a tone (warm / senior / pivot / internal / follow-up), AI drafts a letter that mirrors the job's language naturally.",
  },
  {
    icon: Command,
    metric: "⌘K everywhere",
    title: "Global command palette",
    body: "Search every resume, portfolio, case study and cover letter from anywhere with one keystroke.",
  },
];

export function Highlights() {
  return (
    <Section className="relative">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="What's inside"
          title={
            <>
              The whole stack of career assets — <span className="gradient-text">end to end</span>
            </>
          }
          description="Every feature on this page is real and working. No mocks, no fake numbers."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIGHLIGHTS.map((h, i) => (
            <motion.div
              key={h.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.04 }}
              className="group relative glass rounded-2xl p-5 md:p-6 overflow-hidden hover:bg-white/[0.04] transition-colors"
            >
              <div className="absolute -top-16 -right-12 size-40 rounded-full bg-brand-gradient blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative flex items-center gap-3">
                <div className="size-10 rounded-xl gradient-border flex items-center justify-center">
                  <h.icon className="size-4" />
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                  {h.metric}
                </span>
              </div>
              <h3 className="relative mt-4 text-base md:text-lg font-semibold tracking-tight">
                {h.title}
              </h3>
              <p className="relative mt-1.5 text-sm text-white/65 leading-relaxed">
                {h.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
