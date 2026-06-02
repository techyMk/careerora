import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gradient" | "outline" | "success";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-white/5 text-white/80 border border-white/10",
    gradient:
      "bg-brand-gradient-soft text-white border border-brand-violet/30",
    outline: "border border-white/15 text-white/70",
    success:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
