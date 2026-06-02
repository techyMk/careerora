"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  SendHorizontal,
  Wand2,
  FileText,
  Globe2,
  Linkedin,
  ScrollText,
  ChevronRight,
  Bot,
  Trash2,
  Loader2,
} from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { cn } from "@/lib/utils";

type Message = { id: string; role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  { label: "Rewrite my resume summary", icon: FileText },
  { label: "Generate portfolio hero copy", icon: Globe2 },
  { label: "Draft a LinkedIn headline", icon: Linkedin },
  { label: "Structure a case study", icon: ScrollText },
];

const SUGGESTED = [
  "Make it punchier",
  "Shorter, 1 sentence",
  "Add measurable metrics",
  "More confident tone",
];

export function AssistantChat({
  user,
  initialMessages,
}: {
  user: { name?: string | null; email?: string | null } | null;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length
      ? initialMessages
      : [
          {
            id: "welcome",
            role: "assistant",
            content: `Hi ${user?.name?.split(" ")[0] ?? "there"} 👋 — I'm your Careerora career assistant. I can rewrite, draft, critique or score anything in your workspace. What are we working on?`,
          },
        ]
  );
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [clearing, setClearing] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text.trim(),
    };
    const aiId = `a_${Date.now()}`;
    setMessages((m) => [...m, userMsg, { id: aiId, role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg]
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok || !res.body) {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === aiId
              ? { ...msg, content: "Sorry — something went wrong. Try again?" }
              : msg
          )
        );
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) =>
          m.map((msg) => (msg.id === aiId ? { ...msg, content: acc } : msg))
        );
      }
    } finally {
      setStreaming(false);
      router.refresh();
    }
  };

  const clearHistory = async () => {
    if (!confirm("Clear chat history?")) return;
    setClearing(true);
    try {
      await fetch("/api/ai/chat", { method: "DELETE" });
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Cleared. What would you like to work on next?`,
        },
      ]);
      router.refresh();
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <Topbar
        title="AI Assistant"
        subtitle="Your inline writing partner. Trained to write like you."
        user={user ?? undefined}
      />
      <div className="grid lg:grid-cols-[1fr_320px] h-[calc(100vh-64px)]">
        <div className="flex flex-col min-h-0">
          <div ref={scroller} className="flex-1 overflow-y-auto p-5 md:p-8 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "flex gap-3",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {m.role === "assistant" && (
                    <div className="size-9 rounded-full bg-brand-gradient flex items-center justify-center shrink-0">
                      <Bot className="size-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-brand-gradient text-white shadow-glow"
                        : "glass"
                    )}
                  >
                    {m.content || (streaming ? <Typing /> : null)}
                    {m.role === "assistant" && streaming && m.content && (
                      <span className="inline-block w-1.5 h-4 bg-brand-violet align-middle ml-0.5 animate-pulse" />
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-semibold shrink-0">
                      {(user?.name || user?.email || "U")
                        .split(/\s+/)
                        .map((s) => s[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="border-t border-white/5 p-4 md:p-6 bg-ink-950/60 backdrop-blur-xl">
            <div className="flex items-center flex-wrap gap-2 mb-3">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={streaming}
                  className="text-xs px-3 py-1.5 rounded-full glass hover:bg-white/10 disabled:opacity-50"
                >
                  <Sparkles className="inline size-3 mr-1 text-brand-violet" />
                  {s}
                </button>
              ))}
              <button
                onClick={clearHistory}
                disabled={clearing || streaming}
                className="ml-auto text-xs px-3 py-1.5 rounded-full glass hover:bg-white/10 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {clearing ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                Clear history
              </button>
            </div>
            <div className="relative flex items-center gap-2 p-2 rounded-2xl glass-strong">
              <Wand2 className="size-4 text-brand-violet ml-2" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask anything · rewrite, draft, critique, brainstorm…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
                disabled={streaming}
              />
              <button
                onClick={() => send(input)}
                disabled={streaming || !input.trim()}
                className="size-9 rounded-xl bg-brand-gradient flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {streaming ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <SendHorizontal className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <aside className="hidden lg:flex flex-col border-l border-white/5 bg-ink-950/40 p-5 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40 mb-2">
              Quick prompts
            </p>
            <div className="space-y-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => send(q.label)}
                  disabled={streaming}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-white/[0.04] border border-white/5 transition-colors disabled:opacity-50"
                >
                  <q.icon className="size-3.5 text-brand-violet" />
                  <span className="flex-1 text-left">{q.label}</span>
                  <ChevronRight className="size-3.5 text-white/30" />
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 mt-auto">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Mock interview
            </p>
            <p className="mt-1 text-sm font-medium">Practice for your next role</p>
            <p className="mt-1 text-xs text-white/55">
              10 questions · 12 min · tailored feedback.
            </p>
            <button
              onClick={() =>
                send(
                  "Run a 5-question mock interview for a senior product designer role. Ask me one question at a time and wait for my answer before the next."
                )
              }
              disabled={streaming}
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-xl bg-brand-gradient text-sm font-medium shadow-glow disabled:opacity-50"
            >
              <Sparkles className="size-3.5" />
              Start session
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}

function Typing() {
  return (
    <span className="inline-flex gap-1 items-center text-white/60">
      <span className="size-1.5 rounded-full bg-white/60 animate-bounce [animation-delay:-200ms]" />
      <span className="size-1.5 rounded-full bg-white/60 animate-bounce [animation-delay:-100ms]" />
      <span className="size-1.5 rounded-full bg-white/60 animate-bounce" />
    </span>
  );
}
