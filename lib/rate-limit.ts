import { prisma } from "@/lib/prisma";

/**
 * Per-user hourly cap on AI endpoint calls.
 * Counts rows in AiUsage created in the last 60 minutes.
 */

const HOURLY_LIMITS: Record<string, number> = {
  free: 30,
  pro: 200,
  teams: 500,
};

export type RateCheck =
  | { ok: true; remaining: number; limit: number }
  | { ok: false; retryAfter: number; limit: number; resetAt: Date };

/**
 * Returns OK if the user is under their hourly limit, and records this call.
 * Returns a 429-shaped object otherwise.
 */
export async function rateLimitAi(
  userId: string,
  plan: string | null | undefined,
  endpoint: string
): Promise<RateCheck> {
  const limit = HOURLY_LIMITS[(plan ?? "free").toLowerCase()] ?? HOURLY_LIMITS.free;
  const windowStart = new Date(Date.now() - 60 * 60 * 1000);

  const recent = await prisma.aiUsage.findMany({
    where: { userId, createdAt: { gte: windowStart } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  if (recent.length >= limit) {
    // Oldest call in the window dictates when the user can call again
    const resetAt = new Date(recent[0].createdAt.getTime() + 60 * 60 * 1000);
    return {
      ok: false,
      retryAfter: Math.max(0, Math.round((+resetAt - Date.now()) / 1000)),
      limit,
      resetAt,
    };
  }

  // Record this call (fire-and-forget — we already gated)
  prisma.aiUsage.create({ data: { userId, endpoint } }).catch(() => {});

  return { ok: true, remaining: limit - recent.length - 1, limit };
}

export function rateLimited(check: Exclude<RateCheck, { ok: true }>) {
  return new Response(
    JSON.stringify({
      error: `You hit your hourly AI limit (${check.limit}/hour). Try again in ~${Math.ceil(check.retryAfter / 60)} minutes, or upgrade your plan.`,
      retryAfter: check.retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(check.retryAfter),
      },
    }
  );
}
