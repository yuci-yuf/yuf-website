"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryPhoto, GalleryVideo } from "@/lib/content";
import { cn } from "@/lib/utils";

type Tab = "photos" | "videos";

function Lightbox({
  photos,
  index,
  onClose,
}: {
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  const photo = photos[current];

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25"
          aria-label="Previous"
        >
          <ChevronLeft size={26} />
        </button>
      )}

      {/* Image */}
      <div
        className="relative mx-16 max-h-[90vh] max-w-[90vw]"
        style={{ aspectRatio: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          width={1400}
          height={900}
          className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
          priority
        />
      </div>

      {/* Next */}
      {photos.length > 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25"
          aria-label="Next"
        >
          <ChevronRight size={26} />
        </button>
      )}

      {/* Counter */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1 text-sm text-white/80">
          {current + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}

export function GalleryExplorer({
  photos,
  videos,
}: {
  photos: GalleryPhoto[];
  videos: GalleryVideo[];
}) {
  const hasVideos = videos.length > 0;
  const [tab, setTab] = useState<Tab>("photos");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: "photos", label: "Photos" },
    ...(hasVideos ? [{ key: "videos" as Tab, label: "Videos" }] : []),
  ];

  return (
    <div className="flex flex-col gap-10">
      {tabs.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-medium transition-all",
                tab === t.key
                  ? "bg-primary-600 text-white shadow-card"
                  : "border border-border bg-surface text-text-muted hover:border-primary-300 hover:text-primary-700",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === "photos" && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-alt shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label={`View ${photo.alt || "photo"} fullscreen`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 30vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
            </button>
          ))}
        </div>
      )}

      {tab === "videos" && (
        <div className="grid gap-6 sm:grid-cols-2">
          {videos.map((video) => (
            <div
              key={video.embedUrl}
              className="overflow-hidden rounded-2xl border border-border shadow-card"
            >
              <div className="relative aspect-video">
                <iframe
                  src={video.embedUrl}
                  title={video.title}
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
