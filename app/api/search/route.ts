import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export type SearchHit = {
  id: string;
  kind: "resume" | "portfolio" | "case-study" | "cover-letter";
  title: string;
  subtitle?: string;
  href: string;
  updatedAt: Date;
};

export async function GET(req: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get("limit") ?? "8", 10)));

  // Empty query → return most-recent items as suggestions
  const where = q ? { contains: q, mode: "insensitive" as const } : undefined;

  const [resumes, portfolios, studies, letters] = await Promise.all([
    prisma.resume.findMany({
      where: { userId: user.id, ...(q ? { name: where } : {}) },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, name: true, template: true, atsScore: true, updatedAt: true },
    }),
    prisma.portfolio.findMany({
      where: {
        userId: user.id,
        ...(q
          ? {
              OR: [
                { name: where },
                { bio: where },
                { subdomain: where },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, name: true, subdomain: true, published: true, updatedAt: true },
    }),
    prisma.caseStudy.findMany({
      where: {
        userId: user.id,
        ...(q
          ? {
              OR: [{ title: where }, { role: where }, { results: where }],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, title: true, role: true, published: true, updatedAt: true },
    }),
    prisma.coverLetter.findMany({
      where: {
        userId: user.id,
        ...(q
          ? {
              OR: [
                { title: where },
                { company: where },
                { role: where },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, title: true, company: true, role: true, tone: true, updatedAt: true },
    }),
  ]);

  const hits: SearchHit[] = [
    ...resumes.map((r) => ({
      id: r.id,
      kind: "resume" as const,
      title: r.name,
      subtitle: `Resume · ${r.template} · ATS ${r.atsScore}`,
      href: `/dashboard/resumes/${r.id}`,
      updatedAt: r.updatedAt,
    })),
    ...portfolios.map((p) => ({
      id: p.id,
      kind: "portfolio" as const,
      title: p.name,
      subtitle: `Portfolio · /p/${p.subdomain}${p.published ? " · live" : " · draft"}`,
      href: `/dashboard/portfolios/${p.id}`,
      updatedAt: p.updatedAt,
    })),
    ...studies.map((c) => ({
      id: c.id,
      kind: "case-study" as const,
      title: c.title,
      subtitle: `Case study${c.role ? ` · ${c.role}` : ""}${c.published ? " · published" : " · draft"}`,
      href: `/dashboard/case-studies/${c.id}`,
      updatedAt: c.updatedAt,
    })),
    ...letters.map((l) => ({
      id: l.id,
      kind: "cover-letter" as const,
      title: l.title,
      subtitle: `Cover letter · ${l.tone}${l.role ? ` · ${l.role}` : ""}${l.company ? ` · ${l.company}` : ""}`,
      href: `/dashboard/cover-letters/${l.id}`,
      updatedAt: l.updatedAt,
    })),
  ]
    .sort((a, b) => +b.updatedAt - +a.updatedAt)
    .slice(0, limit * 2);

  return NextResponse.json({ hits, query: q });
}
