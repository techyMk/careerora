import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CaseStudyEditor } from "@/components/dashboard/case-study-editor";

export const dynamic = "force-dynamic";

export default async function CaseStudyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const { id } = await params;
  const [user, study] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { name: true, email: true, avatar: true },
    }),
    prisma.caseStudy.findFirst({ where: { id, userId: sessionUser.id } }),
  ]);
  if (!study) notFound();

  return <CaseStudyEditor user={user} study={study} />;
}
