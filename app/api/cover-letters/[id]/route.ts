import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, notFound, badRequest } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const letter = await prisma.coverLetter.findFirst({
    where: { id, userId: user.id },
  });
  if (!letter) return notFound();
  return NextResponse.json({ letter });
}

const updateSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  company: z.string().max(160).optional(),
  role: z.string().max(160).optional(),
  body: z.string().max(8000).optional(),
  tone: z.string().max(40).optional(),
});

export async function PUT(req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid input");
  const existing = await prisma.coverLetter.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();
  const letter = await prisma.coverLetter.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ letter });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const existing = await prisma.coverLetter.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();
  await prisma.coverLetter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
