import type { Hero as HeroData } from "@/types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroBackdrop } from "@/components/public/HeroBackdrop";

export function Hero({ data }: { data: HeroData }) {
  return (
    <section className="relative overflow-hidden bg-primary-950">
      <HeroBackdrop />

      <Container className="relative z-30 py-32 lg:py-44">
        <div className="flex max-w-3xl flex-col gap-8">
          {data.badge && (
            <div
              className="animate-[fade-up_0.6s_ease-out_both]"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="text-sm font-bold uppercase tracking-[0.25em] text-accent-400">
                {data.badge}
              </span>
            </div>
          )}

          <h1
            className="animate-[fade-up_0.6s_ease-out_both] font-heading text-4xl font-extrabold leading-[1.07] tracking-tight text-white sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.2s" }}
          >
            {data.title}{" "}
            {data.highlight && (
              <span className="bg-gradient-to-r from-accent-400 via-primary-300 to-accent-400 bg-clip-text text-transparent">
                {data.highlight}
              </span>
            )}
          </h1>

          <p
            className="max-w-2xl animate-[fade-up_0.6s_ease-out_both] text-lg leading-relaxed text-primary-100/90 lg:text-xl"
            style={{ animationDelay: "0.35s" }}
          >
            {data.subtitle}
          </p>

          {data.buttons && data.buttons.length > 0 && (
            <div
              className="flex animate-[fade-up_0.6s_ease-out_both] flex-wrap gap-4 pt-2"
              style={{ animationDelay: "0.5s" }}
            >
              {data.buttons.map((b) => (
                <Button
                  key={b.label}
                  href={b.href}
                  size="lg"
                  variant={b.variant ?? "primary"}
                  icon={b.icon ? <span aria-hidden>{b.icon}</span> : undefined}
                  className={
                    b.variant === "outline"
                      ? "border-white/25 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
                      : "shadow-lg hover:shadow-glow"
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
