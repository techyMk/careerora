import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LinkedinEditor } from "@/components/dashboard/linkedin-editor";

export const dynamic = "force-dynamic";

export default async function LinkedinPage() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { name: true, email: true, avatar: true, headline: true },
    }),
    prisma.linkedinProfile.findUnique({ where: { userId: sessionUser.id } }),
  ]);

  let postIdeas: string[] = [];
  try {
    postIdeas = profile?.postIdeas ? JSON.parse(profile.postIdeas) : [];
  } catch {
    /* default */
  }

  return (
    <LinkedinEditor
      user={user}
      initial={{
        headline: profile?.headline ?? "",
        about: profile?.about ?? "",
        postIdeas,
      }}
    />
  );
}
