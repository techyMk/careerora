import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Careerora — Build Your Entire Professional Identity With AI",
    template: "%s · Careerora",
  },
  description:
    "Careerora is the AI-powered career operating system. Generate stunning resumes, portfolios, LinkedIn summaries, case studies and cover letters in minutes.",
  keywords: [
    "AI resume builder",
    "portfolio generator",
    "LinkedIn optimizer",
    "case study writer",
    "cover letter AI",
    "Careerora",
  ],
  metadataBase: new URL("https://careerora.app"),
  icons: {
    icon: [{ url: "/icon.webp", type: "image/webp" }],
    shortcut: "/icon.webp",
    apple: "/icon.webp",
  },
  openGraph: {
    title: "Careerora — Your AI Career Operating System",
    description:
      "Generate premium resumes, portfolios, LinkedIn content and case studies — instantly.",
    url: "https://careerora.app",
    siteName: "Careerora",
    images: [{ url: "/careerora-logo.png" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careerora",
    description:
      "Build your entire professional identity with AI. Resumes, portfolios, LinkedIn, case studies.",
    images: ["/careerora-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="font-sans antialiased text-white min-h-screen overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
