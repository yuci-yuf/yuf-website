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
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/40 via-white to-highlight-50/40 py-16 sm:py-24 lg:py-32">
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
            <FestiveEyebrow className="w-fit">Popular Events</FestiveEyebrow>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-heading sm:text-4xl">
              Explore Upcoming Events
            </h2>
          </div>
          <Link
            href="/events"
            className="group hidden items-center gap-1.5 text-sm font-semibold text-festival-blue transition-colors hover:text-festival-blue-dark sm:inline-flex"
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
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-festival-blue"
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
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-highlight-400/50 hover:shadow-xl hover:shadow-festival-purple/10"
    >
      {/* Festive gradient bar that grows in on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-20 h-1 origin-left scale-x-0 bg-gradient-to-r from-festival-blue via-festival-cyan to-highlight-500 transition-transform duration-300 group-hover:scale-x-100"
      />

      <div className="relative aspect-[16/10] overflow-hidden">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <span className="font-heading text-4xl font-bold text-primary-200">
              {event.title.charAt(0)}
            </span>
          </div>
        )}
        {/* Bottom gradient veil for depth, deepens on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-festival-purple/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-highlight-500 to-highlight-400 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          {event.tag}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-heading text-lg font-bold text-heading transition-colors group-hover:text-festival-blue">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1.5 text-xs text-body/70">
          {event.date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-highlight-500" /> {event.date}
            </span>
          )}
          {event.venue && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-festival-cyan" /> {event.venue}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-festival-blue transition-colors hover:text-festival-blue-dark"
          >
            View Details
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
