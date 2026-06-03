import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, notFound, badRequest } from "@/lib/api-helpers";
import { addDomain, verifyDomain, removeDomain, hasVercelDomainsApi } from "@/lib/vercel";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  domain: z
    .string()
    .min(3)
    .max(253)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Invalid domain"),
});

export async function GET(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const portfolio = await prisma.portfolio.findFirst({
    where: { id, userId: user.id },
    select: { id: true, customDomain: true, domainVerified: true },
  });
  if (!portfolio) return notFound();

  if (portfolio.customDomain && hasVercelDomainsApi) {
    try {
      const { verified } = await verifyDomain(portfolio.customDomain);
      if (verified !== portfolio.domainVerified) {
        await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { domainVerified: verified },
        });
      }
      return NextResponse.json({
        portfolio: { ...portfolio, domainVerified: verified },
        vercelConfigured: true,
      });
    } catch { /* fall through */ }
  }

  return NextResponse.json({
    portfolio,
    vercelConfigured: hasVercelDomainsApi,
  });
}

export async function POST(req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid domain");

  const domain = parsed.data.domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

  const portfolio = await prisma.portfolio.findFirst({
    where: { id, userId: user.id },
  });
  if (!portfolio) return notFound();

  // Uniqueness check
  const taken = await prisma.portfolio.findUnique({ where: { customDomain: domain } });
  if (taken && taken.id !== portfolio.id) {
    return badRequest("This domain is already connected to another portfolio.", 409);
  }

  let verified = false;
  let vercelInfo: { verification?: { type: string; domain: string; value: string; reason: string }[] } = {};

  if (hasVercelDomainsApi) {
    try {
      const result = await addDomain(domain);
      verified = !!result.verified;
      vercelInfo = { verification: result.verification };
    } catch (e) {
      // Don't fail outright — user can still save the domain and configure DNS manually
      vercelInfo = {};
    }
  }

  await prisma.portfolio.update({
    where: { id: portfolio.id },
    data: { customDomain: domain, domainVerified: verified },
  });

  return NextResponse.json({
    portfolio: { ...portfolio, customDomain: domain, domainVerified: verified },
    vercelConfigured: hasVercelDomainsApi,
    ...vercelInfo,
  });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const portfolio = await prisma.portfolio.findFirst({
    where: { id, userId: user.id },
  });
  if (!portfolio) return notFound();

  if (portfolio.customDomain && hasVercelDomainsApi) {
    await removeDomain(portfolio.customDomain);
  }
  await prisma.portfolio.update({
    where: { id: portfolio.id },
    data: { customDomain: null, domainVerified: false },
  });
  return NextResponse.json({ ok: true });
}
