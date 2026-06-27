import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { EventItem } from "@/types";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hover">
      {/* Image placeholder band (Cloudinary image drops in here later) */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary-600 to-primary-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(20rem 12rem at 70% 20%, rgba(245,158,11,0.6), transparent)",
          }}
          aria-hidden
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-800">
          {event.tag}
        </span>
        <span className="absolute bottom-4 left-4 font-heading text-2xl font-bold text-white/90">
          {event.title.charAt(0)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-heading text-lg font-bold text-text">{event.title}</h3>
        <p className="flex-1 text-sm leading-relaxed text-text-muted">
          {event.description}
        </p>
        <Link
          href={`/register?event=${event.id}`}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 transition-colors hover:text-accent-600"
        >
          Register
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
