"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import type { EventItem } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";
import { FestiveEyebrow, ConfettiDots } from "./FestiveAccents";

export function EventShowcase({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;

  return (
    <section className="bg-hero-gradient relative overflow-hidden py-12 sm:py-16 lg:py-20">
      {/* ── Animated background blobs ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-festival-cyan/15 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-highlight-400/15 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-festival-purple/10 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <ConfettiDots />

      <Container className="relative">
        <FadeUp className="mb-14 flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <FestiveEyebrow className="w-fit text-highlight-400">Popular Events</FestiveEyebrow>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Explore Upcoming Events
            </h2>
          </div>
          <Link
            href="/events"
            className="group hidden items-center gap-1.5 text-sm font-semibold text-white transition-colors hover:text-highlight-300 sm:inline-flex"
          >
            View All Events
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </FadeUp>

        <StaggerContainer stagger={0.12} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <StaggerItem key={event.id}>
              <EventCard event={event} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white"
          >
            View All Events <ArrowRight size={15} />
          </Link>
        </div>
      </Container>
    </section>
  );
}

function EventCard({ event }: { event: EventItem }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl border border-white/15 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-festival-purple/20"
    >
      {/* Full-bleed image fills the whole card */}
      {event.image ? (
        <Image
          src={event.image}
          alt={event.title}
          fill
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200" />
      )}

      {/* Depth veil so the frosted panel reads against any photo */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent"
      />

      {/* Festive gradient bar that grows in on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-20 h-1 origin-left scale-x-0 bg-gradient-to-r from-festival-blue via-festival-cyan to-highlight-500 transition-transform duration-300 group-hover:scale-x-100"
      />

      {/* Full-card click target */}
      <Link
        href={`/events/${event.id}`}
        className="absolute inset-0 z-10"
        aria-label={event.title}
      />

      {/* Translucent frosted panel — the image shows through beneath it */}
      <div className="relative z-20 m-3 flex flex-col gap-3 rounded-2xl border border-white/50 bg-white/65 p-5 shadow-lg backdrop-blur-md">
        <h3 className="font-heading text-lg font-bold text-heading transition-colors group-hover:text-festival-blue">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1.5 text-xs text-body/80">
          {event.date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-highlight-500" /> {event.date}
            </span>
          )}
          {event.venue && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="shrink-0 text-festival-cyan" />
              <span className="truncate">{event.venue}</span>
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-festival-blue">
          View Details
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </motion.article>
  );
}
