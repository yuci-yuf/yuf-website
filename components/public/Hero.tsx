import type { Hero as HeroData } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero({ data }: { data: HeroData }) {
  return (
    <section className="relative overflow-hidden bg-primary-950">
      {/* Decorative gradient field */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(60rem 40rem at 15% 10%, rgba(37,99,235,0.55), transparent), radial-gradient(40rem 30rem at 95% 90%, rgba(245,158,11,0.35), transparent)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "3rem 3rem",
        }}
        aria-hidden
      />

      <Container className="relative py-28 lg:py-36">
        <div className="flex max-w-3xl flex-col gap-7">
          {data.badge && <Badge tone="solid">{data.badge}</Badge>}
          <h1 className="font-heading text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            {data.title}{" "}
            {data.highlight && (
              <span className="text-accent-400">{data.highlight}</span>
            )}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-primary-100">
            {data.subtitle}
          </p>
          {data.buttons && data.buttons.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-2">
              {data.buttons.map((b) => (
                <Button
                  key={b.label}
                  href={b.href}
                  size="lg"
                  variant={b.variant ?? "primary"}
                  icon={b.icon ? <span aria-hidden>{b.icon}</span> : undefined}
                  className={
                    b.variant === "outline"
                      ? "border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                      : undefined
                  }
                >
                  {b.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
