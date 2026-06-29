"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";

interface HeroSectionProps {
  title: string;
  highlight: string;
  subtitle: string;
  stats: { number: string; label: string }[];
  marqueeItems: string[];
}

// Dense photo wall behind the dark blanket — drawn from the site's image library.
const COLLAGE = [
  "/images/events/event-1.png",
  "/images/recognition/award_1.jpg",
  "/images/hero/home.jpg",
  "/images/events/event-2.png",
  "/images/sections/who-we-are.jpg",
  "/images/recognition/award_2.jpg",
  "/images/events/event-3.png",
  "/images/hero/events.jpg",
  "/images/recognition/backup/award_1.jpg",
  "/images/events/event-4.png",
  "/images/advisor/advisor.jpg",
  "/images/recognition/award_3.jpg",
  "/images/events/event-5.png",
  "/images/hero/about.jpg",
  "/images/recognition/backup/award_2.jpg",
  "/images/events/event-6.png",
  "/images/sections/join-us.jpg",
  "/images/recognition/award_4.jpg",
  "/images/events/event-7.png",
  "/images/hero/register.jpg",
  "/images/recognition/backup/award_3.png",
  "/images/events/event-8.png",
  "/images/gallery/pondicherry-juniors.jpg",
  "/images/recognition/backup/award_4.jpg",
  "/images/events/event-9.png",
  "/images/hero/contact.jpg",
  "/images/recognition/award_1.jpg",
  "/images/events/event-1.png",
  "/images/sections/who-we-are.jpg",
  "/images/events/event-4.png",
];

export function HeroSection({
  title,
  highlight,
  subtitle,
  stats,
  marqueeItems,
}: HeroSectionProps) {
  const loop = [...marqueeItems, ...marqueeItems];

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-primary-950">
      {/* ── 1 · Photo collage ── */}
      <motion.div
        aria-hidden
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        <div className="grid h-full w-full auto-rows-fr grid-cols-3 sm:grid-cols-5 lg:grid-cols-6">
          {COLLAGE.map((src, i) => (
            <div key={i} className="relative">
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width:1024px) 17vw, (min-width:640px) 20vw, 34vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── 2 · Dark blue blanket ── */}
      <div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,43,61,0.88) 0%, rgba(15,71,95,0.74) 46%, rgba(8,43,61,0.94) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(120% 78% at 50% 34%, rgba(31,168,215,0.22) 0%, transparent 62%)",
        }}
      />

      {/* ── 3 · Centred wordings ── */}
      <Container className="relative z-30 h-full">
        <div className="flex h-full flex-col items-center justify-center gap-5 px-2 pb-24 pt-24 text-center sm:gap-6 sm:pb-28 sm:pt-28">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[5.25rem]"
          >
            {title}
            <br />
            <span className="bg-gradient-to-r from-accent-400 via-primary-300 to-accent-400 bg-clip-text text-transparent">
              {highlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="max-w-3xl text-balance text-lg font-medium leading-relaxed text-primary-50 sm:text-xl"
            style={{ textShadow: "0 2px 16px rgba(8,43,61,0.65)" }}
          >
            {subtitle}
          </motion.p>

          {/* Stats — glassmorphic horizontal card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 shadow-xl shadow-primary-950/30 ring-1 ring-inset ring-white/5 backdrop-blur-md sm:gap-x-8 sm:px-7"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-2.5">
                <span className="font-heading text-2xl font-bold text-white">
                  {stat.number}
                </span>
                <span className="text-sm text-primary-100">{stat.label}</span>
                {i < stats.length - 1 && (
                  <span className="ml-3 hidden h-8 w-px bg-white/20 sm:block" aria-hidden />
                )}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.6 }}
            className="flex w-full max-w-sm flex-col items-stretch justify-center gap-3 pt-1 sm:max-w-none sm:flex-row sm:items-center sm:gap-4"
          >
            <Link
              href="/events"
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-accent-500 px-7 text-[15px] font-semibold text-primary-950 shadow-lg shadow-accent-500/20 transition-all hover:bg-accent-400"
            >
              Browse Events
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/about"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 text-[15px] font-semibold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/10"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </Container>

      {/* ── 5 · Event-name marquee ── */}
      <div className="absolute inset-x-0 bottom-0 z-30 overflow-hidden border-t border-white/10 bg-primary-950/45 py-3.5 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-primary-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-primary-950 to-transparent" />
        <div className="flex w-max animate-[marquee_30s_linear_infinite] items-center gap-10 pr-10">
          {loop.map((item, i) => (
            <div key={i} className="flex items-center gap-10 whitespace-nowrap">
              <span className="font-heading text-sm font-semibold uppercase tracking-[0.18em] text-primary-100">
                {item}
              </span>
              <Star size={13} className="shrink-0 text-accent-400" fill="currentColor" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
