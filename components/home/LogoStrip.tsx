import type { Partner } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "./MotionWrapper";

export function LogoStrip({ partners }: { partners: Partner[] }) {
  // Duplicate the set so the -50% translate loop is seamless.
  const loop = [...partners, ...partners];

  return (
    <FadeIn>
      <section className="border-y border-gray-100 bg-white py-12 sm:py-14">
        <Container>
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Trusted by Leading Partners
          </p>
        </Container>

        <div className="group relative overflow-hidden">
          {/* Edge fade masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-28" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-28" />

          <div className="flex w-max animate-[marquee_45s_linear_infinite] items-center gap-x-20 pr-20 group-hover:[animation-play-state:paused] sm:gap-x-28 sm:pr-28">
            {loop.map((partner, i) => (
              <div key={`${partner.name}-${i}`} className="flex shrink-0 items-center">
                {partner.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="h-14 w-auto max-w-[210px] object-contain transition-transform duration-300 hover:scale-105 sm:h-20"
                  />
                ) : (
                  <span className="whitespace-nowrap text-sm font-medium text-gray-500">
                    {partner.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
