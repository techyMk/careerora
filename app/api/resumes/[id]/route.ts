import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, notFound, badRequest } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const resume = await prisma.resume.findFirst({
    where: { id, userId: user.id },
  });
  if (!resume) return notFound();
  return NextResponse.json({ resume });
}

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  template: z.string().optional(),
  atsScore: z.number().int().min(0).max(100).optional(),
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

  const existing = await prisma.resume.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();

  const resume = await prisma.resume.update({
    where: { id },
    data: {
      name: parsed.data.name ?? undefined,
      template: parsed.data.template ?? undefined,
      atsScore: parsed.data.atsScore ?? undefined,
      data:
        parsed.data.data !== undefined
          ? JSON.stringify(parsed.data.data)
          : undefined,
    },
  });
  return NextResponse.json({ resume });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const existing = await prisma.resume.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();
  await prisma.resume.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
