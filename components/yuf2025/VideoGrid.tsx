import Image from "next/image";
import { Play } from "lucide-react";

export interface VideoItem {
  poster: string;
  title: string;
  /** Small label shown on the card (e.g. category or speaker role). */
  tag?: string;
  /** Optional external video URL (YouTube/Vimeo/mp4). Opens in a new tab. */
  href?: string;
}

/**
 * Grid of video "reel" cards. Posters are festival photos; wire real footage
 * later by passing `href` on each item (renders as a link that opens the video).
 */
export function VideoGrid({ videos }: { videos: VideoItem[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((v) => {
        const inner = (
          <>
            <Image
              src={v.poster}
              alt={v.title}
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Cinematic scrim */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-primary-950/85 via-primary-950/20 to-primary-950/10"
            />

            {/* Play button */}
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/15 ring-1 ring-white/40 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-highlight-500">
                <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-white/20" />
                <Play size={26} className="relative ml-1 fill-white text-white" />
              </span>
            </span>

            {v.tag && (
              <span className="absolute left-4 top-4 rounded-full bg-highlight-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary-950">
                {v.tag}
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 p-5">
              <h4 className="font-display text-lg font-extrabold leading-tight text-white">
                {v.title}
              </h4>
            </div>
          </>
        );

        const cls =
          "group relative flex aspect-video overflow-hidden rounded-2xl ring-1 ring-white/12 shadow-lg transition-shadow duration-300 hover:shadow-xl hover:shadow-highlight-500/20";

        return v.href ? (
          <a
            key={v.title}
            href={v.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cls}
          >
            {inner}
          </a>
        ) : (
          <div key={v.title} className={cls}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
