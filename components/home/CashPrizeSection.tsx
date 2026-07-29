"use client";

import Link from "next/link";
import { Trophy, MapPin, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeUp, ScaleIn } from "@/components/home/MotionWrapper";
import { FestiveGlows, ConfettiDots } from "@/components/home/FestiveAccents";

export function CashPrizeSection() {
  return (
    <section className="bg-hero-gradient relative overflow-hidden py-16 sm:py-24 lg:py-28 text-white">
      {/* Brand festive decorative background accents */}
      <FestiveGlows />
      <ConfettiDots />

      <Container className="relative z-10">
        {/* Header */}
        <FadeUp className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
            Win <span className="text-highlight-400">₹5,000</span> Cash Prize Each
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-white/90 sm:text-xl font-medium max-w-2xl mx-auto">
            Exciting rewards await the brightest minds! Compete in our flagship competitions and win a cash prize of{" "}
            <span className="font-bold text-highlight-400">₹5,000</span> for the winner in each event.
          </p>
        </FadeUp>

        {/* Stacked Cards */}
        <div className="mt-14 flex flex-col gap-10 sm:mt-18 sm:gap-12">

          {/* ──── CARD 1: National Level Youth Hackathon ──── */}
          {/* Text on Left | Cash Prize & CTA on Right */}
          <ScaleIn delay={0.1}>
            <div className="group relative overflow-hidden rounded-3xl border border-[#96d7ec] bg-[#bde8f5] p-8 sm:p-12 lg:p-14 shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              {/* Brand top accent bar */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary-500 via-primary-600 to-highlight-500"
              />

              <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                {/* Left: Info */}
                <div className="flex flex-col gap-5">
                  <h3 className="font-display text-3xl font-black text-heading sm:text-4xl lg:text-5xl leading-tight">
                    National Level Youth Hackathon
                  </h3>

                  <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-primary-300/80 bg-white/85 px-4 py-2 text-sm sm:text-base font-semibold text-primary-950 shadow-xs backdrop-blur-sm">
                    <MapPin size={18} className="shrink-0 text-primary-600" />
                    <span>Easwari Engineering College, Ramapuram</span>
                  </div>

                  <p className="mt-1 text-lg leading-relaxed text-slate-800 sm:text-xl font-medium">
                    Build futuristic tech solutions, solve real-world challenges, and pitch your innovation to industry experts!
                  </p>
                </div>

                {/* Right: Cash Prize & CTA (Seamless, no inner card box) */}
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-highlight-500 text-white shadow-md">
                    <Trophy size={32} />
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-black uppercase tracking-widest text-primary-950/80">
                      Winner Cash Prize
                    </span>
                    <span className="font-display text-5xl sm:text-6xl font-black text-highlight-600 drop-shadow-xs">
                      ₹5,000
                    </span>
                    <span className="text-xs font-bold text-primary-950">
                      Awarded to 1st Place Winner
                    </span>
                  </div>

                  <Link
                    href="/events/national-level-youth-hackathon"
                    className="group/btn mt-1 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-primary-600 px-8 py-4 text-base font-extrabold text-white shadow-md transition-all hover:bg-primary-700 hover:shadow-lg sm:w-auto"
                  >
                    <span>View Event &amp; Register</span>
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover/btn:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </ScaleIn>

          {/* ──── CARD 2: India's Young Scientist ──── */}
          {/* Mirrored: Cash Prize & CTA on Left | Text on Right */}
          <ScaleIn delay={0.2}>
            <div className="group relative overflow-hidden rounded-3xl border border-[#96d7ec] bg-[#bde8f5] p-8 sm:p-12 lg:p-14 shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              {/* Brand top accent bar */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-highlight-500 via-primary-600 to-primary-500"
              />

              <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
                {/* Left (Desktop) / Second (Mobile): Cash Prize & CTA */}
                <div className="order-2 lg:order-1 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-highlight-500 text-white shadow-md">
                    <Trophy size={32} />
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-black uppercase tracking-widest text-primary-950/80">
                      Winner Cash Prize
                    </span>
                    <span className="font-display text-5xl sm:text-6xl font-black text-highlight-600 drop-shadow-xs">
                      ₹5,000
                    </span>
                    <span className="text-xs font-bold text-primary-950">
                      Awarded to 1st Place Winner
                    </span>
                  </div>

                  <Link
                    href="/events/indias-young-scientist"
                    className="group/btn mt-1 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-primary-600 px-8 py-4 text-base font-extrabold text-white shadow-md transition-all hover:bg-primary-700 hover:shadow-lg sm:w-auto"
                  >
                    <span>View Event &amp; Register</span>
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover/btn:translate-x-1"
                    />
                  </Link>
                </div>

                {/* Right (Desktop) / First (Mobile): Info */}
                <div className="order-1 lg:order-2 flex flex-col gap-5">
                  <h3 className="font-display text-3xl font-black text-heading sm:text-4xl lg:text-5xl leading-tight">
                    India&apos;s Young Scientist
                  </h3>

                  <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-primary-300/80 bg-white/85 px-4 py-2 text-sm sm:text-base font-semibold text-primary-950 shadow-xs backdrop-blur-sm">
                    <MapPin size={18} className="shrink-0 text-primary-600" />
                    <span>Easwari Engineering College, Ramapuram</span>
                  </div>

                  <p className="mt-1 text-lg leading-relaxed text-slate-800 sm:text-xl font-medium">
                    Unleash your scientific curiosity, present groundbreaking research, and inspire the next generation of innovators!
                  </p>
                </div>
              </div>
            </div>
          </ScaleIn>

        </div>
      </Container>
    </section>
  );
}
