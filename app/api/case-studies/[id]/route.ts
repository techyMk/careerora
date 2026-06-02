import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, notFound, badRequest } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const study = await prisma.caseStudy.findFirst({
    where: { id, userId: user.id },
  });
  if (!study) return notFound();
  return NextResponse.json({ study });
}

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  role: z.string().max(120).optional(),
  problem: z.string().max(4000).optional(),
  solution: z.string().max(4000).optional(),
  techStack: z.string().max(500).optional(),
  metrics: z.string().max(2000).optional(),
  timeline: z.string().max(500).optional(),
  results: z.string().max(4000).optional(),
  published: z.boolean().optional(),
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

  const existing = await prisma.caseStudy.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();

  const study = await prisma.caseStudy.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ study });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const existing = await prisma.caseStudy.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();
  await prisma.caseStudy.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
