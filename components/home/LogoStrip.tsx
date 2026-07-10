import type { Partner } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "./MotionWrapper";
import { FestiveGlows } from "./FestiveAccents";

export function LogoStrip({ partners }: { partners: Partner[] }) {
  return (
    <FadeIn>
      <section className="relative overflow-hidden border-y border-gray-100 bg-white py-12 sm:py-14">
        <FestiveGlows />
        <Container className="relative">
          <p className="mb-8 flex items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Trusted by Leading Partners
          </p>

          {/* Static, centered logo row */}
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8 sm:gap-x-20">
            {partners.map((partner) => (
              <div key={partner.name} className="flex items-center">
                {partner.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className={
                      partner.prominent
                        ? "h-24 w-auto max-w-[240px] object-contain transition-transform duration-300 hover:scale-105 sm:h-28"
                        : "h-16 w-auto max-w-[220px] object-contain transition-transform duration-300 hover:scale-105 sm:h-20"
                    }
                  />
                ) : (
                  <span className="whitespace-nowrap text-sm font-medium text-gray-500">
                    {partner.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </FadeIn>
  );
}
