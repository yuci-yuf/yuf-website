import type { Metadata } from "next";
import { GalleryExplorer } from "@/components/public/GalleryExplorer";
import { Section, SectionHeading } from "@/components/ui/Section";
import { galleryContent } from "@/lib/content";
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
      <Section tone="aqua" className="pt-28 sm:pt-32">
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
    </>
  );
}
