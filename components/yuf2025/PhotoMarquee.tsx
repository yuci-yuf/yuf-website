"use client";

import { useState } from "react";
import { Lightbox, type GalleryImage } from "./Lightbox";

/**
 * A full-bleed, infinitely auto-scrolling film strip of photos. Rows can run in
 * opposite directions (`reverse`) and different speeds. Click any frame to open
 * the lightbox. Pauses on hover.
 */
export function PhotoMarquee({
  images,
  reverse = false,
  duration = 64,
  heightClass = "h-52 sm:h-64 lg:h-72",
}: {
  images: GalleryImage[];
  reverse?: boolean;
  duration?: number;
  heightClass?: string;
}) {
  const [idx, setIdx] = useState<number | null>(null);
  const loop = [...images, ...images];

  return (
    <div className="group relative overflow-hidden">
      <div
        className="flex w-max gap-3 group-hover:[animation-play-state:paused] sm:gap-4"
        style={{
          animationName: "marquee",
          animationDuration: `${duration}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {loop.map((img, i) => (
          <button
            key={i}
            onClick={() => setIdx(i % images.length)}
            aria-label={`View ${img.alt}`}
            className={`group/frame relative ${heightClass} shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 transition-shadow duration-300 hover:ring-highlight-400/60`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="h-full w-auto max-w-none object-cover transition-transform duration-500 group-hover/frame:scale-105"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover/frame:opacity-100"
            />
          </button>
        ))}
      </div>

      <Lightbox
        images={images}
        index={idx}
        onClose={() => setIdx(null)}
        onStep={(d) =>
          setIdx((i) => (i === null ? i : (i + d + images.length) % images.length))
        }
      />
    </div>
  );
}
