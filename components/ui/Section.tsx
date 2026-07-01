import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

/**
 * Background tone for a section, drawn from the hero palette. Lets pages
 * alternate tinted / mesh / neutral bands declaratively instead of each
 * section hand-rolling its own background. See `app/globals.css`.
 */
export type SectionTone = "plain" | "tint" | "aqua" | "glow" | "brand";

const TONE_CLASS: Record<SectionTone, string> = {
  plain: "",
  tint: "section-tint",
  aqua: "section-aqua",
  glow: "section-glow",
  brand: "section-brand",
};

export function Section({
  children,
  className,
  id,
  containerClassName,
  tone = "plain",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
  tone?: SectionTone;
}) {
  return (
    <section
      id={id}
      className={cn("py-16 sm:py-24 lg:py-32", TONE_CLASS[tone], className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  label,
  title,
  subtitle,
  align = "center",
  className,
  invert = false,
}: {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
  /** White text for use over a dark background (e.g. the hero-gradient band). */
  invert?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {label && (
        <span
          className={cn(
            "text-sm font-bold uppercase tracking-[0.2em]",
            invert ? "text-highlight-400" : "text-highlight-600",
          )}
        >
          {label}
        </span>
      )}
      <h2
        className={cn(
          "max-w-3xl font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]",
          invert ? "text-white" : "text-heading",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "max-w-2xl text-[17px] leading-relaxed",
            invert ? "text-white/85" : "text-body",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
