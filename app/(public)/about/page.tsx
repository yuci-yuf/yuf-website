import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote, Sparkles, Eye, Heart, Music, Cpu, Trophy, GraduationCap } from "lucide-react";
import { aboutContent, siteConfig } from "@/lib/content";

const ACTIVITY_ICONS = [Music, Cpu, Trophy, GraduationCap];
const ACTIVITY_CARD_GRADIENTS = [
  "from-festival-blue-dark to-festival-cyan",
  "from-festival-purple to-festival-magenta",
  "from-festival-cyan to-festival-blue",
  "from-festival-magenta to-festival-purple",
];
import { Container } from "@/components/ui/Container";
import { HeroBackdrop } from "@/components/public/HeroBackdrop";
import { TypingHeadline } from "@/components/public/TypingHeadline";
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
          1. HERO — Centred cinematic statement
          ═══════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[85svh] items-center overflow-hidden bg-primary-950">
        <HeroBackdrop />

        {/* Inset frame accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-4 z-20 rounded-3xl border border-white/10 sm:inset-6 lg:inset-8"
        />

        <Container className="relative z-30 py-28 text-center lg:py-32">
          <div className="mx-auto flex w-full flex-col items-center">
            <TypingHeadline
              text="“United Youth Will Unite Nation”"
              className="bg-gradient-to-r from-[#FF9933] via-white to-[#86efac] bg-clip-text font-display text-4xl font-black leading-[1.12] tracking-tight text-transparent sm:text-5xl lg:text-[2.8rem] lg:whitespace-nowrap xl:text-[3.6rem] 2xl:text-[4.3rem]"
              caretClassName=""
            />

            <FadeUp delay={0.4}>
              <p className="mx-auto mt-8 max-w-3xl text-xl font-medium leading-relaxed text-white/90 sm:text-2xl">
                A nationwide movement by the Youth United Council of India,
                empowering young changemakers to lead, innovate, and inspire.
              </p>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. WHO WE ARE — Split text + quote
          ═══════════════════════════════════════════════════════ */}
      <section id="who-we-are" className="scroll-mt-24 bg-surface-alt py-16 lg:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6">
            {/* Title — first on mobile, top-left on desktop */}
            <FadeUp className="order-1 lg:col-start-1 lg:row-start-1 lg:self-end">
              <h2 className="font-display text-4xl font-extrabold tracking-tight text-heading sm:text-5xl lg:text-[3rem]">
                {aboutContent.about.title}
              </h2>
            </FadeUp>

            {/* Image — between title and paragraph on mobile; right column on desktop */}
            <FadeUp
              delay={0.15}
              className="order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
            >
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

            {/* Body — below the image on mobile, under the title on desktop */}
            <FadeUp className="order-3 flex flex-col gap-6 lg:col-start-1 lg:row-start-2 lg:self-start">
              {aboutContent.about.body.map((p, i) => (
                <p key={i} className="text-lg leading-relaxed text-body sm:text-xl">
                  {p}
                </p>
              ))}
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
            {/* Statement — right column on lg */}
            <FadeUp className="flex flex-col gap-6 lg:order-2">
              <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                Change begins where
                <br className="hidden sm:block" /> youth find their voice
              </h2>
              <p className="max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">
                Every young person carries a spark to transform their community.
                At YUF, we provide the stage, the mentorship, and the
                opportunities that turn that spark into lasting impact — across
                arts, sport, science, and service.
              </p>
              {/* Desktop: CTA sits with the statement */}
              <Link
                href="/register"
                className="group mt-2 hidden h-13 w-fit items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-primary-700 shadow-md transition-all hover:bg-primary-50 hover:shadow-lg lg:inline-flex"
              >
                Join the Movement
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </FadeUp>

            {/* India map — left column on lg */}
            <FadeUp delay={0.15} className="relative lg:order-1">
              {/* scattered accent dots */}
              <span className="absolute left-4 top-4 h-3 w-3 rounded-full bg-accent-400" aria-hidden />
              <span className="absolute right-12 top-10 h-2.5 w-2.5 rounded-full bg-primary-400" aria-hidden />
              <span className="absolute bottom-10 left-8 h-2 w-2 rounded-full bg-accent-500" aria-hidden />
              <span className="absolute bottom-16 right-6 h-3 w-3 rounded-full bg-primary-300" aria-hidden />

              <IndiaMapImage
                src="/images/about/map1.jpeg"
                label="YUF youth across India"
                className="mx-auto h-[380px] w-full max-w-md sm:h-[500px] sm:max-w-lg lg:h-[620px] lg:max-w-xl"
              />
            </FadeUp>

            {/* Mobile: CTA moves below the image */}
            <FadeUp className="flex justify-center lg:hidden">
              <Link
                href="/register"
                className="group inline-flex h-13 w-fit items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-primary-700 shadow-md transition-all hover:bg-primary-50 hover:shadow-lg"
              >
                Join the Movement
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3. MISSION & VISION — big stacked headlines over a globe
             watermark, then Values + Philosophy cards
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-16 lg:py-24">
        <Container>
          {/* ── Mission + Vision, globe watermark behind ── */}
          <div className="relative">
            {/* Globe watermark — sits behind mission/vision only */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="relative aspect-square w-[min(88%,600px)] opacity-[0.09]">
                <Image
                  src="/yuci-globe.jpg"
                  alt=""
                  fill
                  sizes="600px"
                  className="object-contain"
                />
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-10 lg:gap-12">
              {/* Mission */}
              <FadeUp className="mx-auto max-w-4xl text-center">
                <h2 className="font-display text-5xl font-black leading-[0.92] tracking-tight text-heading sm:text-6xl lg:text-7xl">
                  Our{" "}
                  <span className="bg-gradient-to-r from-primary-600 to-festival-cyan bg-clip-text text-transparent">
                    Mission
                  </span>
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-body sm:text-xl">
                  {aboutContent.mission.body[0]}
                </p>
              </FadeUp>

              {/* Vision */}
              <FadeUp delay={0.1} className="mx-auto max-w-4xl text-center">
                <h2 className="font-display text-5xl font-black leading-[0.92] tracking-tight text-heading sm:text-6xl lg:text-7xl">
                  Our{" "}
                  <span className="bg-gradient-to-r from-festival-cyan to-primary-600 bg-clip-text text-transparent">
                    Vision
                  </span>
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-body sm:text-xl">
                  {aboutContent.mission.cards[0].description}
                </p>
              </FadeUp>
            </div>
          </div>

          {/* ── Values + Philosophy cards (no watermark) ── */}
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:mt-24">
            <FadeUp>
              <div className="h-full rounded-3xl border border-border bg-surface-alt p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-10">
                <h3 className="font-display text-2xl font-extrabold text-heading sm:text-3xl">
                  Our Values
                </h3>
                <p className="mt-4 text-base italic leading-relaxed text-body sm:text-lg">
                  &ldquo;{aboutContent.mission.cards[1].description}&rdquo;
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="h-full rounded-3xl border border-border bg-surface-alt p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-10">
                <h3 className="font-display text-2xl font-extrabold text-heading sm:text-3xl">
                  Our Philosophy
                </h3>
                <p className="mt-4 text-base italic leading-relaxed text-body sm:text-lg">
                  &ldquo;We strive to inspire active youth participation and
                  encourage meaningful conversations across a wide range of
                  fields—from performing arts to innovation.&rdquo;
                </p>
              </div>
            </FadeUp>
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
            <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Meet Our Leaders
            </h2>
          </FadeUp>

          <div className="mx-auto flex max-w-7xl flex-col gap-14 lg:gap-24">
            {/* Principal Advisor */}
            <div className="grid items-center gap-8 lg:gap-12 lg:grid-cols-[auto_1fr]">
              <ScaleIn>
                <div className="relative mx-auto h-72 w-72 overflow-hidden rounded-3xl shadow-md sm:h-80 sm:w-80 lg:h-[27rem] lg:w-[27rem]">
                  <Image
                    src={siteConfig.advisor.image!}
                    alt={siteConfig.advisor.name}
                    fill
                    sizes="432px"
                    className="object-cover"
                  />
                </div>
              </ScaleIn>

              <FadeUp delay={0.15} className="flex flex-col gap-5 text-center lg:text-left">
                <div>
                  <h3 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                    {siteConfig.advisor.name}
                  </h3>
                  <span className="mt-2 inline-block text-sm font-bold uppercase tracking-[0.18em] text-highlight-400">
                    {siteConfig.advisor.badge}
                  </span>
                  <p className="mt-2 text-base text-white/70 sm:text-lg">
                    {siteConfig.advisor.title}
                  </p>
                </div>
                <blockquote className="rounded-2xl border-l-4 border-primary-500 bg-white p-7 shadow-sm">
                  <Quote size={24} className="mb-2 text-primary-400" />
                  <p className="text-base italic leading-relaxed text-body sm:text-lg lg:text-xl">
                    &ldquo;{siteConfig.advisor.quote}&rdquo;
                  </p>
                </blockquote>
              </FadeUp>
            </div>

            <div className="border-t border-white/10" />

            {/* National General Secretary */}
            <div className="grid items-center gap-8 lg:gap-12 lg:grid-cols-[1fr_auto]">
              <ScaleIn className="lg:order-2">
                <div className="relative mx-auto h-72 w-72 overflow-hidden rounded-3xl shadow-md sm:h-80 sm:w-80 lg:h-[27rem] lg:w-[27rem]">
                  <Image
                    src="/images/vimal.jpeg"
                    alt="Vimal Rengasamy"
                    fill
                    sizes="432px"
                    className="object-cover object-top"
                  />
                </div>
              </ScaleIn>

              <FadeUp delay={0.15} className="flex flex-col gap-5 text-center lg:order-1 lg:text-left">
                <div>
                  <h3 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                    Vimal Rengasamy
                  </h3>
                  <p className="mt-1 text-base text-white/70 sm:text-lg">
                    National General Secretary, Youth United Council of India
                  </p>
                </div>
                <blockquote className="rounded-2xl border-l-4 border-primary-500 bg-white p-7 shadow-sm">
                  <Quote size={24} className="mb-2 text-primary-400" />
                  <p className="text-base italic leading-relaxed text-body sm:text-lg lg:text-xl">
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
            <h2 className="max-w-2xl font-display text-4xl font-extrabold tracking-tight text-heading sm:text-5xl lg:text-6xl">
              {aboutContent.activities.title}
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-body sm:text-xl">
              {aboutContent.activities.subtitle}
            </p>
          </FadeUp>

          <StaggerContainer stagger={0.08} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aboutContent.activities.cards.map((card, i) => {
              const Icon = ACTIVITY_ICONS[i % ACTIVITY_ICONS.length];
              const grad = ACTIVITY_CARD_GRADIENTS[i % ACTIVITY_CARD_GRADIENTS.length];
              return (
                <StaggerItem key={card.title} className="h-full">
                  <div className={`group flex h-full flex-col gap-4 rounded-3xl bg-gradient-to-br ${grad} p-7 text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl`}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white sm:text-xl">
                      {card.title}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-white/90">
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
                        {`${stat.number}${stat.suffix}`}
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
