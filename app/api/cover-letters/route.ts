import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, badRequest } from "@/lib/api-helpers";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  const letters = await prisma.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ letters });
}

const createSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  company: z.string().max(160).optional(),
  role: z.string().max(160).optional(),
  tone: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();
  let body: unknown = {};
  try { body = await req.json(); } catch { /* allow empty */ }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid input");
  const count = await prisma.coverLetter.count({ where: { userId: user.id } });
  const letter = await prisma.coverLetter.create({
    data: {
      userId: user.id,
      title: parsed.data.title ?? `Untitled cover letter ${count + 1}`,
      company: parsed.data.company ?? "",
      role: parsed.data.role ?? "",
      tone: parsed.data.tone ?? "warm",
      body: "",
    },
  });
  return NextResponse.json({ letter });
}
