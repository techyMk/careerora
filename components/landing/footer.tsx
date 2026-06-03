import Link from "next/link";
import Image from "next/image";

const NAVS: { title: string; links: [string, string][] }[] = [
  {
    title: "Product",
    links: [
      ["Resume builder", "/dashboard/resumes"],
      ["Portfolio generator", "/dashboard/portfolios"],
      ["LinkedIn optimizer", "/dashboard/linkedin"],
      ["Case studies", "/dashboard/case-studies"],
      ["Templates", "/dashboard/templates"],
    ],
  },
  {
    title: "Explore",
    links: [
      ["Features", "/#features"],
      ["How it works", "/#how-it-works"],
      ["Pricing", "/#pricing"],
      ["AI Assistant", "/dashboard/assistant"],
      ["Settings", "/dashboard/settings"],
    ],
  },
  {
    title: "Get started",
    links: [
      ["Sign up", "/sign-up"],
      ["Sign in", "/sign-in"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Terms", "/terms"],
      ["Privacy", "/privacy"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-14 md:py-20">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-[1.2fr_2fr] gap-10">
          <div>
            <Link href="/" aria-label="Careerora" className="inline-flex">
              <Image
                src="/careerora-logo.png"
                alt="Careerora"
                width={260}
                height={72}
                className="h-12 md:h-14 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-white/55">
              Careerora is the AI career operating system. Resumes, portfolios,
              LinkedIn, case studies — all in one tool, all on-brand.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {NAVS.map((n) => (
              <div key={n.title}>
                <p className="text-xs uppercase tracking-wider text-white/40 font-semibold">
                  {n.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {n.links.map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-sm text-white/70 hover:text-white transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Careerora. All rights reserved.</p>
          <p>Crafted with care · Made for people who refuse to look generic.</p>
        </div>
      </div>
    </footer>
  );
}
