import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasStripe, hasPrice } from "@/lib/stripe";
import { SettingsView } from "@/components/dashboard/settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      notificationPrefs: true,
      brandPrefs: true,
      headline: true,
      location: true,
      website: true,
      phone: true,
      bio: true,
      plan: true,
      planStatus: true,
      planRenewsAt: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      createdAt: true,
    },
  });
  if (!user) redirect("/sign-in");

  return (
    <SettingsView
      user={user}
      payments={{
        enabled: hasStripe,
        prices: {
          proMonthly: hasPrice("pro_monthly"),
          proYearly: hasPrice("pro_yearly"),
          teamsMonthly: hasPrice("teams_monthly"),
        },
      }}
    />
  );
}
