"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";

const QUOTES = [
  {
    name: "Maya Kapoor",
    role: "Product Designer · Plume",
    avatar: "MK",
    color: "from-fuchsia-500 to-violet-500",
    text: "I built my portfolio in 18 minutes and got 3 interviews the same week. The AI editor feels like having a senior recruiter on speed-dial.",
    stars: 5,
  },
  {
    name: "Jordan Park",
    role: "Staff Engineer · Foundry",
    avatar: "JP",
    color: "from-sky-500 to-indigo-500",
    text: "The ATS analyzer caught keyword gaps I'd missed for 6 years. Resume bumped from 71 → 96 and the offers followed.",
    stars: 5,
  },
  {
    name: "Sana Hassan",
    role: "Freelance designer",
    avatar: "SH",
    color: "from-pink-500 to-rose-500",
    text: "I run my freelance business on Careerora. Portfolio, case studies, cover letters — everything stays in one tone of voice.",
    stars: 5,
  },
  {
    name: "Diego Marín",
    role: "CS senior · UT Austin",
    avatar: "DM",
    color: "from-cyan-500 to-blue-500",
    text: "Got into 4 of my 5 dream internship interviews. Honestly felt unfair compared to my classmates still using Word templates.",
    stars: 5,
  },
  {
    name: "Lara Okonkwo",
    role: "GM · Hyperdrive",
    avatar: "LO",
    color: "from-amber-400 to-pink-500",
    text: "We onboard new contractors with Careerora. They ship a personal brand site, case studies & LinkedIn in a single afternoon.",
    stars: 5,
  },
  {
    name: "Eli Rosen",
    role: "Founder · Beamlight",
    avatar: "ER",
    color: "from-violet-500 to-blue-500",
    text: "Felt like I was using Linear, not a career tool. The polish is unreal — and the AI suggestions are genuinely sharp.",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <Section className="relative overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="Loved by professionals"
          title={
            <>
              The new standard for{" "}
              <span className="gradient-text">career assets</span>
            </>
          }
          description="From students to staff engineers — Careerora replaces 6 different tools."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUOTES.map((q, i) => (
            <motion.figure
              key={q.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
              className="glass rounded-2xl p-5 md:p-6 flex flex-col"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: q.stars }).map((_, n) => (
                  <Star
                    key={n}
                    className="size-3.5 fill-amber-300 text-amber-300"
                  />
                ))}
              </div>
              <blockquote className="mt-4 text-sm md:text-[15px] leading-relaxed text-white/85">
                “{q.text}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span
                  className={`size-9 rounded-full bg-gradient-to-br ${q.color} flex items-center justify-center text-xs font-semibold`}
                >
                  {q.avatar}
                </span>
                <div>
                  <p className="text-sm font-medium">{q.name}</p>
                  <p className="text-xs text-white/50">{q.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </Section>
  );
}
