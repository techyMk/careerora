"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, ArrowUpRight } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Resume", "Portfolio", "Case Study", "LinkedIn", "Cover letter"];

const TEMPLATES = [
  { name: "Modern Split", cat: "Resume", tone: "Pro · ATS · 2 pages", color: "from-brand-blue/40 to-brand-violet/40" },
  { name: "Executive CV", cat: "Resume", tone: "Serif · 1 page", color: "from-brand-violet/40 to-brand-pink/40" },
  { name: "Cyberpunk Dev", cat: "Portfolio", tone: "Dark · neon", color: "from-brand-cyan/40 to-brand-blue/40" },
  { name: "Creative Gradient", cat: "Portfolio", tone: "Bold · expressive", color: "from-brand-pink/40 to-brand-fuchsia/40" },
  { name: "Minimal Brief", cat: "Portfolio", tone: "Typo-led", color: "from-white/15 to-white/5" },
  { name: "Plume-style story", cat: "Case Study", tone: "Long-form", color: "from-brand-violet/40 to-brand-blue/40" },
  { name: "Recruiter magnet", cat: "LinkedIn", tone: "SEO-optimised", color: "from-brand-blue/40 to-brand-cyan/40" },
  { name: "Warm intro", cat: "Cover letter", tone: "Conversational", color: "from-amber-500/40 to-brand-pink/40" },
  { name: "Brutalist", cat: "Portfolio", tone: "Mono · stark", color: "from-white/10 to-ink-900" },
];

export default function TemplatesPage() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const filtered = TEMPLATES.filter(
    (t) =>
      (cat === "All" || t.cat === cat) &&
      (q === "" || t.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <Topbar title="Templates" subtitle="50+ premium starting points — all editable, all tunable." />
      <div className="p-5 md:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 px-3 h-10 rounded-full glass min-w-[260px] text-sm flex-1 max-w-md">
            <Search className="size-4 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search templates…"
              className="flex-1 bg-transparent outline-none placeholder:text-white/30"
            />
          </div>
          <div className="inline-flex p-1 glass rounded-full text-xs overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full transition-all",
                  cat === c ? "bg-brand-gradient shadow-glow" : "text-white/55 hover:text-white"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              whileHover={{ y: -4 }}
              className="group relative glass rounded-2xl overflow-hidden cursor-pointer"
            >
              <div
                className={`aspect-[4/3] bg-gradient-to-br ${t.color} relative overflow-hidden`}
              >
                <div className="absolute inset-0 dotted-bg opacity-30" />
                <div className="absolute inset-6 rounded-xl bg-ink-950/80 backdrop-blur-md flex flex-col p-4 shadow-soft">
                  <div className="h-2 w-1/3 bg-white/20 rounded" />
                  <div className="mt-1.5 h-2 w-3/4 bg-white/10 rounded" />
                  <div className="mt-1 h-2 w-2/3 bg-white/10 rounded" />
                  <div className="mt-auto grid grid-cols-3 gap-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-6 rounded bg-white/10" />
                    ))}
                  </div>
                </div>
                <div className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-ink-950/80 border border-white/10">
                  <Sparkles className="size-2.5 text-brand-violet" />
                  Pro
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-white/45">
                    {t.cat} · {t.tone}
                  </p>
                </div>
                <button className="size-8 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="size-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
