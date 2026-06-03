"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="relative gradient-border rounded-[2rem] overflow-hidden"
        >
          <div className="absolute inset-0 bg-brand-gradient opacity-20" />
          <div className="absolute -inset-20 bg-brand-gradient blur-3xl opacity-25" />
          <div className="absolute inset-0 dotted-bg opacity-30" />

          <div className="relative glass-strong p-10 md:p-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-white/80">
              <span className="size-1.5 rounded-full bg-brand-gradient animate-pulse-soft" />
              The future of how you present yourself
            </div>
            <h2 className="mt-5 text-3xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
              Your career deserves better
              <br />
              than <span className="gradient-text">templates.</span>
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-white/65 text-balance">
              Start with the free plan — generate a resume, portfolio and
              LinkedIn rewrite in under five minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="xl">
                <Link href="/sign-up">
                  Start Building Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="secondary">
                <Link href="#features">See features</Link>
              </Button>
            </div>
            <p className="mt-5 text-xs text-white/40">
              No credit card · 60-second sign-up · ✨ Generate unlimited drafts
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
