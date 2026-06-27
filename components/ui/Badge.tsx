import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  /** "solid" for the bright on-image variant, "soft" for in-page labels */
  tone?: "solid" | "soft";
}

export function Badge({ children, className, tone = "soft" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium tracking-wide",
        tone === "soft"
          ? "bg-primary-50 text-primary-700"
          : "bg-white/15 text-white backdrop-blur-sm ring-1 ring-white/25",
        className,
      )}
    >
      {children}
    </span>
  );
}
