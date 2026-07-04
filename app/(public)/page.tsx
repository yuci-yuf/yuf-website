import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSection } from "@/components/home/HeroSection";
import { LogoStrip } from "@/components/home/LogoStrip";
import { MissionSection } from "@/components/home/MissionSection";
import { RecognitionBanner } from "@/components/home/RecognitionBanner";
import { InitiativesRow } from "@/components/home/InitiativesRow";
import { StepsTimeline } from "@/components/home/StepsTimeline";
import { GalleryMosaic } from "@/components/home/GalleryMosaic";
import { Testimonials } from "@/components/home/Testimonials";
import { Container } from "@/components/ui/Container";
import { FadeUp, ScaleIn } from "@/components/home/MotionWrapper";
import { FestiveEyebrow, ConfettiDots, FestiveGlows } from "@/components/home/FestiveAccents";
import { CategoryEventRows, type CategoryGroup } from "@/components/home/CategoryEventRows";
import {
  homeContent,
  partners,
  registrationSteps,
  tickerItems,
} from "@/lib/content";
import { getEvents, getGalleryPhotos } from "@/lib/cms-data";

export const dynamic = "force-dynamic";

// Categories to surface on the home page, each shown as a horizontal event
// strip. `key` matches the real event category; `label` is the display name.
const EVENT_CATEGORIES = [
  { key: "Sports & Games",   label: "Sports & Games" },
  { key: "Technical",        label: "Technical" },
  { key: "Arts & Culturals", label: "Non Technical" },
] as const;

export default async function HomePage() {
  const [events, galleryPhotos] = await Promise.all([
    getEvents(),
    getGalleryPhotos(),
  ]);

  const activeEvents = events.filter((e) => e.isActive);
  const categoryGroups: CategoryGroup[] = EVENT_CATEGORIES.map(({ key, label }) => ({
    key,
    label,
    events: activeEvents.filter((e) => e.category === key),
  })).filter((g) => g.events.length > 0);

  return (
    <>
      <HeroSection
        title={homeContent.hero.title}
        highlight={homeContent.hero.highlight}
        subtitle={homeContent.hero.subtitle}
        marqueeItems={tickerItems}
        stats={[
          { number: "5K+", label: "Participants" },
          { number: "28+", label: "States" },
          { number: "100+", label: "Districts" },
        ]}
      />

      <MissionSection
        label="Prime Minister of India"
        title="A Message to India's Youth"
        primaryImage={homeContent.about.image!}
      />

      <RecognitionBanner
        label={homeContent.recognition.label}
        title={homeContent.recognition.title}
        subtitle={homeContent.recognition.subtitle}
        details={homeContent.recognition.details}
        images={homeContent.recognition.images}
      />

      {/* ── Dignitary Spotlight ── */}
      <section className="section-aqua relative overflow-hidden py-16 lg:py-24">
        <FestiveGlows />
        <Container className="relative">
          <div className="grid items-center gap-12 md:grid-cols-[1fr_1fr] md:gap-16">
            {/* Left — image */}
            <ScaleIn>
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src="/images/testimonials/tamilisai-soundararajan.png"
                  alt="Dr. Tamilisai Soundararajan"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            </ScaleIn>

            {/* Right — content */}
            <FadeUp className="flex flex-col gap-7">
              <span className="text-base font-bold uppercase tracking-[0.2em] text-highlight-600">Distinguished Guest</span>
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-4xl font-extrabold uppercase leading-tight tracking-tight text-heading sm:text-5xl lg:text-6xl">
                  Dr. Tamilisai Soundararajan
                </h2>
                <p className="text-base font-medium text-text-muted lg:text-lg">
                  Former Governor of Telangana &amp; Lt. Governor of Puducherry
                </p>
              </div>
              <p className="text-lg leading-relaxed text-body lg:text-xl">
                The Youth United Council of India extends its sincere gratitude to{" "}
                <span className="text-primary-600">Dr. Tamilisai Soundararajan</span>,
                former Governor of Telangana and Pondicherry, for honoring our Youth United
                Festival award ceremony with her esteemed presence. Her encouraging words
                celebrating the talents and accomplishments of our winners were truly inspiring.
              </p>
            </FadeUp>
          </div>
        </Container>
      </section>

      {/* ── Event Categories — horizontal strips per category ── */}
      {categoryGroups.length > 0 && (
        <section className="bg-hero-gradient relative overflow-hidden py-16 sm:py-24">
          <ConfettiDots />
          <Container className="relative">
            <FadeUp className="mb-14 flex items-end justify-between">
              <div className="flex flex-col gap-3">
                <FestiveEyebrow className="text-highlight-400">Explore Events</FestiveEyebrow>
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Browse By Category
                </h2>
              </div>
              <Link
                href="/events"
                className="group hidden items-center gap-1.5 text-sm font-semibold text-white transition-colors hover:text-highlight-300 sm:inline-flex"
              >
                View All Events
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </FadeUp>

            <CategoryEventRows groups={categoryGroups} />

            <div className="mt-10 flex justify-center sm:hidden">
              <Link href="/events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                View All Events <ArrowRight size={15} />
              </Link>
            </div>
          </Container>
        </section>
      )}

      <StepsTimeline steps={registrationSteps} />

<GalleryMosaic photos={galleryPhotos.slice(0, 7)} />

      <Testimonials
        label={homeContent.testimonials.label}
        title={homeContent.testimonials.title}
        subtitle={homeContent.testimonials.subtitle}
        items={homeContent.testimonials.items}
      />

      <InitiativesRow
        label={homeContent.govInitiatives.label}
        title={homeContent.govInitiatives.title}
        subtitle={homeContent.govInitiatives.subtitle}
        cards={homeContent.govInitiatives.cards}
      />

      <LogoStrip
        partners={partners.filter(
          (p) =>
            p.name === "Falmouth University" ||
            p.name === "World Youth Book of Records" ||
            p.name === "Easwari Engineering College",
        )}
      />
    </>
  );
}
