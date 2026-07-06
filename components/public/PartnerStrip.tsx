import type { Partner } from "@/types";

export function PartnerStrip({ partners }: { partners: Partner[] }) {
  const loop = [...partners, ...partners];

  return (
    <div className="relative overflow-hidden">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-surface to-transparent" />

      <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-20 pr-20">
        {loop.map((partner, i) => (
          <div
            key={i}
            className="flex h-24 shrink-0 items-center justify-center"
          >
            {partner.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="max-h-20 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <span className="whitespace-nowrap text-lg font-semibold text-text-muted transition-colors hover:text-text">
                {partner.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
