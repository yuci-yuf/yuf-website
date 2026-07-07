"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A looping video that auto-plays while it's in view and pauses when it scrolls
 * away (for performance only — the viewer can't pause it). It starts muted so
 * browsers allow the autoplay; a speaker button lets the viewer turn the sound
 * on. Pass `hasAudio={false}` for silent clips — the video stays muted and no
 * speaker button is shown. If `src` is missing or fails to load, it falls back
 * to the poster image with a "coming soon" badge so the layout never breaks.
 */
export function ScrollVideo({
  src,
  poster,
  label,
  className,
  hasAudio = true,
}: {
  src?: string;
  poster: string;
  label?: string;
  className?: string;
  hasAudio?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(!src);
  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);

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

  // Play while in view, pause when it scrolls away. Not user-pausable.
  useEffect(() => {
    const el = ref.current;
    if (!el || failed) return;
    if (inView) void el.play().catch(() => {});
    else el.pause();
  }, [inView, failed]);

  function toggleMute() {
    const el = ref.current;
    if (!el || failed) return;
    const next = !el.muted;
    el.muted = next;
    setMuted(next);
    // A tap counts as a user gesture, so make sure it's rolling with sound.
    if (!next) void el.play().catch(() => {});
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
        hasAudio && (
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="absolute bottom-3 right-3 z-30 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-primary-700 shadow-lg backdrop-blur transition-transform hover:scale-105"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        )
      )}
    </div>
  );
}
