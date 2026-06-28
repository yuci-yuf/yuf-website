import type { Metadata } from "next";
import { Hero } from "@/components/public/Hero";
import { GalleryExplorer } from "@/components/public/GalleryExplorer";
import { CTABanner } from "@/components/public/CTABanner";
import { Section, SectionHeading } from "@/components/ui/Section";
import { galleryContent, homeContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos, videos, and highlights from the Youth United Festival — celebrating youth talent, innovation, and unity across India.",
};

export default function GalleryPage() {
  return (
    <>
      <Hero data={galleryContent.hero} />

      <Section>
        <SectionHeading
          label={galleryContent.highlights.label}
          title={galleryContent.highlights.title}
          subtitle={galleryContent.highlights.subtitle}
          className="mb-12"
        />
        <GalleryExplorer
          photos={galleryContent.photos}
          videos={galleryContent.videos}
        />
      </Section>

      {/* Reuse the home CTA banner so we don't author a near-duplicate. */}
      <CTABanner data={homeContent.ctaBanner} />
    </>
  );
}
