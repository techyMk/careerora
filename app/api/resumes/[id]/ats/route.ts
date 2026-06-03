import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, notFound, badRequest } from "@/lib/api-helpers";
import { analyzeAts, resumeToPlainText } from "@/lib/ats";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  jobDescription: z.string().min(1).max(10000),
});

export async function POST(req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid input");

  const resume = await prisma.resume.findFirst({ where: { id, userId: user.id } });
  if (!resume) return notFound();

  let data = {};
  try { data = JSON.parse(resume.data); } catch { /* default */ }

  const resumeText = resumeToPlainText(data as Parameters<typeof resumeToPlainText>[0]);
  const analysis = analyzeAts(parsed.data.jobDescription, resumeText);

  return NextResponse.json({ analysis });
}
