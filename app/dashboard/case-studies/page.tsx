import Link from "next/link";
import { redirect } from "next/navigation";
import { ScrollText, Clock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/dashboard/topbar";
import { CreateProjectButtons } from "@/components/dashboard/create-buttons";
import { DeleteCaseStudyButton } from "@/components/dashboard/delete-case-study";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CaseStudiesListPage() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const [user, studies] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { name: true, email: true },
    }),
    prisma.caseStudy.findMany({
      where: { userId: sessionUser.id },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <>
      <Topbar
        title="Case studies"
        subtitle="Turn projects into hire-magnet narratives."
        user={user}
      />
      <div className="p-5 md:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-white/55">
            {studies.length} {studies.length === 1 ? "case study" : "case studies"} ·
            <span className="ml-1 text-white/40">
              {studies.filter((s) => s.published).length} published
            </span>
          </p>
          <CreateProjectButtons />
        </div>

        {studies.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {studies.map((s) => (
              <div
                key={s.id}
                className="group glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.04] transition-colors"
              >
                <Link
                  href={`/dashboard/case-studies/${s.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="size-10 rounded-xl bg-brand-gradient-soft border border-brand-violet/30 flex items-center justify-center text-xs font-semibold shrink-0">
                    {s.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <p className="text-xs text-white/45 inline-flex items-center gap-1">
                      {s.role && <span>{s.role} ·</span>}
                      <Clock className="size-3" />
                      {relativeTime(s.updatedAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full ml-auto",
                      s.published
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-amber-500/15 text-amber-300"
                    )}
                  >
                    {s.published ? "Published" : "Draft"}
                  </span>
                </Link>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteCaseStudyButton id={s.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="glass rounded-2xl py-16 text-center">
      <div className="mx-auto size-14 rounded-2xl gradient-border flex items-center justify-center">
        <ScrollText className="size-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No case studies yet</h3>
      <p className="mt-1 text-sm text-white/55 max-w-sm mx-auto">
        Write your first case study. AI will help structure problem → solution → metrics → results.
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
