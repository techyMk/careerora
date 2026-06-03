import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);
  return NextResponse.json({ notifications, unread });
}

export async function PUT() {
  const user = await requireUser();
  if (!user) return unauthorized();
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const user = await requireUser();
  if (!user) return unauthorized();
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
