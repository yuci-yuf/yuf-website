"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeUp } from "./MotionWrapper";
import { FestiveEyebrow, ConfettiDots } from "./FestiveAccents";

// Mosaic span pattern, applied to the uploaded photos by position so the
// admin-managed gallery keeps the same editorial layout. Photos beyond the
// pattern fall back to a regular single cell.
const SPANS = [
  "col-span-2 row-span-2",
  "",
  "",
  "",
  "",
  "col-span-2",
  "col-span-2",
];

export function GalleryMosaic({
  photos,
}: {
  photos: { src: string; alt: string }[];
}) {
  if (photos.length === 0) return null;

  const galleryImages = photos.map((p, i) => ({
    ...p,
    span: SPANS[i] ?? "",
  }));

  return (
    <section className="relative overflow-hidden bg-slate-50/60 py-16 sm:py-24 lg:py-32">
      <ConfettiDots />
      <Container className="relative">
        <FadeUp className="mb-14 flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <FestiveEyebrow className="w-fit">Gallery</FestiveEyebrow>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
              Moments Worth Capturing
            </h2>
          </div>
          <Link
            href="/gallery"
            className="group hidden items-center gap-1.5 text-sm font-semibold text-festival-blue transition-colors hover:text-festival-blue-dark sm:inline-flex"
          >
            View Full Gallery
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </FadeUp>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:grid-rows-2">
          {galleryImages.map((img, i) => {
            // Wide/large tiles (col-span-2) render at ~half the grid, so tell
            // next/image their true size — otherwise it serves a source sized
            // for a small cell and the browser upscales it (blurry).
            const isWide = img.span.includes("col-span-2");
            const sizes = isWide
              ? "(min-width: 1024px) 50vw, 100vw"
              : "(min-width: 1024px) 25vw, 50vw";
            return (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl shadow-card ring-1 ring-white/70 ${img.span}`}
            >
              <div className="relative aspect-[4/3] h-full w-full">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes={sizes}
                  quality={90}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-festival-purple/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-festival-blue"
          >
            View Full Gallery <ArrowRight size={15} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
