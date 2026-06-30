"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, Clock, Phone, MapPin, CheckCircle2 } from "lucide-react";
import type { EventItem } from "@/types";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { siteConfig, registerContent } from "@/lib/content";
import { submitRegistration } from "@/lib/submissions";
import { cn } from "@/lib/utils";

const steps = ["Personal Info", "Event Selection", "Review", "Payment"];

export function RegistrationForm({
  events,
  categories,
}: {
  events: EventItem[];
  categories: EventItem["category"][];
}) {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("event");
  const preselected = events.find((e) => e.id === preselectedId);

  const [category, setCategory] = useState<string>(preselected?.category ?? "");
  const [eventId, setEventId] = useState<string>(preselected?.id ?? "");

  const eventsInCategory = useMemo(
    () => events.filter((e) => e.category === category),
    [category, events],
  );

  const selectedEvent = events.find((e) => e.id === eventId);
  const fee = selectedEvent?.registrationFee;
  const feeLabel = fee != null ? `₹ ${fee.toLocaleString("en-IN")}` : "—";

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Guard: only events still open for registration can be submitted. The
    // dropdown is already filtered to these, but this blocks a stale/deep-link
    // selection of a closed event.
    if (!selectedEvent || selectedEvent.registrationOpen === false) return;
    const data = new FormData(e.currentTarget);
    setStatus("submitting");
    try {
      // Razorpay checkout (Phase 3) will run before this write; for now we
      // persist the registration with a pending payment status.
      await submitRegistration({
        firstName: String(data.get("firstName") ?? ""),
        lastName: String(data.get("lastName") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        location: String(data.get("location") ?? ""),
        institution: String(data.get("institution") ?? ""),
        eventCategory: selectedEvent.category,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        ageCategory: String(data.get("ageCategory") ?? ""),
        message: String(data.get("message") ?? ""),
        amountPaid: fee ?? 0,
      });
      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Registration failed:", err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-10 text-center shadow-card">
        <CheckCircle2 size={48} className="text-success" />
        <h2 className="font-heading text-2xl font-bold text-text">Registration received!</h2>
        <p className="text-text-muted">
          Thanks for registering for <strong className="text-text">{selectedEvent?.title}</strong>.
          Your spot is reserved with a pending payment status — our team will reach
          out with payment and confirmation details.
        </p>
        <Button href="/events" variant="outline">Browse more events</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      {/* ── Form ── */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8"
      >
        {/* Progress indicator */}
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
          {steps.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-text-muted">{label}</span>
              {i < steps.length - 1 && (
                <span className="mx-1 hidden h-px w-6 bg-border sm:inline-block" aria-hidden />
              )}
            </li>
          ))}
        </ol>

        <h2 className="font-heading text-2xl font-bold text-text">Registration</h2>

        {/* Personal details */}
        <fieldset className="flex flex-col gap-5">
          <legend className="mb-2 flex items-center gap-2 font-heading text-lg font-bold text-text">
            Personal Details
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="First Name" htmlFor="firstName" required>
              <Input id="firstName" name="firstName" required autoComplete="given-name" placeholder="Enter your first name" />
            </Field>
            <Field label="Last Name" htmlFor="lastName" required>
              <Input id="lastName" name="lastName" required autoComplete="family-name" placeholder="Enter your last name" />
            </Field>
            <Field label="Phone Number" htmlFor="phone" required>
              <Input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="Enter your phone number" />
            </Field>
            <Field label="Email Address" htmlFor="email" required>
              <Input id="email" name="email" type="email" required autoComplete="email" placeholder="Enter your email" />
            </Field>
          </div>
        </fieldset>

        {/* Institution */}
        <fieldset className="flex flex-col gap-5">
          <legend className="mb-2 flex items-center gap-2 font-heading text-lg font-bold text-text">
            Institution Details
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Location" htmlFor="location" required>
              <Select id="location" name="location" required defaultValue="">
                <option value="" disabled>Select a location</option>
                {registerContent.locations.map((l) => (
                  <option key={l.city} value={l.city}>{l.city}</option>
                ))}
              </Select>
            </Field>
            <Field label="College / School" htmlFor="institution" required>
              <Input id="institution" name="institution" required placeholder="Enter your college or school name" />
            </Field>
          </div>
        </fieldset>

        {/* Event selection */}
        <fieldset className="flex flex-col gap-5">
          <legend className="mb-2 flex items-center gap-2 font-heading text-lg font-bold text-text">
            Event Selection
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Event Category" htmlFor="category" required>
              <Select
                id="category"
                name="category"
                required
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setEventId("");
                }}
              >
                <option value="" disabled>Select a category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Event" htmlFor="event" required>
              <Select
                id="event"
                name="event"
                required
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                disabled={!category}
              >
                <option value="" disabled>
                  {category ? "Select an event" : "Select a category first"}
                </option>
                {eventsInCategory.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </Select>
            </Field>
          </div>

          {/* Age category */}
          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-medium text-text">
              Age Category <span className="text-error">*</span>
            </span>
            <div className="flex flex-wrap gap-3">
              {siteConfig.ageCategories.map((age) => (
                <label
                  key={age.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-700"
                >
                  <input type="radio" name="ageCategory" value={age.value} required className="accent-primary-600" />
                  {age.label}
                </label>
              ))}
            </div>
          </div>

          <Field label="Message / Special Requests" htmlFor="message">
            <Textarea
              id="message"
              name="message"
              placeholder="Any special requests, accessibility needs, or additional information you'd like to share..."
            />
          </Field>
        </fieldset>

        {/* Fee + payment */}
        <div className="flex flex-col gap-4 rounded-xl bg-surface-alt p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium text-text">
              Amount to Pay
            </span>
            <span className="font-heading text-xl font-bold text-primary-700">
              {feeLabel}
            </span>
          </div>
          <p className="flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck size={16} className="text-success" />
            Secure payment powered by Razorpay. We accept UPI, cards, net banking &amp; wallets.
          </p>
        </div>

        {status === "error" && (
          <p className="text-sm text-error">
            Something went wrong saving your registration. Please try again.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={status === "submitting"}
          icon={<Lock size={18} />}
        >
          {status === "submitting" ? "Submitting…" : "Pay & Complete Registration"}
        </Button>

        <p className="text-center text-xs text-text-muted">
          By registering you agree to our Terms &amp; Conditions and Privacy Policy.
        </p>
      </form>

      {/* ── Sidebar summary ── */}
      <aside className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h3 className="font-heading text-lg font-bold text-text">
            Registration Summary
          </h3>
          {selectedEvent ? (
            <div className="flex flex-col gap-1 rounded-lg bg-primary-50 p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-primary-600">
                {selectedEvent.category}
              </span>
              <span className="font-heading font-bold text-primary-800">
                {selectedEvent.title}
              </span>
            </div>
          ) : (
            <p className="rounded-lg bg-surface-alt p-4 text-sm text-text-muted">
              Select an event to see your summary.
            </p>
          )}
          <div className="flex items-baseline justify-between border-b border-border pb-4">
            <span className="text-sm text-text-muted">Per participant</span>
            <span className="font-heading text-2xl font-bold text-text">{feeLabel}</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {siteConfig.registrationPerks.map((perk) => (
              <li key={perk} className="text-sm text-text-muted">{perk}</li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm text-text-muted">
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-accent-600" />
              Registration closes <strong className="text-text">{siteConfig.registrationDeadline}</strong>
            </span>
            <span className="flex items-center gap-2">
              <Phone size={16} className="text-accent-600" />
              Need help? Call <strong className="text-text">{siteConfig.contact.phone}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h3 className="font-heading text-base font-bold text-text">Event Locations</h3>
          <ul className="flex flex-col gap-2">
            {registerContent.locations.map((l) => (
              <li key={l.city} className="flex items-center gap-2 text-sm text-text-muted">
                <MapPin size={16} className="text-primary-600" />
                <span className="font-medium text-text">{l.city}</span> — {l.region}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
