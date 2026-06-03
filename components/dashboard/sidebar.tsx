"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Globe2,
  Linkedin,
  ScrollText,
  Wand2,
  LayoutTemplate,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type SidebarUser = {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  plan?: string | null;
};

export function Sidebar({
  user,
  counts,
}: {
  user: SidebarUser;
  counts: { resumes: number; portfolios: number };
}) {
  const pathname = usePathname();

  const NAV = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/resumes", label: "Resumes", icon: FileText, count: counts.resumes },
    { href: "/dashboard/portfolios", label: "Portfolios", icon: Globe2, count: counts.portfolios },
    { href: "/dashboard/linkedin", label: "LinkedIn", icon: Linkedin },
    { href: "/dashboard/case-studies", label: "Case Studies", icon: ScrollText },
  ];

  const TOOLS = [
    { href: "/dashboard/assistant", label: "AI Assistant", icon: Wand2, badge: "New" },
    { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <aside className="hidden md:flex flex-col w-[260px] shrink-0 border-r border-white/5 bg-ink-950/40 p-4 sticky top-0 h-screen">
      <div className="px-2 py-3">
        <Logo />
      </div>

      <div className="mt-4 px-3 text-[10px] uppercase tracking-wider text-white/40">
        Workspace
      </div>
      <nav className="mt-1.5 flex flex-col gap-0.5">
        {NAV.map((item) => (
          <SideLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item)}
            count={item.count}
          />
        ))}
      </nav>

      <div className="mt-6 px-3 text-[10px] uppercase tracking-wider text-white/40">
        Tools
      </div>
      <nav className="mt-1.5 flex flex-col gap-0.5">
        {TOOLS.map((item) => (
          <SideLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname.startsWith(item.href)}
            badge={item.badge}
          />
        ))}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="flex items-center gap-2.5 p-2 rounded-xl glass">
          <Avatar src={user.avatar} name={user.name} email={user.email} size={32} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">
              {user.name ?? user.email.split("@")[0]}
            </p>
            <p className="text-[10px] text-white/40 truncate capitalize">
              {(user.plan ?? "free")} plan
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/55 hover:text-white"
            title="Sign out"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function SideLink({
  href,
  label,
  icon: Icon,
  active,
  count,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  count?: number;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
        active
          ? "bg-white/[0.06] text-white"
          : "text-white/55 hover:text-white hover:bg-white/[0.03]"
      )}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-brand-gradient" />
      )}
      <Icon
        className={cn(
          "size-4",
          active ? "text-white" : "text-white/55 group-hover:text-white"
        )}
      />
      <span className="flex-1">{label}</span>
      {typeof count === "number" && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5">
          {count}
        </span>
      )}
      {badge && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-gradient">
          {badge}
        </span>
      )}
    </Link>
  );
}
