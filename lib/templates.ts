/**
 * Template catalog — the single source of truth for the Templates gallery.
 * Each entry knows its category, tier (free vs pro), and which API to call
 * + which template/theme id to apply when the user picks it.
 */

export type TemplateCategory =
  | "Resume"
  | "Portfolio"
  | "Case Study"
  | "LinkedIn"
  | "Cover letter";

export type Template = {
  id: string;
  name: string;
  category: TemplateCategory;
  tone: string;
  tier: "Free" | "Pro";
  /** What we create when this template is selected. */
  action: {
    kind: "resume" | "portfolio" | "case-study" | "linkedin" | "cover";
    /** Sent in the POST body (e.g. resume template id, portfolio theme). */
    applyId?: string;
    /** Default name for the new asset. */
    defaultName?: string;
  };
  /** Visual hint used by the preview thumbnail. */
  swatch: [string, string];
};

export const TEMPLATES: Template[] = [
  // ─── Resume ───────────────────────────────────────────────
  {
    id: "resume-classic",
    name: "Classic ATS",
    category: "Resume",
    tone: "Centered header · single column",
    tier: "Free",
    action: { kind: "resume", applyId: "classic", defaultName: "Classic resume" },
    swatch: ["#0B0F19", "#3B82F6"],
  },
  {
    id: "resume-modern",
    name: "Modern Split",
    category: "Resume",
    tone: "Sidebar + main · most popular",
    tier: "Free",
    action: { kind: "resume", applyId: "modern", defaultName: "Modern split resume" },
    swatch: ["#3B82F6", "#7C3AED"],
  },
  {
    id: "resume-executive",
    name: "Executive CV",
    category: "Resume",
    tone: "Serif · long-form · senior roles",
    tier: "Pro",
    action: { kind: "resume", applyId: "executive", defaultName: "Executive CV" },
    swatch: ["#7C3AED", "#EC4899"],
  },

  // ─── Portfolio ────────────────────────────────────────────
  {
    id: "portfolio-minimal",
    name: "Minimal",
    category: "Portfolio",
    tone: "Type-led · monochrome",
    tier: "Free",
    action: { kind: "portfolio", applyId: "minimal", defaultName: "Minimal portfolio" },
    swatch: ["#0B0F19", "#FFFFFF"],
  },
  {
    id: "portfolio-gradient",
    name: "Creative Gradient",
    category: "Portfolio",
    tone: "Expressive · bold gradients",
    tier: "Free",
    action: { kind: "portfolio", applyId: "gradient", defaultName: "Creative gradient portfolio" },
    swatch: ["#7C3AED", "#EC4899"],
  },
  {
    id: "portfolio-glass",
    name: "Glassmorphism",
    category: "Portfolio",
    tone: "Soft blur · premium",
    tier: "Pro",
    action: { kind: "portfolio", applyId: "glass", defaultName: "Glass portfolio" },
    swatch: ["#1F2937", "#A78BFA"],
  },
  {
    id: "portfolio-cyberpunk",
    name: "Cyberpunk Dev",
    category: "Portfolio",
    tone: "Dark · neon · for devs",
    tier: "Pro",
    action: { kind: "portfolio", applyId: "cyberpunk", defaultName: "Cyberpunk portfolio" },
    swatch: ["#0B0F19", "#06B6D4"],
  },
  {
    id: "portfolio-luxury",
    name: "Luxury Dark",
    category: "Portfolio",
    tone: "Editorial · understated",
    tier: "Pro",
    action: { kind: "portfolio", applyId: "luxury", defaultName: "Luxury dark portfolio" },
    swatch: ["#0B0F19", "#D946EF"],
  },
  {
    id: "portfolio-brutalist",
    name: "Brutalist",
    category: "Portfolio",
    tone: "Mono · stark · monochrome",
    tier: "Pro",
    action: { kind: "portfolio", applyId: "brutalist", defaultName: "Brutalist portfolio" },
    swatch: ["#FFFFFF", "#000000"],
  },

  // ─── Case Study ───────────────────────────────────────────
  {
    id: "case-plume",
    name: "Plume Story",
    category: "Case Study",
    tone: "Narrative · problem → results",
    tier: "Free",
    action: { kind: "case-study", defaultName: "New case study" },
    swatch: ["#06B6D4", "#3B82F6"],
  },
  {
    id: "case-longform",
    name: "Long-form Story",
    category: "Case Study",
    tone: "10-min read · annotated process",
    tier: "Pro",
    action: { kind: "case-study", defaultName: "Long-form case study" },
    swatch: ["#7C3AED", "#3B82F6"],
  },

  // ─── LinkedIn ─────────────────────────────────────────────
  {
    id: "linkedin-magnet",
    name: "Recruiter Magnet",
    category: "LinkedIn",
    tone: "SEO-tuned · 12k+ profile views",
    tier: "Free",
    action: { kind: "linkedin" },
    swatch: ["#3B82F6", "#06B6D4"],
  },
  {
    id: "linkedin-founder",
    name: "Founder Voice",
    category: "LinkedIn",
    tone: "Personal · authority-led",
    tier: "Pro",
    action: { kind: "linkedin" },
    swatch: ["#EC4899", "#F59E0B"],
  },

  // ─── Cover letter ─────────────────────────────────────────
  {
    id: "cover-warm",
    name: "Warm Intro",
    category: "Cover letter",
    tone: "Conversational · friendly",
    tier: "Free",
    action: { kind: "cover" },
    swatch: ["#F59E0B", "#EC4899"],
  },
  {
    id: "cover-senior",
    name: "Senior Tone",
    category: "Cover letter",
    tone: "Confident · concise · execs",
    tier: "Pro",
    action: { kind: "cover" },
    swatch: ["#7C3AED", "#3B82F6"],
  },
];

export const CATEGORIES: Array<"All" | TemplateCategory> = [
  "All",
  "Resume",
  "Portfolio",
  "Case Study",
  "LinkedIn",
  "Cover letter",
];
