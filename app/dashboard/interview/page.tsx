import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/dashboard/topbar";
import { StartInterview } from "@/components/dashboard/start-interview";
import { Briefcase, Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InterviewListPage() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const [user, sessions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { name: true, email: true, avatar: true, headline: true },
    }),
    prisma.interviewSession.findMany({
      where: { userId: sessionUser.id },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <>
      <Topbar
        title="Mock interviews"
        subtitle="Realistic AI-led practice — questions, evaluation, debrief."
        user={user}
      />
      <div className="p-5 md:p-8 grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="glass rounded-2xl py-16 text-center">
              <div className="mx-auto size-14 rounded-2xl gradient-border flex items-center justify-center">
                <Briefcase className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No sessions yet</h3>
              <p className="mt-1 text-sm text-white/55 max-w-md mx-auto">
                Pick a role and level on the right. AI asks you 5 realistic
                questions, evaluates each answer, and gives you a final debrief.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-white/55 mb-1">
                {sessions.length} session{sessions.length === 1 ? "" : "s"}
              </p>
              {sessions.map((s) => {
                let turns: { answer: string }[] = [];
                try { turns = JSON.parse(s.questions); } catch { /* default empty */ }
                const answered = turns.filter((t) => t.answer).length;
                const progress = Math.round((answered / s.questionCount) * 100);
                return (
                  <Link
                    key={s.id}
                    href={`/dashboard/interview/${s.id}`}
                    className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="size-10 rounded-xl gradient-border flex items-center justify-center shrink-0">
                      <Briefcase className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{s.role}</p>
                      <p className="text-xs text-white/45 capitalize">
                        {s.level} · {s.questionCount} questions · {relativeTime(s.updatedAt)}
                      </p>
                      <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-brand-gradient"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      {s.status === "completed" ? (
                        <p className={cn(
                          "text-lg font-semibold inline-flex items-center gap-1",
                          (s.finalScore ?? 0) >= 80 ? "gradient-text" : "text-amber-300"
                        )}>
                          <Trophy className="size-3.5" />
                          {s.finalScore ?? "—"}
                        </p>
                      ) : (
                        <p className="text-xs text-white/55 inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {answered}/{s.questionCount}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <aside>
          <StartInterview userHeadline={user?.headline ?? null} />
        </aside>
      </div>
    </>
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
