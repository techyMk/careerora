import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, notFound, badRequest } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const portfolio = await prisma.portfolio.findFirst({
    where: { id, userId: user.id },
  });
  if (!portfolio) return notFound();
  return NextResponse.json({ portfolio });
}

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  theme: z.string().optional(),
  bio: z.string().max(2000).optional(),
  subdomain: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/).optional(),
  published: z.boolean().optional(),
  data: z.unknown().optional(),
});

export async function PUT(req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid input");

  const existing = await prisma.portfolio.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();

  if (parsed.data.subdomain && parsed.data.subdomain !== existing.subdomain) {
    const taken = await prisma.portfolio.findUnique({
      where: { subdomain: parsed.data.subdomain },
    });
    if (taken) return badRequest("Subdomain already taken", 409);
  }

  const portfolio = await prisma.portfolio.update({
    where: { id },
    data: {
      name: parsed.data.name ?? undefined,
      theme: parsed.data.theme ?? undefined,
      bio: parsed.data.bio ?? undefined,
      subdomain: parsed.data.subdomain ?? undefined,
      published: parsed.data.published ?? undefined,
      data:
        parsed.data.data !== undefined
          ? JSON.stringify(parsed.data.data)
          : undefined,
    },
  });
  return NextResponse.json({ portfolio });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const existing = await prisma.portfolio.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();
  await prisma.portfolio.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
