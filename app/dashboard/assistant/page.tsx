import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AssistantChat } from "@/components/dashboard/assistant-chat";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const [user, history] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { name: true, email: true },
    }),
    prisma.chatMessage.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: "asc" },
      take: 100,
    }),
  ]);

  return (
    <AssistantChat
      user={user}
      initialMessages={history.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      }))}
    />
  );
}
