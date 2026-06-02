import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, badRequest } from "@/lib/api-helpers";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  const studies = await prisma.caseStudy.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ studies });
}

const createSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  role: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    /* allow empty */
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid input");
  const count = await prisma.caseStudy.count({ where: { userId: user.id } });
  const study = await prisma.caseStudy.create({
    data: {
      userId: user.id,
      title: parsed.data.title ?? `Untitled case study ${count + 1}`,
      role: parsed.data.role ?? "",
      problem: "",
      solution: "",
      techStack: "",
      metrics: "",
      timeline: "",
      results: "",
    },
  });
  return NextResponse.json({ study });
}
