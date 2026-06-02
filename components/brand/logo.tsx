import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
  href = "/",
}: {
  className?: string;
  showText?: boolean;
  href?: string | null;
}) {
  const inner = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative">
        <span className="absolute inset-0 -z-10 rounded-full bg-brand-gradient blur-md opacity-50" />
        <Image
          src="/careerora-icon.png"
          alt="Careerora"
          width={32}
          height={32}
          className="rounded-md"
          priority
        />
      </span>
      {showText && (
        <span className="text-lg font-semibold tracking-tight">
          <span className="gradient-text">Career</span>
          <span className="text-white">ora</span>
        </span>
      )}
    </span>
  );
  if (href === null) return inner;
  return <Link href={href}>{inner}</Link>;
}
