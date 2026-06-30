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

/* Real youth-event photos used for the diamond tiles flanking the headline. */
const DIAMONDS_LEFT = [
  { src: "/images/hero/pondicherry-event.jpg", className: "left-[2%] top-[20%] h-32 w-32 lg:h-40 lg:w-40", delay: 0 },
  { src: "/images/about/youth-yoga.jpg", className: "left-[12%] top-[50%] h-28 w-28 lg:h-36 lg:w-36", delay: 0.8 },
  { src: "/images/gallery/pondicherry-juniors.jpg", className: "left-[1%] bottom-[8%] h-24 w-24 lg:h-32 lg:w-32", delay: 1.4 },
];
const DIAMONDS_RIGHT = [
  { src: "/images/hero/pondicherry-community.jpg", className: "right-[2%] top-[16%] h-32 w-32 lg:h-40 lg:w-40", delay: 0.4 },
  { src: "/images/about/youth-event.jpg", className: "right-[12%] top-[48%] h-28 w-28 lg:h-36 lg:w-36", delay: 1.1 },
  { src: "/images/recognition/award_1.jpg", className: "right-[1%] bottom-[8%] h-24 w-24 lg:h-32 lg:w-32", delay: 1.7 },
];

/* Supporting line for each stat card (matched to the reference). */
const STAT_META = [
  { desc: "Young talents from every corner of India" },
  { desc: "States represented across the festival" },
  { desc: "Districts joining the celebration" },
];

