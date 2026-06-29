import type { CTABanner as CTABannerData } from "@/types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function CTABanner({ data }: { data: CTABannerData }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 py-24 lg:py-28">
      {/* Radial accent glows */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(40rem 24rem at 10% 0%, rgba(29,78,216,0.5), transparent), radial-gradient(35rem 24rem at 95% 100%, rgba(245,158,11,0.3), transparent)",
        }}
        aria-hidden
      />

      {/* Floating decorative circles */}
      <div
        className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary-600/10 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl"
        aria-hidden
      />

      <Container className="relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-accent-400 backdrop-blur-sm ring-1 ring-white/10">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent-400"
              aria-hidden
            />
            {data.label}
          </span>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {data.title}
          </h2>
          <p className="text-lg leading-relaxed text-primary-100">
            {data.body}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {data.buttons.map((b) => (
              <Button
                key={b.label}
                href={b.href}
                size="lg"
                variant={b.variant === "outline" ? "outline" : "secondary"}
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
        </div>
      </Container>
    </section>
  );
}
