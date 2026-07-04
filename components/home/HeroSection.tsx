"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Users, Map, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { AnimatedStat } from "./AnimatedStat";

interface HeroSectionProps {
  title: string;
  highlight: string;
  subtitle: string;
  stats: { number: string; label: string }[];
  marqueeItems: string[];
}

/* Real youth-event photos used for the diamond tiles flanking the headline. */
const DIAMONDS_LEFT = [
  { src: "/images/hero/pondicherry-event.jpg", className: "left-[2%] top-[20%] h-44 w-44 lg:h-56 lg:w-56", delay: 0 },
  { src: "/images/about/youth-yoga.jpg", className: "left-[12%] top-[50%] h-40 w-40 lg:h-48 lg:w-48", delay: 0.8 },
  { src: "/images/hero/IMG-20250924-WA0003.jpg", className: "left-[1%] bottom-[8%] h-36 w-36 lg:h-44 lg:w-44", delay: 1.4 },
];
const DIAMONDS_RIGHT = [
  { src: "/images/hero/pondicherry-community.jpg", className: "right-[2%] top-[16%] h-44 w-44 lg:h-56 lg:w-56", delay: 0.4 },
  { src: "/images/about/youth-event.jpg", className: "right-[12%] top-[48%] h-40 w-40 lg:h-48 lg:w-48", delay: 1.1 },
  { src: "/images/hero/events.jpg", className: "right-[1%] bottom-[8%] h-36 w-36 lg:h-44 lg:w-44", delay: 1.7 },
];

