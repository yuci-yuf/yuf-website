"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* Auto-sliding carousel — every slide shares the large 16:9 frame. */
export function RecognitionCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const count = images.length;

  const goTo = (next: number, direction: number) => {
    setDir(direction);
    setIndex((next + count) % count);
  };

  useEffect(() => {
    if (count <= 1) return;
    const t = window.setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % count);
    }, 4000);
    return () => window.clearInterval(t);
  }, [count]);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5 sm:aspect-[5/4]">
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ x: dir >= 0 ? "100%" : "-100%", opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: dir >= 0 ? "-100%" : "100%", opacity: 0.5 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={images[index]}
            alt={`Recognition award ${index + 1}`}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Arrow controls — transparent */}
      <button
        onClick={() => goTo(index - 1, -1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-transparent text-white/90 transition hover:bg-white/15 [filter:drop-shadow(0_1px_4px_rgba(0,0,0,0.55))]"
      >
        <ChevronLeft size={26} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => goTo(index + 1, 1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-transparent text-white/90 transition hover:bg-white/15 [filter:drop-shadow(0_1px_4px_rgba(0,0,0,0.55))]"
      >
        <ChevronRight size={26} strokeWidth={2.5} />
      </button>
    </div>
  );
}
