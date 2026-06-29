import type { Partner } from "@/types";
import { FadeIn } from "./MotionWrapper";

export function LogoStrip({ partners }: { partners: Partner[] }) {
  return (
    <FadeIn>
      <section className="border-y border-gray-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Trusted by Leading Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
            {partners.map((partner) => (
              <div key={partner.name} className="flex shrink-0 items-center">
                {partner.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="h-10 w-auto max-w-[140px] object-contain opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-300 transition-colors hover:text-gray-600">
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
