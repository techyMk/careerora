import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  viewId: z.string().min(1).max(40),
  dwellMs: z.number().int().nonnegative().max(60 * 60 * 1000),
  scrollPct: z.number().int().min(0).max(100),
});

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: unknown;
  try { body = await req.json(); } catch { return new Response("", { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return new Response("", { status: 400 });

  try {
    // Update the matching view row — but only if it belongs to this portfolio,
    // so a malicious client can't alter views on another portfolio.
    await prisma.portfolioView.updateMany({
      where: { id: parsed.data.viewId, portfolioId: id },
      data: { dwellMs: parsed.data.dwellMs, scrollPct: parsed.data.scrollPct },
    });
  } catch { /* swallow */ }

  return new Response("", { status: 204 });
}
