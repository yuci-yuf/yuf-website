import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/public/Hero";
import { RegistrationForm } from "@/components/public/RegistrationForm";
import { Section } from "@/components/ui/Section";
import { events, eventCategoryOrder, registerContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Register for Youth United Festival 2026. Choose your event category, fill in your details, and complete payment to secure your spot at YUF 2026.",
};

export default function RegisterPage() {
  const activeEvents = events.filter((e) => e.isActive);

  return (
    <>
      <Hero data={registerContent.hero} />
      <Section>
        <Suspense fallback={<div className="h-96" />}>
          <RegistrationForm events={activeEvents} categories={eventCategoryOrder} />
        </Suspense>
      </Section>
    </>
  );
}
