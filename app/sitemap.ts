import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.AUTH_URL || "https://careerora.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Public published portfolios at /p/[subdomain] — show off real ones to Google
  let portfolios: { subdomain: string; updatedAt: Date }[] = [];
  try {
    portfolios = await prisma.portfolio.findMany({
      where: { published: true },
      select: { subdomain: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 1000,
    });
  } catch {
    /* DB unavailable during build — that's fine */
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/sign-up`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/sign-in`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const portfolioRoutes: MetadataRoute.Sitemap = portfolios.map((p) => ({
    url: `${BASE_URL}/p/${p.subdomain}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...portfolioRoutes];
}
