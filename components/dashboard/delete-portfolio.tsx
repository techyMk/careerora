"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function DeletePortfolioButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (!confirm("Delete this portfolio? This cannot be undone.")) return;
        start(async () => {
          await fetch(`/api/portfolios/${id}`, { method: "DELETE" });
          router.refresh();
        });
      }}
      disabled={pending}
      className="size-8 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 flex items-center justify-center"
      aria-label="Delete portfolio"
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
    </button>
  );
}
