"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Lock, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="gradient-border rounded-2xl glass-strong p-6 shadow-soft text-center">
          <div className="mx-auto size-10 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center">
            <AlertTriangle className="size-5" />
          </div>
          <h1 className="mt-4 text-xl font-semibold">Missing token</h1>
          <p className="mt-1 text-xs text-white/55">
            This link is missing its token. Request a fresh reset link.
          </p>
          <Button asChild size="md" className="mt-5 w-full">
            <Link href="/forgot-password">Get a new reset link</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    start(async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Couldn't reset password.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/sign-in"), 1800);
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
        {done ? (
          <div className="text-center py-3">
            <div className="mx-auto size-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center">
              <Check className="size-5" />
            </div>
            <h1 className="mt-4 text-xl font-semibold">Password updated</h1>
            <p className="mt-1 text-xs text-white/55">
              Redirecting you to sign in…
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold tracking-tight">Set a new password</h1>
            <p className="mt-1 text-xs text-white/55">
              Pick something you haven&apos;t used before.
            </p>

            <form onSubmit={onSubmit} className="mt-5 space-y-2.5">
              <Field
                label="New password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />
              <Field
                label="Confirm password"
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
              />

              {error && (
                <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5">
                  {error}
                </p>
              )}

              <Button type="submit" size="md" className="w-full" disabled={pending}>
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Update password
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/45">{label}</span>
      <div className="mt-1 flex items-center gap-2 px-3 h-10 rounded-lg bg-white/[0.02] border border-white/10 focus-within:border-brand-violet/50">
        <Lock className="size-3.5 text-white/40" />
        <input
          type="password"
          required
          minLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
        />
      </div>
    </label>
  );
}
