import type { CTABanner as CTABannerData } from "@/types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function CTABanner({ data }: { data: CTABannerData }) {
  return (
    <section className="relative overflow-hidden bg-primary-800 py-20">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(50rem 30rem at 10% 0%, rgba(29,78,216,0.7), transparent), radial-gradient(40rem 30rem at 100% 100%, rgba(245,158,11,0.4), transparent)",
        }}
        aria-hidden
      />
      <Container className="relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent-400">
            {data.label}
          </span>
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            {data.title}
          </h2>
          <p className="text-base leading-relaxed text-primary-100">{data.body}</p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {data.buttons.map((b) => (
              <Button
                key={b.label}
                href={b.href}
                size="lg"
                variant={b.variant === "outline" ? "outline" : "secondary"}
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
        </div>
      </Container>
    </section>
  );
}
