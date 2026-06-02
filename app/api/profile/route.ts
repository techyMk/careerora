import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, badRequest } from "@/lib/api-helpers";

export async function GET() {
  const user = await requireUser();
  if (!user) return unauthorized();
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      headline: true,
      location: true,
      website: true,
      phone: true,
      bio: true,
      plan: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ profile });
}

const schema = z.object({
  name: z.string().max(120).optional(),
  headline: z.string().max(200).optional(),
  location: z.string().max(120).optional(),
  website: z.string().max(200).optional(),
  phone: z.string().max(40).optional(),
  bio: z.string().max(2000).optional(),
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

  const profile = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      headline: true,
      location: true,
      website: true,
      phone: true,
      bio: true,
      plan: true,
    },
  });
  return NextResponse.json({ profile });
}
