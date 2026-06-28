"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryPhoto, GalleryVideo } from "@/lib/content";
import { cn } from "@/lib/utils";

type Tab = "photos" | "videos";

export function GalleryExplorer({
  photos,
  videos,
}: {
  photos: GalleryPhoto[];
  videos: GalleryVideo[];
}) {
  // Only offer the Videos tab when there are videos to show.
  const hasVideos = videos.length > 0;
  const [tab, setTab] = useState<Tab>("photos");

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
          {photos.map((photo) => (
            <div
              key={photo.src}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-alt shadow-card"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 30vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
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
    </div>
  );
}
