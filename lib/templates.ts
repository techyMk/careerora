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
  // ─── Resume (8) ───────────────────────────────────────────
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
    id: "resume-tech",
    name: "Tech IC",
    category: "Resume",
    tone: "Skills-first · for engineers",
    tier: "Free",
    action: { kind: "resume", applyId: "modern", defaultName: "Tech IC resume" },
    swatch: ["#06B6D4", "#3B82F6"],
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
  {
    id: "resume-creative",
    name: "Creative",
    category: "Resume",
    tone: "Designers, writers, marketers",
    tier: "Pro",
    action: { kind: "resume", applyId: "modern", defaultName: "Creative resume" },
    swatch: ["#EC4899", "#F59E0B"],
  },
  {
    id: "resume-sales",
    name: "Sales / GTM",
    category: "Resume",
    tone: "Quota-led · metric-heavy",
    tier: "Pro",
    action: { kind: "resume", applyId: "modern", defaultName: "Sales resume" },
    swatch: ["#10B981", "#06B6D4"],
  },
  {
    id: "resume-academic",
    name: "Academic CV",
    category: "Resume",
    tone: "Publications · grants · research",
    tier: "Pro",
    action: { kind: "resume", applyId: "executive", defaultName: "Academic CV" },
    swatch: ["#1F2937", "#A78BFA"],
  },
  {
    id: "resume-graduate",
    name: "New Graduate",
    category: "Resume",
    tone: "Education-led · for first jobs",
    tier: "Free",
    action: { kind: "resume", applyId: "classic", defaultName: "Graduate resume" },
    swatch: ["#3B82F6", "#06B6D4"],
  },

  // ─── Portfolio (9) ────────────────────────────────────────
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
  {
    id: "portfolio-editorial",
    name: "Editorial",
    category: "Portfolio",
    tone: "Magazine-like · long-form",
    tier: "Pro",
    action: { kind: "portfolio", applyId: "minimal", defaultName: "Editorial portfolio" },
    swatch: ["#1F2937", "#F59E0B"],
  },
  {
    id: "portfolio-single",
    name: "Single Page",
    category: "Portfolio",
    tone: "All-in-one · scrolly",
    tier: "Free",
    action: { kind: "portfolio", applyId: "gradient", defaultName: "Single-page portfolio" },
    swatch: ["#3B82F6", "#06B6D4"],
  },
  {
    id: "portfolio-agency",
    name: "Studio / Agency",
    category: "Portfolio",
    tone: "Case-led · client logos",
    tier: "Pro",
    action: { kind: "portfolio", applyId: "luxury", defaultName: "Agency portfolio" },
    swatch: ["#EC4899", "#7C3AED"],
  },

  // ─── Case Study (5) ───────────────────────────────────────
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
  {
    id: "case-data",
    name: "Data Heavy",
    category: "Case Study",
    tone: "Charts · before/after metrics",
    tier: "Pro",
    action: { kind: "case-study", defaultName: "Data-heavy case study" },
    swatch: ["#10B981", "#06B6D4"],
  },
  {
    id: "case-startup",
    name: "Startup MVP",
    category: "Case Study",
    tone: "0→1 · scrappy · founder voice",
    tier: "Free",
    action: { kind: "case-study", defaultName: "MVP case study" },
    swatch: ["#F59E0B", "#EC4899"],
  },
  {
    id: "case-research",
    name: "UX Research",
    category: "Case Study",
    tone: "Methods · findings · insights",
    tier: "Pro",
    action: { kind: "case-study", defaultName: "Research case study" },
    swatch: ["#1F2937", "#A78BFA"],
  },

  // ─── LinkedIn (5) ─────────────────────────────────────────
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
  {
    id: "linkedin-creator",
    name: "Creator",
    category: "LinkedIn",
    tone: "Build-in-public · audience-first",
    tier: "Pro",
    action: { kind: "linkedin" },
    swatch: ["#7C3AED", "#EC4899"],
  },
  {
    id: "linkedin-jobseeker",
    name: "Open to Work",
    category: "LinkedIn",
    tone: "Active search · clear ask",
    tier: "Free",
    action: { kind: "linkedin" },
    swatch: ["#06B6D4", "#10B981"],
  },
  {
    id: "linkedin-senior",
    name: "Senior IC",
    category: "LinkedIn",
    tone: "Quiet authority · specific",
    tier: "Pro",
    action: { kind: "linkedin" },
    swatch: ["#1F2937", "#3B82F6"],
  },

  // ─── Cover letter (5) ─────────────────────────────────────
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
  {
    id: "cover-pivot",
    name: "Career Pivot",
    category: "Cover letter",
    tone: "Reframes past as relevant",
    tier: "Pro",
    action: { kind: "cover" },
    swatch: ["#EC4899", "#7C3AED"],
  },
  {
    id: "cover-internal",
    name: "Internal Move",
    category: "Cover letter",
    tone: "For applying within your company",
    tier: "Free",
    action: { kind: "cover" },
    swatch: ["#10B981", "#3B82F6"],
  },
  {
    id: "cover-followup",
    name: "Follow-up",
    category: "Cover letter",
    tone: "Post-interview thank-you",
    tier: "Pro",
    action: { kind: "cover" },
    swatch: ["#06B6D4", "#A78BFA"],
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
