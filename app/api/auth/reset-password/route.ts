import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const reset = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });
  if (!reset || reset.used || reset.expiresAt < new Date()) {
    return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 400 });
  }

  const hash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { password: hash } }),
    prisma.passwordResetToken.update({ where: { id: reset.id }, data: { used: true } }),
    // Invalidate any other outstanding tokens for this user
    prisma.passwordResetToken.updateMany({
      where: { userId: reset.userId, used: false, id: { not: reset.id } },
      data: { used: true },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
