"use client";

import { useState } from "react";
import { Lightbox, type GalleryImage } from "./Lightbox";
import { cn } from "@/lib/utils";

/* Per-position aspect + vertical offset. On lg the grid is 4 columns, so index
   % 4 lands on a fixed column — giving each column its own height rhythm and a
   staggered vertical offset. Offsets only kick in at lg (clean grid on small
   screens). This reads as an editorial staggered grid, not a masonry wall. */
const ASPECTS = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[5/6]"];
const OFFSETS = ["", "lg:translate-y-10", "lg:translate-y-20", "lg:translate-y-6"];

export function StaggeredGallery({ images }: { images: GalleryImage[] }) {
  const [idx, setIdx] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => setIdx(i)}
            aria-label={`View ${img.alt}`}
            className={cn(
              "group relative block overflow-hidden rounded-2xl shadow-sm ring-1 ring-primary-900/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:ring-highlight-400/60",
              ASPECTS[i % ASPECTS.length],
              OFFSETS[i % OFFSETS.length],
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
    </>
  );
}
