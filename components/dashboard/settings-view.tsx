"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User as UserIcon,
  Bell,
  CreditCard,
  Palette,
  Shield,
  Globe,
  Check,
  Loader2,
  LogOut,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Profile = {
  id: string;
  email: string;
  name?: string | null;
  headline?: string | null;
  location?: string | null;
  website?: string | null;
  phone?: string | null;
  bio?: string | null;
  plan?: string | null;
  createdAt?: Date;
};

const TABS = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "brand", label: "Brand & theme", icon: Palette },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export function SettingsView({ user }: { user: Profile }) {
  const router = useRouter();
  const [tab, setTab] = useState("profile");

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
              onClick={() => setTab(t.id)}
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
          {tab === "billing" && <BillingTab user={user} />}
          {tab === "notifications" && <NotifTab />}
          {tab === "security" && <SecurityTab />}
        </div>
      </div>
    </>
  );
}

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

  const initials = (form.name || user.email)
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="glass rounded-2xl p-5 md:p-6">
      <h3 className="text-sm font-semibold">Profile</h3>
      <p className="text-xs text-white/55">
        Your public identity across all Careerora assets.
      </p>
      <div className="mt-5 flex items-center gap-4">
        <div className="size-16 rounded-full bg-brand-gradient flex items-center justify-center text-base font-semibold">
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium">{user.email}</p>
          <p className="text-xs text-white/45 capitalize">{user.plan ?? "free"} plan</p>
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

function BrandTab() {
  return (
    <div className="glass rounded-2xl p-5 md:p-6">
      <h3 className="text-sm font-semibold">Brand & theme</h3>
      <p className="text-xs text-white/55">Defaults applied to newly-created assets.</p>
      <div className="mt-5 grid md:grid-cols-2 gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-white/45">
            Primary color
          </span>
          <div className="mt-1 flex items-center gap-2">
            {["#3B82F6", "#7C3AED", "#EC4899", "#06B6D4", "#10B981"].map((c, i) => (
              <button
                key={c}
                className={cn(
                  "size-7 rounded-full ring-2",
                  i === 1 ? "ring-white" : "ring-white/20"
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-white/45">
            Font
          </span>
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

function BillingTab({ user }: { user: Profile }) {
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  }) : "—";
  return (
    <>
      <div className="glass rounded-2xl p-5 md:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-white/55">Current plan</p>
            <h3 className="text-2xl font-semibold mt-1 capitalize">
              <span className="gradient-text">{user.plan ?? "Free"}</span>
            </h3>
            <p className="text-xs text-white/55 mt-1">Member since {memberSince}</p>
          </div>
          <Button size="sm" variant="secondary">Upgrade</Button>
        </div>
      </div>
    </>
  );
}

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
      <span className="text-[10px] uppercase tracking-wider text-white/45">
        {label}
      </span>
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
