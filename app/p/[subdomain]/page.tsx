import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  PortfolioRenderer,
  type PortfolioData,
} from "@/components/portfolio/portfolio-renderer";

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

  // Drafts are visible to the owner only (for previews).
  if (!portfolio.published) {
    const session = await auth();
    const sessionUser = session?.user as { id?: string } | undefined;
    if (sessionUser?.id !== portfolio.userId) notFound();
  }

  let data: PortfolioData = {};
  try {
    data = JSON.parse(portfolio.data);
  } catch {
    /* empty */
  }

  // Track views for non-owners only — fire and forget.
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (sessionUser?.id !== portfolio.userId) {
    prisma.portfolio
      .update({ where: { id: portfolio.id }, data: { views: { increment: 1 } } })
      .catch(() => {});
    // Notify the owner (debounce naive: only on every Nth view)
    if ((portfolio.views + 1) % 5 === 1) {
      const { notify } = await import("@/lib/notifications");
      notify(portfolio.userId, {
        type: "portfolio_view",
        title: `Someone viewed your portfolio`,
        body: `${portfolio.name} just hit ${portfolio.views + 1} total views.`,
        link: `/dashboard/portfolios/${portfolio.id}`,
      }).catch(() => {});
    }
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
    </main>
  );
}
