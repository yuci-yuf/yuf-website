/**
 * Renders an image masked to the silhouette of India, with a faint themed
 * outline behind it. The silhouette is the union of all Indian states/UTs
 * (public/images/about/india-mask.svg, viewBox 612×696) — an accurate,
 * full-territory outline rather than a hand-traced approximation.
 *
 * The faint outline reuses the SAME mask, scaled up slightly and filled with
 * the current text colour, so it always matches the photo's shape exactly and
 * adapts to the surrounding theme.
 */

import Image from "next/image";

const MASK = "/images/about/india-mask.svg";

const MASK_STYLE: React.CSSProperties = {
  WebkitMaskImage: `url(${MASK})`,
  maskImage: `url(${MASK})`,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskPosition: "center",
  maskPosition: "center",
};

export function IndiaMapImage({
  src,
  label,
  className,
}: {
  src: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`relative aspect-[932/1000] ${className ?? ""}`}>
      {/* Faint India-shaped halo behind — a slightly larger silhouette filled
          with the current colour peeks out as a subtle outline. */}
      <div
        aria-hidden
        className="absolute inset-0 scale-[1.035] bg-current opacity-20"
        style={MASK_STYLE}
      />

      {/* Image filled into the India silhouette via CSS mask */}
      <div className="absolute inset-0" style={MASK_STYLE}>
        <Image
          src={src}
          alt={label ?? "Map of India"}
          fill
          sizes="(min-width: 1024px) 35vw, 90vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
