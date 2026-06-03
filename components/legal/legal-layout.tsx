import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="absolute inset-0 -z-10 grid-bg opacity-50" />
      <div className="absolute left-1/2 -translate-x-1/2 -top-32 -z-10 size-[42rem] rounded-full bg-brand-violet/15 blur-[120px]" />

      <article className="container mx-auto px-6 pt-32 md:pt-40 pb-20 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-white/55 hover:text-white"
        >
          <Image
            src="/careerora-icon.png"
            alt="Careerora"
            width={20}
            height={20}
            className="rounded-sm"
          />
          Back to Careerora
        </Link>
        <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-xs text-white/45">Last updated {updated}</p>

        <div className="prose-careerora mt-10 space-y-6 text-sm md:text-base text-white/80 leading-relaxed">
          {children}
        </div>
      </article>
      <Footer />

      <style>{`
        .prose-careerora h2 {
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: white;
          margin-top: 2rem;
          margin-bottom: 0.5rem;
        }
        .prose-careerora h3 {
          font-size: 0.95rem;
          font-weight: 600;
          color: rgba(255,255,255,0.92);
          margin-top: 1.25rem;
          margin-bottom: 0.25rem;
        }
        .prose-careerora p { margin: 0.5rem 0; }
        .prose-careerora ul { margin: 0.5rem 0 0.5rem 1.25rem; list-style: disc; }
        .prose-careerora ul li { margin: 0.25rem 0; }
        .prose-careerora a { color: #a78bfa; text-decoration: underline; text-underline-offset: 3px; }
        .prose-careerora code {
          background: rgba(255,255,255,0.06);
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          font-size: 0.85em;
        }
      `}</style>
    </main>
  );
}
