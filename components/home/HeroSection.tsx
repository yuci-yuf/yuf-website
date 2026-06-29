"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

interface HeroSectionProps {
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  heroImage: string;
  floatingImage: string;
  stats: { number: string; label: string }[];
}

export function HeroSection({
  badge,
  title,
  highlight,
  subtitle,
  heroImage,
  floatingImage,
  stats,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] overflow-hidden pt-8 lg:pt-0"
      style={{
        background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 40%, #fffbeb 100%)",
      }}
    >
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.18) 1.5px, transparent 1.5px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Blue glow — top right */}
      <div
        className="pointer-events-none absolute -right-40 -top-20 h-[650px] w-[650px] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)" }}
        aria-hidden
      />

      {/* Amber glow — bottom left */}
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)" }}
        aria-hidden
      />

      <Container className="relative flex min-h-[90vh] items-center pt-24 pb-16 lg:pt-28 lg:pb-20">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Left column — content */}
          <div className="flex flex-col gap-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2.5 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-600" />
                </span>
                {badge}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading text-[3.25rem] font-extrabold leading-[1.08] tracking-tight text-gray-900 sm:text-6xl lg:text-[4.25rem]"
            >
              {title}
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                {highlight}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="max-w-lg text-lg leading-relaxed text-gray-500"
            >
              {subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex flex-wrap items-center gap-4 pt-1"
            >
              <Link
                href="/events"
                className="group inline-flex h-13 items-center gap-2 rounded-full bg-primary-600 px-7 text-[15px] font-semibold text-white shadow-md transition-all hover:bg-primary-700 hover:shadow-lg"
              >
                Browse Events
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="/about"
                className="inline-flex h-13 items-center gap-2 rounded-full border border-gray-200 bg-white px-7 text-[15px] font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                Learn More
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap items-center gap-6 border-t border-gray-100 pt-7"
            >
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <span className="font-heading text-2xl font-bold text-gray-900">
                    {stat.number}
                  </span>
                  <span className="text-sm text-gray-400">{stat.label}</span>
                  {i < stats.length - 1 && (
                    <span
                      className="ml-3 h-8 w-px bg-gray-100"
                      aria-hidden
                    />
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column — creative image arrangement */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            {/* Decorative bg shape */}
            <div
              className="absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-br from-primary-50 via-blue-50/50 to-amber-50/30"
              aria-hidden
            />

            {/* Main image */}
<div className="relative w-full h-[550px] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
  <Image
    src={heroImage}
    alt="Youth United Festival"
    fill
    priority
    sizes="(min-width: 1024px) 40vw, 100vw"
    className="object-cover"
  />
</div>

            {/* Floating event card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute -bottom-6 -left-12 z-10 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl">
                  <Image
                    src={floatingImage}
                    alt="Event preview"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Youth United Festival
                  </p>
                  <p className="text-xs text-gray-400">
                    2026 · Multiple Cities
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating registration badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85, duration: 0.4 }}
              className="absolute -right-6 top-12 z-10 rounded-2xl border border-gray-100 bg-white px-5 py-3.5 shadow-xl"
            >
              <p className="text-xs font-medium text-gray-400">
                Registration
              </p>
              <p className="mt-0.5 text-lg font-bold text-primary-600">
                Open Now
              </p>
            </motion.div>

            {/* Floating secondary image thumbnail */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.5 }}
              className="absolute -left-8 top-1/3 z-10 h-24 w-24 overflow-hidden rounded-2xl border-2 border-white shadow-lg"
            >
              <Image
                src="/images/events/event-4.png"
                alt="Event highlight"
                fill
                sizes="96px"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
