import type { PrismaClient } from "@prisma/client";

export const SAMPLE_RESUME_DATA = {
  summary:
    "Senior product builder with 5+ years shipping data-rich SaaS. Recently led a redesign that lifted activation +38% and unlocked an enterprise tier.",
  skills: ["Product design", "Design systems", "Figma", "Webflow", "Motion", "Research"],
  experience: [
    {
      id: "1",
      role: "Senior Designer",
      company: "Plume",
      period: "2023 — Present",
      bullets: [
        "Led end-to-end analytics redesign — +38% activation, −41% support tickets.",
        "Shipped a token-driven design system adopted by 4 product teams.",
      ],
    },
    {
      id: "2",
      role: "Product Designer",
      company: "Foundry",
      period: "2020 — 2023",
      bullets: [
        "Designed onboarding flows that improved trial → paid 22% → 31%.",
        "Partnered with research on weekly tests with 250+ users.",
      ],
    },
  ],
  education: [
    { school: "Pratt Institute", degree: "BFA Communications Design", period: "2014 — 2018" },
  ],
};

export const SAMPLE_PORTFOLIO_DATA = {
  hero: "Hi, I'm here to design products people actually use.",
  socials: { github: "", twitter: "", linkedin: "" },
  projects: [
    { name: "Plume", tagline: "Analytics redesign", color: "from-brand-blue/40 to-brand-violet/40" },
    { name: "Northwind", tagline: "Brand refresh", color: "from-brand-violet/40 to-brand-pink/40" },
    { name: "Lumen", tagline: "Mobile onboarding", color: "from-brand-cyan/40 to-brand-blue/40" },
  ],
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
