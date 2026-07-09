import type { Metadata } from "next";
import { Suspense } from "react";
import { Lock } from "lucide-react";
import { RegistrationForm } from "@/components/public/RegistrationForm";
import { Section } from "@/components/ui/Section";
import { getEvents, getCategoryOrder, getRegistrationSettings } from "@/lib/cms-data";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Register for Youth United Festival 2026. Choose your event category, fill in your details, and complete payment to secure your spot at YUF 2026.",
};

// Read fresh events so the registration fee always reflects the current admin
// value (the form charges selectedEvent.registrationFee).
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const [events, categoryOrder, settings] = await Promise.all([
    getEvents(),
    getCategoryOrder(),
    getRegistrationSettings(),
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
      <Section tone="glow" className="pt-28 sm:pt-32">
        {!settings.open ? (
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-border bg-surface p-10 text-center shadow-card">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Lock size={26} />
            </span>
            <h2 className="font-heading text-2xl font-bold text-heading">
              Registration is closed
            </h2>
            <p className="text-text-muted">{settings.closedMessage}</p>
          </div>
        ) : activeEvents.length > 0 ? (
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
