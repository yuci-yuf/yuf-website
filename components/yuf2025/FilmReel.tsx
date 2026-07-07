"use client";

import { useState } from "react";
import { Lightbox, type GalleryImage } from "./Lightbox";
import { cn } from "@/lib/utils";

/* A row of light sprocket holes along the top/bottom edge of the celluloid. */
function SprocketBar({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 z-20 h-6",
        position === "top" ? "top-0" : "bottom-0",
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle, #bfe0ee 0 3.5px, transparent 4.5px)",
        backgroundSize: "26px 100%",
        backgroundPosition: "center",
      }}
    />
  );
}

/* One film frame in the gate: photo, frame number, hover lift. */
function Frame({
  image,
  n,
  onOpen,
}: {
  image: GalleryImage;
  n: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${image.alt}`}
      className="group/frame relative aspect-[3/2] h-72 shrink-0 overflow-hidden rounded-[4px] bg-black ring-1 ring-white/12 sm:h-96 lg:h-[30rem]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover/frame:scale-105"
      />
      <span className="absolute left-2 top-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-white/70">
        {String(n).padStart(2, "0")}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950/55 to-transparent opacity-0 transition-opacity duration-300 group-hover/frame:opacity-100"
      />
    </button>
  );
}

/**
 * A cinematic horizontal "film reel" of festival photos that auto-scrolls like
 * a marquee (pauses on hover). The image set is duplicated so the -50% loop is
 * seamless. Tap any frame for the full-size lightbox.
 */
export function FilmReel({ images }: { images: GalleryImage[] }) {
  const [idx, setIdx] = useState<number | null>(null);

  const step = (d: 1 | -1) =>
    setIdx((i) => (i === null ? i : (i + d + images.length) % images.length));

  // Duplicate the set so the marquee loops seamlessly at translateX(-50%).
  const loop = [...images, ...images];

  return (
    <>
      {/* Auto-scrolling film strip */}
      <div className="group relative overflow-hidden bg-[#0a131b] shadow-2xl shadow-primary-950/30">
        <SprocketBar position="top" />
        <SprocketBar position="bottom" />
        <div className="flex w-max animate-[marquee_60s_linear_infinite] items-center gap-4 px-6 py-10 group-hover:[animation-play-state:paused]">
          {loop.map((im, i) => (
            <Frame
              key={`${im.src}-${i}`}
              image={im}
              n={(i % images.length) + 1}
              onOpen={() => setIdx(i % images.length)}
            />
          ))}
        </div>
      </div>

      <Lightbox
        images={images}
        index={idx}
        onClose={() => setIdx(null)}
        onStep={step}
      />
    </>
  );
}
