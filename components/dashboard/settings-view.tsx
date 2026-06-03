"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User as UserIcon,
  Bell,
  CreditCard,
  Palette,
  Shield,
  Check,
  Loader2,
  LogOut,
  Crown,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Profile = {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  headline?: string | null;
  location?: string | null;
  website?: string | null;
  phone?: string | null;
  bio?: string | null;
  plan?: string | null;
  planStatus?: string | null;
  planRenewsAt?: Date | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  createdAt?: Date;
};

export type PaymentsConfig = {
  enabled: boolean;
  prices: {
    proMonthly: boolean;
    proYearly: boolean;
    teamsMonthly: boolean;
  };
};

const TABS = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "brand", label: "Brand & theme", icon: Palette },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export function SettingsView({
  user,
  payments,
}: {
  user: Profile;
  payments: PaymentsConfig;
}) {
  return (
    <Suspense fallback={null}>
      <SettingsInner user={user} payments={payments} />
    </Suspense>
  );
}

function SettingsInner({
  user,
  payments,
}: {
  user: Profile;
  payments: PaymentsConfig;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const tabFromUrl = params.get("tab");
  const [tab, setTab] = useState(
    tabFromUrl && TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : "profile"
  );

  useEffect(() => {
    if (tabFromUrl && TABS.some((t) => t.id === tabFromUrl) && tabFromUrl !== tab) {
      setTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  const switchTab = (id: string) => {
    setTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <>
      <Topbar
        title="Settings"
        subtitle="Account, brand, billing & security."
        user={user}
      />
      <div className="p-5 md:p-8 grid md:grid-cols-[240px_1fr] gap-5">
        <aside className="space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
                tab === t.id
                  ? "bg-white/[0.05] text-white"
                  : "text-white/55 hover:text-white hover:bg-white/[0.02]"
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-300/85 hover:text-rose-200 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </aside>

        <div className="space-y-5">
          {tab === "profile" && <ProfileTab user={user} router={router} />}
          {tab === "brand" && <BrandTab />}
          {tab === "billing" && <BillingTab user={user} payments={payments} />}
          {tab === "notifications" && <NotifTab />}
          {tab === "security" && <SecurityTab />}
        </div>
      </div>
    </>
  );
}

/* ──────────────── Profile ──────────────── */

function ProfileTab({
  user,
  router,
}: {
  user: Profile;
  router: ReturnType<typeof useRouter>;
}) {
  const [form, setForm] = useState({
    name: user.name ?? "",
    headline: user.headline ?? "",
    location: user.location ?? "",
    website: user.website ?? "",
    phone: user.phone ?? "",
    bio: user.bio ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-5 md:p-6">
      <h3 className="text-sm font-semibold">Profile</h3>
      <p className="text-xs text-white/55">
        Your public identity across all Careerora assets.
      </p>
      <div className="mt-5 flex items-center gap-4">
        <Avatar src={user.avatar} name={form.name} email={user.email} size={64} />
        <div>
          <p className="text-sm font-medium">{user.email}</p>
          <p className="text-xs text-white/45 capitalize">
            {user.plan ?? "free"} plan
          </p>
        </div>
      </div>
      <div className="mt-5 grid md:grid-cols-2 gap-3">
        <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Headline" value={form.headline} onChange={(v) => setForm({ ...form, headline: v })} />
        <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
        <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} placeholder="yourname.dev" />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
      </div>
      <label className="block mt-3">
        <span className="text-[10px] uppercase tracking-wider text-white/45">Short bio</span>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={3}
          placeholder="A line about what you do."
          className="mt-1 w-full rounded-lg bg-white/[0.02] border border-white/10 px-3 py-2 text-sm outline-none focus:border-brand-violet/50 resize-none"
        />
      </label>
      <div className="mt-5 flex items-center justify-end gap-2">
        {saved && (
          <span className="text-xs text-emerald-300 inline-flex items-center gap-1">
            <Check className="size-3.5" /> Saved
          </span>
        )}
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}

/* ──────────────── Brand ──────────────── */

function BrandTab() {
  return (
    <div className="glass rounded-2xl p-5 md:p-6">
      <h3 className="text-sm font-semibold">Brand & theme</h3>
      <p className="text-xs text-white/55">Defaults applied to newly-created assets.</p>
      <div className="mt-5 grid md:grid-cols-2 gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-white/45">Primary color</span>
          <div className="mt-1 flex items-center gap-2">
            {["#3B82F6", "#7C3AED", "#EC4899", "#06B6D4", "#10B981"].map((c, i) => (
              <button
                key={c}
                className={cn("size-7 rounded-full ring-2", i === 1 ? "ring-white" : "ring-white/20")}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-white/45">Font</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {["Inter", "Satoshi", "Geist", "Manrope"].map((f, i) => (
              <button
                key={f}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border",
                  i === 0
                    ? "bg-brand-gradient-soft border-brand-violet/30"
                    : "border-white/10 text-white/65"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Billing ──────────────── */

function BillingTab({
  user,
  payments,
}: {
  user: Profile;
  payments: PaymentsConfig;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const checkout = params.get("checkout");
  const [busy, setBusy] = useState<string | null>(null);
  const [yearly, setYearly] = useState(true);

  // Clear the ?checkout= query once shown so refreshes don't keep the banner.
  useEffect(() => {
    if (!checkout) return;
    const t = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState(null, "", url.toString());
    }, 8000);
    return () => clearTimeout(t);
  }, [checkout]);

  const plan = (user.plan ?? "free").toLowerCase();
  const isPro = plan === "pro" || plan === "teams";
  const status = user.planStatus;
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "—";
  const renewsAt = user.planRenewsAt
    ? new Date(user.planRenewsAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const upgrade = async (price: "pro_monthly" | "pro_yearly" | "teams_monthly") => {
    setBusy(price);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ price }),
      });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.href = json.url;
      } else {
        alert(json.error ?? "Couldn't start checkout.");
        setBusy(null);
      }
    } catch {
      setBusy(null);
    }
  };

  const manage = async () => {
    setBusy("manage");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.href = json.url;
      } else {
        alert(json.error ?? "Couldn't open portal.");
        setBusy(null);
      }
    } catch {
      setBusy(null);
    }
  };

  return (
    <>
      {checkout === "success" && (
        <div className="glass rounded-2xl p-4 flex items-center gap-3 border border-emerald-500/30 bg-emerald-500/5">
          <Check className="size-5 text-emerald-300" />
          <div className="flex-1">
            <p className="text-sm font-medium">Subscription activated</p>
            <p className="text-xs text-white/60">
              Your plan is upgrading — refresh in a few seconds to see Pro perks.
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => router.refresh()}>
            Refresh
          </Button>
        </div>
      )}
      {checkout === "canceled" && (
        <div className="glass rounded-2xl p-4 flex items-center gap-3 border border-amber-500/30 bg-amber-500/5">
          <AlertTriangle className="size-5 text-amber-300" />
          <div className="flex-1">
            <p className="text-sm">Checkout canceled — no charge was made.</p>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-5 md:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-white/55">Current plan</p>
            <h3 className="text-2xl font-semibold mt-1 inline-flex items-center gap-2 capitalize">
              <span className={isPro ? "gradient-text" : "text-white"}>{plan}</span>
              {status && status !== "active" && (
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider",
                    status === "past_due" || status === "unpaid"
                      ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  )}
                >
                  {status}
                </span>
              )}
            </h3>
            <p className="text-xs text-white/55 mt-1">
              Member since {memberSince}
              {renewsAt && ` · ${isPro ? "Renews" : "Ended"} ${renewsAt}`}
            </p>
          </div>
          {isPro && payments.enabled && user.stripeCustomerId && (
            <Button size="sm" variant="secondary" onClick={manage} disabled={busy !== null}>
              {busy === "manage" ? <Loader2 className="size-3.5 animate-spin" /> : <ExternalLink className="size-3.5" />}
              Manage subscription
            </Button>
          )}
        </div>
      </div>

      {!isPro && (
        <div className="glass rounded-2xl p-5 md:p-6">
          {!payments.enabled ? (
            <PaymentsNotConfigured />
          ) : (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-semibold inline-flex items-center gap-2">
                    <Crown className="size-4 text-amber-300" />
                    Upgrade to unlock everything
                  </h3>
                  <p className="text-xs text-white/55 mt-0.5">
                    Premium templates, unlimited assets, advanced AI editor, custom domain.
                  </p>
                </div>
                {payments.prices.proYearly && payments.prices.proMonthly && (
                  <div className="inline-flex p-1 glass rounded-full text-xs">
                    <button
                      onClick={() => setYearly(false)}
                      className={cn(
                        "px-3 py-1.5 rounded-full transition-all",
                        !yearly ? "bg-brand-gradient" : "text-white/55"
                      )}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setYearly(true)}
                      className={cn(
                        "px-3 py-1.5 rounded-full transition-all inline-flex items-center gap-1.5",
                        yearly ? "bg-brand-gradient" : "text-white/55"
                      )}
                    >
                      Yearly
                      <span className="text-[10px] px-1 py-px rounded bg-emerald-500/20 text-emerald-300">
                        −35%
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 grid md:grid-cols-2 gap-3">
                <PlanCard
                  highlight
                  name="Pro"
                  price={yearly ? "$9" : "$14"}
                  caption={yearly ? "billed $108/yr" : "billed monthly"}
                  features={[
                    "Unlimited resumes & portfolios",
                    "All premium templates",
                    "Advanced ATS + AI editor",
                    "Custom domain + analytics",
                  ]}
                  cta={yearly ? "Get Pro yearly" : "Get Pro monthly"}
                  disabled={busy !== null || !(yearly ? payments.prices.proYearly : payments.prices.proMonthly)}
                  loading={busy === (yearly ? "pro_yearly" : "pro_monthly")}
                  onClick={() => upgrade(yearly ? "pro_yearly" : "pro_monthly")}
                />
                <PlanCard
                  name="Teams"
                  price="$29"
                  caption="per seat / mo"
                  features={[
                    "Everything in Pro",
                    "Workspaces + shared kits",
                    "Role-based permissions",
                    "SSO + audit log",
                  ]}
                  cta="Get Teams"
                  disabled={busy !== null || !payments.prices.teamsMonthly}
                  loading={busy === "teams_monthly"}
                  onClick={() => upgrade("teams_monthly")}
                />
              </div>
              <p className="mt-4 text-[11px] text-white/40 text-center">
                Test card: 4242 4242 4242 4242 · any future date · any CVC ·
                any ZIP
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}

function PaymentsNotConfigured() {
  return (
    <div className="text-center py-6">
      <div className="mx-auto size-12 rounded-2xl gradient-border flex items-center justify-center">
        <CreditCard className="size-5" />
      </div>
      <h3 className="mt-3 text-base font-semibold">Payments not configured</h3>
      <p className="mt-1 text-xs text-white/55 max-w-md mx-auto">
        Add <code className="text-white/80">STRIPE_SECRET_KEY</code> and price IDs
        to your environment to enable Pro upgrades.
      </p>
      <p className="mt-2 text-[11px] text-white/40">
        See README → &ldquo;How to set up payments (Stripe)&rdquo;.
      </p>
    </div>
  );
}

function PlanCard({
  name,
  price,
  caption,
  features,
  cta,
  highlight,
  disabled,
  loading,
  onClick,
}: {
  name: string;
  price: string;
  caption: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 relative border flex flex-col",
        highlight
          ? "border-brand-violet/30 bg-brand-gradient-soft"
          : "border-white/10 bg-white/[0.02]"
      )}
    >
      <p className="text-sm font-medium">{name}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight">{price}</span>
        <span className="text-xs text-white/50">/ mo</span>
      </div>
      <p className="text-[11px] text-white/55">{caption}</p>
      <ul className="mt-4 space-y-1.5 text-sm flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="size-3.5 text-emerald-300 mt-0.5 shrink-0" />
            <span className="text-white/85">{f}</span>
          </li>
        ))}
      </ul>
      <Button
        size="md"
        variant={highlight ? "primary" : "secondary"}
        className="mt-4 w-full"
        disabled={disabled}
        onClick={onClick}
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : null}
        {cta}
      </Button>
    </div>
  );
}

/* ──────────────── Notifications / Security ──────────────── */

function NotifTab() {
  return (
    <div className="glass rounded-2xl p-5 md:p-6">
      <h3 className="text-sm font-semibold">Notifications</h3>
      <div className="mt-4 space-y-2">
        {[
          ["Profile views", true],
          ["New recruiter DMs", true],
          ["Weekly score digest", true],
          ["Product updates", false],
        ].map(([l, on]) => (
          <div key={l as string} className="flex items-center justify-between py-2">
            <span className="text-sm">{l as string}</span>
            <Toggle defaultOn={on as boolean} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="glass rounded-2xl p-5 md:p-6">
      <h3 className="text-sm font-semibold">Security</h3>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Two-factor authentication</p>
            <p className="text-xs text-white/55">Add an extra layer of security.</p>
          </div>
          <Button size="sm" variant="secondary">Enable 2FA</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Sign out everywhere</p>
            <p className="text-xs text-white/55">End all sessions on other browsers and devices.</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/45">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg bg-white/[0.02] border border-white/10 px-3 h-9 text-sm outline-none focus:border-brand-violet/50 placeholder:text-white/30"
      />
    </label>
  );
}

function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={cn(
        "relative w-10 h-6 rounded-full transition-colors",
        on ? "bg-brand-gradient" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow-soft transition-all",
          on ? "left-[18px]" : "left-0.5"
        )}
      />
    </button>
  );
}
