import Link from "next/link";
import { redirect } from "next/navigation";
import { Globe2, Clock, ExternalLink } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/dashboard/topbar";
import { CreateProjectButtons } from "@/components/dashboard/create-buttons";
import { DeletePortfolioButton } from "@/components/dashboard/delete-portfolio";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PortfoliosListPage() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const [user, portfolios] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { name: true, email: true },
    }),
    prisma.portfolio.findMany({
      where: { userId: sessionUser.id },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <>
      <Topbar
        title="Portfolios"
        subtitle="Spin up beautiful personal sites. Deploy in one click."
        user={user}
      />
      <div className="p-5 md:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-white/55">
            {portfolios.length} {portfolios.length === 1 ? "site" : "sites"} ·
            <span className="ml-1 text-white/40">
              {portfolios.filter((p) => p.published).length} published
            </span>
          </p>
          <CreateProjectButtons />
        </div>

        {portfolios.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((p) => (
              <div
                key={p.id}
                className="group relative glass rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-colors"
              >
                <Link href={`/dashboard/portfolios/${p.id}`} className="block">
                  <PortfolioPreviewCard theme={p.theme} bio={p.bio} name={p.name} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-white/45 truncate">
                          {p.subdomain}.careerora.app
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full shrink-0",
                          p.published
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-white/5 text-white/55"
                        )}
                      >
                        {p.published ? "Live" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-white/45 inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      Updated {relativeTime(p.updatedAt)}
                    </p>
                  </div>
                </Link>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeletePortfolioButton id={p.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function PortfolioPreviewCard({
  theme,
  bio,
  name,
}: {
  theme: string;
  bio: string;
  name: string;
}) {
  const bg = {
    minimal: "bg-ink-950",
    luxury: "bg-ink-950",
    cyberpunk: "bg-ink-950",
    glass: "bg-ink-900",
    gradient:
      "bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.4),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.45),transparent_50%)] bg-ink-950",
    brutalist: "bg-white text-ink-900",
  }[theme] || "bg-ink-950";

  return (
    <div className={`${bg} aspect-video p-5 relative`}>
      <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">
        {name}
      </p>
      <p className="mt-3 text-sm font-semibold leading-tight gradient-text-soft max-w-[16ch]">
        Hi, I&apos;m here to build the thing that gets you hired.
      </p>
      <p className="mt-2 text-[10px] opacity-65 line-clamp-2 max-w-[28ch]">
        {bio}
      </p>
      <div className="absolute bottom-4 left-5 right-5 grid grid-cols-3 gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 rounded bg-white/10" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass rounded-2xl py-16 text-center">
      <div className="mx-auto size-14 rounded-2xl gradient-border flex items-center justify-center">
        <Globe2 className="size-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No portfolio sites yet</h3>
      <p className="mt-1 text-sm text-white/55 max-w-sm mx-auto">
        Spin up a personal site in 60 seconds. Pick a theme, add your bio, publish.
      </p>
      <div className="mt-5 flex justify-center">
        <CreateProjectButtons />
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
