import type { Partner } from "@/types";

export function PartnerStrip({ partners }: { partners: Partner[] }) {
  const loop = [...partners, ...partners];

  return (
    <div className="relative overflow-hidden">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-surface to-transparent" />

      <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-6 pr-6">
        {loop.map((partner, i) => (
          <div
            key={i}
            className="flex h-20 w-40 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-alt px-6 text-sm font-semibold text-text-muted"
          >
            {partner.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="max-h-12 w-auto object-contain"
              />
            ) : (
              partner.name
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
