"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  FileText,
  Globe2,
  Linkedin,
  Mail,
  ArrowRight,
  CheckCircle2,
  Star,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate pt-36 md:pt-44 pb-24 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 grid-bg" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[60rem] bg-radial-spotlight" />
      <div className="absolute left-1/2 -translate-x-1/2 -top-32 -z-10 size-[42rem] rounded-full bg-brand-violet/20 blur-[120px]" />
      <div className="absolute right-1/4 top-20 -z-10 size-[28rem] rounded-full bg-brand-pink/15 blur-[120px]" />
      <div className="absolute left-10 top-40 -z-10 size-[24rem] rounded-full bg-brand-blue/15 blur-[120px]" />

      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs font-medium text-white/80"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-violet opacity-75 animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-brand-violet" />
            </span>
            New · Live AI generation, beta now open
            <ArrowRight className="size-3" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] text-balance"
          >
            Build your entire <span className="gradient-text">professional
            identity</span> with AI.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-lg md:text-xl text-white/65 max-w-2xl mx-auto text-balance"
          >
            Generate stunning resumes, portfolios, LinkedIn summaries and
            project case studies in minutes — not weeks. Careerora is your AI
            career operating system.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button asChild size="xl">
              <Link href="/sign-up">
                <Wand2 className="size-4" />
                Generate Resume
              </Link>
            </Button>
            <Button asChild size="xl" variant="secondary">
              <Link href="/sign-up">
                <Globe2 className="size-4" />
                Build Portfolio
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 flex items-center justify-center gap-4 text-xs text-white/50"
          >
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              Free forever plan
            </span>
            <span className="size-1 rounded-full bg-white/20" />
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              No credit card
            </span>
            <span className="size-1 rounded-full bg-white/20" />
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-3.5 text-amber-300" />
              4.9/5 from 12k+ users
            </span>
          </motion.div>
        </div>

        <DashboardPreview reduce={!!reduce} />
      </div>
    </section>
  );
}

