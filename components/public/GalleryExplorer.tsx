"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

  // ── Justified-rows (collage) layout ──
  // Each row is scaled so its images fill the full width at their true aspect
  // ratio — no cropping and no ragged column gaps.
  const rowRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [ratios, setRatios] = useState<number[]>([]);
  const GAP = 12;
  const TARGET = width && width < 640 ? 170 : 240; // ideal row height

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const rows = useMemo(() => {
    if (!width) return [] as { items: number[]; height: number }[];
    const ratioOf = (i: number) => ratios[i] || 1.4; // default until measured
    const out: { items: number[]; height: number }[] = [];
    let items: number[] = [];
    let sum = 0;
    photos.forEach((_, i) => {
      items.push(i);
      sum += ratioOf(i);
      const rowWidth = sum * TARGET + (items.length - 1) * GAP;
      if (rowWidth >= width) {
        const height = (width - (items.length - 1) * GAP) / sum;
        out.push({ items, height });
        items = [];
        sum = 0;
      }
    });
    if (items.length) out.push({ items, height: TARGET }); // last row, left-aligned
    return out;
  }, [photos, width, ratios, TARGET]);

  function onImgLoad(i: number, e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    if (!img.naturalHeight) return;
    const r = img.naturalWidth / img.naturalHeight;
    setRatios((prev) => {
      if (prev[i]) return prev;
      const copy = prev.slice();
      copy[i] = r;
      return copy;
    });
  }

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
        // Justified rows: every row fills the width at true aspect ratio.
        <div ref={rowRef} className="flex flex-col" style={{ gap: GAP }}>
          {rows.map((row, ri) => (
            <div key={ri} className="flex flex-nowrap overflow-hidden" style={{ gap: GAP }}>
              {row.items.map((i) => {
                const photo = photos[i];
                const ratio = ratios[i] || 1.4;
                return (
                  <button
                    key={photo.src}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    style={{ width: ratio * row.height, height: row.height }}
                    className="group relative block shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-alt shadow-card transition-shadow hover:shadow-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    aria-label={`View ${photo.alt || "photo"} fullscreen`}
                  >
                    {/* Uploads have arbitrary dimensions; plain img + measured
                        ratio keeps them uncropped. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      onLoad={(e) => onImgLoad(i, e)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </button>
                );
              })}
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
