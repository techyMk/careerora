"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export function GoogleButton({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        setPending(true);
        signIn("google", { callbackUrl });
      }}
      disabled={pending}
      className="w-full inline-flex items-center justify-center gap-2.5 h-10 rounded-full bg-white text-ink-900 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-soft"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <>
          <GoogleLogo />
          Continue with Google
        </>
      )}
    </button>
  );
}

function GoogleLogo() {
  return (
    <svg className="size-4" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.7 1.1 7.8 3l5.7-5.7C33.7 6 29.1 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C33.7 6 29.1 4 24 4 16.3 4 9.6 8.3 6.3 14.7Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5 0 9.6-1.9 13.1-5l-6.1-5c-2 1.4-4.5 2.3-7 2.3-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.1 5C40.9 35.2 44 30 44 24c0-1.2-.1-2.3-.4-3.5Z"
      />
    </svg>
  );
}
