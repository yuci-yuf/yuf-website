import Link from "next/link";
import type { Hero as HeroData } from "@/types";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { HeroBackdrop } from "@/components/public/HeroBackdrop";
import { ctaButtonVariant } from "@/lib/utils";

export function Hero({ data }: { data: HeroData }) {
  return (
    <section className="relative flex min-h-[34rem] items-center overflow-hidden bg-primary-950 lg:min-h-[40rem]">
      <HeroBackdrop />

      <Container className="relative z-30 py-24 lg:py-28">
        <div className="flex max-w-3xl flex-col gap-8">
          {data.badge && (
            <div
              className="animate-[fade-up_0.6s_ease-out_both]"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="text-sm font-bold uppercase tracking-[0.25em] text-highlight-400">
                {data.badge}
              </span>
            </div>
          )}

          <h1
            className="animate-[fade-up_0.6s_ease-out_both] font-heading text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-7xl"
            style={{ animationDelay: "0.2s" }}
          >
            {data.title}{" "}
            {data.highlight && (
              <span className="text-highlight-400">
                {data.highlight}
              </span>
            )}
          </h1>

          <p
            className="max-w-2xl animate-[fade-up_0.6s_ease-out_both] text-lg leading-relaxed text-white/90 lg:text-xl"
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
                  asChild
                  size="lg"
                  variant={ctaButtonVariant(b.variant)}
                  className={
                    b.variant === "outline"
                      ? "border-2 border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white/25 hover:text-white"
                      : "bg-white text-festival-blue shadow-xl shadow-primary-950/25 hover:bg-primary-50"
                  }
                >
                  <Link href={b.href}>
                    {b.icon && <span aria-hidden>{b.icon}</span>}
                    {b.label}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
