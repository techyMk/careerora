import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, Clock } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/dashboard/topbar";
import { CreateCoverLetterButton } from "@/components/dashboard/create-cover-letter";
import { DeleteCoverLetterButton } from "@/components/dashboard/delete-cover-letter";

export const dynamic = "force-dynamic";

export default async function CoverLettersListPage() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const [user, letters] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { name: true, email: true, avatar: true },
    }),
    prisma.coverLetter.findMany({
      where: { userId: sessionUser.id },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <>
      <Topbar
        title="Cover letters"
        subtitle="AI-tuned letters that read like you wrote them."
        user={user}
      />
      <div className="p-5 md:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-white/55">
            {letters.length}{" "}
            {letters.length === 1 ? "letter" : "letters"}
          </p>
          <CreateCoverLetterButton />
        </div>

        {letters.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {letters.map((l) => (
              <div
                key={l.id}
                className="group glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.04] transition-colors"
              >
                <Link
                  href={`/dashboard/cover-letters/${l.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="size-10 rounded-xl gradient-border flex items-center justify-center shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{l.title}</p>
                    <p className="text-xs text-white/45 inline-flex items-center gap-1">
                      {l.role && <span>{l.role}</span>}
                      {l.role && l.company && <span>·</span>}
                      {l.company && <span>{l.company}</span>}
                      {(l.role || l.company) && <span>·</span>}
                      <Clock className="size-3" />
                      {relativeTime(l.updatedAt)}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ml-auto capitalize">
                    {l.tone}
                  </span>
                </Link>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteCoverLetterButton id={l.id} />
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
        <Mail className="size-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No cover letters yet</h3>
      <p className="mt-1 text-sm text-white/55 max-w-sm mx-auto">
        Generate a tailored letter from a job description. AI writes the first
        draft, you tighten it.
      </p>
      <div className="mt-5 flex justify-center">
        <CreateCoverLetterButton />
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
