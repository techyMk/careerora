"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, SendHorizontal, FileText, Wand2 } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { cn } from "@/lib/utils";

const PROMPTS = [
  "Write a senior backend resume summary highlighting AWS, Go and 5 yrs scale",
  "Create a designer portfolio bio — warm, confident, hint of wit",
  "LinkedIn headline for a freelance React + AI engineer",
];

const RESPONSE_TEXT = `Senior backend engineer with 5+ years architecting low-latency, cloud-native systems on AWS. I specialise in Go services that scale to millions of requests/day — recently led a re-platform that cut p99 latency by 42% while halving infra cost. I care deeply about clean abstractions, robust observability, and shipping work that compounds.`;

export function LiveDemo() {
  const [active, setActive] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const [text, setText] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const run = (prompt: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setText("");
    setStreaming(true);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i += 2;
      setText(RESPONSE_TEXT.slice(0, i));
      if (i >= RESPONSE_TEXT.length) {
        clearInterval(intervalRef.current!);
        setStreaming(false);
      }
    }, 22);
  };

  useEffect(() => {
    run(PROMPTS[active]);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <Section className="relative">
      <div className="absolute left-1/2 -translate-x-1/2 top-1/3 -z-10 size-[36rem] rounded-full bg-brand-violet/15 blur-[120px]" />
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="Live AI demo"
          title={
            <>
              Watch the AI write{" "}
              <span className="gradient-text">in real time</span>
            </>
          }
          description="Pick a prompt and see how Careerora streams polished, on-brand career copy — instantly."
        />

        <div className="grid md:grid-cols-[1fr_1.2fr] gap-4 md:gap-6">
          <div className="glass rounded-2xl p-5 md:p-6 space-y-3">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Try a prompt
            </p>
            {PROMPTS.map((p, i) => (
              <button
                key={p}
                onClick={() => setActive(i)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border transition-all group",
                  active === i
                    ? "bg-white/[0.04] border-white/15 shadow-soft"
                    : "border-white/5 hover:bg-white/[0.02] hover:border-white/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "size-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors",
                      active === i
                        ? "bg-brand-gradient"
                        : "bg-white/5 text-white/60 group-hover:bg-white/10"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/85">{p}</span>
                </div>
              </button>
            ))}
            <div className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
              <Wand2 className="size-4 text-brand-violet" />
              <input
                placeholder="Or write your own…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    run((e.target as HTMLInputElement).value || PROMPTS[active]);
                  }
                }}
              />
              <button
                onClick={() => run(PROMPTS[active])}
                className="size-7 rounded-lg bg-brand-gradient flex items-center justify-center hover:scale-105 transition-transform"
                aria-label="Run"
              >
                <SendHorizontal className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-5 md:p-6 min-h-[360px] flex flex-col">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-2 text-white/60">
                <FileText className="size-3.5" />
                Resume summary · draft
              </span>
              <AnimatePresence>
                {streaming && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center gap-2 text-brand-violet"
                  >
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-brand-violet opacity-75 animate-ping" />
                      <span className="relative inline-flex size-2 rounded-full bg-brand-violet" />
                    </span>
                    Streaming
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex-1 rounded-xl bg-white/[0.02] border border-white/5 p-5">
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-white/90">
                {text}
                {streaming && (
                  <span className="inline-block w-1.5 h-4 bg-brand-violet align-middle ml-0.5 animate-pulse" />
                )}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {["Make punchier", "Add metrics", "Shorten", "Formal tone"].map(
                (a) => (
                  <button
                    key={a}
                    onClick={() => run(PROMPTS[active])}
                    className="px-3 py-1.5 text-xs rounded-full glass hover:bg-white/10 transition-colors"
                  >
                    <Sparkles className="inline size-3 mr-1 text-brand-violet" />
                    {a}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