function DashboardPreview({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative mt-16 md:mt-24"
    >
      <div className="absolute inset-0 -z-10 bg-brand-gradient blur-3xl opacity-25 rounded-[3rem]" />

      <div className="relative gradient-border rounded-[1.75rem] glass-strong p-2 md:p-3 shadow-glow">
        <div className="rounded-[1.4rem] bg-ink-950/80 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-400/70" />
              <span className="size-2.5 rounded-full bg-amber-300/70" />
              <span className="size-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <div className="ml-3 flex-1 h-7 rounded-md bg-white/5 max-w-md flex items-center px-3 text-xs text-white/40">
              careerora.app/dashboard
            </div>
            <span className="hidden md:inline text-xs text-white/40">
              ⌘ K
            </span>
          </div>

          <div className="grid md:grid-cols-[220px_1fr] min-h-[520px]">
            <aside className="hidden md:flex flex-col gap-1 p-4 border-r border-white/5 bg-white/[0.015]">
              <SidebarItem active label="Dashboard" />
              <SidebarItem label="Resumes" count={4} />
              <SidebarItem label="Portfolios" count={2} />
              <SidebarItem label="LinkedIn" />
              <SidebarItem label="Case Studies" />
              <div className="mt-2 px-3 text-[10px] uppercase tracking-wider text-white/30">
                Tools
              </div>
              <SidebarItem label="AI Assistant" />
              <SidebarItem label="Templates" />
              <SidebarItem label="Settings" />

              <div className="mt-auto p-3 rounded-xl gradient-border">
                <p className="text-xs text-white/70">Career score</p>
                <p className="text-2xl font-semibold gradient-text">87</p>
                <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full w-[87%] bg-brand-gradient" />
                </div>
              </div>
            </aside>

            <div className="p-5 md:p-7 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40">Welcome back</p>
                  <h3 className="text-xl md:text-2xl font-semibold">
                    Let&apos;s ship your portfolio, Maya.
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-full glass text-xs">
                    <Sparkles className="size-3 text-brand-violet" />
                    AI suggestions ready
                  </div>
                  <div className="size-9 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-semibold">
                    MK
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <Stat label="Resumes" value="4" delta="+2" icon={<FileText className="size-3.5" />} />
                <Stat label="Portfolios" value="2" delta="+1" icon={<Globe2 className="size-3.5" />} />
                <Stat label="Profile views" value="1.2k" delta="+24%" icon={<Linkedin className="size-3.5" />} />
                <Stat label="Cover letters" value="9" delta="+3" icon={<Mail className="size-3.5" />} />
              </div>

              <div className="grid md:grid-cols-5 gap-4 mt-6">
                <div className="md:col-span-3 rounded-2xl bg-white/[0.02] border border-white/5 p-4 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-brand-gradient opacity-70" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/70">AI is drafting…</p>
                    <span className="text-[10px] uppercase tracking-wider text-brand-violet">
                      Streaming
                    </span>
                  </div>
                  <TypingPreview reduce={reduce} />
                </div>

                <div className="md:col-span-2 rounded-2xl bg-white/[0.02] border border-white/5 p-4">
                  <p className="text-sm text-white/70">Profile strength</p>
                  <div className="mt-3 flex items-center gap-4">
                    <RingProgress value={87} />
                    <div className="space-y-1.5 text-xs">
                      <Bar label="Resume" v={92} />
                      <Bar label="Portfolio" v={74} />
                      <Bar label="LinkedIn" v={88} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingCard
        className="absolute -left-4 md:-left-10 top-32 hidden md:block"
        delay={0.5}
      >
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-brand-gradient flex items-center justify-center">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-xs text-white/50">AI tip</p>
            <p className="text-sm">Quantify impact with metrics ✨</p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard
        className="absolute -right-4 md:-right-10 bottom-24 hidden md:block"
        delay={0.8}
      >
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-300">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <p className="text-xs text-white/50">ATS score</p>
            <p className="text-sm font-medium">94/100 · Excellent</p>
          </div>
        </div>
      </FloatingCard>
    </motion.div>
  );
}

function SidebarItem({
  label,
  active,
  count,
}: {
  label: string;
  active?: boolean;
  count?: number;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
        active ? "bg-white/5 text-white" : "text-white/55"
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5">
          {count}
        </span>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-3">
      <div className="flex items-center justify-between text-white/50">
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="mt-1.5 flex items-end justify-between">
        <span className="text-xl font-semibold">{value}</span>
        <span className="text-[10px] text-emerald-300">{delta}</span>
      </div>
    </div>
  );
}

function RingProgress({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = c * (value / 100);
  return (
    <div className="relative size-16 shrink-0">
      <svg viewBox="0 0 60 60" className="size-16 -rotate-90">
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <circle
          cx="30"
          cy="30"
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="5"
          fill="none"
        />
        <circle
          cx="30"
          cy="30"
          r={r}
          stroke="url(#ring)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}

function Bar({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="flex justify-between text-white/60">
        <span>{label}</span>
        <span>{v}%</span>
      </div>
      <div className="mt-0.5 h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-brand-gradient"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

function FloatingCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`glass-strong rounded-2xl p-3 shadow-soft animate-float ${className}`}
    >
      {children}
    </motion.div>
  );
}

function TypingPreview({ reduce }: { reduce: boolean }) {
  const text =
    "Maya is a product designer with 5+ years building data-rich SaaS experiences. At Acme, she led the redesign of the analytics dashboard that lifted activation by 38% and";
  return (
    <p className="mt-3 text-sm leading-relaxed text-white/80">
      {reduce ? (
        text
      ) : (
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "linear" }}
          className="inline-block overflow-hidden whitespace-pre-wrap align-top"
        >
          {text}
        </motion.span>
      )}
      <span className="inline-block w-1.5 h-4 bg-brand-violet align-middle ml-0.5 animate-pulse" />
    </p>
  );
}
