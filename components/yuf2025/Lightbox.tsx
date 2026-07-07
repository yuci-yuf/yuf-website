"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface GalleryImage {
  src: string;
  alt: string;
}

/** Full-screen, keyboard-navigable image viewer. Controlled via `index`. */
export function Lightbox({
  images,
  index,
  onClose,
  onStep,
}: {
  images: GalleryImage[];
  index: number | null;
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}) {
  useEffect(() => {
    if (index === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onClose, onStep]);

  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-[#05070d]/95 p-4 backdrop-blur-md sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStep(-1);
            }}
            aria-label="Previous"
            className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft size={26} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStep(1);
            }}
            aria-label="Next"
            className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
          >
            <ChevronRight size={26} />
          </button>

          <motion.figure
            key={index}
            className="flex max-h-full max-w-6xl flex-col items-center gap-3"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[index].src}
              alt={images[index].alt}
              className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
            />
            <figcaption className="text-center text-xs uppercase tracking-[0.2em] text-white/50">
              {index + 1} / {images.length}
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
