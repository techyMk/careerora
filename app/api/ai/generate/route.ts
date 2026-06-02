import { z } from "zod";
import { requireUser, unauthorized, badRequest } from "@/lib/api-helpers";
import { streamChat, type ChatMessage } from "@/lib/groq";

export const dynamic = "force-dynamic";

const schema = z.object({
  kind: z.enum([
    "resume-summary",
    "portfolio-bio",
    "linkedin-headline",
    "linkedin-about",
    "cover-letter",
    "case-study-block",
    "rewrite",
    "free",
  ]),
  context: z.string().max(4000).optional(),
  instruction: z.string().max(2000).optional(),
});

const PROMPTS: Record<string, (ctx: string, ins: string) => string> = {
  "resume-summary": (ctx, ins) =>
    `Write a 3-sentence resume summary in first-person. Be specific, confident, quantify impact. Context:\n${ctx}\n\nExtra instruction: ${ins}`,
  "portfolio-bio": (ctx, ins) =>
    `Write a 2-sentence portfolio hero bio. Warm, confident, hint of wit. Context:\n${ctx}\n\nExtra instruction: ${ins}`,
  "linkedin-headline": (ctx, ins) =>
    `Write 3 LinkedIn headline options under 220 chars. Make them recruiter-magnet quality. Return as a plain numbered list. Context:\n${ctx}\n\nExtra instruction: ${ins}`,
  "linkedin-about": (ctx, ins) =>
    `Write a LinkedIn About section in 3 short paragraphs. First-person, specific, includes a soft CTA. Context:\n${ctx}\n\nExtra instruction: ${ins}`,
  "cover-letter": (ctx, ins) =>
    `Write a 4-paragraph cover letter. Conversational but professional. End with a clear ask. Context:\n${ctx}\n\nExtra instruction: ${ins}`,
  "case-study-block": (ctx, ins) =>
    `Write a 2-3 sentence case-study block. Specific, metric-led, narrative voice. Context:\n${ctx}\n\nExtra instruction: ${ins}`,
  rewrite: (ctx, ins) =>
    `Rewrite the following text. Keep the meaning, improve clarity, punch, and flow.\n\nText:\n${ctx}\n\nInstruction: ${ins || "Make it punchier and more specific."}`,
  free: (ctx, ins) => `${ins}\n\nContext:\n${ctx}`,
};

const SYSTEM_PROMPT =
  "You are Careerora's expert career copywriter. Write confidently, specifically, in the user's voice. Quantify impact. Avoid clichés. Return only the requested content — no preamble.";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid input");

  const prompt = PROMPTS[parsed.data.kind](
    parsed.data.context ?? "",
    parsed.data.instruction ?? ""
  );

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamChat(messages, { temperature: 0.8 })) {
          controller.enqueue(encoder.encode(chunk));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
