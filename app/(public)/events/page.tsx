import type { Metadata } from "next";
import { Hero } from "@/components/public/Hero";
import { MarqueeTicker } from "@/components/public/MarqueeTicker";
import { EventsExplorer } from "@/components/public/EventsExplorer";
import { StepsToRegister } from "@/components/public/StepsToRegister";
import { StatsCounter } from "@/components/public/StatsCounter";
import { CTABanner } from "@/components/public/CTABanner";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import {
  eventsContent,
  events,
  eventCategoryOrder,
  tickerItems,
  registrationSteps,
  siteConfig,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Explore all YUF 2026 events — Arts & Culturals, Sports & Games, Indian Youth Parliament, India's Young Scientists, Youth Talent Icon, and more.",
};

export default function EventsPage() {
  const activeEvents = events.filter((e) => e.isActive);

  return (
    <>
      <Hero data={eventsContent.hero} />
      <MarqueeTicker items={tickerItems} />

      <Section>
        <SectionHeading
          label={eventsContent.intro.label}
          title={eventsContent.intro.title}
          subtitle={eventsContent.intro.subtitle}
          className="mb-14"
        />
        <EventsExplorer events={activeEvents} categoryOrder={eventCategoryOrder} />
      </Section>

      <Section className="bg-surface-alt">
        <SectionHeading
          label="How It Works"
          title="Steps to Register"
          subtitle="Follow these simple steps to register for your desired competition."
          className="mb-14"
        />
        <StepsToRegister steps={registrationSteps} />
        <div className="mt-12 flex justify-center">
          <Button href="/register" size="lg" variant="secondary" icon={<span aria-hidden>✏️</span>}>
            Register Now
          </Button>
        </div>
      </Section>

      <StatsCounter stats={siteConfig.stats} />

      <CTABanner data={eventsContent.ctaBanner} />
    </>
  );
}
