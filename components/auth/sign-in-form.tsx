"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/auth/google-button";

export function SignInForm({
  enabledProviders,
}: {
  enabledProviders: { google: boolean };
}) {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push(from);
      router.refresh();
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
        <h1 className="text-xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-xs text-white/55">
          Sign in to continue.
        </p>

        {enabledProviders.google && (
          <>
            <div className="mt-5">
              <GoogleButton callbackUrl={from} />
            </div>
            <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-wider text-white/30">
              <span className="flex-1 h-px bg-white/10" />
              or
              <span className="flex-1 h-px bg-white/10" />
            </div>
          </>
        )}

        <form
          onSubmit={onSubmit}
          className={enabledProviders.google ? "space-y-2.5" : "mt-5 space-y-2.5"}
        >
          <FieldInput
            label="Email"
            type="email"
            icon={Mail}
            value={email}
            onChange={setEmail}
            placeholder="you@careerora.app"
            autoComplete="email"
            required
          />
          <FieldInput
            label="Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            minLength={6}
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
                Continue
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-white/55">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="gradient-text font-medium hover:underline"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

function FieldInput({
  label,
  icon: Icon,
  value,
  onChange,
  ...rest
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/45">
        {label}
      </span>
      <div className="mt-1 flex items-center gap-2 px-3 h-10 rounded-lg bg-white/[0.02] border border-white/10 focus-within:border-brand-violet/50">
        <Icon className="size-3.5 text-white/40" />
        <input
          {...rest}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
        />
      </div>
    </label>
  );
}
