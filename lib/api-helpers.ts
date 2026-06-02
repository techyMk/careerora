import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; name?: string } | undefined;
  if (!user?.id) return null;
  return user as { id: string; email: string; name?: string };
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
