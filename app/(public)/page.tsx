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
import { FadeUp, ScaleIn, StaggerContainer, StaggerItem } from "@/components/home/MotionWrapper";
import { FestiveEyebrow, ConfettiDots } from "@/components/home/FestiveAccents";
import { CATEGORY_STYLE } from "@/lib/category-style";
import {
  homeContent,
  partners,
  registrationSteps,
  tickerItems,
} from "@/lib/content";
import { getGalleryPhotos } from "@/lib/cms-data";

export const dynamic = "force-dynamic";

const EVENT_CATEGORIES = [
  { key: "Sports & Games",   label: "Sports & Games",   desc: "Cricket, volleyball, throwball, kabaddi & more competitive sports." },
  { key: "Technical",        label: "Technical",        desc: "Science exhibitions, innovation showcases & tech competitions." },
  { key: "Arts & Culturals", label: "Non Technical",   desc: "Dance, music, drama & cultural performances from across India." },
] as const;

export default async function HomePage() {
  const galleryPhotos = await getGalleryPhotos();

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
        label={homeContent.about.label}
        title={homeContent.about.title}
        body={homeContent.about.body}
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
      <section className="relative overflow-hidden bg-white py-16 lg:py-24">
        <Container>
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
            <FadeUp className="flex flex-col gap-6">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-highlight-600">Distinguished Guest</span>
              <div className="flex flex-col gap-1">
                <h2 className="font-heading text-3xl font-extrabold uppercase leading-tight tracking-tight text-heading sm:text-4xl lg:text-[2.5rem]">
                  Dr. Tamilisai Soundararajan
                </h2>
                <p className="text-sm font-medium text-text-muted">
                  Lt. Governor of Puducherry &amp; Governor of Telangana
                </p>
              </div>
              <p className="text-[16px] leading-relaxed text-body">
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

      {/* ── Event Categories ── */}
      <section className="bg-hero-gradient relative overflow-hidden py-16 sm:py-24">
        <ConfettiDots />
        <Container className="relative">
          <FadeUp className="mb-14 flex items-end justify-between">
            <div className="flex flex-col gap-3">
              <FestiveEyebrow className="text-highlight-400">Explore Events</FestiveEyebrow>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
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

          <StaggerContainer stagger={0.1} className="grid gap-5 sm:grid-cols-3">
            {EVENT_CATEGORIES.map(({ key, label, desc }) => {
              const st = CATEGORY_STYLE[key];
              const Icon = st.icon;
              return (
                <StaggerItem key={key} className="h-full">
                  <Link
                    href={`/events?category=${encodeURIComponent(key)}`}
                    className="group flex h-full flex-col gap-5 overflow-hidden rounded-3xl bg-white p-7 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: st.soft }}
                    >
                      <Icon size={22} style={{ color: st.accent }} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="font-heading text-lg font-bold text-heading">{label}</h3>
                      <p className="text-sm leading-relaxed text-body">{desc}</p>
                    </div>
                    <span
                      className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                      style={{ color: st.accent }}
                    >
                      Explore <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          <div className="mt-8 flex justify-center sm:hidden">
            <Link href="/events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              View All Events <ArrowRight size={15} />
            </Link>
          </div>
        </Container>
      </section>

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

      <LogoStrip partners={partners} />
    </>
  );
}
