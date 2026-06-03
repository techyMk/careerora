import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; name?: string } | undefined;
  if (!user?.id) return null;
  return user as { id: string; email: string; name?: string };
}

const planCache = new Map<string, { plan: string; until: number }>();

/** Cheap memo of user plan to avoid an extra DB hit per AI call. */
export async function getUserPlan(userId: string): Promise<string> {
  const cached = planCache.get(userId);
  if (cached && cached.until > Date.now()) return cached.plan;
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  const plan = (u?.plan ?? "free").toLowerCase();
  planCache.set(userId, { plan, until: Date.now() + 60_000 });
  return plan;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
