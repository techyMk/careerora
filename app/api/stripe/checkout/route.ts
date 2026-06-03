import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe, PRICE_IDS, type PriceKey } from "@/lib/stripe";
import { requireUser, unauthorized, badRequest } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

const schema = z.object({
  price: z.enum(["pro_monthly", "pro_yearly", "teams_monthly"]),
});

export async function POST(req: Request) {
  if (!stripe) {
    return badRequest("Payments are not configured on this server.", 503);
  }
  const user = await requireUser();
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid input");

  const priceId = PRICE_IDS[parsed.data.price as PriceKey];
  if (!priceId) {
    return badRequest(`Price not configured for ${parsed.data.price}.`, 503);
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return unauthorized();

  // Reuse the Stripe customer if we already have one for this user.
  let customerId = dbUser.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      name: dbUser.name ?? undefined,
      metadata: { userId: dbUser.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin =
    req.headers.get("origin") ||
    process.env.AUTH_URL ||
    "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard/settings?tab=billing&checkout=success`,
    cancel_url: `${origin}/dashboard/settings?tab=billing&checkout=canceled`,
    client_reference_id: dbUser.id,
    metadata: { userId: dbUser.id, price: parsed.data.price },
    subscription_data: { metadata: { userId: dbUser.id } },
  });

  return NextResponse.json({ url: session.url });
}
