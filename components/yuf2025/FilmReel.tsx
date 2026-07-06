"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  heightClass,
  onOpen,
}: {
  image: GalleryImage;
  n: number;
  heightClass: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${image.alt}`}
      className={cn(
        "group relative aspect-[3/2] shrink-0 snap-center overflow-hidden rounded-[4px] bg-black ring-1 ring-white/12",
        heightClass,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <span className="absolute left-2 top-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-white/70">
        {String(n).padStart(2, "0")}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </button>
  );
}

/**
 * A cinematic horizontal "film reel" of festival photos. On desktop the strip
 * is pinned and pans sideways as you scroll down (driven by scroll progress);
 * on touch it degrades to a native swipeable strip. Tap any frame for the
 * full-size lightbox.
 */
export function FilmReel({ images }: { images: GalleryImage[] }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [idx, setIdx] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const hint = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  // Measure how far the strip must travel so the last frame ends on-screen.
  useEffect(() => {
    const measure = () => {
      if (stripRef.current) {
        setDistance(Math.max(0, stripRef.current.scrollWidth - window.innerWidth));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [images.length]);

  const step = (d: 1 | -1) =>
    setIdx((i) => (i === null ? i : (i + d + images.length) % images.length));

  return (
    <>
      {/* Desktop — scroll-driven, pinned film reel */}
      <div
        ref={targetRef}
        className="relative hidden md:block"
        style={{ height: `${images.length * 22 + 110}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <motion.div
            ref={stripRef}
            style={{ x }}
            className="relative flex h-[64vh] items-center gap-4 bg-[#0a131b] px-12 shadow-2xl shadow-primary-950/30"
          >
            <SprocketBar position="top" />
            <SprocketBar position="bottom" />
            {images.map((im, i) => (
              <Frame
                key={im.src}
                image={im}
                n={i + 1}
                heightClass="h-[48vh]"
                onOpen={() => setIdx(i)}
              />
            ))}
          </motion.div>

          {/* Reel label (kept clear of the fixed navbar) */}
          <div className="pointer-events-none absolute left-6 top-24 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-heading/50">
            <span className="h-2 w-2 rounded-full bg-highlight-500" />
            Festival Reel · 2025
          </div>

          {/* Scroll hint (fades once you start) */}
          <motion.div
            style={{ opacity: hint }}
            className="pointer-events-none absolute bottom-14 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-[0.3em] text-heading/50"
          >
            Scroll to advance →
          </motion.div>

          {/* Progress bar */}
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="absolute bottom-8 left-0 h-[3px] w-full origin-left bg-highlight-500"
          />
        </div>
      </div>

      {/* Mobile — swipeable film strip */}
      <div className="relative bg-[#0a131b] md:hidden">
        <SprocketBar position="top" />
        <SprocketBar position="bottom" />
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-9">
          {images.map((im, i) => (
            <Frame
              key={im.src}
              image={im}
              n={i + 1}
              heightClass="h-[42vh]"
              onOpen={() => setIdx(i)}
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
