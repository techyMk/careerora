import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, badRequest } from "@/lib/api-helpers";
import { generate, type ChatMessage } from "@/lib/groq";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  role: z.string().min(1).max(120),
  level: z.enum(["junior", "mid", "senior", "staff"]),
  questionCount: z.number().int().min(3).max(10).default(5),
});

const SYSTEM_INTERVIEWER = `You are a senior, experienced interviewer at a top company. You ask one focused, realistic interview question at a time for the target role + level. You're polite but probing. You alternate question types: behavioral, technical/role-specific, situational, system-design (for senior+), and a culture-fit question. Output the question only — no preamble like "Here's your question:". Keep questions specific and 1–3 sentences max.`;

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  const sessions = await prisma.interviewSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();
  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid input");

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_INTERVIEWER },
    {
      role: "user",
      content: `Role: ${parsed.data.role}\nLevel: ${parsed.data.level}\nThis is question 1 of ${parsed.data.questionCount}. Start with a behavioral or warm-up question — something that helps you assess the candidate's general approach.`,
    },
  ];

  let firstQuestion = "Tell me about yourself and what brought you to this role.";
  try {
    firstQuestion = (await generate(messages, { temperature: 0.7 })).trim();
  } catch { /* fallback above */ }

  const session = await prisma.interviewSession.create({
    data: {
      userId: user.id,
      role: parsed.data.role,
      level: parsed.data.level,
      questionCount: parsed.data.questionCount,
      questions: JSON.stringify([
        { question: firstQuestion, answer: "", score: null, feedback: "" },
      ]),
    },
  });
  return NextResponse.json({ session });
}
