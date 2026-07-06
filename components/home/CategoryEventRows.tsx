"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Calendar, MapPin } from "lucide-react";
import type { EventItem } from "@/types";
import { categoryStyle, type CategoryStyle } from "@/lib/category-style";
import { getEventLocations } from "@/lib/event-groups";

export interface CategoryGroup {
  /** The real category key used for filtering/links (e.g. "Arts & Culturals"). */
  key: string;
  /** The label shown to users (e.g. "Non Technical"). */
  label: string;
  events: EventItem[];
}

export function CategoryEventRows({ groups }: { groups: CategoryGroup[] }) {
  return (
    <div className="flex flex-col gap-16 lg:gap-20">
      {groups.map((group) => (
        <CategoryRow key={group.key} group={group} />
      ))}
    </div>
  );
}

function CategoryRow({ group }: { group: CategoryGroup }) {
  if (group.events.length === 0) return null;

  const st = categoryStyle(group.key);
  const Icon = st.icon;
  const featured = group.events[0];
  const side = group.events.slice(1, 4);
  const catHref = `/events?category=${encodeURIComponent(group.key)}`;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Category header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-md"
            style={{ color: st.accent }}
          >
            <Icon size={22} />
          </span>
          <h3 className="font-heading text-xl font-bold text-white sm:text-2xl">
            {group.label}
          </h3>
        </div>

        <Link
          href={catHref}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors hover:text-white"
        >
          View All
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* ── Cards ── layout adapts to how many events the category has ── */}
      {group.events.length === 1 ? (
        // A lone event looks like a giant empty banner in the featured layout,
        // so show it as a wide landscape card (poster left, details right).
        <SoloCard event={featured} st={st} />
      ) : group.events.length === 2 ? (
        // Two events: a single featured card + one compact card looks lopsided
        // and leaves dead space, so show them as two equal hero cards instead.
        <div className="grid gap-5 sm:grid-cols-2">
          {group.events.map((event) => (
            <FeaturedCard key={event.id} event={event} st={st} />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <FeaturedCard event={featured} st={st} />

          <div
            className={`grid gap-4 lg:h-full ${
              side.length === 2 ? "grid-rows-2" : "grid-rows-3"
            }`}
          >
            {side.map((event) => (
              <CompactCard key={event.id} event={event} st={st} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FeaturedCard({ event, st }: { event: EventItem; st: CategoryStyle }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 shadow-lg lg:min-h-[27rem]"
    >
      {event.image ? (
        <Image
          src={event.image}
          alt={event.title}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${st.from}, ${st.to})` }}
        />
      )}

      {/* Depth veil */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5"
      />

      {/* Accent bar grows in on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-20 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ backgroundColor: st.accent }}
      />

      <Link
        href={`/events/${event.id}`}
        className="absolute inset-0 z-10"
        aria-label={event.title}
      />

      <div className="relative z-20 flex flex-col gap-3 p-7 lg:p-9">
        <h4 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
          {event.title}
        </h4>
        <p className="line-clamp-2 max-w-xl text-sm leading-relaxed text-white/75">
          {event.description}
        </p>
        <span
          className="mt-1 inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: st.accent }}
        >
          View Details
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </motion.article>
  );
}

function CompactCard({ event, st }: { event: EventItem; st: CategoryStyle }) {
  const locations = getEventLocations(event);
  const uniq = (arr: (string | undefined)[]) =>
    Array.from(new Set(arr.map((s) => s?.trim()).filter(Boolean)));
  const metaDate = uniq(locations.map((l) => l.date)).join(", ");
  const metaPlace = uniq(
    locations.map((l) => l.district || l.venue),
  ).join(", ");

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative flex min-h-[8rem] items-stretch gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/[0.1]"
    >
      {/* Poster strip — fills the full card height, showing the top of the art */}
      <div className="relative w-32 shrink-0 self-stretch overflow-hidden rounded-xl sm:w-36">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="144px"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${st.from}, ${st.to})` }}
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-end gap-2 py-1 pr-2">
        <h4 className="line-clamp-2 font-heading text-base font-bold leading-snug text-white sm:text-lg">
          {event.title}
        </h4>

        {(metaDate || metaPlace) && (
          <div className="flex flex-col gap-1 text-xs font-medium text-white/70">
            {metaDate && (
              <span className="inline-flex items-start gap-1.5">
                <Calendar size={13} className="mt-0.5 shrink-0 text-primary-200" />
                <span className="line-clamp-1">{metaDate}</span>
              </span>
            )}
            {metaPlace && (
              <span className="inline-flex items-start gap-1.5">
                <MapPin size={13} className="mt-0.5 shrink-0 text-primary-200" />
                <span className="line-clamp-1">{metaPlace}</span>
              </span>
            )}
          </div>
        )}

        <p className="line-clamp-3 text-xs leading-relaxed text-white/60">
          {event.description}
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-200">
          View
          <ArrowUpRight
            size={13}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>

      <Link
        href={`/events/${event.id}`}
        className="absolute inset-0 z-10"
        aria-label={event.title}
      />
    </motion.article>
  );
}

/** A single-event category: a wide landscape card (poster left, details right). */
function SoloCard({ event, st }: { event: EventItem; st: CategoryStyle }) {
  const locations = getEventLocations(event);
  const uniq = (arr: (string | undefined)[]) =>
    Array.from(new Set(arr.map((s) => s?.trim()).filter(Boolean)));
  const metaDate = uniq(locations.map((l) => l.date)).join(", ");
  const metaPlace = uniq(locations.map((l) => l.district || l.venue)).join(", ");

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-lg backdrop-blur-sm sm:grid-cols-[minmax(0,18rem)_1fr]"
    >
      {/* Poster — matches the content height (no big empty frame) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-auto sm:h-full sm:min-h-[12rem]">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(min-width: 640px) 18rem, 100vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${st.from}, ${st.to})` }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center gap-2.5 p-6 lg:p-8">
        <h4 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
          {event.title}
        </h4>

        {(metaDate || metaPlace) && (
          <div className="flex flex-col gap-1.5 text-sm font-medium text-white/70">
            {metaDate && (
              <span className="inline-flex items-center gap-2">
                <Calendar size={15} className="shrink-0 text-primary-200" />
                {metaDate}
              </span>
            )}
            {metaPlace && (
              <span className="inline-flex items-center gap-2">
                <MapPin size={15} className="shrink-0 text-primary-200" />
                {metaPlace}
              </span>
            )}
          </div>
        )}

        <p className="line-clamp-3 max-w-2xl text-sm leading-relaxed text-white/70">
          {event.description}
        </p>
        <span
          className="mt-1 inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: st.accent }}
        >
          View Details
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>

      <Link
        href={`/events/${event.id}`}
        className="absolute inset-0 z-10"
        aria-label={event.title}
      />
    </motion.article>
  );
}
