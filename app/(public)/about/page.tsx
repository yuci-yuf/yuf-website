import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Heart, Sparkles, Music, Cpu, Dumbbell, Mic, Users, Globe, MapPin, Trophy, Quote } from "lucide-react";
import { aboutContent, siteConfig } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { FadeUp, FadeIn, StaggerContainer, StaggerItem, ScaleIn } from "@/components/home/MotionWrapper";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Youth United Council of India (YUCI) — our mission, what we do, and how YUF empowers the next generation of leaders, innovators, and changemakers.",
};

/* ── Icon map for activity cards ── */
const activityIcons = [Music, Cpu, Dumbbell, Mic];
const whyJoinIcons = [Sparkles, Eye, Heart];

export default function AboutPage() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          1. HERO — Editorial 3-column layout (reference match)
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white pb-16 pt-28 lg:pb-24 lg:pt-36">
        <Container>
          {/* ── Top row: ABOUT ── */}
          <div className="mb-12 lg:mb-10 lg:pl-1">
  <FadeUp>
    <h1 className="font-heading text-[5rem] font-black uppercase leading-[0.85] tracking-tighter text-gray-900 sm:text-[7.5rem] lg:text-[10rem]">
      About
    </h1>
  </FadeUp>
</div>

          {/* ── Bottom row: US | Large Image | Small Image + Text ── */}
          <div className="grid grid-cols-1 items-stretch gap-x-10 gap-y-12 lg:grid-cols-[max-content_1fr_minmax(300px,0.4fr)]">
            
            {/* Left Column */}
            <div className="flex flex-col">
              <FadeUp delay={0.05}>
                <h1 className="font-heading text-[5rem] font-black uppercase leading-[0.85] tracking-tighter text-gray-900 sm:text-[7.5rem] lg:text-[10rem]">
                  Us
                </h1>
              </FadeUp>
              
              <div className="mt-8 flex flex-col gap-10 lg:mt-12 lg:pb-4 lg:pl-2">
                <FadeUp delay={0.15}>
                  <p className="max-w-[200px] text-[13px] font-semibold leading-relaxed text-gray-600">
                    {aboutContent.hero.subtitle}
                  </p>
                </FadeUp>
                <FadeUp delay={0.2}>
                  <p className="max-w-[250px] text-[13px] leading-relaxed text-gray-500">
                    {aboutContent.about.body[0]}
                  </p>
                </FadeUp>
              </div>
            </div>

            {/* Center Column */}
            <FadeUp delay={0.1} className="h-full">
              <div className="relative h-full min-h-[350px] w-full overflow-hidden rounded-[2.5rem] lg:min-h-[480px]">
                <Image
                  src="/images/hero/about.jpg"
                  alt="Youth United Festival"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 90vw"
                  className="object-cover"
                />
              </div>
            </FadeUp>

            {/* Right Column */}
            <div className="flex flex-col justify-between">
              <FadeUp delay={0.2}>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[2.5rem] lg:aspect-[2/1] xl:aspect-[4/3]">
                  <Image
                    src="/images/sections/who-we-are.jpg"
                    alt="YUCI Community"
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </FadeUp>
              
              <div className="mt-10 flex flex-col gap-3 lg:mt-0 lg:pb-4">
                <FadeUp delay={0.25} className="flex flex-col gap-3">
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Our Philosophy
                  </h2>
                  <p className="text-[14px] leading-relaxed text-gray-500">
                    "We strive to inspire active youth participation, spark creativity, and encourage meaningful conversations across a wide range of fields—from performing arts to technology and innovation. YUF cultivates a strong sense of community, unity, and personal growth that extends far beyond the meaningful connections, and continued collaboration."
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
      <section className="bg-slate-50/60 py-24 lg:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2">
            <FadeUp className="flex flex-col gap-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700">
                {aboutContent.about.label}
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem]">
                {aboutContent.about.title}
              </h2>
              <p className="text-lg font-semibold text-primary-700">
                {aboutContent.about.subhead}
              </p>
              {aboutContent.about.body.map((p, i) => (
                <p key={i} className="text-[16px] leading-relaxed text-gray-500">
                  {p}
                </p>
              ))}
            </FadeUp>

            {/* Right — image + floating badge */}
            <FadeUp delay={0.15} className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-md">
                <Image
                  src="/images/sections/who-we-are.jpg"
                  alt="YUCI Team"
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-lg lg:-left-8">
                <p className="font-heading text-3xl font-bold text-primary-600">10+</p>
                <p className="text-xs font-medium text-gray-400">Years of Excellence</p>
              </div>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3. MISSION — Vision & Values cards
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <FadeUp className="flex flex-col gap-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {aboutContent.mission.label}
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {aboutContent.mission.title}
              </h2>
              {aboutContent.mission.body.map((p, i) => (
                <p key={i} className="text-[16px] leading-relaxed text-gray-500">
                  {p}
                </p>
              ))}
            </FadeUp>

            <StaggerContainer stagger={0.12} className="grid gap-6 sm:grid-cols-2">
              {aboutContent.mission.cards.map((card, i) => {
                const Icon = i === 0 ? Eye : Heart;
                return (
                  <StaggerItem key={card.title}>
                    <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                        <Icon size={22} />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-gray-900">
                        {card.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-500">
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
          4. MEET THE PRINCIPAL — Advisor spotlight
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-slate-50/60 py-24 lg:py-32">
        <Container>
          <FadeUp className="mb-14 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Leadership
            </span>
            <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Meet The Principal Advisor
            </h2>
          </FadeUp>

          <div className="mx-auto grid max-w-4xl items-center gap-12 lg:grid-cols-[auto_1fr]">
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
                <h3 className="font-heading text-2xl font-bold text-gray-900">
                  {siteConfig.advisor.name}
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {siteConfig.advisor.title}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  {siteConfig.advisor.badge}
                </span>
              </div>

              <blockquote className="rounded-2xl border-l-4 border-primary-500 bg-white p-6 shadow-sm">
                <Quote size={20} className="mb-2 text-primary-400" />
                <p className="text-[15px] italic leading-relaxed text-gray-600">
                  &ldquo;{siteConfig.advisor.quote}&rdquo;
                </p>
              </blockquote>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════
          5. WHAT WE DO — Activity cards (4-col)
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <FadeUp className="mb-14 flex flex-col items-center gap-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {aboutContent.activities.label}
            </span>
            <h2 className="max-w-lg font-heading text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {aboutContent.activities.title}
            </h2>
            <p className="max-w-xl text-[16px] leading-relaxed text-gray-500">
              {aboutContent.activities.subtitle}
            </p>
          </FadeUp>

          <StaggerContainer stagger={0.08} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aboutContent.activities.cards.map((card, i) => {
              const Icon = activityIcons[i % activityIcons.length];
              return (
                <StaggerItem key={card.title}>
                  <div className="group flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-heading text-base font-bold text-gray-900">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-500">
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
      <section className="bg-slate-50/60 py-24 lg:py-32">
        <Container>
          <FadeUp className="mb-14 flex flex-col items-center gap-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {aboutContent.whyJoinUs.label}
            </span>
            <h2 className="max-w-lg font-heading text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {aboutContent.whyJoinUs.title}
            </h2>
            <p className="max-w-xl text-[16px] leading-relaxed text-gray-500">
              {aboutContent.whyJoinUs.subtitle}
            </p>
          </FadeUp>

          <StaggerContainer stagger={0.1} className="grid gap-6 sm:grid-cols-3">
            {aboutContent.whyJoinUs.cards.map((card, i) => {
              const Icon = whyJoinIcons[i % whyJoinIcons.length];
              return (
                <StaggerItem key={card.title}>
                  <div className="group flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-gray-900">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-500">
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
          7. IMPACT — Stats + text
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left — impact text + image */}
            <FadeUp className="flex flex-col gap-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {aboutContent.impact.label}
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {aboutContent.impact.title}
              </h2>
              {aboutContent.impact.body.map((p, i) => (
                <p key={i} className="text-[16px] leading-relaxed text-gray-500">
                  {p}
                </p>
              ))}

              {/* Image collage */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src="/images/recognition/award_1.jpg"
                    alt="YUCI Award Ceremony"
                    fill
                    sizes="(min-width:1024px) 20vw, 45vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
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
                  const icons = [Users, Globe, MapPin, Trophy];
                  const Icon = icons[aboutContent.impact.stats.indexOf(stat) % icons.length];
                  return (
                    <div
                      key={stat.label}
                      className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-7 shadow-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                        <Icon size={18} />
                      </div>
                      <span className="font-heading text-3xl font-bold text-gray-900">
                        {stat.number}
                        <span className="text-primary-500">{stat.suffix}</span>
                      </span>
                      <span className="text-sm text-gray-400">{stat.label}</span>
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
      <section className="bg-white pb-24 pt-8 lg:pb-32">
        <Container>
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 px-8 py-16 sm:px-14 lg:px-20">
              {/* Decorative shapes */}
              <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" aria-hidden />
              <div className="absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-primary-400/20 blur-3xl" aria-hidden />

              <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
                <div className="max-w-xl">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/70">
                    {aboutContent.ctaBanner.label}
                  </p>
                  <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
                    {aboutContent.ctaBanner.title}
                  </h2>
                  <p className="mt-4 text-[16px] leading-relaxed text-white/80">
                    {aboutContent.ctaBanner.body}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="group inline-flex h-13 items-center gap-2 rounded-full bg-white px-8 text-[15px] font-semibold text-primary-700 shadow-md transition-all hover:bg-gray-50"
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
