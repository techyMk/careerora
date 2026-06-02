import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, badRequest } from "@/lib/api-helpers";
import { SAMPLE_RESUME_DATA } from "@/lib/sample-data";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ resumes });
}

const createSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  template: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    /* allow empty body */
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid input");
  const count = await prisma.resume.count({ where: { userId: user.id } });
  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      name: parsed.data.name ?? `Untitled resume ${count + 1}`,
      template: parsed.data.template ?? "modern",
      atsScore: 75,
      data: JSON.stringify(SAMPLE_RESUME_DATA),
    },
  });
  return NextResponse.json({ resume });
}
