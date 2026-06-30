import type { Metadata } from "next";
import { Hero } from "@/components/public/Hero";
import { EventsExplorer } from "@/components/public/EventsExplorer";
import { CTABanner } from "@/components/public/CTABanner";
import { Section, SectionHeading } from "@/components/ui/Section";
import { eventsContent } from "@/lib/content";
import { getEvents, getCategoryOrder } from "@/lib/cms-data";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Explore all YUF 2026 events — Arts & Culturals, Sports & Games, Indian Youth Parliament, India's Young Scientists, Youth Talent Icon, and more.",
};

// Read fresh CMS data on every request so admin edits show after a reload.
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [events, categoryOrder] = await Promise.all([
    getEvents(),
    getCategoryOrder(),
  ]);
  const activeEvents = events.filter((e) => e.isActive);
  // Only show category tabs that actually have visible events, preserving the
  // managed order and appending any extras the events introduce.
  const presentCategories = Array.from(
    new Set(activeEvents.map((e) => e.category)),
  );
  const eventCategoryOrder = [
    ...categoryOrder.filter((c) => presentCategories.includes(c)),
    ...presentCategories.filter((c) => !categoryOrder.includes(c)),
  ];

  return (
    <>
      <Hero data={eventsContent.hero} />

      <Section>
        <SectionHeading
          label={eventsContent.intro.label}
          title={eventsContent.intro.title}
          subtitle={eventsContent.intro.subtitle}
          className="mb-14"
        />
        {activeEvents.length > 0 ? (
          <EventsExplorer events={activeEvents} categoryOrder={eventCategoryOrder} />
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-surface-alt p-12 text-center text-text-muted">
            No events have been published yet. Please check back soon.
          </p>
        )}
      </Section>

      <CTABanner data={eventsContent.ctaBanner} />
    </>
  );
}
