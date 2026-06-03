"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LEVELS = [
  { id: "junior", label: "Junior" },
  { id: "mid", label: "Mid" },
  { id: "senior", label: "Senior" },
  { id: "staff", label: "Staff" },
] as const;

export function StartInterview({ userHeadline }: { userHeadline: string | null }) {
  const router = useRouter();
  const [role, setRole] = useState(userHeadline ?? "");
  const [level, setLevel] = useState<(typeof LEVELS)[number]["id"]>("senior");
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    if (!role.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: role.trim(), level, questionCount: count }),
      });
      const json = await res.json();
      if (json?.session?.id) {
        router.push(`/dashboard/interview/${json.session.id}`);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-3 sticky top-20">
      <div>
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <Briefcase className="size-3.5 text-brand-violet" />
          Start a session
        </h3>
        <p className="text-xs text-white/55 mt-0.5">
          Tell the AI who&apos;s interviewing you and at what level.
        </p>
      </div>
      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-white/45">Role</span>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Senior Product Designer"
          className="mt-1 w-full rounded-lg bg-white/[0.02] border border-white/10 px-3 h-10 text-sm outline-none focus:border-brand-violet/50"
        />
      </label>
      <div>
        <span className="text-[10px] uppercase tracking-wider text-white/45">Level</span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLevel(l.id)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                level === l.id
                  ? "bg-brand-gradient-soft border-brand-violet/30"
                  : "bg-white/[0.02] border-white/10 text-white/65 hover:text-white"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="text-[10px] uppercase tracking-wider text-white/45">Questions</span>
        <div className="mt-1 inline-flex p-1 glass rounded-full">
          {[3, 5, 7, 10].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-colors",
                count === n ? "bg-brand-gradient text-white" : "text-white/55 hover:text-white"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <Button
        size="md"
        className="w-full"
        onClick={start}
        disabled={busy || !role.trim()}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Briefcase className="size-4" />}
        {busy ? "Preparing question…" : "Start interview"}
      </Button>
      <p className="text-[10px] text-white/40">
        AI asks one question at a time. Type your answer, submit, get an evaluation, and continue.
      </p>
    </div>
  );
}
