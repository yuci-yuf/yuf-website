import Image from "next/image";
import { Hero } from "@/components/public/Hero";
import { MarqueeTicker } from "@/components/public/MarqueeTicker";
import { SplitSection } from "@/components/public/SplitSection";
import { StatsCounter } from "@/components/public/StatsCounter";
import { FeatureGrid } from "@/components/public/FeatureGrid";
import { EventCard } from "@/components/public/EventCard";
import { StepsToRegister } from "@/components/public/StepsToRegister";
import { AdvisorQuote } from "@/components/public/AdvisorQuote";
import { PartnerStrip } from "@/components/public/PartnerStrip";
import { CTABanner } from "@/components/public/CTABanner";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import {
  homeContent,
  siteConfig,
  tickerItems,
  partners,
  registrationSteps,
} from "@/lib/content";
import { getEvents } from "@/lib/cms-data";

// Read fresh events so the home preview reflects admin edits after a reload.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getEvents();
  const previewEvents = events.filter((e) => e.isActive).slice(0, 3);

  return (
    <>
      <Hero data={homeContent.hero} />
      <MarqueeTicker items={tickerItems} />

      {/* Who We Are */}
      <SplitSection
        label={homeContent.about.label}
        title={homeContent.about.title}
        subhead={homeContent.about.subhead}
        body={homeContent.about.body}
        features={homeContent.about.features}
        buttons={[homeContent.about.button]}
        image={homeContent.about.image}
        imageSide="right"
      />

      <StatsCounter stats={siteConfig.stats} />

      {/* Join Us */}
      <SplitSection
        label={homeContent.joinUs.label}
        title={homeContent.joinUs.title}
        body={homeContent.joinUs.body}
        buttons={homeContent.joinUs.buttons}
        image={homeContent.joinUs.image}
        imageSide="left"
        className="bg-surface-alt"
      />

      {/* Recognition */}
      <Section className="bg-primary-950 text-white">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent-400">
              <span className="h-px w-6 bg-accent-500" aria-hidden />
              {homeContent.recognition.label}
            </span>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              {homeContent.recognition.title}
            </h2>
            <p className="leading-relaxed text-primary-100">
              {homeContent.recognition.subtitle}
            </p>
            <ul className="flex flex-col gap-3 pt-2">
              {homeContent.recognition.details.map((d) => (
                <li key={d} className="flex items-start gap-3 text-primary-100">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-400" aria-hidden />
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {homeContent.recognition.images.map((src, i) => (
              <div
                key={src}
                className={`relative overflow-hidden rounded-2xl ring-1 ring-white/10 ${
                  i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={src}
                  alt={`YUCI award presentation ${i + 1}`}
                  fill
                  sizes="(min-width: 1024px) 30rem, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Government initiatives */}
      <Section>
        <SectionHeading
          label={homeContent.govInitiatives.label}
          title={homeContent.govInitiatives.title}
          subtitle={homeContent.govInitiatives.subtitle}
          className="mb-12"
        />
        <FeatureGrid cards={homeContent.govInitiatives.cards} columns={3} />
      </Section>

      {/* Principal Advisor */}
      <AdvisorQuote
        advisor={siteConfig.advisor}
        title="A Word From Our Principal Advisor"
      />

      {/* Events preview — only shown once events are published */}
      {previewEvents.length > 0 && (
        <Section className="bg-surface-alt">
          <SectionHeading
            label={homeContent.eventsPreview.label}
            title={homeContent.eventsPreview.title}
            subtitle={homeContent.eventsPreview.subtitle}
            className="mb-12"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {previewEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Button href="/events" size="lg" variant="primary">
              View All Events
            </Button>
          </div>
        </Section>
      )}

      {/* Steps to register */}
      <Section>
        <SectionHeading
          label={homeContent.registrationSteps.label}
          title={homeContent.registrationSteps.title}
          subtitle={homeContent.registrationSteps.subtitle}
          className="mb-14"
        />
        <StepsToRegister steps={registrationSteps} />
        <div className="mt-12 flex justify-center">
          <Button href="/register" size="lg" variant="secondary">
            Register Now
          </Button>
        </div>
      </Section>

      {/* Why join us */}
      <Section className="bg-surface-alt">
        <SectionHeading
          label={homeContent.whyJoinUs.label}
          title={homeContent.whyJoinUs.title}
          subtitle={homeContent.whyJoinUs.subtitle}
          className="mb-12"
        />
        <FeatureGrid cards={homeContent.whyJoinUs.cards} columns={3} />
      </Section>

      {/* Partners */}
      <Section>
        <SectionHeading
          label={homeContent.partners.label}
          title={homeContent.partners.title}
          className="mb-12"
        />
        <PartnerStrip partners={partners} />
      </Section>

      <CTABanner data={homeContent.ctaBanner} />
    </>
  );
}
