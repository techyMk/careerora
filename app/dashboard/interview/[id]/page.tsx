import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InterviewSession } from "@/components/dashboard/interview-session";

export const dynamic = "force-dynamic";

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const { id } = await params;
  const [user, interview] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { name: true, email: true, avatar: true },
    }),
    prisma.interviewSession.findFirst({ where: { id, userId: sessionUser.id } }),
  ]);
  if (!interview) notFound();

  return <InterviewSession user={user} initial={interview} />;
}
