import { HeroSection } from "@/components/home/HeroSection";
import { LogoStrip } from "@/components/home/LogoStrip";
import { MissionSection } from "@/components/home/MissionSection";
import { RecognitionBanner } from "@/components/home/RecognitionBanner";
import { InitiativesRow } from "@/components/home/InitiativesRow";
import { EventShowcase } from "@/components/home/EventShowcase";
import { StepsTimeline } from "@/components/home/StepsTimeline";
import { GalleryMosaic } from "@/components/home/GalleryMosaic";
import {
  homeContent,
  partners,
  registrationSteps,
  tickerItems,
} from "@/lib/content";
import { getEvents } from "@/lib/cms-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getEvents();
  const previewEvents = events.filter((e) => e.isActive).slice(0, 3);

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

      <InitiativesRow
        label={homeContent.govInitiatives.label}
        title={homeContent.govInitiatives.title}
        subtitle={homeContent.govInitiatives.subtitle}
        cards={homeContent.govInitiatives.cards}
      />

      {previewEvents.length > 0 && (
        <EventShowcase events={previewEvents} />
      )}

      <StepsTimeline steps={registrationSteps} />

<GalleryMosaic />

      <LogoStrip partners={partners} />
    </>
  );
}
