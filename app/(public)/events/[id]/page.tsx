import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/Section";
import { EventCard } from "@/components/public/EventCard";
import { getEvents, getEventById } from "@/lib/cms-data";
import {
  getEventLocations,
  audienceLabel,
  eventAudienceLabel,
  locationAudience,
} from "@/lib/event-groups";
import { SITE_URL } from "@/app/layout";

/** Best-effort conversion of a human date label ("2nd Sept 2026") to ISO. */
function toIsoDate(label?: string): string | undefined {
  if (!label) return undefined;
  let s = label
    .replace(/(\d+)(st|nd|rd|th)/gi, "$1")
    .replace(/\bsept\b/gi, "Sep");
  const range = s.match(/^(\d{1,2})\s*[–—-]\s*\d{1,2}(\s+\w+\s+\d{4})$/);
  if (range) s = `${range[1]}${range[2]}`;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Make an image path absolute for OG tags / structured data. */
function absImage(src?: string): string | undefined {
  if (!src) return undefined;
  return src.startsWith("http") ? src : `${SITE_URL}${src}`;
}

/**
 * Turn a Cloudinary file URL into a forced-download URL: insert the
 * `fl_attachment` flag so the browser downloads the file (Content-Disposition:
 * attachment) with a friendly name instead of opening it in the PDF viewer.
 * Non-Cloudinary URLs (e.g. an admin-pasted link) are returned unchanged.
 */
function ruleBookDownloadUrl(url: string): string {
  if (!url.includes("res.cloudinary.com") || url.includes("/fl_attachment"))
    return url;
  return url.replace("/upload/", "/upload/fl_attachment:YUF-Rule-Book/");
}

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
  const img = absImage(event.image);
  return {
    title: `${event.title} — YUF 2026`,
    description: event.description,
    alternates: { canonical: `/events/${id}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/events/${id}`,
      title: `${event.title} — Youth United Festival 2026`,
      description: event.description,
      images: img ? [{ url: img }] : undefined,
    },
  };
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ loc?: string }>;
}) {
  const { id } = await params;
  const { loc } = await searchParams;
  const allEvents = await getEvents();
  const event = allEvents.find((e) => e.id === id);
  if (!event) notFound();

  const locations = getEventLocations(event);
  const multi = locations.length > 1;
  // The location picked from the listing (?loc=), else the first one.
  const selectedLocation =
    locations.find((l) => l.id === loc) ?? locations[0];

  const body = event.details ?? [event.description];
  const related = allEvents
    .filter((e) => e.category === event.category && e.id !== event.id)
    .slice(0, 3);

  // Event structured data — makes the page eligible for rich event results.
  const startDate = toIsoDate(selectedLocation?.date);
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    ...(absImage(event.image) ? { image: [absImage(event.image)] } : {}),
    ...(startDate ? { startDate } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    organizer: {
      "@type": "Organization",
      name: "Youth United Council of India",
      url: SITE_URL,
    },
    location: (locations.length ? locations : [{ city: "", address: "" }]).map(
      (l) => ({
        "@type": "Place",
        name: l.address || l.city || "Youth United Festival",
        address:
          [l.address, l.city].filter(Boolean).join(", ") || "Tamil Nadu, India",
      }),
    ),
    ...(typeof event.registrationFee === "number"
      ? {
          offers: {
            "@type": "Offer",
            price: event.registrationFee,
            priceCurrency: "INR",
            url: `${SITE_URL}/register?event=${event.id}`,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
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
        <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8">
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
              {eventAudienceLabel(event) && (
                <Badge className="bg-highlight-400/20 px-4 py-1.5 text-sm text-white ring-1 ring-highlight-300/40 backdrop-blur-sm">
                  {eventAudienceLabel(event)}
                </Badge>
              )}
            </div>
            <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-3 text-sm">
              {/* Single-location: date + venue on one line. Multi-location:
                  list every location with its own date. Each sits in a
                  translucent pill so it stays legible over the hero image. */}
              {!multi ? (
                <>
                  {selectedLocation?.date && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary-950/45 px-4 py-1.5 font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
                      <CalendarDays size={16} className="text-highlight-400" />
                      {selectedLocation.date}
                    </span>
                  )}
                  {(selectedLocation?.address || selectedLocation?.city) && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary-950/45 px-4 py-1.5 font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
                      <MapPin size={16} className="text-highlight-400" />
                      {[selectedLocation.address, selectedLocation.city]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  )}
                </>
              ) : (
                locations.map((loc) => {
                  const locAudience = audienceLabel(locationAudience(event, loc));
                  return (
                    <span
                      key={loc.id}
                      className="inline-flex items-center gap-2 rounded-full bg-primary-950/45 px-4 py-1.5 font-medium text-white ring-1 ring-white/20 backdrop-blur-sm"
                    >
                      <MapPin size={16} className="text-highlight-400" />
                      {[loc.address, loc.city].filter(Boolean).join(" · ")}
                      {loc.date && (
                        <span className="font-semibold text-highlight-300">
                          · {loc.date}
                        </span>
                      )}
                      {locAudience && (
                        <span className="rounded-full bg-highlight-400/25 px-2 py-0.5 text-xs font-semibold text-white">
                          {locAudience}
                        </span>
                      )}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <Section tone="glow">
        <div className="grid gap-12 lg:grid-cols-[1.7fr_1fr] lg:items-start">
          <div className="flex max-w-3xl flex-col gap-5">
            <h2 className="font-heading text-2xl font-bold text-heading">
              About this event
            </h2>
            {body.map((p, i) => (
              <p key={i} className="leading-relaxed text-text-muted">
                {p}
              </p>
            ))}

            {event.guidelines && event.guidelines.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                <h3 className="font-heading text-xl font-bold text-heading">
                  General Guidelines
                </h3>
                <ul className="flex list-disc flex-col gap-2 pl-5 text-text-muted">
                  {event.guidelines.map((item, i) => (
                    <li key={i} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.rules && event.rules.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                <h3 className="font-heading text-xl font-bold text-heading">
                  Rules &amp; Regulations
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
          <aside className="h-fit overflow-hidden rounded-2xl border border-border bg-surface shadow-card lg:sticky lg:top-28">
            {/* Framed event photo at the top of the card */}
            {event.image && (
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(min-width: 1024px) 24rem, 100vw"
                  className="object-cover"
                />
              </div>
            )}

            <div className="p-6">
            {event.registrationOpen !== false ? (
              <>
                <h3 className="font-heading text-lg font-bold text-heading">
                  Ready to participate?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Secure your spot for {event.title} at Youth United Festival 2026.
                </p>
                {typeof event.registrationFee === "number" && (
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
                    <span className="text-sm font-semibold text-primary-800">
                      Registration fee
                    </span>
                    <span className="font-heading text-2xl font-extrabold text-primary-700">
                      ₹{event.registrationFee}
                    </span>
                  </div>
                )}

                {multi && (
                  <div className="mt-5 flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Available locations
                    </p>
                    <ul className="flex flex-col gap-2">
                      {locations.map((location) => (
                        <li
                          key={location.id}
                          className="flex items-start gap-2 rounded-xl border border-border bg-surface-alt px-3.5 py-2.5"
                        >
                          <MapPin
                            size={15}
                            className="mt-0.5 shrink-0 text-primary-600"
                          />
                          <span className="flex min-w-0 flex-col">
                            <span className="text-sm font-medium text-text">
                              {location.address ||
                                location.city ||
                                "Location"}
                            </span>
                            {(location.city || location.date) && (
                              <span className="text-xs text-text-muted">
                                {[location.city, location.date]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-text-muted">
                      You&apos;ll choose your location on the next step.
                    </p>
                  </div>
                )}

                <Button asChild size="lg" className="mt-6 w-full">
                  <Link
                    href={`/register?event=${event.id}${
                      selectedLocation && !multi
                        ? `&loc=${encodeURIComponent(selectedLocation.id)}`
                        : ""
                    }`}
                  >
                    Register Now
                  </Link>
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

            {event.ruleBook && (
              <a
                href={ruleBookDownloadUrl(event.ruleBook)}
                download
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary-300 bg-white px-6 text-[15px] font-semibold text-primary-700 transition-colors hover:border-primary-500 hover:bg-primary-50"
                style={{ height: "3rem" }}
              >
                <FileDown size={17} />
                Download Rule Book (PDF)
              </a>
            )}
            </div>
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
