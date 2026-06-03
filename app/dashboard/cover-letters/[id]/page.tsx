import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CoverLetterEditor } from "@/components/dashboard/cover-letter-editor";

export const dynamic = "force-dynamic";

export default async function CoverLetterEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const { id } = await params;
  const [user, letter] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { name: true, email: true, avatar: true, headline: true },
    }),
    prisma.coverLetter.findFirst({ where: { id, userId: sessionUser.id } }),
  ]);
  if (!letter) notFound();

  return <CoverLetterEditor user={user} letter={letter} />;
}
