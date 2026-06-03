"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Loader2,
  SendHorizontal,
  Check,
  Trophy,
  Trash2,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Turn = { question: string; answer: string; score: number | null; feedback: string };

type Session = {
  id: string;
  role: string;
  level: string;
  questionCount: number;
  questions: string;
  status: string;
  finalScore: number | null;
  finalReport: string | null;
};

type UserProp = {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
} | null;

export function InterviewSession({
  user,
  initial,
}: {
  user: UserProp;
  initial: Session;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session>(initial);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  let turns: Turn[] = [];
  try { turns = JSON.parse(session.questions); } catch { /* default empty */ }

  const isCompleted = session.status === "completed";
  const currentIdx = isCompleted ? turns.length : turns.findIndex((t) => !t.answer);
  const current = !isCompleted && currentIdx >= 0 ? turns[currentIdx] : null;

  const submit = async () => {
    if (!answer.trim() || !current) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/interview/${session.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answer: answer.trim() }),
      });
      const json = await res.json();
      if (json?.session) {
        setSession(json.session);
        setAnswer("");
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this interview session permanently?")) return;
    setDeleting(true);
    await fetch(`/api/interview/${session.id}`, { method: "DELETE" });
    router.push("/dashboard/interview");
    router.refresh();
  };

  return (
    <>
      <Topbar
        title={session.role}
        subtitle={`${session.level} · ${turns.filter((t) => t.answer).length}/${session.questionCount} questions`}
        user={user}
      />
      <div className="p-5 md:p-8 max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" onClick={() => router.push("/dashboard/interview")}>
            <ArrowLeft className="size-3.5" /> All sessions
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} disabled={deleting} className="ml-auto text-rose-300 hover:bg-rose-500/10">
            {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            Delete
          </Button>
        </div>

        {/* Past turns */}
        <div className="space-y-4">
          {turns.map((t, i) => {
            const isCurrent = i === currentIdx && !isCompleted;
            return (
              <div key={i} className="glass rounded-2xl p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider text-brand-violet font-semibold">
                    Question {i + 1} of {session.questionCount}
                  </p>
                  {t.score !== null && (
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-semibold",
                        t.score >= 80
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : t.score >= 60
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      )}
                    >
                      {t.score}/100
                    </span>
                  )}
                </div>
                <p className="mt-2 text-base md:text-lg">{t.question}</p>

                {t.answer ? (
                  <>
                    <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-white/45 mb-1">Your answer</p>
                      <p className="text-sm text-white/85 whitespace-pre-wrap">{t.answer}</p>
                    </div>
                    {t.feedback && (
                      <div className="mt-3 p-3 rounded-xl bg-brand-gradient-soft border border-brand-violet/30">
                        <p className="text-[10px] uppercase tracking-wider text-brand-violet mb-1">Interviewer feedback</p>
                        <p className="text-sm text-white/85">{t.feedback}</p>
                      </div>
                    )}
                  </>
                ) : isCurrent ? (
                  <div className="mt-4 space-y-2">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={6}
                      placeholder="Take a breath. Structure your answer — situation, action, outcome."
                      className="w-full rounded-xl bg-white/[0.02] border border-white/10 p-3 text-sm outline-none focus:border-brand-violet/50 resize-none"
                      disabled={submitting}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-white/40">
                        {answer.trim().length} characters · {answer.trim() ? answer.trim().split(/\s+/).length : 0} words
                      </p>
                      <Button size="sm" onClick={submit} disabled={submitting || !answer.trim()}>
                        {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <SendHorizontal className="size-3.5" />}
                        {submitting ? "Evaluating…" : "Submit answer"}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Final report */}
        {isCompleted && session.finalReport && (
          <div className="gradient-border rounded-3xl glass-strong p-6 md:p-8 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow">
                <Trophy className="size-5" />
              </div>
              <div>
                <p className="text-xs text-white/55">Session complete</p>
                <h2 className="text-2xl font-semibold inline-flex items-baseline gap-2">
                  <span className="gradient-text">{session.finalScore ?? 0}</span>
                  <span className="text-base text-white/55">/ 100 overall</span>
                </h2>
              </div>
            </div>
            <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-white/85">
              {session.finalReport}
            </div>
            <div className="mt-6 flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => router.push("/dashboard/interview")}
              >
                <Briefcase className="size-3.5" />
                Start another
              </Button>
              <span className="text-xs text-white/45 inline-flex items-center gap-1.5">
                <Check className="size-3 text-emerald-400" />
                Saved to your history
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
