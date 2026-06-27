import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

export function Section({
  children,
  className,
  id,
  containerClassName,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
}) {
  return (
    <section id={id} className={cn("py-20 lg:py-24", className)}>
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
}: {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {label && (
        <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent-600">
          <span className="h-px w-6 bg-accent-500" aria-hidden />
          {label}
        </span>
      )}
      <h2 className="max-w-3xl text-3xl font-bold leading-tight text-text sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed text-text-muted",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
