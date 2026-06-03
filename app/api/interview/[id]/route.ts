import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, notFound, badRequest, getUserPlan } from "@/lib/api-helpers";
import { generate, type ChatMessage } from "@/lib/groq";
import { rateLimitAi, rateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
type Turn = { question: string; answer: string; score: number | null; feedback: string };

const answerSchema = z.object({
  answer: z.string().min(1).max(4000),
});

const SYSTEM_EVAL = `You are a senior interviewer who evaluates candidate answers. For a given question + answer, respond with a strict JSON object with two keys: "score" (integer 0-100) and "feedback" (2 sentences, specific). No prose around the JSON. No markdown fence.`;

const SYSTEM_NEXT = `You are a senior, experienced interviewer at a top company. You ask one focused, realistic interview question at a time for the target role + level. Alternate question types: behavioral, technical/role-specific, situational, system-design (for senior+), culture-fit. Output the question only — no preamble. Keep questions specific and 1–3 sentences max.`;

const SYSTEM_FINAL = `You are a senior hiring manager writing a brief, honest interview debrief based on the candidate's answers. Output: 3 short bullets on strengths, 3 on areas to improve, then a one-paragraph hiring recommendation. Plain text, no markdown headers or bold.`;

export async function GET(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const session = await prisma.interviewSession.findFirst({
    where: { id, userId: user.id },
  });
  if (!session) return notFound();
  return NextResponse.json({ session });
}

export async function POST(req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const plan = await getUserPlan(user.id);
  const rate = await rateLimitAi(user.id, plan, "interview");
  if (!rate.ok) return rateLimited(rate);
  const { id } = await ctx.params;
  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }
  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid input");

  const session = await prisma.interviewSession.findFirst({
    where: { id, userId: user.id },
  });
  if (!session) return notFound();
  if (session.status === "completed") return badRequest("Session already completed");

  const turns: Turn[] = JSON.parse(session.questions);
  const currentIdx = turns.findIndex((t) => !t.answer);
  if (currentIdx === -1) return badRequest("All questions already answered");
  turns[currentIdx].answer = parsed.data.answer;

  // Evaluate the answer
  try {
    const evalMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_EVAL },
      {
        role: "user",
        content: `Role: ${session.role}\nLevel: ${session.level}\nQuestion: ${turns[currentIdx].question}\nAnswer: ${turns[currentIdx].answer}`,
      },
    ];
    const raw = (await generate(evalMessages, { temperature: 0.3 })).trim();
    const json = JSON.parse(raw.replace(/^```(?:json)?/, "").replace(/```$/, "").trim());
    turns[currentIdx].score = typeof json.score === "number" ? Math.max(0, Math.min(100, Math.round(json.score))) : 70;
    turns[currentIdx].feedback = typeof json.feedback === "string" ? json.feedback : "";
  } catch {
    turns[currentIdx].score = 70;
    turns[currentIdx].feedback = "Good attempt — specifics and outcomes would strengthen this further.";
  }

  const isLast = turns.length >= session.questionCount;
  let finalScore: number | null = null;
  let finalReport: string | null = null;

  if (isLast) {
    finalScore = Math.round(turns.reduce((s, t) => s + (t.score ?? 0), 0) / turns.length);
    try {
      const finalMessages: ChatMessage[] = [
        { role: "system", content: SYSTEM_FINAL },
        {
          role: "user",
          content: `Role: ${session.role}\nLevel: ${session.level}\nTurns:\n${turns.map((t, i) => `Q${i + 1}: ${t.question}\nA${i + 1}: ${t.answer}\nScore: ${t.score}\n`).join("\n")}`,
        },
      ];
      finalReport = (await generate(finalMessages, { temperature: 0.6 })).trim();
    } catch {
      finalReport = "Solid overall performance. Focus next sessions on concrete metrics, structured frameworks, and a clearer narrative arc per answer.";
    }
  } else {
    // Generate next question
    try {
      const askMessages: ChatMessage[] = [
        { role: "system", content: SYSTEM_NEXT },
        {
          role: "user",
          content: `Role: ${session.role}\nLevel: ${session.level}\nThis is question ${turns.length + 1} of ${session.questionCount}. Previous questions:\n${turns.map((t, i) => `Q${i + 1}: ${t.question}`).join("\n")}\nAsk a different type of question this time — vary across behavioral / technical / situational / system-design / culture-fit. Avoid repeating themes.`,
        },
      ];
      const nextQ = (await generate(askMessages, { temperature: 0.75 })).trim();
      turns.push({ question: nextQ, answer: "", score: null, feedback: "" });
    } catch {
      turns.push({
        question: "Walk me through a recent project where you had to balance competing priorities. What did you cut, and why?",
        answer: "",
        score: null,
        feedback: "",
      });
    }
  }

  const updated = await prisma.interviewSession.update({
    where: { id: session.id },
    data: {
      questions: JSON.stringify(turns),
      status: isLast ? "completed" : "active",
      finalScore: finalScore ?? undefined,
      finalReport: finalReport ?? undefined,
    },
  });

  return NextResponse.json({ session: updated });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const existing = await prisma.interviewSession.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();
  await prisma.interviewSession.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
