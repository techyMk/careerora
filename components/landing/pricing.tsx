"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CtaIntent = "signup" | "checkout_pro_monthly" | "checkout_pro_yearly" | "checkout_teams_monthly" | "dashboard" | "manage";

type Plan = {
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  highlight?: boolean;
  /** Used to figure out what the CTA should actually do for the current session. */
  tier: "free" | "pro" | "teams";
};

const PLANS: Plan[] = [
  {
    name: "Free",
    tagline: "Get hired — at zero cost.",
    priceMonthly: 0,
    priceYearly: 0,
    tier: "free",
    features: [
      "1 AI resume",
      "1 portfolio site (subdomain)",
      "Basic ATS analyzer",
      "PDF export",
      "Community templates",
    ],
  },
  {
    name: "Pro",
    tagline: "For ambitious professionals.",
    priceMonthly: 14,
    priceYearly: 9,
    tier: "pro",
    highlight: true,
    features: [
      "Unlimited resumes, portfolios & case studies",
      "Advanced ATS + keyword scoring",
      "Custom domain + analytics",
      "Premium themes & fonts",
      "AI writing assistant (inline)",
      "Recruiter tracking & engagement",
    ],
  },
  {
    name: "Teams",
    tagline: "For agencies & talent teams.",
    priceMonthly: 39,
    priceYearly: 29,
    tier: "teams",
    features: [
      "Everything in Pro",
      "Workspaces & shared brand kits",
      "Role-based permissions",
      "Bulk generate for contractors",
      "SSO + audit log",
      "Priority support",
    ],
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();
  const { status, data } = useSession();
  const isAuthed = status === "authenticated";

  // We don't know the user's plan from useSession (it only has name/email/id);
  // assume free unless the call we make says otherwise. Real checks happen
  // server-side in the Stripe endpoint.
  const goCheckout = async (
    price: "pro_monthly" | "pro_yearly" | "teams_monthly",
    key: string
  ) => {
    setBusy(key);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ price }),
      });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.href = json.url;
        return;
      }
      // Payments not configured / not authed / etc — fall back gracefully
      if (res.status === 401) {
        router.push("/sign-in?from=/dashboard/settings?tab=billing");
        return;
      }
      router.push("/dashboard/settings?tab=billing");
    } finally {
      setBusy(null);
    }
  };

  const handleCta = (plan: Plan) => {
    const key = `${plan.tier}-${yearly ? "y" : "m"}`;
    if (!isAuthed) {
      router.push(plan.tier === "free" ? "/sign-up" : "/sign-up");
      return;
    }
    if (plan.tier === "free") {
      router.push("/dashboard");
      return;
    }
    if (plan.tier === "pro") {
      goCheckout(yearly ? "pro_yearly" : "pro_monthly", key);
      return;
    }
    if (plan.tier === "teams") {
      goCheckout("teams_monthly", key);
      return;
    }
  };

  const ctaLabel = (plan: Plan) => {
    if (!isAuthed) return plan.tier === "free" ? "Start free" : `Get ${plan.name}`;
    if (plan.tier === "free") return "Open dashboard";
    return `Upgrade to ${plan.name}`;
  };

  return (
    <Section id="pricing" className="relative">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="Pricing"
          title={
            <>
              Premium career assets.{" "}
              <span className="gradient-text">Pocket-money pricing.</span>
            </>
          }
          description="Simple plans. Cancel anytime. No surprise tokens or AI credits — generate as much as you need."
        />

        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 glass rounded-full text-sm">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "px-4 py-2 rounded-full transition-all",
                !yearly ? "bg-brand-gradient text-white shadow-glow" : "text-white/60"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "px-4 py-2 rounded-full transition-all inline-flex items-center gap-2",
                yearly ? "bg-brand-gradient text-white shadow-glow" : "text-white/60"
              )}
            >
              Yearly
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                −35%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {PLANS.map((p, i) => {
            const key = `${p.tier}-${yearly ? "y" : "m"}`;
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={cn(
                  "relative rounded-3xl p-6 md:p-8 flex flex-col",
                  p.highlight ? "gradient-border glass-strong shadow-glow" : "glass"
                )}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-brand-gradient text-xs font-semibold shadow-glow ring-4 ring-ink-950">
                    Most popular
                  </div>
                )}
                <div>
                  <p className="text-sm text-white/60">{p.tagline}</p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                    {p.name}
                  </h3>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-5xl font-semibold tracking-tight">
                      ${yearly ? p.priceYearly : p.priceMonthly}
                    </span>
                    <span className="text-sm text-white/50">/ mo</span>
                  </div>
                  {yearly && p.priceYearly > 0 && (
                    <p className="text-xs text-white/45 mt-1">
                      billed ${p.priceYearly * 12}/year
                    </p>
                  )}
                </div>

                <ul className="mt-7 space-y-3 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span
                        className={cn(
                          "mt-0.5 size-5 rounded-full flex items-center justify-center shrink-0",
                          p.highlight
                            ? "bg-brand-gradient"
                            : "bg-white/5 border border-white/10"
                        )}
                      >
                        <Check className="size-3" />
                      </span>
                      <span className="text-white/85">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  variant={p.highlight ? "primary" : "secondary"}
                  className="mt-8 w-full"
                  onClick={() => handleCta(p)}
                  disabled={busy !== null}
                >
                  {busy === key ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    ctaLabel(p)
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
