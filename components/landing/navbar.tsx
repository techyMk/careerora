"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#templates", label: "Templates" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { status, data } = useSession();
  const isAuthed = status === "authenticated";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-3 inset-x-0 z-50 flex justify-center transition-all duration-300",
        scrolled ? "top-2" : "top-4"
      )}
    >
      <nav
        className={cn(
          "w-[min(96%,1100px)] flex items-center justify-between gap-4 px-3 md:px-4 py-2.5 rounded-full transition-all duration-300",
          scrolled ? "glass-strong shadow-soft" : "glass"
        )}
      >
        <Link href="/" aria-label="Careerora" className="shrink-0 flex items-center pl-2">
          <Image
            src="/careerora-logo.png"
            alt="Careerora"
            width={180}
            height={48}
            priority
            className="h-9 md:h-10 w-auto"
          />
        </Link>

        <ul className="hidden md:flex items-center gap-1 text-sm">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="px-3.5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          {isAuthed ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center gap-1.5"
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </button>
              </Button>
              <Button asChild size="sm">
                <Link href="/dashboard">
                  <LayoutDashboard className="size-3.5" />
                  Dashboard
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">
                  Start free
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          className="md:hidden inline-flex items-center justify-center size-9 rounded-full glass"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-20 inset-x-4 glass-strong rounded-2xl p-3"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 rounded-xl text-white/80 hover:bg-white/5"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2">
                <Button asChild className="w-full">
                  <Link href={isAuthed ? "/dashboard" : "/sign-up"}>
                    {isAuthed ? "Open dashboard" : "Start free"}
                  </Link>
                </Button>
              </li>
              {isAuthed && (
                <li className="mt-2">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign out
                  </Button>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
