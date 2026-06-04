"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Globe2,
  Linkedin,
  ScrollText,
  Mail,
  Wand2,
  LayoutTemplate,
  Settings,
  LogOut,
  BarChart3,
  Briefcase,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const MOBILE_SIDEBAR_EVENT = "careerora:mobile-sidebar-toggle";

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
  counts: { resumes: number; portfolios: number; coverLetters: number };
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Topbar dispatches this event to open the drawer
  useEffect(() => {
    const onToggle = () => setMobileOpen((v) => !v);
    window.addEventListener(MOBILE_SIDEBAR_EVENT, onToggle);
    return () => window.removeEventListener(MOBILE_SIDEBAR_EVENT, onToggle);
  }, []);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  return (
    <>
      <aside className="hidden md:flex flex-col w-[260px] shrink-0 border-r border-white/5 bg-ink-950/40 p-4 sticky top-0 h-screen">
        <NavBody user={user} counts={counts} pathname={pathname} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="md:hidden fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-[88%] max-w-[300px] bg-ink-950 border-r border-white/10 p-4 flex flex-col overflow-y-auto"
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="absolute top-3 right-3 size-9 rounded-full glass flex items-center justify-center"
              >
                <X className="size-4" />
              </button>
              <NavBody user={user} counts={counts} pathname={pathname} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavBody({
  user,
  counts,
  pathname,
}: {
  user: SidebarUser;
  counts: { resumes: number; portfolios: number; coverLetters: number };
  pathname: string;
}) {
  const NAV = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/resumes", label: "Resumes", icon: FileText, count: counts.resumes },
    { href: "/dashboard/portfolios", label: "Portfolios", icon: Globe2, count: counts.portfolios },
    { href: "/dashboard/linkedin", label: "LinkedIn", icon: Linkedin },
    { href: "/dashboard/case-studies", label: "Case Studies", icon: ScrollText },
    { href: "/dashboard/cover-letters", label: "Cover Letters", icon: Mail, count: counts.coverLetters },
  ];

  const TOOLS = [
    { href: "/dashboard/assistant", label: "AI Assistant", icon: Wand2 },
    { href: "/dashboard/interview", label: "Mock Interview", icon: Briefcase, badge: "New" },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      <Link
        href="/dashboard"
        aria-label="Careerora"
        className="block px-2 py-3 shrink-0"
      >
        <Image
          src="/careerora-logo.png"
          alt="Careerora"
          width={220}
          height={56}
          priority
          className="h-11 md:h-12 w-auto"
        />
      </Link>

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

      <div className="mt-auto space-y-3 pt-6">
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
    </>
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
