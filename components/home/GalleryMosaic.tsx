"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeUp } from "./MotionWrapper";

const galleryImages = [
  { src: "/images/recognition/award_1.jpg", alt: "YUCI Award Ceremony", span: "col-span-2 row-span-2" },
  { src: "/images/events/event-1.png", alt: "Acapella Competition", span: "" },
  { src: "/images/events/event-4.png", alt: "Creative Fashion Show", span: "" },
  { src: "/images/sections/join-us.jpg", alt: "Join YUF", span: "" },
  { src: "/images/recognition/award_2.jpg", alt: "Governor Award", span: "" },
  { src: "/images/events/event-5.png", alt: "Makeup & Saree Draping", span: "col-span-2" },
  { src: "/images/gallery/pondicherry-juniors.jpg", alt: "Youth United Festival for Juniors — Pondicherry 2025", span: "col-span-2" },
];

export function GalleryMosaic() {
  return (
    <section className="bg-slate-50/60 py-24 lg:py-32">
      <Container>
        <FadeUp className="mb-14 flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Gallery
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Moments Worth Capturing
            </h2>
          </div>
          <Link
            href="/gallery"
            className="hidden items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 sm:inline-flex"
          >
            View Full Gallery
            <ArrowRight size={15} />
          </Link>
        </FadeUp>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:grid-rows-2">
          {galleryImages.map((img, i) => (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl ${img.span}`}
            >
              <div className="relative aspect-[4/3] h-full w-full">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 20vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600"
          >
            View Full Gallery <ArrowRight size={15} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
