import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
export const groq = apiKey ? new Groq({ apiKey }) : null;
export const hasGroq = !!apiKey;

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * Stream tokens from Groq's API. Falls back to a deterministic mock
 * stream when GROQ_API_KEY is not configured so the UI works offline.
 */
export async function* streamChat(
  messages: ChatMessage[],
  opts: { temperature?: number; mockResponse?: string } = {}
): AsyncGenerator<string> {
  if (!groq) {
    const fallback =
      opts.mockResponse ??
      buildMockResponse(messages[messages.length - 1]?.content ?? "");
    for (const chunk of fallback.match(/.{1,4}/g) ?? [fallback]) {
      await new Promise((r) => setTimeout(r, 22));
      yield chunk;
    }
    return;
  }
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: 800,
    stream: true,
  });
  for await (const chunk of completion) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}

export async function generate(
  messages: ChatMessage[],
  opts: { temperature?: number; mockResponse?: string } = {}
): Promise<string> {
  let out = "";
  for await (const chunk of streamChat(messages, opts)) out += chunk;
  return out.trim();
}

function buildMockResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("headline")) {
    return "Senior Product Designer · Shipping expressive SaaS at Plume · ex-Foundry · open to AI-native briefs.";
  }
  if (p.includes("resume") || p.includes("summary")) {
    return "Senior product designer with 6+ years shaping data-rich SaaS. At Plume I led an analytics redesign that lifted activation +38% and unlocked a $1.4M ARR enterprise tier. I care about clear thinking, type-led layouts, and motion that explains — not decorates.";
  }
  if (p.includes("portfolio") || p.includes("bio")) {
    return "I help ambitious early-stage teams turn fuzzy product ideas into shipped, on-brand experiences. Currently designing at Plume; previously Foundry.";
  }
  if (p.includes("case study") || p.includes("problem")) {
    return "Problem: 22% bounce on first analytics session.\nSolution: re-architected IA around 3 focal jobs with progressive disclosure.\nMetrics: activation +38%, p99 load 8.7s → 1.9s, tickets −41%.\nResult: unlocked a $1.4M ARR enterprise tier in Q1.";
  }
  if (p.includes("cover letter")) {
    return "Hi team — I've been following Plume's work on collaborative analytics and the recent IA refresh resonates with how I approach product. I'd love to bring my experience scaling design systems at Foundry to your team. A 20-min chat?";
  }
  return "Here's a draft you can tune. Tell me the role, audience, and tone — I'll tighten it: confident, specific, and ATS-friendly.";
}
