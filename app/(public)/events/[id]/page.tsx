import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <section className="bg-festival-gradient relative overflow-hidden py-24 text-white lg:py-36">
        {event.image && (
          <Image
            src={event.image}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        {/* Scrim: darken + brand tint so white text stays legible over any photo */}
        <div
          className="absolute inset-0"
          style={{
            background: event.image
              ? "linear-gradient(120deg, rgba(20,40,90,0.5) 0%, rgba(28,79,198,0.4) 40%, rgba(26,166,206,0.32) 100%), linear-gradient(0deg, rgba(10,20,45,0.55) 0%, transparent 55%)"
              : "radial-gradient(120% 100% at 12% 8%, rgba(123,52,226,0.5) 0%, transparent 46%), linear-gradient(120deg, rgba(28,79,198,0.92) 0%, rgba(30,127,212,0.9) 38%, rgba(26,166,206,0.88) 62%, rgba(30,198,192,0.92) 100%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-4xl px-6 lg:px-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            All Events
          </Link>
          <div className="mt-6 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-white/15 px-4 py-1.5 text-sm text-white ring-1 ring-white/25 backdrop-blur-sm">
                {event.category}
              </Badge>
            </div>
            <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
              {event.date && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={16} className="text-highlight-400" /> {event.date}
                </span>
              )}
              {event.venue && (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} className="text-highlight-400" /> {event.venue}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <Section tone="glow" containerClassName="max-w-4xl">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-5">
            <h2 className="font-heading text-2xl font-bold text-heading">
              About this event
            </h2>
            {body.map((p, i) => (
              <p key={i} className="leading-relaxed text-text-muted">
                {p}
              </p>
            ))}

            {event.rules && event.rules.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                <h3 className="font-heading text-xl font-bold text-heading">
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
                <h3 className="font-heading text-lg font-bold text-heading">
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
                <Button asChild size="lg" className="mt-6 w-full">
                  <Link href={`/register?event=${event.id}`}>Register Now</Link>
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-heading text-lg font-bold text-heading">
                  Registration closed
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Sign-ups for {event.title} are no longer being accepted.
                </p>
                <Button asChild size="lg" variant="outline" className="mt-6 w-full">
                  <Link href="/events">Browse other events</Link>
                </Button>
              </>
            )}
          </aside>
        </div>
      </Section>

      {/* Related events */}
      {related.length > 0 && (
        <Section tone="tint">
          <h2 className="mb-10 font-heading text-2xl font-bold text-heading">
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
