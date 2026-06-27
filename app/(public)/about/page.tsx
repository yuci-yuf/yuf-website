import type { Metadata } from "next";
import { Hero } from "@/components/public/Hero";
import { SplitSection } from "@/components/public/SplitSection";
import { FeatureGrid } from "@/components/public/FeatureGrid";
import { StatsCounter } from "@/components/public/StatsCounter";
import { AdvisorQuote } from "@/components/public/AdvisorQuote";
import { CTABanner } from "@/components/public/CTABanner";
import { Section, SectionHeading } from "@/components/ui/Section";
import { aboutContent, siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Youth United Council of India (YUCI) — our mission, what we do, and how YUF empowers the next generation of leaders, innovators, and changemakers.",
};

export default function AboutPage() {
  return (
    <>
      <Hero data={aboutContent.hero} />

      <SplitSection
        label={aboutContent.about.label}
        title={aboutContent.about.title}
        subhead={aboutContent.about.subhead}
        body={aboutContent.about.body}
        buttons={[aboutContent.about.button]}
        imageSide="right"
      />

      {/* Mission */}
      <Section className="bg-surface-alt">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent-600">
              <span className="h-px w-6 bg-accent-500" aria-hidden />
              {aboutContent.mission.label}
            </span>
            <h2 className="font-heading text-3xl font-bold text-text sm:text-4xl">
              {aboutContent.mission.title}
            </h2>
            {aboutContent.mission.body.map((p, i) => (
              <p key={i} className="leading-relaxed text-text-muted">
                {p}
              </p>
            ))}
          </div>
          <FeatureGrid cards={aboutContent.mission.cards} columns={2} />
        </div>
      </Section>

      {/* What we do */}
      <Section>
        <SectionHeading
          label={aboutContent.activities.label}
          title={aboutContent.activities.title}
          subtitle={aboutContent.activities.subtitle}
          className="mb-12"
        />
        <FeatureGrid cards={aboutContent.activities.cards} columns={4} />
      </Section>

      {/* Why join us */}
      <Section className="bg-surface-alt">
        <SectionHeading
          label={aboutContent.whyJoinUs.label}
          title={aboutContent.whyJoinUs.title}
          subtitle={aboutContent.whyJoinUs.subtitle}
          className="mb-12"
        />
        <FeatureGrid cards={aboutContent.whyJoinUs.cards} columns={3} />
      </Section>

      {/* Impact */}
      <SplitSection
        label={aboutContent.impact.label}
        title={aboutContent.impact.title}
        body={aboutContent.impact.body}
        imageSide="left"
      />
      <StatsCounter stats={aboutContent.impact.stats} />

      <AdvisorQuote advisor={siteConfig.advisor} title="Principal Advisor" />

      <CTABanner data={aboutContent.ctaBanner} />
    </>
  );
}
