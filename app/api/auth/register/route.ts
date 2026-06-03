import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { seedUserContent } from "@/lib/sample-data";
import { notify } from "@/lib/notifications";
import { sendEmail, welcomeEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, password: hash, headline: "Open to interesting work" },
    select: { id: true, email: true, name: true },
  });

  await seedUserContent(prisma, user);
  await notify(user.id, {
    type: "system",
    title: "Welcome to Careerora 👋",
    body: "Your starter resume, portfolio and LinkedIn profile are ready in the dashboard.",
    link: "/dashboard",
  });

  // Welcome email (fire-and-forget — email is best-effort)
  const origin =
    req.headers.get("origin") || process.env.AUTH_URL || "http://localhost:3000";
  const tpl = welcomeEmail({
    name: user.name ?? name,
    dashboardUrl: `${origin}/dashboard`,
  });
  sendEmail({ to: user.email, ...tpl }).catch(() => {});

  return NextResponse.json({ ok: true, user });
}
