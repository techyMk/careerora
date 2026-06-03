import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { requireUser, unauthorized, badRequest } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!stripe) {
    return badRequest("Payments are not configured.", 503);
  }
  const user = await requireUser();
  if (!user) return unauthorized();

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.stripeCustomerId) {
    return badRequest("No Stripe customer for this account.", 404);
  }

  const origin =
    req.headers.get("origin") ||
    process.env.AUTH_URL ||
    "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${origin}/dashboard/settings?tab=billing`,
  });

  return NextResponse.json({ url: session.url });
}
