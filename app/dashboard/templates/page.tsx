import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TemplatesGallery } from "@/components/dashboard/templates-gallery";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { name: true, email: true, avatar: true, plan: true },
  });
  if (!user) redirect("/sign-in");

  return <TemplatesGallery user={user} plan={user.plan ?? "free"} />;
}