/* Icon + supporting line for each stat card (matched to the reference). */
const STAT_META = [
  { Icon: Users, desc: "Young talents from every corner of India" },
  { Icon: Map, desc: "States represented across the festival" },
  { Icon: MapPin, desc: "Districts joining the celebration" },
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
      <div className="h-full w-full">
        <div className="relative h-full w-full -rotate-45 scale-[1.5]">
          <Image src={src} alt="" fill sizes="400px" quality={90} className="object-cover" />
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
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden pt-20 sm:pt-24">
      {/* ── Background photo (YUF 2025 participants) ── */}
      <Image
        src="/images/hero/group-2025.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 z-0 object-cover"
      />

      {/* ── Gradient wash over the photo: blue → cyan → purple ── */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 opacity-75"
        style={{
          background:
            "radial-gradient(110% 90% at 18% 22%, rgba(89,31,172,0.6) 0%, transparent 50%), radial-gradient(100% 90% at 88% 78%, rgba(89,31,172,0.5) 0%, transparent 48%), linear-gradient(125deg, #133a8c 0%, #155fa6 38%, #15938f 58%, #1d5fbf 100%)",
        }}
      />

      {/* ── Decorative gradient arrows (framing the hero) — desktop only ── */}
      <div aria-hidden className="absolute inset-0 z-10 hidden overflow-hidden sm:block">
        {/* Left side — pointing right */}
        <ArrowShape id="arw-l1" from="#ff8a2a" to="#7c4ddb" className="-left-6 top-[8%] h-72 w-48 opacity-90" />
        <ArrowShape id="arw-l2" from="#27e0d2" to="#1e6fd6" className="left-[14%] top-[44%] h-56 w-36 opacity-70" />
        <ArrowShape id="arw-l3" from="#7c4ddb" to="#c026d3" className="-left-4 bottom-[2%] h-64 w-40 opacity-80" />
        {/* Right side — pointing left (mirrored) */}
        <ArrowShape id="arw-r1" from="#27e0d2" to="#1e6fd6" className="-right-6 top-[6%] h-72 w-48 opacity-90" flip />
        <ArrowShape id="arw-r2" from="#ff8a2a" to="#7c4ddb" className="right-[14%] top-[42%] h-56 w-36 opacity-70" flip />
        <ArrowShape id="arw-r3" from="#7c4ddb" to="#c026d3" className="-right-4 bottom-[2%] h-64 w-40 opacity-80" flip />
      </div>

      {/* ── Flowing ribbons (orange & purple) — desktop only ── */}
      <div aria-hidden className="absolute inset-0 z-10 hidden overflow-hidden sm:block">
        {/* Left */}
        <Ribbon id="rib-l1" from="#ff8a2a" to="#ff5e8a" className="-left-8 bottom-[24%] h-24 w-80 rotate-[18deg] opacity-80" />
        <Ribbon id="rib-l2" from="#7c4ddb" to="#a855f7" className="left-[4%] bottom-[12%] h-20 w-72 rotate-[10deg] opacity-70" />
        {/* Right */}
        <Ribbon id="rib-r1" from="#7c4ddb" to="#c026d3" className="-right-8 top-[24%] h-24 w-80 rotate-[18deg] opacity-80" flip />
        <Ribbon id="rib-r2" from="#ff8a2a" to="#ff5e8a" className="right-[4%] top-[14%] h-20 w-72 rotate-[10deg] opacity-70" flip />
      </div>

      {/* ── Confetti dots — desktop only (reads as noise on phones) ── */}
      <div aria-hidden className="absolute inset-0 z-10 hidden sm:block">
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

      {/* ── Mobile-only decoration (desktop uses the arrows/ribbons + lg diamonds) ── */}
      <div aria-hidden className="absolute inset-0 z-10 overflow-hidden sm:hidden">
        {/* Soft colour orbs for ambient depth */}
        <div className="animate-float-slow absolute -left-16 top-8 h-52 w-52 rounded-full bg-festival-purple/40 blur-3xl" />
        <div className="animate-float absolute -right-16 top-1/3 h-52 w-52 rounded-full bg-festival-orange/25 blur-3xl" />
        <div className="animate-float-slow absolute -left-12 bottom-24 h-48 w-48 rounded-full bg-festival-cyan/35 blur-3xl" />

        {/* A couple of festive dots in the mid-side gaps */}
        <span className="animate-float absolute left-4 top-1/2 h-2 w-2 rounded-full bg-highlight-400" style={{ opacity: 0.85 }} />
        <span className="animate-float absolute right-5 top-[46%] h-1.5 w-1.5 rounded-full bg-white" style={{ opacity: 0.75, animationDelay: "0.8s" }} />
      </div>

      {/* ── Centred content ── */}
      <Container className="relative z-30 flex w-full flex-1 items-center">
        <div className="flex w-full flex-col items-center justify-center gap-4 px-2 py-4 text-center sm:gap-5 sm:py-5">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(8,43,61,0.4)] sm:text-6xl lg:text-[5rem]"
          >
            Youth United Festival<br /><span className="text-highlight-400">{highlight}</span>
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
            className="flex justify-center pt-1"
          >
            <Link
              href="/register"
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-8 text-[15px] font-semibold text-primary-700 shadow-xl shadow-black/20 transition-all hover:bg-white/90"
            >
              Register Now
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Glass stat cards */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="mt-2 grid w-full max-w-3xl grid-cols-3 gap-2.5 sm:mt-3 sm:gap-4"
          >
            {stats.map((stat, i) => {
              const { Icon, desc } = STAT_META[i] ?? STAT_META[0];
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/20 bg-white/12 p-3 text-center shadow-xl shadow-primary-950/20 backdrop-blur-md sm:p-5 sm:text-left"
                >
                  <div className="flex items-start justify-center sm:justify-between">
                    <AnimatedStat
                      value={stat.number}
                      className="font-display text-2xl font-extrabold text-white sm:text-3xl"
                    />
                    <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white sm:flex">
                      <Icon size={16} />
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-white sm:mt-1 sm:text-base">
                    {stat.label}
                  </p>
                  <p className="mt-1 hidden text-xs leading-relaxed text-white/70 sm:block">
                    {desc}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </Container>

      {/* ── Event-name marquee ── */}
      <div className="relative z-30 w-full overflow-hidden border-t border-white/15 bg-primary-950/30 py-3.5 backdrop-blur-sm">
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
