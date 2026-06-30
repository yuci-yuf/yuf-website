import type { Metadata } from "next";
import { Hero } from "@/components/public/Hero";
import { GalleryExplorer } from "@/components/public/GalleryExplorer";
import { CTABanner } from "@/components/public/CTABanner";
import { Section, SectionHeading } from "@/components/ui/Section";
import { galleryContent, homeContent } from "@/lib/content";
import { getGalleryPhotos } from "@/lib/cms-data";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos, videos, and highlights from the Youth United Festival — celebrating youth talent, innovation, and unity across India.",
};

// Read fresh gallery data on every request so admin additions show after a reload.
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();
  return (
    <>
      <Hero data={galleryContent.hero} />

      <Section tone="aqua">
        <SectionHeading
          label={galleryContent.highlights.label}
          title={galleryContent.highlights.title}
          subtitle={galleryContent.highlights.subtitle}
          className="mb-12"
        />
        {photos.length > 0 || galleryContent.videos.length > 0 ? (
          <GalleryExplorer photos={photos} videos={galleryContent.videos} />
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-surface-alt p-12 text-center text-text-muted">
            No gallery images have been added yet. Please check back soon.
          </p>
        )}
      </Section>

      {/* Reuse the home CTA banner so we don't author a near-duplicate. */}
      <CTABanner data={homeContent.ctaBanner} />
    </>
  );
}
