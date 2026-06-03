import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, ArrowUpRight, Gauge, Clock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/dashboard/topbar";
import { CreateProjectButtons } from "@/components/dashboard/create-buttons";
import { DeleteResumeButton } from "@/components/dashboard/delete-resume";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ResumesListPage() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const [user, resumes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { name: true, email: true, avatar: true },
    }),
    prisma.resume.findMany({
      where: { userId: sessionUser.id },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <>
      <Topbar
        title="Resumes"
        subtitle="AI-drafted, ATS-optimised, beautifully typeset."
        user={user}
      />
      <div className="p-5 md:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-white/55">
            {resumes.length} {resumes.length === 1 ? "resume" : "resumes"} ·
            <span className="ml-1 text-white/40">avg ATS{" "}
              {resumes.length
                ? Math.round(resumes.reduce((s, r) => s + r.atsScore, 0) / resumes.length)
                : 0}
            </span>
          </p>
          <CreateProjectButtons />
        </div>

        {resumes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((r) => (
              <div
                key={r.id}
                className="group relative glass rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-colors"
              >
                <Link
                  href={`/dashboard/resumes/${r.id}`}
                  className="block"
                >
                  <div className="aspect-[1/1.2] bg-white relative">
                    <ResumeThumbnail data={r.data} name={r.name} />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">{r.name}</p>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                          r.atsScore >= 90
                            ? "bg-emerald-500/15 text-emerald-300"
                            : r.atsScore >= 80
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-rose-500/15 text-rose-300"
                        )}
                      >
                        ATS {r.atsScore}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-white/45 inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      Updated {relativeTime(r.updatedAt)}
                    </p>
                  </div>
                </Link>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteResumeButton id={r.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ResumeThumbnail({ data, name }: { data: string; name: string }) {
  let summary = "";
  try {
    const parsed = JSON.parse(data);
    summary = parsed?.summary ?? "";
  } catch {
    /* no-op */
  }
  return (
    <div className="absolute inset-4 rounded-lg bg-white text-ink-900 p-3 flex flex-col gap-1.5 overflow-hidden">
      <p className="text-[10px] font-semibold tracking-tight truncate">{name}</p>
      <div className="h-1 w-1/3 rounded bg-ink-900/15" />
      <div className="space-y-1 mt-1">
        <div className="h-1 w-full rounded bg-ink-900/10" />
        <div className="h-1 w-[88%] rounded bg-ink-900/10" />
        <div className="h-1 w-[72%] rounded bg-ink-900/10" />
      </div>
      <p className="mt-2 text-[6.5px] leading-snug text-ink-900/70 line-clamp-6">
        {summary}
      </p>
      <div className="mt-auto grid grid-cols-3 gap-0.5">
        <div className="h-2 rounded bg-ink-900/10" />
        <div className="h-2 rounded bg-ink-900/10" />
        <div className="h-2 rounded bg-ink-900/10" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass rounded-2xl py-16 text-center">
      <div className="mx-auto size-14 rounded-2xl gradient-border flex items-center justify-center">
        <FileText className="size-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No resumes yet</h3>
      <p className="mt-1 text-sm text-white/55 max-w-sm mx-auto">
        Create your first AI-drafted resume. We&apos;ll seed it with smart defaults you can edit.
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
