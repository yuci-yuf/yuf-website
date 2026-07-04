import type { Partner } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "./MotionWrapper";

export function LogoStrip({ partners }: { partners: Partner[] }) {
  return (
    <FadeIn>
      <section className="border-y border-gray-100 bg-white py-12 sm:py-14">
        <Container>
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Trusted by Leading Partners
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 sm:gap-x-24">
            {partners.map((partner) => (
              <div key={partner.name} className="flex items-center">
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
        </Container>
      </section>
    </FadeIn>
  );
}
