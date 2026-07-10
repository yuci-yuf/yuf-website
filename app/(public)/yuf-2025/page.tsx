import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Star, Trophy, Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeUp, ScaleIn } from "@/components/home/MotionWrapper";
import { ConfettiDots } from "@/components/home/FestiveAccents";
import { ScrollVideo } from "@/components/yuf2025/ScrollVideo";
import { FilmReel } from "@/components/yuf2025/FilmReel";
import type { GalleryImage } from "@/components/yuf2025/Lightbox";

// Elegant italic serif for the accents, scoped to this route.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});
const SERIF = "font-[family-name:var(--font-instrument)] italic";

export const metadata: Metadata = {
  title: "YUF 2025 — Event Highlights",
  description:
    "Relive the Youth United Festival 2025 — event highlights, the festival film, distinguished chief guests, and the crowning of champions. Every unforgettable moment in one place.",
};

const P = "/images/yuf2025";
const G = `${P}/gallery`;
const img = (n: number): GalleryImage => ({
  src: `${G}/g-${String(n).padStart(2, "0")}.jpg`,
  alt: `Youth United Festival 2025 — moment ${n}`,
});
const range = (a: number, b: number) =>
  Array.from({ length: b - a + 1 }, (_, i) => img(a + i));

/* Photos for the staggered highlights grid + focal / award selections drawn
   from the 71-frame gallery. */
const HIGHLIGHTS = range(1, 16);

/* Headline numbers from the 2025 edition, shown beside the highlights video. */
const HIGHLIGHT_STATS = [
  { value: "5K+", label: "Participants" },
  { value: "5+", label: "States" },
  { value: "100+", label: "Districts" },
  { value: "50+", label: "Events" },
];
/* The four champion photos with their true aspect ratios, so a justified
   gallery can show each one in full (no cropping) while still filling the row. */
const AWARDS = [
  {
    src: "/images/hero/award/championship-trophy.webp",
    alt: "Champions receiving the YUF 2025 championship trophy on stage",
    aspect: 1.228,
  },
  {
    src: "/images/hero/award/trophy-raised.webp",
    alt: "Winning team lifting the YUF 2025 trophy together",
    aspect: 1.55,
  },
  {
    src: "/images/hero/award/medalists-marigold.webp",
    alt: "Medal and certificate winners felicitated at the ceremony",
    aspect: 1.909,
  },
  {
    src: "/images/hero/award/medalists-lawn.webp",
    alt: "Award winners with their certificates and medals",
    aspect: 1.778,
  },
];

/* Highlighted chief guest — carries her own spotlight video. */
const SUKHEE = {
  name: "Prof. Sukhee Lee",
  role: "Advisor, International Affairs · Republic of Korea",
  quote:
    "The Youth United Festival creates meaningful opportunities for young people to connect across cultures and inspire positive change.",
  poster: "/images/testimonials/sukhee-lee.jpeg",
  video:
    "https://res.cloudinary.com/dudvem6ri/video/upload/q_auto,f_auto/v1783426595/yuf-website/videos/sukhee_lee_speech.mp4",
};

