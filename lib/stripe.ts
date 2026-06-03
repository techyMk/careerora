import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY;

export const stripe = apiKey ? new Stripe(apiKey) : null;
export const hasStripe = !!apiKey;

export const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
  teams_monthly: process.env.STRIPE_PRICE_TEAMS_MONTHLY ?? "",
} as const;

export type PriceKey = keyof typeof PRICE_IDS;

/** Map a Stripe price id back to our internal plan name. */
export function planFromPriceId(
  priceId: string | null | undefined
): "free" | "pro" | "teams" {
  if (!priceId) return "free";
  if (priceId === PRICE_IDS.pro_monthly || priceId === PRICE_IDS.pro_yearly) {
    return "pro";
  }
  if (priceId === PRICE_IDS.teams_monthly) return "teams";
  return "free";
}

export function hasPrice(key: PriceKey) {
  return PRICE_IDS[key].length > 0;
}
