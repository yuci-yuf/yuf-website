import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import type { EventItem } from "@/types";
import { categoryStyle } from "@/lib/category-style";
import { getEventLocations, audienceLabel } from "@/lib/event-groups";

export function EventCard({ event }: { event: EventItem }) {
  const style = categoryStyle(event.category);
  const Icon = style.icon;
  const audience = audienceLabel(event.audience);

  // Location-aware meta: keep the card to two lines — one for date(s), one for
  // place(s) — even when the event runs in multiple places. Multi-location
  // events also get a "N locations" badge; the detail page lists each fully.
  const locations = getEventLocations(event);
  const multi = locations.length > 1;

  // Combine dates and places across locations, de-duplicated, into one line each.
  const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
  const metaDate = uniq(locations.map((l) => l.date?.trim() ?? "")).join(", ");
  const metaPlace = uniq(
    locations.map((l) => (l.district || l.venue || "").trim()),
  ).join(", ");

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-hover">
      {/* Category-colored accent bar, revealed on hover. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-20 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ backgroundColor: style.accent }}
      />

      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{ backgroundImage: `linear-gradient(135deg, ${style.from}, ${style.to})` }}
      >
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            {/* Diagonal stripe texture */}
            <span
              aria-hidden
              className="absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, #fff 0 2px, transparent 2px 18px)",
              }}
            />
            {/* Oversized watermark icon */}
            <Icon
              aria-hidden
              strokeWidth={1.25}
              className="absolute -bottom-5 -right-4 h-36 w-36 text-white/10"
            />
            {/* Centered icon chip */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-white shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <Icon size={28} />
              </span>
            </span>
          </>
        )}

        {/* Bottom scrim for badge/legibility */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary-950/55 to-transparent"
          aria-hidden
        />

        {/* Multi-location hint */}
        {multi && (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-3 py-1 text-xs font-semibold text-text shadow-sm ring-1 ring-border backdrop-blur-sm">
            <MapPin size={12} style={{ color: style.accent }} />
            {locations.length} locations
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {/* Schedule meta — kept to two lines: all dates on one, all places on
            the other, even for multi-location events. */}
        {(metaDate || metaPlace) && (
          <div className="flex flex-col gap-1.5 text-xs font-medium text-text-muted">
            {metaDate && (
              <span className="inline-flex min-w-0 items-start gap-1.5">
                <Calendar
                  size={14}
                  className="mt-0.5 shrink-0 text-primary-500"
                />
                <span className="line-clamp-1">{metaDate}</span>
              </span>
            )}
            {metaPlace && (
              <span className="inline-flex min-w-0 items-start gap-1.5">
                <MapPin
                  size={14}
                  className="mt-0.5 shrink-0 text-primary-500"
                />
                <span className="line-clamp-1">{metaPlace}</span>
              </span>
            )}
          </div>
        )}

        <h3 className="font-heading text-xl font-bold text-heading">
          <Link
            href={`/events/${event.id}`}
            className="transition-colors hover:text-primary-700"
          >
            {/* Full-card click target without nesting links */}
            <span className="absolute inset-0 z-10" aria-hidden />
            {event.title}
          </Link>
        </h3>

        {audience && (
          <span className="inline-flex w-fit items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
            {audience}
          </span>
        )}

        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-text-muted">
          {event.description}
        </p>

        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 transition-colors group-hover:text-accent-600">
          View Details
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </article>
  );
}