export default function Yuf2025Page() {
  return (
    <div className={instrumentSerif.variable}>
      {/* ═══════════ HERO — text left · logo right ═══════════ */}
      <section className="relative overflow-hidden bg-surface pt-28 pb-16 lg:pt-32 lg:pb-24">
        {/* Light brand wash */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 82% 22%, rgba(255,165,82,0.14) 0%, transparent 55%), radial-gradient(65% 65% at 14% 34%, rgba(100,209,236,0.30) 0%, transparent 60%), linear-gradient(180deg,#f5fbfd 0%,#e3f0f8 100%)",
          }}
        />
        <ConfettiDots />

        <Container className="relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            {/* LEFT — hero text */}
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <FadeUp>
                <h1 className="font-display font-black uppercase leading-[0.85] tracking-tight text-heading">
                  <span className="block text-5xl sm:text-6xl lg:text-7xl">
                    Youth United Festival
                  </span>
                  <span className="mt-2 block bg-gradient-to-r from-primary-500 via-festival-cyan to-highlight-500 bg-clip-text text-7xl text-transparent sm:text-8xl lg:text-[8.5rem]">
                    2025
                  </span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.16}>
                <p className="mx-auto mt-7 max-w-lg text-lg leading-relaxed text-body lg:mx-0">
                  A year of extraordinary talent, unity and celebration — every
                  unforgettable moment of the festival, gathered in one place.
                </p>
              </FadeUp>
            </div>

            {/* RIGHT — background-less YUF logo */}
            <FadeUp delay={0.12} className="order-1 lg:order-2">
              <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-lg">
                {/* Soft halo + offset colour blobs for atmosphere */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.75) 0%, rgba(157,224,239,0.35) 45%, transparent 70%)",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-6 -top-8 h-40 w-40 rounded-full bg-primary-300/40 blur-3xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-10 -right-4 h-44 w-44 rounded-full bg-highlight-400/30 blur-3xl"
                />
                <Image
                  src="/images/logo.png"
                  alt="Youth United Festival 2025"
                  width={1080}
                  height={540}
                  priority
                  className="animate-float relative w-full drop-shadow-[0_24px_50px_rgba(16,35,48,0.20)]"
                />
              </div>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* ═══════════ EVENT HIGHLIGHTS — two-part band + staggered grid ═══════════ */}
      <section
        id="highlights"
        className="bg-hero-gradient relative overflow-hidden scroll-mt-24 py-20 text-white lg:py-28"
      >
        {/* Ambient accent glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-highlight-500/25 blur-3xl"
        />
        <Container className="relative">
          <FadeUp>
            <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
                {/* LEFT — portrait scroll-play video (the anchor) */}
                <div className="order-first">
                  <ScrollVideo
                    src="https://res.cloudinary.com/dudvem6ri/video/upload/q_auto,f_auto/v1783423728/yuf-website/videos/events_montage.mp4"
                    poster={img(11).src}
                    label="YUF 2025 event film"
                    hasAudio={false}
                    className="mx-auto aspect-[9/16] w-full max-w-[340px] rounded-3xl shadow-2xl shadow-primary-950/40 ring-1 ring-white/20 sm:max-w-[400px] lg:mx-0 lg:max-w-[440px]"
                  />
                </div>

                {/* RIGHT — headline, blurb, recap stats, CTA */}
                <div>
                  <h2 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                    Event Highlights
                  </h2>
                  <p className="mt-4 max-w-5xl text-lg leading-relaxed text-white/80 lg:text-xl">
                    From the roar of the arena to the spotlight of the stage,
                    Youth United Festival 2025 brought young talent together to
                    compete, perform and celebrate. Relive the standout moments —
                    the performances, the champions and the memories that made
                    the year unforgettable.
                  </p>

                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-highlight-400">
                    By the numbers
                  </p>
                  {/* Recap stats — full-width bar with dividers */}
                  <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-7 border-y border-white/15 py-8 sm:flex sm:gap-0 sm:divide-x sm:divide-white/15">
                    {HIGHLIGHT_STATS.map((s) => (
                      <div
                        key={s.label}
                        className="sm:flex-1 sm:px-8 sm:first:pl-0 sm:last:pr-0"
                      >
                        <div className="font-display text-4xl font-extrabold leading-none text-white lg:text-5xl">
                          {s.value}
                        </div>
                        <div className="mt-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/60">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/gallery"
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/12 px-6 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/20"
                  >
                    Explore the full gallery
                    <ArrowUpRight size={16} className="text-highlight-400" />
                  </Link>
                </div>
              </div>
            </FadeUp>
          </Container>
      </section>

      {/* ═══════════ THE FESTIVAL IN FRAMES — horizontal film reel ═══════════ */}
      <section className="relative bg-white pt-6 pb-16 lg:pb-24">
        <Container className="mb-10 lg:mb-14">
          <FadeUp className="flex flex-col items-center gap-3 text-center">
            <h3 className="font-display text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
              The Festival in Frames
            </h3>
            <p className="max-w-2xl leading-relaxed text-body">
              Every cheer, every performance, every proud smile — watch the reel
              roll by, tap any frame to relive it full-size.
            </p>
          </FadeUp>
        </Container>
        <FilmReel images={HIGHLIGHTS} />
      </section>

      {/* ═══════════ CHIEF GUEST — highlighted spotlight ═══════════ */}
      <section className="relative overflow-hidden bg-hero-gradient py-16 text-white lg:py-20">
        <ConfettiDots />
        <Container className="relative">
          <FadeUp className="mb-10 flex flex-col items-center gap-3 text-center">
            <span className={`${SERIF} text-xl text-highlight-400`}>
              Guest of Honour
            </span>
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Graced by a Visionary
            </h2>
            <p className="max-w-2xl text-white/80">
              A distinguished leader whose words inspired our young changemakers.
            </p>
          </FadeUp>

          {/* Highlighted guest — Prof. Sukhee Lee, with her spotlight video */}
          <FadeUp>
            <div className="mx-auto grid max-w-5xl items-center gap-10 rounded-[2.5rem] border border-white/12 bg-white/[0.06] p-6 backdrop-blur sm:p-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-12">
              <ScrollVideo
                src={SUKHEE.video}
                poster={SUKHEE.poster}
                label={SUKHEE.name}
                className="mx-auto aspect-[9/16] w-full max-w-[340px] rounded-3xl shadow-2xl shadow-primary-950/40 ring-1 ring-white/20 lg:mx-0"
              />
              <div className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-full bg-highlight-500/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-highlight-400">
                  Highlighted Guest
                </span>
                <Quote size={44} className="mx-auto mt-6 text-highlight-400 lg:mx-0" />
                <p className={`${SERIF} mt-3 text-3xl leading-[1.15] text-white sm:text-4xl lg:text-[2.9rem]`}>
                  &ldquo;{SUKHEE.quote}&rdquo;
                </p>
                <div className="mt-8">
                  <h3 className="font-display text-2xl font-bold sm:text-3xl">{SUKHEE.name}</h3>
                  <p className="mt-1 text-white/70 sm:text-lg">{SUKHEE.role}</p>
                </div>
              </div>
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* ═══════════ AWARD CEREMONY — curated collage ═══════════ */}
      <section className="section-tint relative overflow-hidden py-20 lg:py-28">
        {/* Wide feature band — header row on top, full-width photo gallery below,
            so the horizontal space is used at every screen size. */}
        <div className="mx-auto w-full max-w-[110rem] px-6 sm:px-8 lg:px-12">
          {/* Header: title left · intro + highlights right */}
          <div className="mb-10 grid gap-8 lg:mb-14 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-20">
            <FadeUp>
              <h2 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-heading sm:text-5xl lg:text-6xl">
                Champions Crowned
              </h2>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-highlight-500/12 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-highlight-600">
                <Trophy size={16} /> Moment of Glory
              </span>
            </FadeUp>

            <FadeUp delay={0.1}>
              <p className="max-w-2xl text-lg leading-relaxed text-body">
                The brightest talents of YUF 2025 took the stage to collect their
                honours — celebrated for their creativity, skill and
                sportsmanship. From solo stars to winning teams,{" "}
                <span className="font-semibold text-highlight-600">
                  every champion
                </span>{" "}
                earned their moment in the spotlight.
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-2.5">
                {[
                  "Individual & team champions felicitated",
                  "Trophies, medals & merit certificates awarded",
                  "Winners across arts, sports & innovation",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-heading/85">
                    <Star
                      size={15}
                      className="shrink-0 fill-highlight-500 text-highlight-500"
                    />
                    <span className="text-[15px] leading-snug">{t}</span>
                  </li>
                ))}
              </ul>
            </FadeUp>
          </div>

          {/* Full-width gallery row */}
          <FadeUp delay={0.15}>
            {/* Desktop — two justified rows of two. Each pair's widths follow
                their aspect ratios, so both share one height with no cropping,
                filling the full width at a large, impactful size. */}
            <div className="hidden flex-col gap-5 lg:flex">
              {[[0, 1], [2, 3]].map((pair) => (
                <div key={pair.join("-")} className="flex gap-5">
                  {pair.map((idx) => {
                    const a = AWARDS[idx];
                    return (
                      <div
                        key={a.src}
                        style={{ flexGrow: a.aspect, flexBasis: 0, aspectRatio: String(a.aspect) }}
                        className="group relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-primary-900/10"
                      >
                        <Image
                          src={a.src}
                          alt={a.alt}
                          fill
                          sizes="50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950/25 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Mobile / tablet — full-width stack at each photo's natural aspect. */}
            <div className="flex flex-col gap-4 lg:hidden">
              {AWARDS.map((a) => (
                <div
                  key={a.src}
                  style={{ aspectRatio: String(a.aspect) }}
                  className="group relative w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-primary-900/10"
                >
                  <Image
                    src={a.src}
                    alt={a.alt}
                    fill
                    sizes="100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="bg-festival-gradient relative overflow-hidden py-20 text-white lg:py-28">
        <Container>
          <ScaleIn>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-4xl font-black leading-tight sm:text-5xl">
                You just relived 2025.
                <br />
                Now be the story of{" "}
                <span className="text-highlight-400">2026.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/90">
                Registrations for Youth United Festival 2026 are open. Your
                spotlight is waiting.
              </p>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80">
                Thank you to every participant, volunteer, mentor, teacher,
                partner and supporter who made Youth United Festival 2025
                unforgettable.
              </p>
              <Link
                href="/register"
                className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-white px-9 text-base font-semibold text-primary-700 shadow-xl transition hover:bg-white/90"
              >
                Register for YUF 2026
                <ArrowRight size={18} />
              </Link>
            </div>
          </ScaleIn>
        </Container>
      </section>
    </div>
  );
}
