"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

function initialsOf(name?: string | null, email?: string | null) {
  const source = (name || email || "U").trim();
  return source
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({
  src,
  name,
  email,
  size = 36,
  className,
}: {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  const initials = initialsOf(name, email);

  if (src && !errored) {
    return (
      <Image
        src={src}
        alt={name || email || "Avatar"}
        width={size}
        height={size}
        unoptimized
        referrerPolicy="no-referrer"
        onError={() => setErrored(true)}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={cn(
        "rounded-full bg-brand-gradient flex items-center justify-center font-semibold text-white select-none",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initials}
    </span>
  );
}
