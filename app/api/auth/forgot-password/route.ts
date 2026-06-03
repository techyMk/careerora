import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail, passwordResetEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email().toLowerCase(),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Always return 200 — don't leak which emails are registered
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return NextResponse.json({ ok: true });
  }
  // OAuth-only accounts have no password — silently skip
  if (!user.password) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const origin = req.headers.get("origin") || process.env.AUTH_URL || "http://localhost:3000";
  const resetUrl = `${origin}/reset-password?token=${token}`;

  const tpl = passwordResetEmail({ name: user.name, resetUrl });
  await sendEmail({ to: user.email, ...tpl });

  return NextResponse.json({ ok: true });
}
