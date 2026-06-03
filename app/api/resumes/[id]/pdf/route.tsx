import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorized, notFound } from "@/lib/api-helpers";
import { ResumePdf, type ResumePdfData } from "@/lib/pdf/resume-pdf";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;

  const [resume, dbUser] = await Promise.all([
    prisma.resume.findFirst({
      where: { id, userId: user.id },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        location: true,
        website: true,
        headline: true,
      },
    }),
  ]);
  if (!resume) return notFound();

  let data: ResumePdfData = {};
  try { data = JSON.parse(resume.data); } catch { /* default */ }

  const buf = await renderToBuffer(
    <ResumePdf
      user={dbUser ?? {}}
      data={data}
      name={resume.name}
      template={resume.template}
    />
  );

  const safeName = resume.name.replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60) || "resume";

  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
