import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileText,
  Globe2,
  Linkedin,
  ScrollText,
  Eye,
  Sparkles,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  Lightbulb,
  Zap,
  TrendingUp,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/dashboard/topbar";
import { CreateProjectButtons } from "@/components/dashboard/create-buttons";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const [user, resumes, portfolios, caseStudies, chatMessages] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { name: true, email: true, headline: true },
      }),
      prisma.resume.findMany({
        where: { userId: sessionUser.id },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.portfolio.findMany({
        where: { userId: sessionUser.id },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.caseStudy.findMany({
        where: { userId: sessionUser.id },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.chatMessage.count({ where: { userId: sessionUser.id } }),
    ]);

  const recent = [
    ...resumes.map((r) => ({
      id: r.id,
      name: r.name,
      type: "Resume",
      kind: "resume" as const,
      updated: r.updatedAt,
      score: r.atsScore,
      href: `/dashboard/resumes/${r.id}`,
    })),
    ...portfolios.map((p) => ({
      id: p.id,
      name: p.name,
      type: "Portfolio",
      kind: "portfolio" as const,
      updated: p.updatedAt,
      score: p.published ? 92 : 78,
      href: `/dashboard/portfolios/${p.id}`,
    })),
    ...caseStudies.map((c) => ({
      id: c.id,
      name: c.title,
      type: "Case study",
      kind: "case" as const,
      updated: c.updatedAt,
      score: c.published ? 90 : 70,
      href: `/dashboard/case-studies/${c.id}`,
    })),
  ]
    .sort((a, b) => +b.updated - +a.updated)
    .slice(0, 6);

  const totalViews = portfolios.reduce((s, p) => s + p.views, 0);
  const profileViewsDelta = totalViews > 0 ? "+24% vs last week" : "Publish to start tracking";
  const avgAts = resumes.length
    ? Math.round(resumes.reduce((s, r) => s + r.atsScore, 0) / resumes.length)
    : 0;
  const score = Math.min(
    100,
    Math.round(
      40 +
        Math.min(resumes.length, 5) * 6 +
        Math.min(portfolios.length, 3) * 8 +
        Math.min(caseStudies.length, 3) * 5 +
        Math.min(avgAts, 100) * 0.1
    )
  );

  const firstName = (user?.name || user?.email || "there").split(/\s+/)[0];

  const SUGGESTIONS = buildSuggestions({
    resumes: resumes.length,
    portfolios: portfolios.length,
    caseStudies: caseStudies.length,
    avgAts,
  });

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle={`Welcome back, ${firstName}. Here's where your career is at.`}
        user={user}
      />
      <div className="p-5 md:p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat
            label="Resumes"
            value={resumes.length.toString()}
            delta={resumes.length > 0 ? `Avg ATS ${avgAts}` : "Create your first"}
            icon={FileText}
            accent="from-brand-blue/40 to-brand-violet/40"
          />
          <Stat
            label="Portfolios"
            value={portfolios.length.toString()}
            delta={
              portfolios.filter((p) => p.published).length > 0
                ? `${portfolios.filter((p) => p.published).length} published`
                : "Publish to share"
            }
            icon={Globe2}
            accent="from-brand-violet/40 to-brand-pink/40"
          />
          <Stat
            label="Case studies"
            value={caseStudies.length.toString()}
            delta={caseStudies.length === 0 ? "Add your first project" : "Story library"}
            icon={ScrollText}
            accent="from-brand-cyan/40 to-brand-blue/40"
          />
          <Stat
            label="Profile views"
            value={totalViews.toLocaleString()}
            delta={profileViewsDelta}
            icon={Eye}
            accent="from-brand-pink/40 to-brand-fuchsia/40"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 glass rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Activity overview</p>
                <h3 className="text-lg font-semibold tracking-tight">
                  Your workspace at a glance
                </h3>
              </div>
              <Link href="/dashboard/templates">
                <span className="inline-flex items-center gap-1 text-xs text-white/65 hover:text-white">
                  Templates <ArrowUpRight className="size-3.5" />
                </span>
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Tile
                label="AI messages"
                value={chatMessages}
                href="/dashboard/assistant"
              />
              <Tile
                label="LinkedIn drafts"
                value={1}
                href="/dashboard/linkedin"
              />
              <Tile
                label="Templates available"
                value={9}
                href="/dashboard/templates"
              />
            </div>
            <div className="mt-6">
              <CreateProjectButtons />
            </div>
          </div>

          <div className="glass rounded-2xl p-5 md:p-6 flex flex-col">
            <p className="text-xs text-white/50">Profile strength</p>
            <h3 className="text-lg font-semibold tracking-tight">{score} / 100</h3>
            <div className="mt-4">
              <RingProgress value={score} />
            </div>
            <div className="mt-5 space-y-2 flex-1">
              <BarRow label="Resume" v={resumes.length > 0 ? avgAts : 0} />
              <BarRow
                label="Portfolio"
                v={portfolios.length > 0 ? (portfolios.some((p) => p.published) ? 92 : 70) : 0}
              />
              <BarRow label="LinkedIn" v={70} />
              <BarRow
                label="Case studies"
                v={caseStudies.length > 0 ? 80 : 0}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 glass rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold tracking-tight">
                Recent projects
              </h3>
              <CreateProjectButtons compact />
            </div>
            {recent.length === 0 ? (
              <EmptyState />
            ) : (
              <ul className="divide-y divide-white/5">
                {recent.map((p) => (
                  <li
                    key={`${p.kind}-${p.id}`}
                    className="py-3 flex items-center gap-3"
                  >
                    <span
                      className={cn(
                        "size-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10",
                        iconClass(p.kind)
                      )}
                    >
                      <KindIcon kind={p.kind} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-white/45">
                        {p.type} · {relativeTime(p.updated)}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-white/65">
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            p.score >= 90
                              ? "bg-emerald-400"
                              : p.score >= 80
                                ? "bg-amber-300"
                                : "bg-rose-400"
                          )}
                        />
                        Score {p.score}
                      </span>
                      <Link
                        href={p.href}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full glass hover:bg-white/10"
                      >
                        Open
                        <ArrowUpRight className="size-3" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold tracking-tight">
                AI suggestions
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-brand-violet">
                <Sparkles className="inline size-3" /> {SUGGESTIONS.length} ideas
              </span>
            </div>
            <p className="text-xs text-white/50">
              Smart wins to push your score past 90.
            </p>
            <div className="mt-4 space-y-2.5">
              {SUGGESTIONS.map((s) => (
                <Link
                  key={s.title}
                  href={s.href}
                  className="block p-3 rounded-xl border border-white/5 hover:border-white/15 hover:bg-white/[0.03] transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-lg gradient-border flex items-center justify-center shrink-0">
                      <s.icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{s.title}</p>
                      <p className="text-xs text-emerald-300 mt-0.5">
                        {s.impact}
                      </p>
                    </div>
                    <ArrowUpRight className="size-3.5 text-white/40 group-hover:text-white" />
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-5 p-3 rounded-xl bg-brand-gradient-soft border border-brand-violet/30">
              <p className="text-xs font-medium">Try mock interview prep</p>
              <p className="text-xs text-white/60 mt-0.5">
                Role-specific questions from AI · 10-min sessions.
              </p>
              <Link
                href="/dashboard/assistant"
                className="mt-2 inline-flex items-center gap-1 text-xs gradient-text font-medium"
              >
                Start session <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <QuickAction
            href="/dashboard/resumes"
            icon={FileText}
            title="Generate a resume"
            desc="From your details. ATS-optimised."
          />
          <QuickAction
            href="/dashboard/portfolios"
            icon={Globe2}
            title="Build a portfolio"
            desc="Pick a theme, ship in minutes."
          />
          <QuickAction
            href="/dashboard/case-studies"
            icon={ScrollText}
            title="Write a case study"
            desc="Turn projects into hire-magnets."
          />
        </div>
      </div>
    </>
  );
}

function buildSuggestions({
  resumes,
  portfolios,
  caseStudies,
  avgAts,
}: {
  resumes: number;
  portfolios: number;
  caseStudies: number;
  avgAts: number;
}) {
  const list = [] as {
    title: string;
    impact: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
  }[];
  if (resumes === 0) {
    list.push({
      title: "Create your first AI resume",
      impact: "Unlocks ATS scoring",
      icon: FileText,
      href: "/dashboard/resumes",
    });
  } else if (avgAts < 85) {
    list.push({
      title: "Improve ATS score with measurable bullets",
      impact: `+${90 - avgAts} ATS expected`,
      icon: TrendingUp,
      href: "/dashboard/resumes",
    });
  }
  if (portfolios === 0) {
    list.push({
      title: "Spin up a portfolio site",
      impact: "+8 strength",
      icon: Globe2,
      href: "/dashboard/portfolios",
    });
  } else {
    list.push({
      title: "Polish your portfolio bio with AI",
      impact: "+12% recruiter views",
      icon: Sparkles,
      href: "/dashboard/portfolios",
    });
  }
  if (caseStudies === 0) {
    list.push({
      title: "Add your first case study",
      impact: "Land senior interviews",
      icon: Lightbulb,
      href: "/dashboard/case-studies",
    });
  } else {
    list.push({
      title: "Quantify case-study metrics",
      impact: "+5 story score",
      icon: Lightbulb,
      href: "/dashboard/case-studies",
    });
  }
  return list.slice(0, 3);
}

function relativeTime(d: Date) {
  const diff = (Date.now() - +new Date(d)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString();
}

function iconClass(kind: string) {
  switch (kind) {
    case "resume":
      return "text-brand-blue";
    case "portfolio":
      return "text-brand-violet";
    case "case":
      return "text-brand-pink";
    case "linkedin":
      return "text-brand-cyan";
    default:
      return "";
  }
}

function KindIcon({ kind }: { kind: string }) {
  if (kind === "resume") return <FileText className="size-4" />;
  if (kind === "portfolio") return <Globe2 className="size-4" />;
  if (kind === "case") return <ScrollText className="size-4" />;
  if (kind === "linkedin") return <Linkedin className="size-4" />;
  return null;
}

function Stat({
  label,
  value,
  delta,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  delta: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="relative glass rounded-2xl p-4 overflow-hidden hover:bg-white/[0.04] transition-colors">
      <div
        className={`absolute -top-12 -right-10 size-40 rounded-full bg-gradient-to-br ${accent} blur-2xl opacity-50`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/45">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-[11px] text-emerald-300 mt-0.5">{delta}</p>
        </div>
        <div className="size-9 rounded-xl glass flex items-center justify-center">
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 p-4 transition-colors"
    >
      <p className="text-[10px] uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
    </Link>
  );
}

function RingProgress({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = c * (value / 100);
  return (
    <div className="relative size-32 mx-auto">
      <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
        <defs>
          <linearGradient id="ring2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          stroke="url(#ring2)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold">{value}</span>
        <span className="text-[10px] uppercase tracking-wider text-white/50">
          score
        </span>
      </div>
    </div>
  );
}

function BarRow({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-white/70">
        <span>{label}</span>
        <span className="text-white/50">{v}%</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-brand-gradient transition-all"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group relative glass rounded-2xl p-5 overflow-hidden hover:bg-white/[0.04] transition-colors"
    >
      <div className="absolute -top-16 -right-12 size-44 rounded-full bg-brand-gradient blur-3xl opacity-25 group-hover:opacity-50 transition-opacity" />
      <div className="relative flex items-start gap-3">
        <div className="size-10 rounded-xl gradient-border flex items-center justify-center">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-white/55 mt-0.5">{desc}</p>
        </div>
        <ArrowUpRight className="size-4 ml-auto text-white/40 group-hover:text-white transition-colors" />
      </div>
      <div className="relative mt-4 flex items-center gap-2 text-xs text-white/45">
        <Zap className="size-3.5 text-brand-violet" />
        Avg time: 30s
        <span className="size-1 rounded-full bg-white/15" />
        <CheckCircle2 className="size-3.5 text-emerald-400" />
        Pro-ready
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-10">
      <div className="mx-auto size-12 rounded-2xl gradient-border flex items-center justify-center">
        <Plus className="size-5" />
      </div>
      <p className="mt-3 text-sm font-medium">No projects yet</p>
      <p className="mt-1 text-xs text-white/55">
        Create your first resume, portfolio or case study.
      </p>
      <div className="mt-4 flex items-center justify-center">
        <CreateProjectButtons />
      </div>
    </div>
  );
}
