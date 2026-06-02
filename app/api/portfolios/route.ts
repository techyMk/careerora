import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, badRequest } from "@/lib/api-helpers";
import { SAMPLE_PORTFOLIO_DATA } from "@/lib/sample-data";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  const portfolios = await prisma.portfolio.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ portfolios });
}

const createSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  theme: z.string().optional(),
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

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

  const baseName = parsed.data.name ?? "Untitled portfolio";
  const base = slugify(baseName) || "portfolio";
  let subdomain = base;
  for (let i = 1; await prisma.portfolio.findUnique({ where: { subdomain } }); i++) {
    subdomain = `${base}-${i}`;
  }

  const portfolio = await prisma.portfolio.create({
    data: {
      userId: user.id,
      name: baseName,
      theme: parsed.data.theme ?? "gradient",
      subdomain,
      bio: "Tell the world what you do — Careerora will polish the words.",
      data: JSON.stringify(SAMPLE_PORTFOLIO_DATA),
    },
  });
  return NextResponse.json({ portfolio });
}
