"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show success — never reveal if account exists
      setSent(true);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm"
    >
      <div className="gradient-border rounded-2xl glass-strong p-6 shadow-soft">
        {!sent ? (
          <>
            <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
            <p className="mt-1 text-xs text-white/55">
              Enter your email. We&apos;ll send a secure link.
            </p>

            <form onSubmit={onSubmit} className="mt-5 space-y-2.5">
              <label className="block">
                <span className="text-[10px] uppercase tracking-wider text-white/45">Email</span>
                <div className="mt-1 flex items-center gap-2 px-3 h-10 rounded-lg bg-white/[0.02] border border-white/10 focus-within:border-brand-violet/50">
                  <Mail className="size-3.5 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@careerora.app"
                    autoComplete="email"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
                  />
                </div>
              </label>

              <Button type="submit" size="md" className="w-full" disabled={pending}>
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="mx-auto size-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center">
              <Check className="size-5" />
            </div>
            <h1 className="mt-4 text-xl font-semibold tracking-tight">Check your inbox</h1>
            <p className="mt-1 text-xs text-white/55">
              If <span className="text-white/80">{email}</span> has an account, a reset link is on
              its way. It expires in 60 minutes.
            </p>
            <p className="mt-3 text-[11px] text-white/40">
              Didn&apos;t get it? Check spam, or{" "}
              <button
                onClick={() => setSent(false)}
                className="gradient-text font-medium hover:underline"
              >
                try a different email
              </button>
              .
            </p>
          </div>
        )}

        <p className="mt-5 text-center text-xs text-white/55">
          Remembered it?{" "}
          <Link href="/sign-in" className="gradient-text font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
