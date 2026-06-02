import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, badRequest } from "@/lib/api-helpers";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  const profile = await prisma.linkedinProfile.findUnique({
    where: { userId: user.id },
  });
  return NextResponse.json({ profile });
}

const schema = z.object({
  headline: z.string().max(220).optional(),
  about: z.string().max(4000).optional(),
  postIdeas: z.array(z.string()).max(20).optional(),
});

export async function PUT(req: Request) {
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

  const profile = await prisma.linkedinProfile.upsert({
    where: { userId: user.id },
    update: {
      headline: parsed.data.headline ?? undefined,
      about: parsed.data.about ?? undefined,
      postIdeas: parsed.data.postIdeas
        ? JSON.stringify(parsed.data.postIdeas)
        : undefined,
    },
    create: {
      userId: user.id,
      headline: parsed.data.headline ?? "",
      about: parsed.data.about ?? "",
      postIdeas: JSON.stringify(parsed.data.postIdeas ?? []),
    },
  });
  return NextResponse.json({ profile });
}
