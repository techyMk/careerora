"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wand2,
  Loader2,
  Check,
  ArrowLeft,
  Trash2,
  Download,
  Copy,
  Mail,
  Briefcase,
  Building2,
  FileText,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Letter = {
  id: string;
  title: string;
  company: string | null;
  role: string | null;
  body: string;
  tone: string;
};

type UserProp = {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  headline?: string | null;
} | null;

const TONES = [
  { id: "warm", label: "Warm" },
  { id: "senior", label: "Senior" },
  { id: "pivot", label: "Career pivot" },
  { id: "internal", label: "Internal move" },
  { id: "followup", label: "Follow-up" },
];

export function CoverLetterEditor({
  user,
  letter,
}: {
  user: UserProp;
  letter: Letter;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(letter.title);
  const [company, setCompany] = useState(letter.company ?? "");
  const [role, setRole] = useState(letter.role ?? "");
  const [body, setBody] = useState(letter.body);
  const [tone, setTone] = useState(letter.tone);
  const [jobDescription, setJobDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(new Date());
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const dirtyRef = useRef(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/cover-letters/${letter.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, company, role, body, tone }),
      });
      setSavedAt(new Date());
      dirtyRef.current = false;
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    dirtyRef.current = true;
    const t = setTimeout(() => dirtyRef.current && save(), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, company, role, body, tone]);

  const generate = async (mode: "draft" | "refine" = "draft") => {
    setGenerating(true);
    try {
      const context = JSON.stringify({
        name: user?.name,
        headline: user?.headline,
        company,
        role,
        tone,
        jobDescription: jobDescription.slice(0, 3000),
        currentBody: mode === "refine" ? body : "",
      });
      const instruction =
        mode === "draft"
          ? `Write a tailored 4-paragraph cover letter in a ${tone} tone. Use the job description if provided to mirror keywords naturally. End with a clear ask. Address to ${company || "the hiring team"}.`
          : `Refine the existing cover letter. Keep meaning, improve clarity, add specificity. Tone: ${tone}.`;
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "cover-letter", context, instruction }),
      });
      if (!res.ok || !res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setBody("");
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setBody(acc);
      }
    } finally {
      setGenerating(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this cover letter permanently?")) return;
    setDeleting(true);
    await fetch(`/api/cover-letters/${letter.id}`, { method: "DELETE" });
    router.push("/dashboard/cover-letters");
    router.refresh();
  };

  const copy = () => {
    navigator.clipboard?.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadTxt = () => {
    const blob = new Blob([
      `${user?.name ?? ""}\n${user?.email ?? ""}\n\n` +
        `${new Date().toLocaleDateString()}\n\n` +
        `${role ? `Re: ${role}` : ""}${company ? ` · ${company}` : ""}\n\n` +
        body,
    ], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const today = new Date().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Topbar
        title="Cover letter editor"
        subtitle={saving ? "Saving…" : savedAt ? "Saved · autosaves enabled" : "Unsaved"}
        user={user ?? undefined}
      />
      <div className="p-5 md:p-8">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <Button size="sm" variant="ghost" onClick={() => router.push("/dashboard/cover-letters")}>
            <ArrowLeft className="size-3.5" /> All cover letters
          </Button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 min-w-[200px] bg-transparent text-xl md:text-2xl font-semibold tracking-tight outline-none border-b border-transparent hover:border-white/10 focus:border-brand-violet/50 transition-colors py-1"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onDelete} disabled={deleting} className="text-rose-300 hover:bg-rose-500/10">
              {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              Delete
            </Button>
            <Button size="sm" variant="secondary" onClick={copy}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" variant="secondary" onClick={downloadTxt}>
              <Download className="size-3.5" />
              .txt
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Download className="size-3.5" />
              PDF
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-5">
          <aside className="space-y-4">
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold">Target</h3>
              <Field icon={Building2} label="Company" value={company} onChange={setCompany} placeholder="Plume" />
              <Field icon={Briefcase} label="Role" value={role} onChange={setRole} placeholder="Senior Product Designer" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-white/45">Tone</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full border",
                        tone === t.id
                          ? "bg-brand-gradient-soft border-brand-violet/30"
                          : "bg-white/[0.02] border-white/10 text-white/65 hover:text-white"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold inline-flex items-center gap-2">
                <FileText className="size-3.5 text-brand-violet" />
                Paste job description
              </h3>
              <p className="text-xs text-white/55">
                AI mirrors keywords from the description into your letter — naturally, not stuffed.
              </p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={9}
                placeholder="Paste the JD here for a tailored draft."
                className="w-full rounded-xl bg-white/[0.02] border border-white/10 p-3 text-xs outline-none focus:border-brand-violet/50 resize-none"
              />
              <Button size="sm" onClick={() => generate("draft")} disabled={generating} className="w-full">
                {generating ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
                {body ? "Replace with new draft" : "Draft with AI"}
              </Button>
              {body && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => generate("refine")}
                  disabled={generating}
                  className="w-full"
                >
                  <Wand2 className="size-3.5" /> Refine existing
                </Button>
              )}
            </div>

            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-white/55">Stats</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-white/45">Words</p>
                  <p className="mt-0.5 text-xl font-semibold">{wordCount}</p>
                </div>
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-white/45">Read time</p>
                  <p className="mt-0.5 text-xl font-semibold">{Math.max(1, Math.round(wordCount / 220))}m</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-4 min-w-0">
            <div id="cover-print" className="relative gradient-border rounded-3xl glass-strong p-3 md:p-4 shadow-soft">
              <div className="bg-white text-ink-900 rounded-2xl aspect-[8.5/11] max-w-3xl mx-auto p-8 md:p-12 shadow-soft relative overflow-hidden font-sans text-[11px] leading-relaxed">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold tracking-tight">
                      {user?.name ?? "Your name"}
                    </p>
                    <p className="text-ink-700/85 inline-flex items-center gap-1">
                      <Mail className="size-3" /> {user?.email ?? "you@example.com"}
                    </p>
                  </div>
                  <p className="text-[10px] text-ink-700/70">{today}</p>
                </div>
                <div className="my-3 h-px bg-ink-900/15" />
                {(role || company) && (
                  <p className="text-ink-700/85">
                    {role && <span className="font-medium">Re: {role}</span>}
                    {role && company && " · "}
                    {company && <span>{company}</span>}
                  </p>
                )}
                <div className="mt-5">
                  {body ? (
                    <div className="whitespace-pre-wrap text-ink-700">{body}</div>
                  ) : (
                    <p className="text-ink-700/40 italic">
                      Your AI-drafted letter will appear here. Paste a job description on the
                      left to get a tailored draft, or write your own.
                    </p>
                  )}
                </div>
                <div className="mt-8">
                  <p className="text-ink-700">Sincerely,</p>
                  <p className="mt-3 font-semibold">{user?.name ?? "Your name"}</p>
                </div>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Edit inline — autosaves."
                className="absolute opacity-0 pointer-events-none"
              />
            </div>

            <details className="glass rounded-2xl p-4">
              <summary className="text-sm font-semibold cursor-pointer">
                Edit body manually
              </summary>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={14}
                placeholder="Paste or write your cover letter here."
                className="mt-3 w-full rounded-xl bg-white/[0.02] border border-white/10 p-3 text-sm outline-none focus:border-brand-violet/50 resize-none"
              />
            </details>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          aside, header, .no-print { display: none !important; }
          #cover-print { padding: 0 !important; box-shadow: none !important; border: none !important; background: white !important; }
        }
      `}</style>
    </>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/45">{label}</span>
      <div className="mt-1 flex items-center gap-2 px-3 h-10 rounded-lg bg-white/[0.02] border border-white/10 focus-within:border-brand-violet/50">
        <Icon className="size-3.5 text-white/55 shrink-0" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
        />
      </div>
    </label>
  );
}
