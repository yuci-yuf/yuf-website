import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote, Sparkles, Eye, Heart, Music, Cpu, Trophy, GraduationCap } from "lucide-react";
import { aboutContent, siteConfig } from "@/lib/content";

const ACTIVITY_ICONS = [Music, Cpu, Trophy, GraduationCap];
import { Container } from "@/components/ui/Container";
import { HeroBackdrop } from "@/components/public/HeroBackdrop";
import { IndiaMapImage } from "@/components/public/IndiaMapImage";
import { FadeUp, FadeIn, StaggerContainer, StaggerItem, ScaleIn } from "@/components/home/MotionWrapper";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Youth United Council of India (YUCI) — our mission, what we do, and how YUF empowers the next generation of leaders, innovators, and changemakers.",
};

export default function AboutPage() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          1. HERO — Editorial 3-column layout (reference match)
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-primary-950 pb-12 pt-20 lg:pb-20 lg:pt-24">
        <HeroBackdrop />
        <Container className="relative z-30">
          {/* ── Top row: ABOUT + tagline ── */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-4 lg:mb-10 lg:pl-1">
            <FadeUp>
              <h1 className="font-heading text-[2.75rem] font-black uppercase leading-[0.85] tracking-tighter text-white sm:text-[5rem] md:text-[7.5rem] lg:text-[10rem]">
                About
              </h1>
            </FadeUp>

            <FadeUp delay={0.12} className="hidden max-w-sm flex-col items-start gap-4 pb-3 lg:flex">
              {/* <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-400 backdrop-blur-sm">
                {aboutContent.hero.badge}
              </span> */}
              <p className="font-heading text-2xl font-bold leading-snug text-white">
                {aboutContent.about.subhead}
              </p>
              <p className="text-sm leading-relaxed text-white/85">
                A nationwide movement by the Youth United Council of India,
                empowering young changemakers to lead, innovate, and inspire.
              </p>
            </FadeUp>
          </div>

          {/* ── Bottom row: US | Large Image | Small Image + Text ── */}
          <div className="grid grid-cols-1 items-stretch gap-x-10 gap-y-6 sm:gap-y-8 lg:grid-cols-[max-content_1fr_minmax(300px,0.4fr)]">

            {/* Left Column */}
            <div className="flex flex-col">
              <FadeUp delay={0.05}>
                <h1 className="font-heading text-[2.75rem] font-black uppercase leading-[0.85] tracking-tighter text-white sm:text-[5rem] md:text-[7.5rem] lg:text-[10rem]">
                  Us
                </h1>
              </FadeUp>

              <div className="mt-6 flex flex-col gap-6 lg:pb-4 lg:pl-2">
                <FadeUp delay={0.15}>
                  <p className="max-w-full text-[13px] font-semibold leading-relaxed text-white sm:max-w-[200px]">
                    {aboutContent.hero.subtitle}
                  </p>
                </FadeUp>
                <FadeUp delay={0.2}>
                  <p className="max-w-full text-[13px] leading-relaxed text-white/80 sm:max-w-[280px]">
                    At Youth United Council of India (YUCI), we believe in the limitless potential of young people. As a nonprofit organization, we empower youth worldwide by fostering inclusivity, nurturing talent, and creating impactful platforms like the Youth United Festival (YUF) that inspire leadership, creativity, and positive change.
                  </p>
                </FadeUp>
              </div>
            </div>

            {/* Center Column */}
<FadeUp delay={0.1} className="h-full">
  <div className="relative h-[190px] w-full overflow-hidden rounded-2xl ring-1 ring-white/10 sm:h-[280px] sm:rounded-[2.5rem] lg:h-[390px]">
    <Image
      src="/images/hero/pondicherry-event.jpg"
      alt="Youth United Festival"
      fill
      priority
      sizes="(min-width: 1024px) 50vw, 90vw"
      className="object-cover"
    />
  </div>
</FadeUp>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              <FadeUp delay={0.2}>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl ring-1 ring-white/10 sm:rounded-[2.5rem] lg:aspect-[2/1] xl:aspect-4/3">
                  <Image
                    src="/images/hero/pondicherry-community.jpg"
                    alt="YUCI Community"
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </FadeUp>

              <div className="flex flex-col gap-3 lg:pb-4">
                <FadeUp delay={0.25} className="flex flex-col gap-3">
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Our Philosophy
                  </h2>
                  <p className="text-[14px] leading-relaxed text-white/90">
                    &ldquo;We strive to inspire active youth participation and encourage meaningful conversations across a wide range of fields—from performing arts to innovation.&rdquo;
                  </p>
                </FadeUp>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. WHO WE ARE — Split text + quote
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-surface-alt py-16 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:gap-16 lg:grid-cols-2">
            <FadeUp className="flex flex-col gap-6">
              <span className="w-fit text-sm font-bold uppercase tracking-[0.2em] text-highlight-600">
                {aboutContent.about.label}
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-heading sm:text-4xl lg:text-[2.75rem]">
                {aboutContent.about.title}
              </h2>
              <p className="text-lg font-semibold text-primary-700">
                {aboutContent.about.subhead}
              </p>
              {aboutContent.about.body.map((p, i) => (
                <p key={i} className="text-[16px] leading-relaxed text-body">
                  {p}
                </p>
              ))}
            </FadeUp>

            {/* Right — image */}
            <FadeUp delay={0.15} className="relative">
              <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-md">
                <Image
                  src="/images/sections/who-we-are-team.jpg"
                  alt="YUCI Team"
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
              </div>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2.5 BELIEF — Pill collage + statement
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-hero-gradient relative overflow-hidden py-16 lg:py-24">
        {/* Decorative organic blobs */}
        <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-festival-cyan/25 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-10 right-1/3 h-40 w-40 rounded-full bg-festival-purple/25 blur-2xl" aria-hidden />

        <Container>
          <div className="grid items-center gap-10 lg:gap-16 lg:grid-cols-2">
            {/* Left — statement */}
            <FadeUp className="flex flex-col gap-6">
              <span className="w-fit text-sm font-bold uppercase tracking-[0.2em] text-highlight-400">
                Our Belief
              </span>
              <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                Change begins where
                <br className="hidden sm:block" /> youth find their voice
              </h2>
              <p className="max-w-md text-[16px] leading-relaxed text-white/85">
                Every young person carries a spark to transform their community.
                At YUF, we provide the stage, the mentorship, and the
                opportunities that turn that spark into lasting impact — across
                arts, sport, science, and service.
              </p>
              <Link
                href="/register"
                className="group mt-2 inline-flex h-13 w-fit items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-primary-700 shadow-md transition-all hover:bg-primary-50 hover:shadow-lg"
              >
                Join the Movement
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </FadeUp>

            {/* Right — India map filled with event imagery */}
            <FadeUp delay={0.15} className="relative">
              {/* scattered accent dots */}
              <span className="absolute left-4 top-4 h-3 w-3 rounded-full bg-accent-400" aria-hidden />
              <span className="absolute right-12 top-10 h-2.5 w-2.5 rounded-full bg-primary-400" aria-hidden />
              <span className="absolute bottom-10 left-8 h-2 w-2 rounded-full bg-accent-500" aria-hidden />
              <span className="absolute bottom-16 right-6 h-3 w-3 rounded-full bg-primary-300" aria-hidden />

              <IndiaMapImage
                src="/images/about/youth-event.jpg"
                label="YUF youth across India"
                className="mx-auto h-[300px] w-full max-w-sm text-white/90 drop-shadow-xl sm:h-[400px] sm:max-w-md lg:h-[500px] lg:max-w-lg"
              />
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3. MISSION — Vision & Values cards
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 lg:py-24">
        <Container>
          <div className="grid items-center gap-10 lg:gap-16 lg:grid-cols-2">
            <FadeUp className="flex flex-col gap-6">
              <span className="w-fit text-sm font-bold uppercase tracking-[0.2em] text-highlight-600">
                {aboutContent.mission.label}
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
                {aboutContent.mission.title}
              </h2>
              {aboutContent.mission.body.map((p, i) => (
                <p key={i} className="text-[16px] leading-relaxed text-body">
                  {p}
                </p>
              ))}
            </FadeUp>

            <StaggerContainer stagger={0.12} className="grid gap-6 sm:grid-cols-2">
              {aboutContent.mission.cards.map((card) => {
                return (
                  <StaggerItem key={card.title}>
                    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <h3 className="font-heading text-lg font-bold text-heading">
                        {card.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-body">
                        {card.description}
                      </p>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          4. LEADERSHIP — Principal Advisor + National General Secretary
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-hero-gradient relative overflow-hidden py-16 lg:py-24">
        <Container>
          <FadeUp className="mb-12 text-center lg:mb-16">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-highlight-400">
              Leadership
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Meet Our Leaders
            </h2>
          </FadeUp>

          <div className="mx-auto flex max-w-4xl flex-col gap-14">
            {/* Principal Advisor */}
            <div className="grid items-center gap-8 lg:gap-12 lg:grid-cols-[auto_1fr]">
              <ScaleIn>
                <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-3xl shadow-md lg:h-64 lg:w-64">
                  <Image
                    src={siteConfig.advisor.image!}
                    alt={siteConfig.advisor.name}
                    fill
                    sizes="256px"
                    className="object-cover"
                  />
                </div>
              </ScaleIn>

              <FadeUp delay={0.15} className="flex flex-col gap-5 text-center lg:text-left">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-white">
                    {siteConfig.advisor.name}
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    {siteConfig.advisor.title}
                  </p>
                  <span className="mt-2 inline-block text-xs font-bold uppercase tracking-[0.18em] text-highlight-400">
                    {siteConfig.advisor.badge}
                  </span>
                </div>
                <blockquote className="rounded-2xl border-l-4 border-primary-500 bg-white p-6 shadow-sm">
                  <Quote size={20} className="mb-2 text-primary-400" />
                  <p className="text-[15px] italic leading-relaxed text-body">
                    &ldquo;{siteConfig.advisor.quote}&rdquo;
                  </p>
                </blockquote>
              </FadeUp>
            </div>

            <div className="border-t border-white/10" />

            {/* National General Secretary */}
            <div className="grid items-center gap-8 lg:gap-12 lg:grid-cols-[auto_1fr]">
              <ScaleIn>
                <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-3xl shadow-md lg:h-64 lg:w-64">
                  <Image
                    src="/images/vimal.jpeg"
                    alt="Vimal Rengasamy"
                    fill
                    sizes="256px"
                    className="object-cover object-top"
                  />
                </div>
              </ScaleIn>

              <FadeUp delay={0.15} className="flex flex-col gap-5 text-center lg:text-left">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-white">
                    Vimal Rengasamy
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    National General Secretary, Youth United Council of India
                  </p>
                  <span className="mt-2 inline-block text-xs font-bold uppercase tracking-[0.18em] text-highlight-400">
                    Founder · Since 2017 &nbsp;·&nbsp; UN Representation · 28+ States
                  </span>
                </div>
                <blockquote className="rounded-2xl border-l-4 border-primary-500 bg-white p-6 shadow-sm">
                  <Quote size={20} className="mb-2 text-primary-400" />
                  <p className="text-[15px] italic leading-relaxed text-body">
                    &ldquo;Youth are the future of India. I am committed to working towards a powerful, self-reliant India by empowering students and young leaders across every state. Through YUCI, we build leadership, skill, and nation-first mindset in the next generation.&rdquo;
                  </p>
                </blockquote>
              </FadeUp>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          5. WHAT WE DO — Activity cards (4-col)
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 lg:py-24">
        <Container>
          <FadeUp className="mb-10 flex flex-col items-center gap-4 text-center lg:mb-14">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-highlight-600">
              {aboutContent.activities.label}
            </span>
            <h2 className="max-w-lg font-display text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
              {aboutContent.activities.title}
            </h2>
            <p className="max-w-xl text-[16px] leading-relaxed text-body">
              {aboutContent.activities.subtitle}
            </p>
          </FadeUp>

          <StaggerContainer stagger={0.08} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aboutContent.activities.cards.map((card, i) => {
              const Icon = ACTIVITY_ICONS[i % ACTIVITY_ICONS.length];
              return (
                <StaggerItem key={card.title} className="h-full">
                  <div className="group flex h-full flex-col gap-4 rounded-3xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-md">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-500 transition-colors group-hover:bg-primary-100">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-heading text-base font-bold text-heading">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-body">
                      {card.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          6. WHY JOIN US — 3-col benefit cards
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-hero-gradient relative overflow-hidden py-16 lg:py-24">
        <Container>
          <FadeUp className="mb-10 flex flex-col items-center gap-4 text-center lg:mb-14">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-highlight-400">
              {aboutContent.whyJoinUs.label}
            </span>
            <h2 className="max-w-lg font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {aboutContent.whyJoinUs.title}
            </h2>
            <p className="max-w-xl text-[16px] leading-relaxed text-white/85">
              {aboutContent.whyJoinUs.subtitle}
            </p>
          </FadeUp>

          <StaggerContainer stagger={0.1} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Sparkles size={22} />, ...aboutContent.whyJoinUs.cards[0] },
              { icon: <Eye size={22} />, ...aboutContent.whyJoinUs.cards[1] },
              { icon: <Heart size={22} />, ...aboutContent.whyJoinUs.cards[2] },
            ].map((card) => (
              <StaggerItem key={card.title} className="h-full">
                <div className="group flex h-full flex-col gap-4 rounded-3xl border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
                    {card.icon}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-heading">
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
          7. IMPACT — Stats + text
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 lg:py-24">
        <Container>
          <div className="grid items-center gap-10 lg:gap-16 lg:grid-cols-2">
            {/* Left — impact text + image */}
            <FadeUp className="flex flex-col gap-6">
              <span className="w-fit text-sm font-bold uppercase tracking-[0.2em] text-highlight-600">
                {aboutContent.impact.label}
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
                {aboutContent.impact.title}
              </h2>
              {aboutContent.impact.body.map((p, i) => (
                <p key={i} className="text-[16px] leading-relaxed text-body">
                  {p}
                </p>
              ))}

              {/* Image collage */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
                  <Image
                    src="/images/recognition/award_1.jpg"
                    alt="YUCI Award Ceremony"
                    fill
                    sizes="(min-width:1024px) 20vw, 45vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
                  <Image
                    src="/images/sections/join-us.jpg"
                    alt="Join YUF"
                    fill
                    sizes="(min-width:1024px) 20vw, 45vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </FadeUp>

            {/* Right — stats card */}
            <FadeUp delay={0.15}>
              <div className="grid grid-cols-2 gap-6">
                {aboutContent.impact.stats.map((stat) => {
                  return (
                    <div
                      key={stat.label}
                      className="flex flex-col gap-3 rounded-3xl border border-border bg-white p-7 shadow-sm"
                    >
                      <span className="font-display text-3xl font-extrabold text-heading">
                        {stat.number}
                        <span className="text-primary-500">{stat.suffix}</span>
                      </span>
                      <span className="text-sm text-text-muted">{stat.label}</span>
                    </div>
                  );
                })}
              </div>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          8. CTA — Premium register banner
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white pb-16 pt-4 lg:pb-24">
        <Container>
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary-600 via-primary-500 to-primary-700 px-8 py-16 sm:px-14 lg:px-20">
              {/* Decorative shapes */}
              <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" aria-hidden />
              <div className="absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-primary-400/20 blur-3xl" aria-hidden />

              <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
                <div className="max-w-xl">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/70">
                    {aboutContent.ctaBanner.label}
                  </p>
                  <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                    {aboutContent.ctaBanner.title}
                  </h2>
                  <p className="mt-4 text-[16px] leading-relaxed text-white/80">
                    {aboutContent.ctaBanner.body}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="group inline-flex h-13 items-center gap-2 rounded-full bg-white px-8 text-[15px] font-semibold text-primary-700 shadow-md transition-all hover:bg-primary-50"
                  >
                    Register Now
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/events"
                    className="inline-flex h-13 items-center gap-2 rounded-full border border-white/30 px-8 text-[15px] font-semibold text-white transition-all hover:bg-white/10"
                  >
                    Explore Events
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
