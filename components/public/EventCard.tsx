import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { EventItem } from "@/types";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-200 hover:shadow-hover">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary-600 to-primary-900">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="absolute bottom-4 left-4 font-heading text-2xl font-bold text-white/90">
            {event.title.charAt(0)}
          </span>
        )}
        {/* Bottom gradient overlay for readability */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary-950/50 to-transparent"
          aria-hidden
        />
        <span className="absolute left-4 top-4 z-10 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-primary-800 backdrop-blur-sm">
          {event.tag}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-heading text-xl font-bold text-heading">
          <Link href={`/events/${event.id}`} className="hover:text-primary-700 transition-colors">
            {event.title}
          </Link>
        </h3>
        <p className="flex-1 text-sm leading-relaxed text-text-muted">
          {event.description}
        </p>
        <Link
          href={`/events/${event.id}`}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 transition-colors hover:text-accent-600"
        >
          View Details
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
}
