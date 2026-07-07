"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export interface GalleryImage {
  src: string;
  alt: string;
}

/**
 * Masonry photo gallery with a keyboard-navigable lightbox. Uses plain <img>
 * so arbitrary-aspect festival photos flow naturally in CSS columns.
 */
export function PhotoGallery({ images }: { images: GalleryImage[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setOpen((i) =>
        i === null ? i : (i + dir + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => setOpen(i)}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl ring-1 ring-white/10 sm:mb-4"
            aria-label={`View ${img.alt}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-primary-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-primary-700 shadow-lg">
                <ZoomIn size={18} />
              </span>
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-primary-950/95 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X size={22} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label="Previous"
              className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft size={26} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label="Next"
              className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
            >
              <ChevronRight size={26} />
            </button>

            <motion.figure
              key={open}
              className="flex max-h-full max-w-5xl flex-col items-center gap-3"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[open].src}
                alt={images[open].alt}
                className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
              />
              <figcaption className="text-center text-sm text-white/70">
                {images[open].alt} · {open + 1} / {images.length}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
