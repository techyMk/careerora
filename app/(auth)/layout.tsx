import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen flex">
      <div className="absolute inset-0 -z-10 grid-bg" />
      <div className="absolute left-1/2 -translate-x-1/2 -top-32 -z-10 size-[42rem] rounded-full bg-brand-violet/20 blur-[120px]" />
      <div className="absolute right-1/4 top-20 -z-10 size-[28rem] rounded-full bg-brand-pink/15 blur-[120px]" />
      <div className="absolute left-10 top-40 -z-10 size-[24rem] rounded-full bg-brand-blue/15 blur-[120px]" />

      <div className="flex-1 flex flex-col">
        <header className="px-5 md:px-7 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 gap-5">
          <Link href="/" aria-label="Careerora" className="block relative">
            <span className="absolute inset-0 -z-10 bg-brand-gradient blur-2xl opacity-30" />
            <Image
              src="/careerora-logo.png"
              alt="Careerora"
              width={200}
              height={56}
              priority
              className="h-12 md:h-14 w-auto drop-shadow-[0_4px_24px_rgba(124,58,237,0.35)]"
            />
          </Link>
          {children}
        </div>
      </div>
    </main>
  );
}
