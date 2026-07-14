"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const IMAGES = [
  {
    src: "/images/recognition/award_4.jpg",
    alt: "Noble Appreciation from Raj Bhavan, Hyderabad — Sri Jishnu Dev Varma, Governor of Telangana",
  },
  {
    src: "/images/recognition/award_3.jpg",
    alt: "Noble Appreciation from Raj Bhavan, Puducherry — Shri K. Kailashnathan, Lieutenant Governor of Puducherry",
  },
];

export function RajBhavanCarousel() {
  const [index, setIndex] = useState(0);
  const count = IMAGES.length;

  const next = useCallback(
    () => setIndex((i) => (i + 1) % count),
    [count],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count],
  );

  // Auto-advance every 5 seconds
  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      {/* Image */}
      <div className="relative w-full">
        <Image
          src={IMAGES[index].src}
          alt={IMAGES[index].alt}
          width={800}
          height={600}
          className="w-full h-auto transition-opacity duration-500"
          priority
        />
      </div>

      {/* Prev / Next arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous image"
        className="absolute left-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-surface/80 text-text-muted shadow-card backdrop-blur-sm transition-colors hover:bg-surface hover:text-heading"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next image"
        className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-surface/80 text-text-muted shadow-card backdrop-blur-sm transition-colors hover:bg-surface hover:text-heading"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 py-4">
        {IMAGES.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show image ${i + 1}`}
            aria-current={i === index}
            className={
              i === index
                ? "h-2.5 w-6 rounded-full bg-heading transition-all"
                : "h-2.5 w-2.5 rounded-full bg-text-muted/40 transition-all hover:bg-text-muted/70"
            }
          />
        ))}
      </div>
    </div>
  );
}
