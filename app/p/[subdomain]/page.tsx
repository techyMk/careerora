import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  PortfolioRenderer,
  type PortfolioData,
} from "@/components/portfolio/portfolio-renderer";
import { DwellBeacon } from "@/components/portfolio/dwell-beacon";

export const dynamic = "force-dynamic";

async function getPortfolio(subdomain: string) {
  return prisma.portfolio.findUnique({
    where: { subdomain },
    include: {
      user: {
        select: { id: true, name: true, email: true, headline: true },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const portfolio = await getPortfolio(subdomain);
  if (!portfolio) return { title: "Not found" };
  const ownerName = portfolio.user.name ?? portfolio.name;
  const title = `${ownerName} — ${portfolio.user.headline ?? "Portfolio"}`;
  return {
    title,
    description: portfolio.bio,
    openGraph: { title, description: portfolio.bio },
  };
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const portfolio = await getPortfolio(subdomain);
  if (!portfolio) notFound();

  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  const isOwner = sessionUser?.id === portfolio.userId;

  // Drafts visible to the owner only
  if (!portfolio.published && !isOwner) notFound();

  let data: PortfolioData = {};
  try {
    data = JSON.parse(portfolio.data);
  } catch { /* empty */ }

  // Record a real view event for non-owners
  let viewId: string | null = null;
  if (!isOwner) {
    const h = await headers();
    const country = h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || null;
    const referrer = h.get("referer") || null;
    const userAgent = h.get("user-agent")?.slice(0, 240) || null;

    try {
      const view = await prisma.portfolioView.create({
        data: { portfolioId: portfolio.id, country, referrer, userAgent },
        select: { id: true },
      });
      viewId = view.id;
      // keep the lightweight aggregate counter in sync
      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: { views: { increment: 1 } },
      });
      // Notify the owner — debounced to every 5th view
      if ((portfolio.views + 1) % 5 === 1) {
        const { notify } = await import("@/lib/notifications");
        notify(portfolio.userId, {
          type: "portfolio_view",
          title: `Someone viewed your portfolio`,
          body: `${portfolio.name} just hit ${portfolio.views + 1} total views.`,
          link: `/dashboard/portfolios/${portfolio.id}`,
        }).catch(() => {});
      }
    } catch { /* swallow */ }
  }

  return (
    <main className="min-h-screen">
      {!portfolio.published && (
        <div className="sticky top-0 z-40 bg-amber-500/15 text-amber-200 border-b border-amber-500/30 text-xs text-center py-2 backdrop-blur-md">
          Draft preview · only you can see this until you publish.
        </div>
      )}
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
      {viewId && <DwellBeacon viewId={viewId} portfolioId={portfolio.id} />}
    </main>
  );
}
