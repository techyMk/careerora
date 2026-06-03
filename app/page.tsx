import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { TechStack } from "@/components/landing/tech-stack";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LiveDemo } from "@/components/landing/live-demo";
import { PortfolioShowcase } from "@/components/landing/portfolio-showcase";
import { ResumeShowcase } from "@/components/landing/resume-showcase";
import { CaseStudy } from "@/components/landing/case-study";
import { Highlights } from "@/components/landing/highlights";
import { Pricing } from "@/components/landing/pricing";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import {
  PortfolioRenderer,
  type PortfolioData,
} from "@/components/portfolio/portfolio-renderer";

export const dynamic = "force-dynamic";

const APP_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "careerora.app",
  "www.careerora.app",
]);

function isAppHost(host: string) {
  const h = host.toLowerCase().split(":")[0];
  if (APP_HOSTS.has(h)) return true;
  if (h.endsWith(".vercel.app")) return true;
  if (h.endsWith(".careerora.app")) return true;
  return false;
}

export default async function HomePage() {
  const h = await headers();
  const host = h.get("host") ?? "";

  // If someone visits us at a custom domain (CNAMEd to the app), render that
  // portfolio at the root instead of the landing page.
  if (host && !isAppHost(host)) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { customDomain: host.toLowerCase().split(":")[0] },
      include: {
        user: {
          select: { id: true, name: true, email: true, headline: true },
        },
      },
    });
    if (portfolio?.published) {
      let data: PortfolioData = {};
      try { data = JSON.parse(portfolio.data); } catch { /* default */ }
      prisma.portfolio
        .update({ where: { id: portfolio.id }, data: { views: { increment: 1 } } })
        .catch(() => {});
      return (
        <main className="min-h-screen">
          <PortfolioRenderer
            meta={{
              name: portfolio.name,
              bio: portfolio.bio,
              theme: portfolio.theme,
              ownerName: portfolio.user.name,
              ownerHeadline: portfolio.user.headline,
            }}
            data={data}
          />
        </main>
      );
    }
  }

  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <TechStack />
      <Features />
      <HowItWorks />
      <LiveDemo />
      <PortfolioShowcase />
      <ResumeShowcase />
      <CaseStudy />
      <Highlights />
      <Pricing />
      <FinalCta />
      <Footer />
    </main>
  );
}
