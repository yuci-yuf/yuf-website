"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A muted, looping video that auto-plays while it's in view and pauses when it
 * scrolls away. The viewer can pause/resume by clicking — a manual pause sticks
 * until they press play again. If `src` is missing or fails to load (e.g. the
 * real file hasn't been dropped in `public/videos/` yet) it falls back to the
 * poster image with a "coming soon" badge, so the layout never breaks.
 */
export function ScrollVideo({
  src,
  poster,
  label,
  className,
}: {
  src?: string;
  poster: string;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(!src);
  const [manualPaused, setManualPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Track whether the player is at least half in view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting && e.intersectionRatio >= 0.5),
      { threshold: [0, 0.5, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [failed]);

  // Auto play/pause from view state, unless the viewer paused it manually.
  // `playing` is derived from the element's own play/pause events (below), so
  // we never call setState synchronously in the effect body.
  useEffect(() => {
    const el = ref.current;
    if (!el || failed) return;
    if (inView && !manualPaused) {
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [inView, manualPaused, failed]);

  function toggle() {
    const el = ref.current;
    if (!el || failed) return;
    if (el.paused) {
      setManualPaused(false);
      void el.play().catch(() => {});
    } else {
      setManualPaused(true);
      el.pause();
    }
  }

  return (
    <div className={cn("group relative overflow-hidden bg-primary-950", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt={label ?? ""}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {src && !failed && (
        <video
          ref={ref}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
          className="relative z-10 h-full w-full object-cover"
        />
      )}

      <span
        aria-hidden
        className="absolute inset-0 z-20 bg-gradient-to-t from-primary-950/45 via-transparent to-transparent"
      />

      {failed ? (
        <span className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-primary-700 shadow-xl">
            <Play size={24} className="ml-0.5" />
          </span>
          <span className="rounded-full bg-primary-950/70 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
            Video coming soon
          </span>
        </span>
      ) : (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause video" : "Play video"}
          className="absolute inset-0 z-30 flex items-center justify-center"
        >
          <span
            className={cn(
              "grid h-16 w-16 place-items-center rounded-full bg-white/90 text-primary-700 shadow-xl transition-opacity duration-300",
              playing ? "opacity-0 group-hover:opacity-100" : "opacity-100",
            )}
          >
            {playing ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </span>
        </button>
      )}
    </div>
  );
}
