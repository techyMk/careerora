import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { TrustedBy } from "@/components/landing/trusted-by";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LiveDemo } from "@/components/landing/live-demo";
import { PortfolioShowcase } from "@/components/landing/portfolio-showcase";
import { ResumeShowcase } from "@/components/landing/resume-showcase";
import { CaseStudy } from "@/components/landing/case-study";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <LiveDemo />
      <PortfolioShowcase />
      <ResumeShowcase />
      <CaseStudy />
      <Testimonials />
      <Pricing />
      <FinalCta />
      <Footer />
    </main>
  );
}
