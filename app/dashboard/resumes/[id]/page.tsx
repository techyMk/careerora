import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ResumeEditor } from "@/components/dashboard/resume-editor";

export const dynamic = "force-dynamic";

export default async function ResumeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const { id } = await params;

  const [user, resume] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        name: true,
        email: true,
        avatar: true,
        headline: true,
        location: true,
        website: true,
        phone: true,
      },
    }),
    prisma.resume.findFirst({
      where: { id, userId: sessionUser.id },
    }),
  ]);

  if (!resume) notFound();

  let data: any = {};
  try {
    data = JSON.parse(resume.data);
  } catch {
    /* default to {} */
  }

  return (
    <ResumeEditor
      user={user}
      resume={{
        id: resume.id,
        name: resume.name,
        template: resume.template,
        atsScore: resume.atsScore,
        data,
      }}
    />
  );
}
