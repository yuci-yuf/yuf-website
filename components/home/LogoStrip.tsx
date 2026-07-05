import type { Partner } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "./MotionWrapper";
import { FestiveGlows } from "./FestiveAccents";

export function LogoStrip({ partners }: { partners: Partner[] }) {
  // Duplicate the set so the -50% translate loop is seamless on every viewport.
  const loop = [...partners, ...partners];

  return (
    <FadeIn>
      <section className="relative overflow-hidden border-y border-gray-100 bg-white py-12 sm:py-14">
        <FestiveGlows />
        <Container className="relative">
          <p className="mb-8 flex items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Trusted by Leading Partners
          </p>
        </Container>

        {/* Infinite scrolling marquee (all viewports) */}
        <div className="group relative overflow-hidden">
          {/* Edge fade masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-24" />

          <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-x-14 pr-14 group-hover:[animation-play-state:paused] sm:gap-x-24 sm:pr-24">
            {loop.map((partner, i) => (
              <div key={`${partner.name}-${i}`} className="flex shrink-0 items-center">
                {partner.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="h-12 w-auto max-w-[180px] object-contain transition-transform duration-300 hover:scale-105 sm:h-16"
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
