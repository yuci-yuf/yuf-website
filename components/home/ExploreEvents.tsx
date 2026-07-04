import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Clock,
  Users,
  Star,
  CheckCircle2,
} from "lucide-react";
import type { EventItem } from "@/types";
import { Container } from "@/components/ui/Container";
import { categoryStyle } from "@/lib/category-style";

/**
 * Home events showcase — an editorial bento masonry inspired by a festival
 * "lineup" layout. Four tile types (content card, full-bleed image tile, a
 * stats card, and a register feature card) mix into a 3-column masonry.
 *
 * Signature device: the day-over-month date block. The festival runs on real
 * dated heats, so leading a card with its date is information, not decoration.
 *
 * Server component; all data is static.
 */

// Tile treatment per position (cycled): "tile" = full-bleed image, "stats" =
// content card with a registered-count footer, else a plain content card.
const VARIANTS = ["content", "tile", "stats", "tile", "content"] as const;

function splitDate(date?: string) {
  if (!date) return null;
  const m = /(\d{1,2})[a-z]*\s+([A-Za-z]+)/.exec(date);
  return m ? { day: m[1], month: m[2].slice(0, 3).toUpperCase() } : null;
}

/** Day-over-month block — the section's recurring structural device. */
function DateBlock({ date }: { date?: string }) {
  const d = splitDate(date);
  if (!d) return null;
  return (
    <div className="flex shrink-0 flex-col items-center leading-none">
      <span className="font-display text-[1.7rem] font-extrabold text-primary-600">
        {d.day}
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">
        {d.month}
      </span>
    </div>
  );
}

function AvatarStack({ count }: { count: number }) {
  return (
    <div className="flex items-center">
      {[0, 1, 2].map((k) => (
        <span
          key={k}
          className="-ml-2 h-7 w-7 rounded-full bg-primary-100 ring-2 ring-white first:ml-0"
          aria-hidden
        />
      ))}
      {count > 0 && (
        <span className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white ring-2 ring-white">
          +{count}
        </span>
      )}
    </div>
  );
}

export function ExploreEvents({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-surface py-16 lg:py-24">
      <Container>
        {/* ── Header ── */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-heading sm:text-5xl">
              Explore the Games
            </h2>
            <p className="text-[17px] leading-relaxed text-body">
              Every contest, meet, and showcase of Youth United Festival 2026 —
              find your discipline and claim your spot on the schedule.
            </p>
          </div>
          <Link
            href="/events"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:bg-primary-700 hover:shadow-hover"
          >
            View all events
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* ── Masonry ── */}
        <div className="gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
          {events.map((event, i) => {
            const st = categoryStyle(event.category);
            const variant = VARIANTS[i % VARIANTS.length];

            /* ── Full-bleed image tile ── */
            if (variant === "tile") {
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group relative mb-6 block break-inside-avoid overflow-hidden rounded-3xl shadow-card ring-1 ring-black/5 transition-shadow hover:shadow-hover"
                  style={{ aspectRatio: i % 4 === 1 ? "3 / 4.3" : "4 / 3.4" }}
                >
                  {event.image ? (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover transition-transform duration-[600ms] group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundImage: `linear-gradient(135deg, ${st.from}, ${st.to})` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <span
                    className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm"
                    style={{ backgroundColor: `${st.accent}e6` }}
                  >
                    {event.category}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5">
                    <h3 className="font-display text-2xl font-extrabold leading-tight text-white">
                      {event.title}
                    </h3>
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <Clock size={13} />
                      {event.date ?? "Dates soon"}
                    </span>
                  </div>
                </Link>
              );
            }

            /* ── Content card (plain + stats variants share the top) ── */
            return (
              <article
                key={event.id}
                className="group mb-6 break-inside-avoid rounded-3xl bg-white p-2.5 shadow-card transition-shadow hover:shadow-hover"
              >
                {/* Inset rounded image */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  {event.image ? (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover transition-transform duration-[600ms] group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundImage: `linear-gradient(135deg, ${st.from}, ${st.to})` }}
                    />
                  )}
                  <span
                    className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
                    style={{ backgroundColor: st.accent }}
                  >
                    {event.category}
                  </span>
                </div>

                <div className="flex flex-col gap-3 px-3.5 pb-4 pt-4">
                  <div className="flex items-start gap-4">
                    <DateBlock date={event.date} />
                    <h3 className="font-display text-xl font-extrabold leading-snug text-heading">
                      <Link href={`/events/${event.id}`} className="transition-colors hover:text-primary-700">
                        {event.title}
                      </Link>
                    </h3>
                  </div>

                  {event.venue && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
                      <MapPin size={15} className="shrink-0 text-primary-500" /> {event.venue}
                    </span>
                  )}

                  <p className="line-clamp-3 text-sm leading-relaxed text-body">
                    {event.description}
                  </p>

                  {variant === "stats" ? (
                    <div className="mt-1 flex items-center justify-between border-t border-border pt-4">
                      <AvatarStack count={event.registrationCount ?? 0} />
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted">
                        <Users size={14} className="text-primary-500" />
                        {event.registrationCount
                          ? `${event.registrationCount} registered`
                          : "Be the first"}
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={`/events/${event.id}`}
                      className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 transition-colors hover:text-accent-600"
                    >
                      View details
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}

          {/* ── Register feature card ── */}
          <div className="mb-6 break-inside-avoid rounded-3xl border-t-4 border-primary-600 bg-white p-8 shadow-card">
            <span className="flex h-14 w-14 items-center justify-center rounded-full ring-2 ring-primary-600 text-primary-600">
              <Star size={26} />
            </span>
            <h3 className="mt-5 font-display text-2xl font-extrabold text-heading">
              Compete at YUF 2026
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-body">
              Pick your competition and lock in your place. Every registration
              comes with the full festival package.
            </p>
            <ul className="mt-5 flex flex-col gap-3">
              {[
                "Participation certificate",
                "Merit awards & trophies",
                "YUF 2026 merchandise",
              ].map((perk) => (
                <li key={perk} className="flex items-center gap-2.5 text-sm text-text">
                  <CheckCircle2 size={18} className="shrink-0 text-primary-600" />
                  {perk}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="group mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-600 text-sm font-semibold text-white transition-all hover:bg-primary-700"
            >
              Register now
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
