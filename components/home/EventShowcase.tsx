"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import type { EventItem } from "@/types";
import { Container } from "@/components/ui/Container";
import { FadeUp, StaggerContainer, StaggerItem } from "./MotionWrapper";

export function EventShowcase({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-24 lg:py-32">
      <Container>
        <FadeUp className="mb-14 flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <span className="w-fit text-sm font-bold uppercase tracking-[0.2em] text-primary-600">
              Popular Events
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Explore Upcoming Events
            </h2>
          </div>
          <Link
            href="/events"
            className="hidden items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 sm:inline-flex"
          >
            View All Events
            <ArrowRight size={15} />
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
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600"
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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <span className="font-heading text-4xl font-bold text-primary-200">
              {event.title.charAt(0)}
            </span>
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 backdrop-blur-sm">
          {event.tag}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-heading text-lg font-bold text-gray-900">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1.5 text-xs text-gray-400">
          {event.date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} /> {event.date}
            </span>
          )}
          {event.venue && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} /> {event.venue}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            View Details
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
