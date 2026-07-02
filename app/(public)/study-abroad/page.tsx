import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { studyAbroadContent, partners } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { HeroBackdrop } from "@/components/public/HeroBackdrop";
import { PartnerStrip } from "@/components/public/PartnerStrip";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/home/MotionWrapper";

export const metadata: Metadata = {
  title: "Study Abroad",
  description:
    "Free one-on-one counselling for higher secondary students with our esteemed international education partners — explore global universities, scholarships, and career pathways.",
};

const { hero, intro, benefits, partners: partnersCopy, cta } = studyAbroadContent;

export default function StudyAbroadPage() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          1. HERO
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-primary-950 pb-16 pt-20 lg:pb-24 lg:pt-28">
        <HeroBackdrop />
        <Container className="relative z-30">
          <div className="flex max-w-3xl flex-col gap-6">
            <FadeUp>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-400 backdrop-blur-sm">
                {hero.kicker}
              </span>
            </FadeUp>
            <FadeUp delay={0.08}>
              <h1 className="font-heading text-[2.75rem] font-black uppercase leading-[0.9] tracking-tighter text-white sm:text-[4.5rem] lg:text-[6rem]">
                {hero.title}
              </h1>
            </FadeUp>
            <FadeUp delay={0.16}>
              <p className="font-heading text-xl font-bold text-white sm:text-2xl">
                {hero.subtitle}
              </p>
            </FadeUp>
            <FadeUp delay={0.22}>
              <p className="max-w-2xl text-[15px] leading-relaxed text-white/85 sm:text-base">
                {hero.lead}
              </p>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. INTRO — Collaboration announcement
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 lg:py-24">
        <Container>
          <FadeUp className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-highlight-600">
              {intro.label}
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-heading sm:text-4xl">
              {intro.title}
            </h2>
            {intro.body.map((p, i) => (
              <p key={i} className="text-[16px] leading-relaxed text-body">
                {p}
              </p>
            ))}
          </FadeUp>

          <StaggerContainer
            stagger={0.1}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-4"
          >
            {intro.bullets.map((b) => (
              <StaggerItem key={b}>
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface-alt p-5">
                  <CheckCircle2
                    size={22}
                    className="mt-0.5 shrink-0 text-primary-500"
                  />
                  <p className="text-[15px] font-medium leading-relaxed text-body">
                    {b}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeUp
            delay={0.15}
            className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 text-center"
          >
            {intro.closing.map((p, i) => (
              <p key={i} className="text-[16px] leading-relaxed text-body">
                {p}
              </p>
            ))}
          </FadeUp>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3. BENEFITS — What students gain
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-hero-gradient relative overflow-hidden py-16 lg:py-24">
        <div
          className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-festival-cyan/25 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-10 right-1/4 h-40 w-40 rounded-full bg-festival-purple/25 blur-2xl"
          aria-hidden
        />
        <Container>
          <FadeUp className="mb-10 flex flex-col items-center gap-4 text-center lg:mb-14">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-highlight-400">
              {benefits.label}
            </span>
            <h2 className="max-w-lg font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {benefits.title}
            </h2>
            <p className="max-w-xl text-[16px] leading-relaxed text-white/85">
              {benefits.subtitle}
            </p>
          </FadeUp>

          <StaggerContainer
            stagger={0.08}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {benefits.cards.map((card) => (
              <StaggerItem key={card.title} className="h-full">
                <div className="group flex h-full flex-col gap-4 rounded-3xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-md">
                  <h3 className="font-heading text-base font-bold text-heading">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-body">
                    {card.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          4. PARTNERS — Marquee logo strip
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-surface py-16 lg:py-24">
        <Container>
          <FadeUp className="mb-10 flex max-w-2xl flex-col gap-4">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-highlight-600">
              {partnersCopy.label}
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-heading sm:text-4xl">
              {partnersCopy.title}
            </h2>
            <p className="text-[16px] leading-relaxed text-body">
              {partnersCopy.subtitle}
            </p>
          </FadeUp>
        </Container>
        <PartnerStrip partners={partners} />
      </section>

      {/* ═══════════════════════════════════════════════════════
          5. CTA — Register banner
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white pb-16 pt-4 lg:pb-24">
        <Container>
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary-600 via-primary-500 to-primary-700 px-8 py-16 sm:px-14 lg:px-20">
              <div
                className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"
                aria-hidden
              />
              <div
                className="absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-primary-400/20 blur-3xl"
                aria-hidden
              />

              <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
                <div className="max-w-xl">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/70">
                    {cta.label}
                  </p>
                  <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
                    {cta.title}
                  </h2>
                  <p className="mt-4 text-[16px] leading-relaxed text-white/80">
                    {cta.body}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="group inline-flex h-13 items-center gap-2 rounded-full bg-white px-8 text-[15px] font-semibold text-primary-700 shadow-md transition-all hover:bg-primary-50"
                  >
                    Register Now
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex h-13 items-center gap-2 rounded-full border border-white/30 px-8 text-[15px] font-semibold text-white transition-all hover:bg-white/10"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </Container>
      </section>
    </>
  );
}
