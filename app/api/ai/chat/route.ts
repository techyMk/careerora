import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, badRequest } from "@/lib/api-helpers";
import { streamChat, type ChatMessage } from "@/lib/groq";

export const dynamic = "force-dynamic";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(8000),
      })
    )
    .min(1)
    .max(40),
  persist: z.boolean().optional(),
});

const SYSTEM_PROMPT =
  "You are Careerora's expert career assistant. You help users craft resumes, portfolios, LinkedIn copy, case studies, and cover letters. Write confidently, specifically, and in the user's voice — never generic. Prefer measurable outcomes, active verbs, and short, punchy sentences. Avoid clichés and corporate-speak.";

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

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...parsed.data.messages,
  ];

  const lastUser = [...parsed.data.messages].reverse().find((m) => m.role === "user");
  if (parsed.data.persist !== false && lastUser) {
    prisma.chatMessage
      .create({
        data: { userId: user.id, role: "user", content: lastUser.content },
      })
      .catch(() => {});
  }

  const encoder = new TextEncoder();
  let assistantText = "";
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamChat(messages)) {
          assistantText += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (e) {
        controller.enqueue(
          encoder.encode("\n\n[stream interrupted — please retry]")
        );
      } finally {
        controller.close();
        if (parsed.data.persist !== false && assistantText) {
          prisma.chatMessage
            .create({
              data: { userId: user.id, role: "assistant", content: assistantText },
            })
            .catch(() => {});
        }
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

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  return new Response(JSON.stringify({ messages }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE() {
  const user = await requireUser();
  if (!user) return unauthorized();
  await prisma.chatMessage.deleteMany({ where: { userId: user.id } });
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
