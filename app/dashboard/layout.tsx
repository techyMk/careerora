import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const [user, resumeCount, portfolioCount, coverLetterCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        headline: true,
        plan: true,
      },
    }),
    prisma.resume.count({ where: { userId: sessionUser.id } }),
    prisma.portfolio.count({ where: { userId: sessionUser.id } }),
    prisma.coverLetter.count({ where: { userId: sessionUser.id } }),
  ]);

  if (!user) redirect("/sign-in");

  return (
    <div className="relative min-h-screen flex">
      <Sidebar
        user={user}
        counts={{
          resumes: resumeCount,
          portfolios: portfolioCount,
          coverLetters: coverLetterCount,
        }}
      />
      <div className="flex-1 min-w-0">{children}</div>
      <CommandPalette />
    </div>
  );
}
