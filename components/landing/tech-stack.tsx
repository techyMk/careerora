"use client";

import { motion } from "framer-motion";

const STACK = [
  { name: "Next.js 15", note: "App Router · RSC" },
  { name: "TypeScript", note: "strict mode" },
  { name: "Tailwind CSS", note: "design system" },
  { name: "Framer Motion", note: "animations" },
  { name: "Prisma 6", note: "ORM" },
  { name: "Neon Postgres", note: "serverless DB" },
  { name: "NextAuth v5", note: "credentials + OAuth" },
  { name: "Groq", note: "streaming LLMs" },
  { name: "Stripe", note: "subscriptions" },
  { name: "Vercel", note: "hosting + domains" },
  { name: "React PDF", note: "real PDF export" },
];

export function TechStack() {
  return (
    <section className="py-14 md:py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="text-center text-xs uppercase tracking-[0.2em] text-white/40"
        >
          Built with the modern web stack
        </motion.p>

        <div className="relative mt-8 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <div className="flex gap-8 md:gap-12 animate-marquee will-change-transform">
            {[...STACK, ...STACK].map((s, i) => (
              <Pill key={i} name={s.name} note={s.note} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pill({ name, note }: { name: string; note: string }) {
  return (
    <div className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
      <span className="size-1.5 rounded-full bg-brand-gradient" />
      <span className="text-sm font-medium whitespace-nowrap">{name}</span>
      <span className="text-xs text-white/40 whitespace-nowrap">{note}</span>
    </div>
  );
}
