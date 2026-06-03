import type { MetadataRoute } from "next";

const BASE_URL = process.env.AUTH_URL || "https://careerora.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/sign-up", "/sign-in", "/terms", "/privacy", "/p/"],
        disallow: ["/dashboard", "/api/", "/forgot-password", "/reset-password"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
