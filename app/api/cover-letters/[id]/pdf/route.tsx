import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, notFound } from "@/lib/api-helpers";
import { CoverLetterPdf } from "@/lib/pdf/cover-letter-pdf";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;

  const [letter, dbUser] = await Promise.all([
    prisma.coverLetter.findFirst({ where: { id, userId: user.id } }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true },
    }),
  ]);
  if (!letter) return notFound();

  const buf = await renderToBuffer(
    <CoverLetterPdf
      data={{
        name: dbUser?.name ?? null,
        email: dbUser?.email ?? null,
        date: new Date().toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        role: letter.role,
        company: letter.company,
        body: letter.body,
      }}
    />
  );

  const safe = letter.title.replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60) || "cover-letter";

  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safe}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
