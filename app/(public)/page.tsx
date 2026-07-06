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
import { RajBhavanCarousel } from "@/components/home/RajBhavanCarousel";
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
import { getEvents, getGalleryPhotos, getCategoryOrder } from "@/lib/cms-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [events, galleryPhotos, categoryOrder] = await Promise.all([
    getEvents(),
    getGalleryPhotos(),
    getCategoryOrder(),
  ]);

  const activeEvents = events.filter((e) => e.isActive);

  // Surface every event category the CMS defines (each as a horizontal strip),
  // in the admin-managed order, appending any extras the events introduce.
  // Empty categories are dropped so we never render a bare heading.
  const presentCategories = Array.from(
    new Set(activeEvents.map((e) => e.category)),
  );
  const orderedCategories = [
    ...categoryOrder.filter((c) => presentCategories.includes(c)),
    ...presentCategories.filter((c) => !categoryOrder.includes(c)),
  ];
  // Within each category, honor the admin-managed home order (index 0 becomes
  // the featured card). Events without a homeOrder sort after ordered ones,
  // preserving their existing order (getEvents() already sorts by `order`, and
  // Array.sort is stable). This ordering applies to the home page only.
  const categoryGroups: CategoryGroup[] = orderedCategories
    .map((key) => ({
      key,
      label: key,
      events: activeEvents
        .filter((e) => e.category === key)
        .sort(
          (a, b) =>
            (a.homeOrder ?? Number.MAX_SAFE_INTEGER) -
            (b.homeOrder ?? Number.MAX_SAFE_INTEGER),
        ),
    }))
    .filter((g) => g.events.length > 0);

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
        label="From the Prime Minister of India"
        title="A Message to India's Youth"
        primaryImage={homeContent.about.image!}
      />

      <RecognitionBanner
        label={homeContent.recognition.label}
        title={homeContent.recognition.title}
        subtitle={homeContent.recognition.subtitle}
        details={homeContent.recognition.details}
        images={homeContent.recognition.images}
        highlight="Dr. Mansukh L. Mandaviya"
      />

      {/* ── Dignitary Spotlight ── */}
      <section className="section-aqua relative overflow-hidden py-12 lg:py-16">
        <FestiveGlows />
        <Container className="relative">
          {/* Mobile order: heading → image → paragraph. Desktop: image on the
              left (spanning both rows), heading + paragraph stacked on the right. */}
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-x-16 md:gap-y-5">
            {/* Heading — top on mobile, top-right on desktop */}
            <FadeUp className="order-1 flex flex-col gap-5 md:order-none md:col-start-2 md:row-start-1 md:self-end">
              <span className="text-base font-bold uppercase tracking-[0.2em] text-highlight-600">Distinguished Guest</span>
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-heading sm:text-3xl xl:text-4xl lg:whitespace-nowrap">
                  Dr. Tamilisai Soundararajan
                </h2>
                <p className="text-base font-medium text-text-muted lg:text-lg">
                  Former Governor of Telangana &amp; Lt. Governor of Puducherry
                </p>
              </div>
            </FadeUp>

            {/* Image — middle on mobile, left column (both rows) on desktop */}
            <ScaleIn className="order-2 md:order-none md:col-start-1 md:row-start-1 md:row-span-2">
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

            {/* Paragraph — below the image on mobile, below the heading on desktop */}
            <FadeUp className="order-3 md:order-none md:col-start-2 md:row-start-2 md:self-start">
              <p className="text-lg leading-relaxed text-body lg:text-xl">
                The Youth United Council of India extends its sincere gratitude to{" "}
                <span className="whitespace-nowrap font-semibold text-highlight-600">
                  Dr. Tamilisai Soundararajan
                </span>
                ,
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
        <section className="bg-hero-gradient relative overflow-hidden py-12 sm:py-16">
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

      {/* ── Noble Appreciation From Raj Bhavan ── */}
      <section className="section-aqua relative overflow-hidden py-12 lg:py-16">
        <FestiveGlows />
        <Container className="relative">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-x-16">
            {/* Title — first on mobile, top-right on desktop */}
            <FadeUp className="order-1 lg:col-start-2 lg:row-start-1 lg:self-end">
              <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-heading sm:text-4xl xl:text-5xl">
                Noble Appreciation From{" "}
                <span className="text-highlight-600">Raj Bhavan</span>
              </h2>
            </FadeUp>

            {/* Image carousel — second on mobile, left column (spans both rows) on desktop */}
            <ScaleIn className="order-2 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
              <RajBhavanCarousel />
            </ScaleIn>

            {/* Paragraph + list — below the image on mobile, bottom-right on desktop */}
            <FadeUp className="order-3 flex flex-col gap-6 lg:col-start-2 lg:row-start-2 lg:self-start">
              <p className="text-base leading-relaxed text-body sm:text-lg">
                The Youth United Council of India (YUCI) to has received prestigious
                recognition for its commendable contributions. Awards of appreciation
                were presented by esteemed dignitaries:
              </p>

              <ul className="flex flex-col gap-3">
                <li className="flex items-start gap-3 text-body">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-highlight-500" aria-hidden />
                  <span className="text-base leading-relaxed sm:text-lg">
                    <span className="font-semibold text-heading">Sri Jishnu Dev Varma</span>,
                    Governor of Telangana, at Raj Bhavan, Hyderabad.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-body">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-highlight-500" aria-hidden />
                  <span className="text-base leading-relaxed sm:text-lg">
                    <span className="font-semibold text-heading">Shri K. Kailashnathan</span>,
                    Lieutenant Governor of Puducherry, at Raj Bhavan, Puducherry.
                  </span>
                </li>
              </ul>
            </FadeUp>
          </div>
        </Container>
      </section>

      <Testimonials
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

      <LogoStrip partners={partners} />
    </>
  );
}
