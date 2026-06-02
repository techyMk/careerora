import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PortfolioEditor } from "@/components/dashboard/portfolio-editor";

export const dynamic = "force-dynamic";

export default async function PortfolioEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const { id } = await params;

  const [user, portfolio] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { name: true, email: true, headline: true },
    }),
    prisma.portfolio.findFirst({
      where: { id, userId: sessionUser.id },
    }),
  ]);

  if (!portfolio) notFound();

  return (
    <PortfolioEditor
      user={user}
      portfolio={{
        id: portfolio.id,
        name: portfolio.name,
        theme: portfolio.theme,
        subdomain: portfolio.subdomain,
        bio: portfolio.bio,
        published: portfolio.published,
      }}
    />
  );
}