function DiamondTile({
  src,
  className,
  delay,
}: {
  src: string;
  className: string;
  delay: number;
}) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.6, rotate: 45 }}
      animate={{ opacity: 1, scale: 1, rotate: 45 }}
      transition={{ delay: 0.4 + delay * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute hidden overflow-hidden rounded-2xl shadow-2xl ring-2 ring-white/40 lg:block ${className}`}
    >
      <div className="animate-float h-full w-full" style={{ animationDelay: `${delay}s` }}>
        <div className="relative h-full w-full -rotate-45 scale-[1.5]">
          <Image src={src} alt="" fill sizes="180px" className="object-cover" />
        </div>
      </div>
    </motion.div>
  );
}

/* Bold filled ">" chevron arrow with a gradient — the signature framing
   shape from the reference. Set `flip` to mirror it into a "<". */
function ArrowShape({
  id,
  className,
  from,
  to,
  flip = false,
}: {
  id: string;
  className: string;
  from: string;
  to: string;
  flip?: boolean;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 120"
      className={`absolute ${flip ? "-scale-x-100" : ""} ${className}`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <path
        d="M4 8 L50 8 L96 60 L50 112 L4 112 L50 60 Z"
        fill={`url(#${id})`}
        stroke={`url(#${id})`}
        strokeWidth="10"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Flowing wavy ribbon band with a gradient fill. */
function Ribbon({
  id,
  className,
  from,
  to,
  flip = false,
}: {
  id: string;
  className: string;
  from: string;
  to: string;
  flip?: boolean;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 80"
      preserveAspectRatio="none"
      className={`absolute ${flip ? "-scale-x-100" : ""} ${className}`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <path
        d="M0 38 C60 2 120 78 240 26 L240 54 C120 104 60 28 0 66 Z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}

export function HeroSection({
  title,
  highlight,
  subtitle,
  stats,
  marqueeItems,
}: HeroSectionProps) {
  const loop = [...marqueeItems, ...marqueeItems];

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* ── Gradient base: blue → cyan → purple ── */}
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(110% 90% at 18% 22%, rgba(89,31,172,0.6) 0%, transparent 50%), radial-gradient(100% 90% at 88% 78%, rgba(89,31,172,0.5) 0%, transparent 48%), linear-gradient(125deg, #133a8c 0%, #155fa6 38%, #15938f 58%, #1d5fbf 100%)",
        }}
      />

      {/* ── Decorative gradient arrows (framing the hero) ── */}
      <div aria-hidden className="absolute inset-0 z-10 overflow-hidden">
        {/* Left side — pointing right */}
        <ArrowShape id="arw-l1" from="#ff8a2a" to="#7c4ddb" className="-left-6 top-[8%] h-72 w-48 opacity-90" />
        <ArrowShape id="arw-l2" from="#27e0d2" to="#1e6fd6" className="left-[14%] top-[44%] h-56 w-36 opacity-70" />
        <ArrowShape id="arw-l3" from="#7c4ddb" to="#c026d3" className="-left-4 bottom-[2%] h-64 w-40 opacity-80" />
        {/* Right side — pointing left (mirrored) */}
        <ArrowShape id="arw-r1" from="#27e0d2" to="#1e6fd6" className="-right-6 top-[6%] h-72 w-48 opacity-90" flip />
        <ArrowShape id="arw-r2" from="#ff8a2a" to="#7c4ddb" className="right-[14%] top-[42%] h-56 w-36 opacity-70" flip />
        <ArrowShape id="arw-r3" from="#7c4ddb" to="#c026d3" className="-right-4 bottom-[2%] h-64 w-40 opacity-80" flip />
      </div>

      {/* ── Flowing ribbons (orange & purple) ── */}
      <div aria-hidden className="absolute inset-0 z-10 overflow-hidden">
        {/* Left */}
        <Ribbon id="rib-l1" from="#ff8a2a" to="#ff5e8a" className="-left-8 bottom-[24%] h-24 w-80 rotate-[18deg] opacity-80" />
        <Ribbon id="rib-l2" from="#7c4ddb" to="#a855f7" className="left-[4%] bottom-[12%] h-20 w-72 rotate-[10deg] opacity-70" />
        {/* Right */}
        <Ribbon id="rib-r1" from="#7c4ddb" to="#c026d3" className="-right-8 top-[24%] h-24 w-80 rotate-[18deg] opacity-80" flip />
        <Ribbon id="rib-r2" from="#ff8a2a" to="#ff5e8a" className="right-[4%] top-[14%] h-20 w-72 rotate-[10deg] opacity-70" flip />
      </div>

      {/* ── Confetti dots ── */}
      <div aria-hidden className="absolute inset-0 z-10">
        {[
          "left-[20%] top-[18%] bg-highlight-500",
          "left-[30%] top-[70%] bg-festival-cyan",
          "left-[44%] top-[12%] bg-white",
          "right-[24%] top-[24%] bg-highlight-400",
          "right-[34%] top-[66%] bg-white",
          "right-[44%] top-[16%] bg-festival-cyan",
          "left-[18%] bottom-[20%] bg-white",
          "right-[20%] bottom-[24%] bg-highlight-500",
        ].map((c, i) => (
          <span
            key={i}
            className={`absolute h-2.5 w-2.5 animate-float rounded-full ${c}`}
            style={{ animationDelay: `${i * 0.6}s`, opacity: 0.85 }}
          />
        ))}
      </div>

      {/* ── Diamond photo tiles ── */}
      <div aria-hidden className="absolute inset-0 z-10">
        {[...DIAMONDS_LEFT, ...DIAMONDS_RIGHT].map((d) => (
          <DiamondTile key={d.src} {...d} />
        ))}
      </div>

      {/* ── Centred content ── */}
      <Container className="relative z-30 h-full">
        <div className="flex min-h-[100svh] flex-col items-center justify-center gap-6 px-2 pb-28 pt-28 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(8,43,61,0.4)] sm:text-6xl lg:text-[5.5rem]"
          >
            {title}{" "}
            <span className="text-highlight-400">{highlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="max-w-2xl text-balance text-lg font-medium leading-relaxed text-white/90"
            style={{ textShadow: "0 2px 16px rgba(8,43,61,0.5)" }}
          >
            {subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex w-full max-w-sm flex-col items-stretch justify-center gap-3 pt-1 sm:max-w-none sm:flex-row sm:items-center sm:gap-4"
          >
            <Link
              href="/register"
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-8 text-[15px] font-bold text-festival-blue shadow-xl shadow-primary-950/25 transition-all hover:bg-primary-50"
            >
              Register Now
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/events"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border-2 border-white bg-white/10 px-8 text-[15px] font-bold text-white backdrop-blur-sm transition-all hover:bg-white/25"
            >
              Browse Events
            </Link>
          </motion.div>

          {/* Glass stat cards */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="mt-6 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {stats.map((stat, i) => {
              const { desc } = STAT_META[i] ?? STAT_META[0];
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/20 bg-white/12 p-5 text-left shadow-xl shadow-primary-950/20 backdrop-blur-md"
                >
                  <span className="font-display text-3xl font-extrabold text-white">
                    {stat.number}
                  </span>
                  <p className="mt-1 font-semibold text-white">{stat.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">{desc}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </Container>

      {/* ── Event-name marquee ── */}
      <div className="absolute inset-x-0 bottom-0 z-30 overflow-hidden border-t border-white/15 bg-primary-950/30 py-3.5 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-primary-900/60 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-primary-900/60 to-transparent" />
        <div className="flex w-max animate-[marquee_30s_linear_infinite] items-center gap-10 pr-10">
          {loop.map((item, i) => (
            <div key={i} className="flex items-center gap-10 whitespace-nowrap">
              <span className="font-heading text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
                {item}
              </span>
              <Star size={13} className="shrink-0 text-highlight-400" fill="currentColor" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
