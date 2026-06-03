import { headers } from "next/headers";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe, planFromPriceId } from "@/lib/stripe";
import { notify } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!stripe) {
    return new Response("Stripe not configured", { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Webhook secret missing", { status: 503 });
  }

  const body = await req.text(); // raw body required for signature verification
  const sig = (await headers()).get("stripe-signature");
  if (!sig) return new Response("Missing stripe-signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`Invalid signature: ${msg}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subId =
          typeof session.subscription === "string" ? session.subscription : null;
        const customerId =
          typeof session.customer === "string" ? session.customer : null;
        const userId = session.metadata?.userId ?? session.client_reference_id;
        if (subId && customerId && userId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const priceId = sub.items.data[0]?.price.id;
          const periodEnd = (sub as unknown as { current_period_end?: number })
            .current_period_end;
          const plan = planFromPriceId(priceId);
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subId,
              plan,
              planStatus: sub.status,
              planRenewsAt: periodEnd ? new Date(periodEnd * 1000) : null,
            },
          });
          notify(userId, {
            type: "plan_change",
            title: `Welcome to Careerora ${plan === "pro" ? "Pro" : plan === "teams" ? "Teams" : ""} 🎉`,
            body: "All premium templates and unlimited assets unlocked.",
            link: "/dashboard/settings?tab=billing",
          }).catch(() => {});
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : null;
        if (!customerId) break;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });
        if (!user) break;

        const priceId = sub.items.data[0]?.price.id;
        const periodEnd = (sub as unknown as { current_period_end?: number })
          .current_period_end;
        const stillActive = sub.status === "active" || sub.status === "trialing";
        const isDeleted = event.type === "customer.subscription.deleted";

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: stillActive && !isDeleted ? planFromPriceId(priceId) : "free",
            planStatus: sub.status,
            planRenewsAt:
              periodEnd && !isDeleted ? new Date(periodEnd * 1000) : null,
            stripeSubscriptionId: isDeleted ? null : sub.id,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : null;
        if (!customerId) break;
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { planStatus: "past_due" },
        });
        const u = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (u) {
          notify(u.id, {
            type: "plan_change",
            title: "Payment failed — update your card",
            body: "We couldn't process your latest invoice. Update your card to keep Pro active.",
            link: "/dashboard/settings?tab=billing",
          }).catch(() => {});
        }
        break;
      }
    }
  } catch (e) {
    console.error("[stripe webhook handler error]", event.type, e);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
