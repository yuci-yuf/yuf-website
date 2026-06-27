import type { ReactNode } from "react";
import { Check } from "lucide-react";
import type { CTAButton, FeatureCard } from "@/types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

interface SplitSectionProps {
  label: string;
  title: string;
  subhead?: string;
  body: string[];
  features?: FeatureCard[];
  buttons?: CTAButton[];
  /** Image side: "left" or "right" (default right) */
  imageSide?: "left" | "right";
  /** Visual panel content; defaults to a branded gradient panel */
  visual?: ReactNode;
  className?: string;
}

export function SplitSection({
  label,
  title,
  subhead,
  body,
  features,
  buttons,
  imageSide = "right",
  visual,
  className,
}: SplitSectionProps) {
  return (
    <section className={cn("py-20 lg:py-24", className)}>
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div
            className={cn(
              "flex flex-col gap-5",
              imageSide === "left" && "lg:order-2",
            )}
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent-600">
              <span className="h-px w-6 bg-accent-500" aria-hidden />
              {label}
            </span>
            <h2 className="font-heading text-3xl font-bold leading-tight text-text sm:text-4xl">
              {title}
            </h2>
            {subhead && (
              <p className="text-lg font-semibold text-primary-700">{subhead}</p>
            )}
            {body.map((p, i) => (
              <p key={i} className="leading-relaxed text-text-muted">
                {p}
              </p>
            ))}

            {features && features.length > 0 && (
              <ul className="flex flex-col gap-4 pt-2">
                {features.map((f) => (
                  <li key={f.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                      {f.icon ? (
                        <span className="text-sm" aria-hidden>{f.icon}</span>
                      ) : (
                        <Check size={16} />
                      )}
                    </span>
                    <span>
                      <span className="font-semibold text-text">{f.title}</span>
                      {" — "}
                      <span className="text-text-muted">{f.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {buttons && buttons.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-3">
                {buttons.map((b) => (
                  <Button
                    key={b.label}
                    href={b.href}
                    variant={b.variant ?? "primary"}
                    icon={b.icon ? <span aria-hidden>{b.icon}</span> : undefined}
                  >
                    {b.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className={cn(imageSide === "left" && "lg:order-1")}>
            {visual ?? <DefaultVisual />}
          </div>
        </div>
      </Container>
    </section>
  );
}

function DefaultVisual() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-950 shadow-hover">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(24rem 16rem at 80% 20%, rgba(245,158,11,0.7), transparent)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "2.5rem 2.5rem",
        }}
        aria-hidden
      />
    </div>
  );
}
