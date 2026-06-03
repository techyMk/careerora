import type { PrismaClient } from "@prisma/client";

export const SAMPLE_RESUME_DATA = {
  summary:
    "Senior product builder with 6+ years shipping data-rich SaaS. Recently led an analytics redesign at Plume that lifted activation +38% and unlocked a $1.4M ARR enterprise tier. I care about clear thinking, type-led layouts, and motion that explains — not decorates.",
  skills: [
    "Product design",
    "Design systems",
    "Figma",
    "Webflow",
    "Motion",
    "Research",
    "Prototyping",
    "User testing",
    "Information architecture",
    "Brand",
  ],
  experience: [
    {
      id: "exp-1",
      role: "Senior Designer",
      company: "Plume",
      location: "Remote",
      period: "2023 — Present",
      bullets: [
        "Led end-to-end analytics redesign — +38% activation, −41% support tickets.",
        "Shipped a token-driven design system adopted by 4 product teams.",
        "Owned the brand refresh: new wordmark, motion language, and marketing site.",
      ],
    },
    {
      id: "exp-2",
      role: "Product Designer",
      company: "Foundry",
      location: "New York, NY",
      period: "2020 — 2023",
      bullets: [
        "Designed onboarding flows that improved trial → paid conversion 22% → 31%.",
        "Partnered with research on weekly tests with 250+ users.",
        "Mentored 2 junior designers and led the design hiring loop.",
      ],
    },
    {
      id: "exp-3",
      role: "Junior Designer",
      company: "Northwind Studio",
      location: "Brooklyn, NY",
      period: "2018 — 2020",
      bullets: [
        "Designed marketing sites for 12 early-stage clients.",
        "Built and maintained the studio's component library in Figma.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "Pratt Institute",
      degree: "BFA Communications Design",
      period: "2014 — 2018",
      details: "Magna Cum Laude · GPA 3.8 / 4.0",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Plume Analytics 2.0",
      description:
        "Re-architected the analytics suite around 3 focal jobs with progressive disclosure.",
      tech: "Figma · Webflow · React",
      url: "",
    },
    {
      id: "proj-2",
      name: "Northwind brand system",
      description:
        "New wordmark, motion language and marketing site shipped in 4 weeks.",
      tech: "Illustrator · After Effects · Webflow",
      url: "",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Google UX Design Professional Certificate",
      issuer: "Google",
      date: "2022",
      url: "",
    },
    {
      id: "cert-2",
      name: "Nielsen Norman UX Certification",
      issuer: "NN/g",
      date: "2021",
      url: "",
    },
  ],
  awards: [
    {
      id: "awd-1",
      name: "Awwwards Site of the Day",
      issuer: "Awwwards",
      date: "2024",
    },
    {
      id: "awd-2",
      name: "Design+Code Best of Year",
      issuer: "Design+Code",
      date: "2023",
    },
  ],
  languages: [
    { id: "lang-1", name: "English", level: "Native" },
    { id: "lang-2", name: "Hindi", level: "Native" },
    { id: "lang-3", name: "Spanish", level: "Conversational" },
  ],
  links: [
    { id: "lnk-1", label: "Portfolio", url: "maya.design" },
    { id: "lnk-2", label: "LinkedIn", url: "linkedin.com/in/maya" },
    { id: "lnk-3", label: "Read.cv", url: "read.cv/maya" },
  ],
};

export const SAMPLE_PORTFOLIO_DATA = {
  hero: "I build products people actually use.",
  about:
    "I'm a multidisciplinary builder with a background in product, design, and engineering. Recently I've been focused on AI-native tools that help small teams ship faster without losing taste.",
  skills: ["Product", "Design systems", "Next.js", "TypeScript", "AI tools"],
  projects: [
    {
      id: "p1",
      name: "Plume Analytics",
      description: "Led a 6-week redesign that lifted activation +38% and unlocked a $1.4M ARR enterprise tier.",
      url: "",
      tags: ["Product design", "Data viz"],
    },
    {
      id: "p2",
      name: "Northwind brand refresh",
      description: "New wordmark, motion language and marketing site. Shipped in 4 weeks.",
      url: "",
      tags: ["Brand", "Motion"],
    },
    {
      id: "p3",
      name: "Lumen onboarding",
      description: "Mobile-first onboarding flow that improved trial → paid 22% → 31%.",
      url: "",
      tags: ["Mobile", "Growth"],
    },
  ],
  socials: { github: "", twitter: "", linkedin: "", website: "" },
  contact: { email: "" },
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

/** Create starter content for a freshly-registered user. */
export async function seedUserContent(
  prisma: PrismaClient,
  user: { id: string; name?: string | null; email: string }
) {
  const displayName = user.name || user.email.split("@")[0];

  await prisma.resume.create({
    data: {
      userId: user.id,
      name: `${displayName}'s first resume`,
      template: "modern",
      atsScore: 82,
      data: JSON.stringify(SAMPLE_RESUME_DATA),
    },
  });

  const base = slugify(displayName) || "me";
  let subdomain = base;
  for (let i = 1; await prisma.portfolio.findUnique({ where: { subdomain } }); i++) {
    subdomain = `${base}-${i}`;
  }

  await prisma.portfolio.create({
    data: {
      userId: user.id,
      name: `${displayName}.careerora.app`,
      theme: "gradient",
      subdomain,
      bio: `${displayName} — multidisciplinary builder. I help early-stage teams ship on-brand products.`,
      published: false,
      data: JSON.stringify(SAMPLE_PORTFOLIO_DATA),
    },
  });

  await prisma.linkedinProfile.create({
    data: {
      userId: user.id,
      headline: `${displayName} · open to interesting work`,
      about: `I'm ${displayName}. I care about clear thinking, well-designed systems, and shipping work that compounds.`,
      postIdeas: JSON.stringify([
        "The 3 metrics that actually predict design impact",
        "How I work with engineers on weekly tests",
      ]),
    },
  });
}
