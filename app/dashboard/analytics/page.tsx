import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/dashboard/topbar";
import { Eye, Globe2, Clock, ArrowUpRight, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

const COUNTRY_FLAG: Record<string, string> = {
  US: "🇺🇸", IN: "🇮🇳", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", DE: "🇩🇪", FR: "🇫🇷",
  NL: "🇳🇱", JP: "🇯🇵", KR: "🇰🇷", SG: "🇸🇬", BR: "🇧🇷", MX: "🇲🇽", IT: "🇮🇹",
  ES: "🇪🇸", IE: "🇮🇪", SE: "🇸🇪", NO: "🇳🇴", FI: "🇫🇮", DK: "🇩🇰",
};

export default async function AnalyticsPage() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const [user, portfolios] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { name: true, email: true, avatar: true },
    }),
    prisma.portfolio.findMany({
      where: { userId: sessionUser.id },
      select: { id: true, name: true, subdomain: true, published: true, views: true },
      orderBy: { views: "desc" },
    }),
  ]);

  const portfolioIds = portfolios.map((p) => p.id);

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const events = portfolioIds.length
    ? await prisma.portfolioView.findMany({
        where: { portfolioId: { in: portfolioIds }, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Aggregate
  const total = events.length;
  const avgDwell =
    events.length > 0
      ? Math.round(events.reduce((s, e) => s + e.dwellMs, 0) / events.length / 1000)
      : 0;
  const avgScroll =
    events.length > 0
      ? Math.round(events.reduce((s, e) => s + e.scrollPct, 0) / events.length)
      : 0;

  // Last 14 days time-series
  const days = 14;
  const dayBuckets: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dayBuckets.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  const bucketIndex = new Map(dayBuckets.map((b, i) => [b.date, i]));
  for (const e of events) {
    const key = new Date(e.createdAt).toISOString().slice(0, 10);
    const i = bucketIndex.get(key);
    if (i !== undefined) dayBuckets[i].count += 1;
  }

  // Top referrers
  const referrerCounts = new Map<string, number>();
  for (const e of events) {
    if (!e.referrer) continue;
    try {
      const host = new URL(e.referrer).hostname.replace(/^www\./, "");
      referrerCounts.set(host, (referrerCounts.get(host) ?? 0) + 1);
    } catch { /* skip */ }
  }
  const topReferrers = [...referrerCounts.entries()]
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Top countries
  const countryCounts = new Map<string, number>();
  for (const e of events) {
    if (!e.country) continue;
    countryCounts.set(e.country, (countryCounts.get(e.country) ?? 0) + 1);
  }
  const topCountries = [...countryCounts.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Per-portfolio breakdown
  const perPortfolio = portfolios
    .map((p) => {
      const portfolioEvents = events.filter((e) => e.portfolioId === p.id);
      return {
        ...p,
        recent: portfolioEvents.length,
        avgDwellSec: portfolioEvents.length
          ? Math.round(portfolioEvents.reduce((s, e) => s + e.dwellMs, 0) / portfolioEvents.length / 1000)
          : 0,
      };
    })
    .sort((a, b) => b.recent - a.recent);

  // Recent activity (last 12 distinct events with context)
  const recent = events.slice(0, 12);

  return (
    <>
      <Topbar
        title="Analytics"
        subtitle="Who&apos;s reading your portfolios — country, referrer, dwell time."
        user={user}
      />
      <div className="p-5 md:p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Views · 30d" value={total.toLocaleString()} icon={Eye} accent="from-brand-blue/40 to-brand-violet/40" />
          <Stat label="Avg dwell" value={`${avgDwell}s`} icon={Clock} accent="from-brand-violet/40 to-brand-pink/40" />
          <Stat label="Avg scroll" value={`${avgScroll}%`} icon={TrendingUp} accent="from-brand-cyan/40 to-brand-blue/40" />
          <Stat label="Live portfolios" value={portfolios.filter((p) => p.published).length.toString()} icon={Globe2} accent="from-brand-pink/40 to-brand-fuchsia/40" />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 glass rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Last 14 days</p>
                <h3 className="text-lg font-semibold tracking-tight">Views over time</h3>
              </div>
            </div>
            <ViewChart data={dayBuckets} />
          </div>

          <div className="glass rounded-2xl p-5 md:p-6">
            <p className="text-xs text-white/50">Top countries</p>
            <h3 className="text-lg font-semibold tracking-tight">Where readers are</h3>
            {topCountries.length === 0 ? (
              <p className="mt-4 text-xs text-white/45">No country data yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {topCountries.map((c) => (
                  <li key={c.code} className="flex items-center gap-2 text-sm">
                    <span className="text-base">{COUNTRY_FLAG[c.code] ?? "🌐"}</span>
                    <span className="flex-1">{c.code}</span>
                    <span className="text-white/55">{c.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="glass rounded-2xl p-5 md:p-6">
            <h3 className="text-sm font-semibold mb-3">Top referrers</h3>
            {topReferrers.length === 0 ? (
              <p className="text-xs text-white/45">No referrer data yet.</p>
            ) : (
              <ul className="space-y-2">
                {topReferrers.map((r) => (
                  <li key={r.host} className="flex items-center gap-2 text-sm">
                    <span className="size-6 rounded-md glass flex items-center justify-center text-[10px] uppercase">
                      {r.host.slice(0, 2)}
                    </span>
                    <span className="flex-1 truncate">{r.host}</span>
                    <span className="text-white/55">{r.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass rounded-2xl p-5 md:p-6">
            <h3 className="text-sm font-semibold mb-3">Per portfolio</h3>
            {perPortfolio.length === 0 ? (
              <p className="text-xs text-white/45">No portfolios yet.</p>
            ) : (
              <ul className="space-y-2">
                {perPortfolio.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/portfolios/${p.id}`}
                      className="flex items-center gap-2 flex-1 min-w-0 text-sm hover:text-white"
                    >
                      <div className="size-7 rounded-lg gradient-border flex items-center justify-center shrink-0">
                        <Globe2 className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate">{p.name}</p>
                        <p className="text-[11px] text-white/45 truncate">/p/{p.subdomain}</p>
                      </div>
                    </Link>
                    <div className="text-right">
                      <p className="text-sm font-medium">{p.recent}</p>
                      <p className="text-[10px] text-white/45">{p.avgDwellSec}s dwell</p>
                    </div>
                    <Link href={`/p/${p.subdomain}`} target="_blank" rel="noreferrer" className="text-white/35 hover:text-white">
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 md:p-6">
          <h3 className="text-sm font-semibold mb-3">Recent activity</h3>
          {recent.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-white/55">No views yet.</p>
              <p className="text-xs text-white/35 mt-1">Publish a portfolio and share the link.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {recent.map((e) => {
                const p = portfolios.find((p) => p.id === e.portfolioId);
                let host: string | null = null;
                if (e.referrer) {
                  try { host = new URL(e.referrer).hostname.replace(/^www\./, ""); } catch { /* skip */ }
                }
                return (
                  <li key={e.id} className="py-2.5 flex items-center gap-3 text-sm">
                    <span className="text-base">{e.country ? (COUNTRY_FLAG[e.country] ?? "🌐") : "🌐"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">
                        Viewed{" "}
                        <Link href={`/dashboard/portfolios/${e.portfolioId}`} className="font-medium hover:underline">
                          {p?.name ?? "portfolio"}
                        </Link>
                        {host && <span className="text-white/55"> · from {host}</span>}
                      </p>
                      <p className="text-[11px] text-white/45">
                        {relativeTime(e.createdAt)} · {Math.round(e.dwellMs / 1000)}s · {e.scrollPct}% scroll
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="relative glass rounded-2xl p-4 overflow-hidden">
      <div className={`absolute -top-12 -right-10 size-40 rounded-full bg-gradient-to-br ${accent} blur-2xl opacity-50`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/45">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="size-9 rounded-xl glass flex items-center justify-center">
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  );
}

function ViewChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const w = 600;
  const h = 180;
  const step = w / Math.max(1, data.length - 1);
  const points = data.map((d, i) => `${i * step},${h - (d.count / max) * (h - 20) - 8}`).join(" ");
  const area = `0,${h} ${points} ${w},${h}`;
  return (
    <div className="mt-5 -mx-1">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
        <defs>
          <linearGradient id="ana-stroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="ana-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 4 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={(h / 4) * (i + 1) - 1}
            x2={w}
            y2={(h / 4) * (i + 1) - 1}
            stroke="rgba(255,255,255,0.05)"
          />
        ))}
        <polygon points={area} fill="url(#ana-fill)" />
        <polyline points={points} fill="none" stroke="url(#ana-stroke)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <circle key={i} cx={i * step} cy={h - (d.count / max) * (h - 20) - 8} r="2" fill="#fff" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-white/40 px-1 mt-1">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[Math.floor(data.length / 2)]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

function relativeTime(d: Date) {
  const diff = (Date.now() - +new Date(d)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString();
}
