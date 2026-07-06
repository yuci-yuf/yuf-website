import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Trophy, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import {
  FadeUp,
  FadeIn,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/home/MotionWrapper";
import {
  FestiveEyebrow,
  ConfettiDots,
  FestiveGlows,
} from "@/components/home/FestiveAccents";
import { PhotoGallery, type GalleryImage } from "@/components/yuf2025/PhotoGallery";
import { VideoGrid, type VideoItem } from "@/components/yuf2025/VideoGrid";

export const metadata: Metadata = {
  title: "YUF 2025 — Highlights",
  description:
    "Relive the Youth United Festival 2025 — event highlights, award ceremonies, distinguished chief guests, and unforgettable moments of youth talent and celebration.",
};

const P = "/images/yuf2025";

const HIGHLIGHTS: GalleryImage[] = Array.from({ length: 18 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  const ext = n === "13" ? "png" : "jpg";
  return { src: `${P}/h-${n}.${ext}`, alt: `Youth United Festival 2025 moment ${i + 1}` };
});

const AWARDS: GalleryImage[] = [1, 2, 3, 4].map((n) => ({
  src: `${P}/award-${n}.jpg`,
  alt: `YUF 2025 award ceremony ${n}`,
}));

const EVENT_VIDEOS: VideoItem[] = [
  { poster: `${P}/h-05.jpg`, title: "Grand Opening Ceremony", tag: "Ceremony" },
  { poster: `${P}/h-11.jpg`, title: "Sports & Games Finals", tag: "Sports" },
  { poster: `${P}/h-14.jpg`, title: "Cultural Performances", tag: "Arts" },
  { poster: `${P}/h-09.jpg`, title: "Innovation Showcase", tag: "Technical" },
  { poster: `${P}/h-06.jpg`, title: "Youth Parliament", tag: "Debate" },
  { poster: `${P}/h-08.jpg`, title: "Closing & Prize Distribution", tag: "Finale" },
];

const FEEDBACK_VIDEOS: VideoItem[] = [
  { poster: `${P}/h-01.jpg`, title: "In Their Own Words", tag: "Participants" },
  { poster: `${P}/h-03.jpg`, title: "Voices of the Winners", tag: "Champions" },
  { poster: `${P}/h-17.jpg`, title: "Mentors & Faculty Reflect", tag: "Educators" },
];

const GUESTS = [
  {
    img: `${P}/guest-tamilisai.png`,
    name: "Dr. Tamilisai Soundararajan",
    title: "Former Governor of Telangana & Lt. Governor of Puducherry",
  },
  {
    img: `${P}/guest-sundaramurthy.jpg`,
    name: "Dr. T K Sundaramurthy",
    title: "Ex-Mission Director, ISRO · Principal Advisor, YUCI",
  },
  {
    img: `${P}/guest-embalam.png`,
    name: "Shri Embalam R. Selvam",
    title: "Speaker, Puducherry Legislative Assembly",
  },
  {
    img: `${P}/guest-modi.jpg`,
    name: "Shri Narendra Modi",
    title: "Hon'ble Prime Minister of India — Guiding Vision",
  },
];

const STATS = [
  { number: "5,000+", label: "Participants" },
  { number: "28+", label: "States" },
  { number: "50+", label: "Events" },
  { number: "100+", label: "Districts" },
];

export default function Yuf2025Page() {
  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <section className="bg-festival-gradient relative flex min-h-[85svh] items-center overflow-hidden text-white">
        {/* Photo montage backdrop */}
        <div aria-hidden className="absolute inset-0 z-0 opacity-25">
          <div className="grid h-full w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">
            {HIGHLIGHTS.slice(0, 12).map((img) => (
              <div key={img.src} className="relative">
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="20vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <div
          aria-hidden
          className="absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 20%, rgba(28,79,198,0.55) 0%, transparent 55%), linear-gradient(180deg, rgba(10,20,45,0.72) 0%, rgba(10,20,45,0.55) 45%, rgba(10,20,45,0.9) 100%)",
          }}
        />
        <ConfettiDots />

        <Container className="relative z-30 py-28 text-center lg:py-32">
          <FadeUp>
            <FestiveEyebrow className="mx-auto w-fit text-highlight-400">
              Youth United Festival · The 2025 Chapter
            </FestiveEyebrow>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="mt-6 font-display text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-8xl lg:text-[9.5rem]">
              YUF{" "}
              <span className="bg-gradient-to-r from-[#FF9933] via-white to-[#4ade80] bg-clip-text text-transparent">
                2025
              </span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-white/90 sm:text-xl">
              A year of extraordinary talent, unity and celebration — relive the
              moments that made the Youth United Festival 2025 unforgettable.
            </p>
          </FadeUp>

          {/* Stats */}
          <FadeUp delay={0.32}>
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-5 backdrop-blur-sm"
                >
                  <div className="font-display text-3xl font-black text-highlight-400 sm:text-4xl">
                    {s.number}
                  </div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/70">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </Container>
      </section>

      {/* ═══════════ HIGHLIGHTS GALLERY ═══════════ */}
      <section className="section-glow relative overflow-hidden py-16 lg:py-24">
        <FestiveGlows />
        <Container className="relative">
          <FadeUp className="mb-12 flex flex-col items-center gap-4 text-center">
            <FestiveEyebrow>Event Highlights</FestiveEyebrow>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-heading sm:text-5xl">
              Moments Worth Reliving
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-body">
              From the roar of the sports arena to the spotlight of the cultural
              stage — a glimpse into the energy of YUF 2025. Tap any photo to
              view it full-size.
            </p>
          </FadeUp>
          <FadeIn>
            <PhotoGallery images={HIGHLIGHTS} />
          </FadeIn>
        </Container>
      </section>

      {/* ═══════════ EVENT VIDEOS ═══════════ */}
      <section className="bg-hero-gradient relative overflow-hidden py-16 lg:py-24">
        <ConfettiDots />
        <Container className="relative">
          <FadeUp className="mb-12 flex flex-col items-center gap-4 text-center">
            <FestiveEyebrow className="text-highlight-400">
              Watch the Action
            </FestiveEyebrow>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Event Videos
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-white/85">
              Ceremonies, finals and showcases — the festival in motion.
            </p>
          </FadeUp>
          <FadeIn>
            <VideoGrid videos={EVENT_VIDEOS} />
          </FadeIn>
        </Container>
      </section>

      {/* ═══════════ AWARD CEREMONY ═══════════ */}
      <section className="section-aqua relative overflow-hidden py-16 lg:py-24">
        <FestiveGlows />
        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <FadeUp className="flex flex-col gap-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-highlight-500/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] text-highlight-600">
                <Trophy size={16} /> Honouring Excellence
              </span>
              <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-heading sm:text-5xl">
                The Award Ceremony
              </h2>
              <p className="text-lg leading-relaxed text-body">
                YUF 2025 celebrated its brightest talents on stage — recognised
                for their creativity, skill and sportsmanship. The festival was
                also honoured with prestigious appreciation at{" "}
                <span className="font-semibold text-primary-700">Raj Bhavan</span>,
                a proud milestone for the Youth United Council of India.
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  "State & national-level winners felicitated",
                  "Recognition from esteemed dignitaries",
                  "Appreciation received at Raj Bhavan",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-body">
                    <Star
                      size={16}
                      className="mt-1 shrink-0 fill-highlight-500 text-highlight-500"
                    />
                    <span className="text-[15px] leading-relaxed sm:text-base">
                      {t}
                    </span>
                  </li>
                ))}
              </ul>
            </FadeUp>

            <FadeUp delay={0.15}>
              <PhotoGallery images={AWARDS} />
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* ═══════════ FEEDBACK VIDEOS ═══════════ */}
      <section className="section-glow relative overflow-hidden py-16 lg:py-24">
        <FestiveGlows />
        <Container className="relative">
          <FadeUp className="mb-12 flex flex-col items-center gap-4 text-center">
            <FestiveEyebrow>Straight From the Heart</FestiveEyebrow>
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-heading sm:text-5xl">
              Feedback & Reflections
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-body">
              What participants, winners and mentors had to say about their YUF
              2025 experience.
            </p>
          </FadeUp>
          <FadeIn>
            <VideoGrid videos={FEEDBACK_VIDEOS} />
          </FadeIn>
        </Container>
      </section>

      {/* ═══════════ CHIEF GUESTS ═══════════ */}
      <section className="bg-festival-gradient relative overflow-hidden py-16 text-white lg:py-24">
        <ConfettiDots />
        <Container className="relative">
          <FadeUp className="mb-12 flex flex-col items-center gap-4 text-center">
            <FestiveEyebrow className="text-highlight-400">
              Distinguished Presence
            </FestiveEyebrow>
            <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Chief Guests &amp; Dignitaries
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-white/85">
              We were honoured by the presence and guidance of eminent leaders
              who inspired our young changemakers.
            </p>
          </FadeUp>

          <StaggerContainer
            stagger={0.1}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {GUESTS.map((g) => (
              <StaggerItem key={g.name}>
                <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/12 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-highlight-400/50">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={g.img}
                      alt={g.name}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 p-5">
                    <h3 className="font-display text-lg font-bold leading-tight">
                      {g.name}
                    </h3>
                    <p className="text-sm leading-snug text-white/70">
                      {g.title}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="relative overflow-hidden bg-white py-16 lg:py-24">
        <Container>
          <ScaleIn>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-600 via-primary-500 to-festival-cyan px-8 py-16 text-center sm:px-14 lg:py-20">
              <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-highlight-400/25 blur-3xl" aria-hidden />
              <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
              <div className="relative flex flex-col items-center gap-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                  <Sparkles size={16} /> The story continues
                </span>
                <h2 className="max-w-2xl font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                  Loved YUF 2025? Be part of{" "}
                  <span className="text-highlight-300">YUF 2026.</span>
                </h2>
                <p className="max-w-xl text-lg leading-relaxed text-white/85">
                  Registrations are open. Bring your talent to India&apos;s
                  biggest celebration of youth.
                </p>
                <Link
                  href="/register"
                  className="group inline-flex h-13 items-center gap-2 rounded-full bg-white px-8 text-[15px] font-semibold text-primary-700 shadow-xl transition-all hover:bg-primary-50"
                >
                  Register for YUF 2026
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
          </ScaleIn>
        </Container>
      </section>
    </>
  );
}
