import Image from "next/image";
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
  /** Photo for the visual panel; falls back to a branded gradient */
  image?: string;
  /** Custom visual panel content; overrides image + gradient fallback */
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
  image,
  visual,
  className,
}: SplitSectionProps) {
  return (
    <section className={cn("py-24 lg:py-32", className)}>
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div
            className={cn(
              "flex flex-col gap-6",
              imageSide === "left" && "lg:order-2",
            )}
          >
            <span className="w-fit text-sm font-bold uppercase tracking-[0.2em] text-primary-600">
              {label}
            </span>
            <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight text-text sm:text-4xl lg:text-[2.75rem]">
              {title}
            </h2>
            {subhead && (
              <p className="text-lg font-semibold text-primary-700">
                {subhead}
              </p>
            )}
            {body.map((p, i) => (
              <p key={i} className="text-[17px] leading-relaxed text-text-muted">
                {p}
              </p>
            ))}

            {features && features.length > 0 && (
              <ul className="flex flex-col gap-4 pt-2">
                {features.map((f) => (
                  <li key={f.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                      {f.icon ? (
                        <span className="text-sm" aria-hidden>
                          {f.icon}
                        </span>
                      ) : (
                        <Check size={16} />
                      )}
                    </span>
                    <span>
                      <span className="font-semibold text-text">
                        {f.title}
                      </span>
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
                    icon={
                      b.icon ? <span aria-hidden>{b.icon}</span> : undefined
                    }
                  >
                    {b.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className={cn(imageSide === "left" && "lg:order-1")}>
            {visual ?? (
              image ? (
                <ImageVisual src={image} alt={title} />
              ) : (
                <DefaultVisual />
              )
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

function ImageVisual({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-hover ring-1 ring-border">
      {/* Subtle colored shadow behind image */}
      <div
        className="absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-br from-primary-200/30 to-accent-200/30 blur-xl"
        aria-hidden
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 40rem, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </div>
  );
}

function DefaultVisual() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-950 shadow-hover">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(24rem 16rem at 80% 20%, rgba(245,158,11,0.7), transparent)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
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
