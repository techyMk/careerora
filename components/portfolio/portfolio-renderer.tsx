import {
  ArrowUpRight,
  Github,
  Twitter,
  Linkedin,
  Globe,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PortfolioProject = {
  id: string;
  name: string;
  description: string;
  url?: string;
  tags?: string[];
};

export type PortfolioData = {
  hero?: string;
  about?: string;
  skills?: string[];
  projects?: PortfolioProject[];
  socials?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  contact?: { email?: string };
};

export type PortfolioMeta = {
  name: string;
  bio: string;
  theme: string;
  ownerName: string | null;
  ownerHeadline: string | null;
};

const THEMES: Record<
  string,
  { wrap: string; ink: string; muted: string; chip: string; accent: string; useGrad: boolean }
> = {
  minimal: {
    wrap: "bg-ink-950 text-white",
    ink: "text-white",
    muted: "text-white/55",
    chip: "bg-white/5 border border-white/10",
    accent: "text-white",
    useGrad: false,
  },
  luxury: {
    wrap: "bg-ink-950 text-white",
    ink: "text-white",
    muted: "text-white/55",
    chip: "bg-white/5 border border-fuchsia-500/20",
    accent: "text-fuchsia-400",
    useGrad: true,
  },
  cyberpunk: {
    wrap: "bg-ink-950 text-white",
    ink: "text-white",
    muted: "text-cyan-200/70",
    chip: "bg-cyan-500/10 border border-cyan-400/20",
    accent: "text-cyan-300",
    useGrad: false,
  },
  glass: {
    wrap: "bg-ink-900 text-white",
    ink: "text-white",
    muted: "text-white/55",
    chip: "bg-white/5 border border-white/10",
    accent: "text-violet-300",
    useGrad: true,
  },
  gradient: {
    wrap:
      "bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.4),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.45),transparent_50%)] bg-ink-950 text-white",
    ink: "text-white",
    muted: "text-white/65",
    chip: "bg-white/5 border border-white/15",
    accent: "",
    useGrad: true,
  },
  brutalist: {
    wrap: "bg-white text-ink-900",
    ink: "text-ink-900",
    muted: "text-ink-900/65",
    chip: "bg-ink-900/[0.04] border border-ink-900/15",
    accent: "text-ink-900",
    useGrad: false,
  },
};

export function PortfolioRenderer({
  meta,
  data,
  compact = false,
}: {
  meta: PortfolioMeta;
  data: PortfolioData;
  compact?: boolean;
}) {
  const t = THEMES[meta.theme] ?? THEMES.gradient;
  const isBrutalist = meta.theme === "brutalist";
  const name = (meta.ownerName?.trim() || meta.name || "Your name").trim();
  const firstName = name.split(/\s+/)[0];
  const headline = meta.ownerHeadline?.trim() || "Builder";
  const tagline = (data.hero?.trim() || "I help great teams ship great products.").trim();
  const about = data.about?.trim();
  const skills = data.skills?.filter(Boolean) ?? [];
  const projects = data.projects?.filter((p) => p?.name?.trim()) ?? [];
  const socials = data.socials ?? {};
  const email = data.contact?.email?.trim();
  const anyContact = email || socials.github || socials.twitter || socials.linkedin || socials.website;

  const padX = compact ? "px-6 md:px-8" : "px-6 md:px-12 lg:px-20";
  const heroPad = compact ? "pt-10 pb-14" : "pt-16 md:pt-24 pb-20 md:pb-28";

  return (
    <div className={cn("min-h-full w-full", t.wrap)}>
      <header className={cn("flex items-center justify-between", padX, "py-4")}>
        <span className={cn("text-xs uppercase tracking-[0.2em]", t.muted)}>
          {name} · Portfolio
        </span>
        <nav className={cn("hidden sm:flex items-center gap-5 text-xs", t.muted)}>
          <a href="#about" className="hover:opacity-100 opacity-80">About</a>
          <a href="#work" className="hover:opacity-100 opacity-80">Work</a>
          {anyContact && (
            <a href="#contact" className="hover:opacity-100 opacity-80">Contact</a>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className={cn(padX, heroPad)}>
        <p className={cn("text-[10px] md:text-xs uppercase tracking-[0.3em]", t.muted)}>
          {headline}
        </p>
        <h1
          className={cn(
            "mt-4 font-semibold tracking-tight leading-[1.05] break-words",
            isBrutalist ? "uppercase" : "",
            compact ? "text-3xl md:text-5xl" : "text-4xl md:text-6xl lg:text-7xl"
          )}
        >
          Hi, I&apos;m {firstName}.{" "}
          {t.useGrad ? (
            <span className="gradient-text">{tagline}</span>
          ) : (
            <span className={t.accent}>{tagline}</span>
          )}
        </h1>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {projects.length > 0 && (
            <a
              href="#work"
              className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-brand-gradient text-white text-sm shadow-glow"
            >
              See work <ArrowUpRight className="size-3.5" />
            </a>
          )}
          {anyContact && (
            <a
              href="#contact"
              className={cn(
                "inline-flex items-center gap-2 px-4 h-10 rounded-full text-sm border",
                isBrutalist
                  ? "border-ink-900 text-ink-900"
                  : "border-white/15 text-white"
              )}
            >
              Get in touch
            </a>
          )}
        </div>
      </section>

      {/* About */}
      {about && (
        <section id="about" className={cn(padX, "py-12 md:py-16")}>
          <p className={cn("text-[10px] md:text-xs uppercase tracking-[0.3em]", t.muted)}>
            About
          </p>
          <p
            className={cn(
              "mt-4 max-w-2xl text-lg md:text-xl leading-relaxed",
              t.ink
            )}
          >
            {about}
          </p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className={cn(padX, "pb-2")}>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className={cn(
                  "text-xs px-3 py-1 rounded-full",
                  t.chip,
                  t.muted
                )}
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section id="work" className={cn(padX, "py-12 md:py-20")}>
          <div className="flex items-baseline justify-between mb-6">
            <p className={cn("text-[10px] md:text-xs uppercase tracking-[0.3em]", t.muted)}>
              Selected work
            </p>
            <span className={cn("text-xs", t.muted)}>
              {projects.length} project{projects.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} theme={meta.theme} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      {anyContact && (
        <section id="contact" className={cn(padX, "py-12 md:py-20 border-t", isBrutalist ? "border-ink-900/15" : "border-white/10")}>
          <p className={cn("text-[10px] md:text-xs uppercase tracking-[0.3em]", t.muted)}>
            Contact
          </p>
          <h3
            className={cn(
              "mt-3 text-2xl md:text-3xl font-semibold tracking-tight",
              isBrutalist ? "uppercase" : ""
            )}
          >
            Let&apos;s work together.
          </h3>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {email && (
              <a
                href={`mailto:${email}`}
                className={cn(
                  "inline-flex items-center gap-2 px-4 h-10 rounded-full text-sm",
                  "bg-brand-gradient text-white shadow-glow"
                )}
              >
                <Mail className="size-3.5" />
                {email}
              </a>
            )}
            <SocialPill href={socials.github} icon={Github} label="GitHub" theme={meta.theme} />
            <SocialPill href={socials.twitter} icon={Twitter} label="Twitter" theme={meta.theme} />
            <SocialPill href={socials.linkedin} icon={Linkedin} label="LinkedIn" theme={meta.theme} />
            <SocialPill href={socials.website} icon={Globe} label="Website" theme={meta.theme} />
          </div>
        </section>
      )}

      <footer
        className={cn(
          padX,
          "py-6 text-[11px] flex items-center justify-between border-t",
          isBrutalist ? "border-ink-900/15 text-ink-900/55" : "border-white/10 text-white/40"
        )}
      >
        <span>
          © {new Date().getFullYear()} {name}
        </span>
        <span>
          Built with <span className="gradient-text font-medium">Careerora</span>
        </span>
      </footer>
    </div>
  );
}

function ProjectCard({
  project,
  theme,
  t,
}: {
  project: PortfolioProject;
  theme: string;
  t: (typeof THEMES)[string];
}) {
  const isBrutalist = theme === "brutalist";
  const card = isBrutalist
    ? "bg-ink-900/[0.03] border border-ink-900/15 hover:bg-ink-900/[0.06]"
    : "bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/15";

  const Inner = (
    <div
      className={cn(
        "group relative rounded-2xl p-5 md:p-6 transition-all h-full",
        card
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className={cn("text-lg md:text-xl font-semibold tracking-tight", t.ink)}>
          {project.name}
        </h4>
        {project.url && (
          <ArrowUpRight
            className={cn(
              "size-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity",
              t.ink
            )}
          />
        )}
      </div>
      <p className={cn("mt-2 text-sm leading-relaxed", t.muted)}>
        {project.description}
      </p>
      {project.tags && project.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className={cn("text-[10px] px-2 py-0.5 rounded-full", t.chip, t.muted)}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (project.url) {
    return (
      <a href={project.url} target="_blank" rel="noreferrer noopener" className="block">
        {Inner}
      </a>
    );
  }
  return Inner;
}

function SocialPill({
  href,
  icon: Icon,
  label,
  theme,
}: {
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  theme: string;
}) {
  if (!href) return null;
  const isBrutalist = theme === "brutalist";
  const safe = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a
      href={safe}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "inline-flex items-center gap-2 px-3 h-10 rounded-full text-sm border transition-colors",
        isBrutalist
          ? "border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white"
          : "border-white/15 text-white hover:bg-white/10"
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </a>
  );
}
