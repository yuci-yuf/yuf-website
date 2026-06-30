import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/public/Hero";
import { RegistrationForm } from "@/components/public/RegistrationForm";
import { Section } from "@/components/ui/Section";
import { registerContent } from "@/lib/content";
import { getEvents, getCategoryOrder } from "@/lib/cms-data";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Register for Youth United Festival 2026. Choose your event category, fill in your details, and complete payment to secure your spot at YUF 2026.",
};

// Read fresh events so the registration fee always reflects the current admin
// value (the form charges selectedEvent.registrationFee).
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const [events, categoryOrder] = await Promise.all([
    getEvents(),
    getCategoryOrder(),
  ]);
  // Only events that are visible AND still accepting sign-ups are registrable.
  const activeEvents = events.filter(
    (e) => e.isActive && e.registrationOpen !== false,
  );
  // Only offer categories that have at least one active event.
  const presentCategories = Array.from(
    new Set(activeEvents.map((e) => e.category)),
  );
  const categories = [
    ...categoryOrder.filter((c) => presentCategories.includes(c)),
    ...presentCategories.filter((c) => !categoryOrder.includes(c)),
  ];

  return (
    <>
      <Hero data={registerContent.hero} />
      <Section tone="glow">
        {activeEvents.length > 0 ? (
          <Suspense fallback={<div className="h-64 sm:h-96" />}>
            <RegistrationForm events={activeEvents} categories={categories} />
          </Suspense>
        ) : (
          <p className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-surface-alt p-12 text-center text-text-muted">
            Registration isn&apos;t open yet — no events are available. Please
            check back soon.
          </p>
        )}
      </Section>
    </>
  );
}
