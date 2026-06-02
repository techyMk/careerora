import { Suspense } from "react";
import { getEnabledProviders } from "@/lib/providers";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  const providers = getEnabledProviders();
  return (
    <Suspense fallback={<SkeletonCard />}>
      <SignInForm enabledProviders={providers} />
    </Suspense>
  );
}

function SkeletonCard() {
  return (
    <div className="w-full max-w-sm">
      <div className="gradient-border rounded-2xl glass-strong p-6 shadow-soft">
        <div className="h-6 w-3/4 rounded bg-white/5 shimmer" />
        <div className="mt-5 space-y-2.5">
          <div className="h-10 rounded-lg bg-white/5 shimmer" />
          <div className="h-10 rounded-lg bg-white/5 shimmer" />
          <div className="h-11 rounded-full bg-white/5 shimmer" />
        </div>
      </div>
    </div>
  );
}
