"use client";

import { motion } from "framer-motion";

const LOGOS = [
  "Lumen Labs",
  "Northwind",
  "Pixelate",
  "Hyperdrive",
  "Foundry",
  "Nimbus",
  "Stack&Co",
  "Beamlight",
  "Polaris",
  "Quantic",
];

export function TrustedBy() {
  return (
    <section className="py-14 md:py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="text-center text-xs uppercase tracking-[0.2em] text-white/40"
        >
          Trusted by 12,000+ creators, freelancers, students &amp; founders
        </motion.p>

        <div className="relative mt-8 [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
          <div className="flex gap-12 md:gap-16 animate-marquee will-change-transform">
            {[...LOGOS, ...LOGOS].map((name, i) => (
              <LogoMark key={i} name={name} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoMark({ name }: { name: string }) {
  return (
    <div className="shrink-0 flex items-center gap-2 text-white/55 hover:text-white transition-colors">
      <span className="inline-block size-5 rounded-md bg-gradient-to-br from-white/20 to-white/5 shadow-soft" />
      <span className="text-base md:text-lg font-semibold tracking-tight whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}
