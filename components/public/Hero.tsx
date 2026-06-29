import Image from "next/image";
import type { Hero as HeroData } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero({ data }: { data: HeroData }) {
  return (
    <section className="relative overflow-hidden bg-primary-950">
      {/* Background photo */}
      {data.backgroundImage && (
        <Image
          src={data.backgroundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
      )}
      {/* Readability scrim — richer gradient */}
      {data.backgroundImage && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/90 to-primary-900/70"
          aria-hidden
        />
      )}

      {/* Decorative gradient blobs */}
      <div
        className="absolute inset-0 opacity-80 mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(50rem 35rem at 10% 10%, rgba(37,99,235,0.5), transparent), radial-gradient(35rem 25rem at 90% 85%, rgba(245,158,11,0.3), transparent)",
        }}
        aria-hidden
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "2rem 2rem",
        }}
        aria-hidden
      />

      {/* Floating decorative elements */}
      <div
        className="absolute left-[10%] top-[15%] h-64 w-64 animate-float rounded-full bg-primary-600/10 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute bottom-[10%] right-[5%] h-48 w-48 animate-float rounded-full bg-accent-500/10 blur-3xl"
        style={{ animationDelay: "-3s" }}
        aria-hidden
      />
      <div
        className="absolute right-[30%] top-[60%] h-32 w-32 animate-float rounded-full bg-primary-400/8 blur-2xl"
        style={{ animationDelay: "-1.5s" }}
        aria-hidden
      />

      <Container className="relative py-32 lg:py-44">
        <div className="flex max-w-3xl flex-col gap-8">
          {data.badge && (
            <div
              className="animate-[fade-up_0.6s_ease-out_both]"
              style={{ animationDelay: "0.1s" }}
            >
              <Badge tone="solid" className="gap-2">
                <span
                  className="h-2 w-2 animate-[pulse-dot_2s_ease-in-out_infinite] rounded-full bg-accent-400"
                  aria-hidden
                />
                {data.badge}
              </Badge>
            </div>
          )}

          <h1
            className="animate-[fade-up_0.6s_ease-out_both] font-heading text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.2s" }}
          >
            {data.title}{" "}
            {data.highlight && (
              <span
                className="text-accent-400"
                style={{
                  textShadow: "0 0 40px rgba(251,191,36,0.3)",
                }}
              >
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
                  icon={
                    b.icon ? <span aria-hidden>{b.icon}</span> : undefined
                  }
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
