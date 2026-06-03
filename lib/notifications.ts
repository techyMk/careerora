import { prisma } from "@/lib/prisma";

/**
 * Insert a notification for a user. Fire-and-forget — callers don't await this
 * for time-critical code paths (e.g. inside webhooks or page renders).
 */
export async function notify(
  userId: string,
  n: { type: string; title: string; body?: string; link?: string }
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
      },
    });
  } catch {
    /* swallow — notifications are best-effort */
  }
}
