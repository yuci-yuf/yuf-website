import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { EventCard } from "@/components/public/EventCard";
import { getEvents, getEventById } from "@/lib/cms-data";

// Read fresh CMS data on every request so admin edits (including fee changes)
// show after a reload, and events created post-build resolve without a rebuild.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return { title: "Event Not Found" };
  return {
    title: event.title,
    description: event.description,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const allEvents = await getEvents();
  const event = allEvents.find((e) => e.id === id);
  if (!event) notFound();

  const body = event.details ?? [event.description];
  const related = allEvents
    .filter((e) => e.category === event.category && e.id !== event.id)
    .slice(0, 3);

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden bg-primary-950 py-20 text-white lg:py-28">
        {event.image && (
          <Image
            src={event.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/85 to-primary-900/60" aria-hidden />
        <div className="relative mx-auto w-full max-w-4xl px-6 lg:px-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-200 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            All Events
          </Link>
          <div className="mt-6 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="solid">{event.category}</Badge>
              <span className="inline-flex items-center gap-1.5 text-sm text-primary-200">
                <Tag size={15} /> {event.tag}
              </span>
            </div>
            <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-100">
              {event.date && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={16} className="text-accent-400" /> {event.date}
                </span>
              )}
              {event.venue && (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} className="text-accent-400" /> {event.venue}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <Section containerClassName="max-w-4xl">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-5">
            <h2 className="font-heading text-2xl font-bold text-text">
              About this event
            </h2>
            {body.map((p, i) => (
              <p key={i} className="leading-relaxed text-text-muted">
                {p}
              </p>
            ))}

            {event.rules && event.rules.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                <h3 className="font-heading text-xl font-bold text-text">
                  Rules &amp; Guidelines
                </h3>
                <ul className="flex list-disc flex-col gap-2 pl-5 text-text-muted">
                  {event.rules.map((rule, i) => (
                    <li key={i} className="leading-relaxed">
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Register card */}
          <aside className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-card lg:sticky lg:top-28">
            {event.registrationOpen !== false ? (
              <>
                <h3 className="font-heading text-lg font-bold text-text">
                  Ready to participate?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Secure your spot for {event.title} at Youth United Festival 2026.
                </p>
                {typeof event.registrationFee === "number" && (
                  <p className="mt-4 text-sm text-text">
                    <span className="font-semibold">Registration fee:</span>{" "}
                    ₹{event.registrationFee}
                  </p>
                )}
                <Button
                  href={`/register?event=${event.id}`}
                  size="lg"
                  variant="secondary"
                  className="mt-6 w-full"
                >
                  Register Now
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-heading text-lg font-bold text-text">
                  Registration closed
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Sign-ups for {event.title} are no longer being accepted.
                </p>
                <Button
                  href="/events"
                  size="lg"
                  variant="outline"
                  className="mt-6 w-full"
                >
                  Browse other events
                </Button>
              </>
            )}
          </aside>
        </div>
      </Section>

      {/* Related events */}
      {related.length > 0 && (
        <Section className="bg-surface-alt">
          <h2 className="mb-10 font-heading text-2xl font-bold text-text">
            More in {event.category}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
