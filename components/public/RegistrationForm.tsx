"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import type { EventItem } from "@/types";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { siteConfig, registerContent } from "@/lib/content";
import { submitRegistration, RegistrationFullError } from "@/lib/submissions";
import { cn } from "@/lib/utils";

/**
 * Remaining capacity for an event. Returns null when the event has no limit
 * (unlimited), otherwise the number of spots left (clamped at 0).
 */
function spotsLeft(ev: EventItem | undefined): number | null {
  if (!ev || typeof ev.registrationLimit !== "number") return null;
  return Math.max(0, ev.registrationLimit - (ev.registrationCount ?? 0));
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  location: string;
  institution: string;
  ageCategory: string;
  message: string;
}

const EMPTY: FormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  location: "",
  institution: "",
  ageCategory: "",
  message: "",
};

type Errors = Partial<Record<keyof FormValues | "category" | "event", string>>;

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

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [category, setCategory] = useState<string>(preselected?.category ?? "");
  const [eventId, setEventId] = useState<string>(preselected?.id ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error" | "full"
  >("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const setField = (key: keyof FormValues, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const eventsInCategory = useMemo(
    () => events.filter((e) => e.category === category),
    [category, events],
  );

  const selectedEvent = events.find((e) => e.id === eventId);
  const fee = selectedEvent?.registrationFee;
  const feeLabel = fee != null ? `₹ ${fee.toLocaleString("en-IN")}` : "—";

  const selectedSpotsLeft = spotsLeft(selectedEvent);
  const selectedFull = selectedSpotsLeft === 0;

  function validate(): Errors {
    const e: Errors = {};
    if (!category) e.category = "Please choose a category.";
    if (!eventId) e.event = "Please choose an event.";
    if (!values.ageCategory) e.ageCategory = "Please choose an age group.";
    if (!values.firstName.trim())
      e.firstName = "Please enter the student's first name.";
    if (!values.lastName.trim())
      e.lastName = "Please enter the student's last name.";
    if (!/^[6-9]\d{9}$/.test(values.phone))
      e.phone = "Enter a valid 10-digit mobile number.";
    if (!EMAIL_RE.test(values.email.trim()))
      e.email = "Please enter a valid email address.";
    if (!values.location) e.location = "Please select your city.";
    if (!values.institution.trim())
      e.institution = "Please enter the school or college name.";
    return e;
  }

  // Surface a single field's error when the user leaves it, so problems show
  // up as they go rather than only on submit.
  function handleBlur(key: keyof Errors) {
    const all = validate();
    setErrors((e) => ({ ...e, [key]: all[key] }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      // Scroll the first problem into view so nothing is missed.
      const firstKey = Object.keys(found)[0];
      const el = formRef.current?.querySelector<HTMLElement>(
        `[data-field="${firstKey}"]`,
      );
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!selectedEvent || selectedEvent.registrationOpen === false) return;
    if (spotsLeft(selectedEvent) === 0) {
      setStatus("full");
      return;
    }

    setStatus("submitting");
    try {
      await submitRegistration({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        location: values.location,
        institution: values.institution,
        eventCategory: selectedEvent.category,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        ageCategory: values.ageCategory,
        message: values.message,
        amountPaid: fee ?? 0,
      });
      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Registration failed:", err);
      setStatus(err instanceof RegistrationFullError ? "full" : "error");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-border bg-surface p-10 text-center shadow-card">
        <CheckCircle2 size={52} className="text-success" />
        <h2 className="font-heading text-2xl font-bold text-heading">
          You&apos;re registered!
        </h2>
        <p className="text-text-muted">
          Thanks for registering for{" "}
          <strong className="text-text">{selectedEvent?.title}</strong>. We&apos;ve
          saved your spot. Our team will call{" "}
          <strong className="text-text">{values.phone}</strong> with the payment and
          confirmation details — no payment is needed right now.
        </p>
        <Button asChild variant="outline">
          <Link href="/events">Browse more events</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto flex max-w-6xl flex-col gap-8"
    >
      {/* Intro / reassurance */}
      <div className="mx-auto flex max-w-2xl flex-col gap-2 text-center">
        <h2 className="font-heading text-3xl font-bold text-heading">
          Register for YUF 2026
        </h2>
        <p className="text-text-muted">
          It only takes a couple of minutes. Fill in the details below — fields
          marked <span className="text-error">*</span> are required. You don&apos;t
          pay anything now; our team will call you about payment.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr] lg:items-start">
        {/* ── Left column: the input steps ── */}
        <div className="flex flex-col gap-6">
      {/* ── 1. Choose the event ── */}
      <SectionCard step={1} title="Choose the event">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Event category" htmlFor="category" required>
            <>
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v);
                  setEventId("");
                  setErrors((e) => ({ ...e, category: undefined, event: undefined }));
                }}
              >
                <SelectTrigger
                  id="category"
                  data-field="category"
                  aria-invalid={!!errors.category}
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ErrorText>{errors.category}</ErrorText>
            </>
          </Field>

          <Field label="Event" htmlFor="event" required>
            <>
              <Select
                value={eventId}
                onValueChange={(v) => {
                  setEventId(v);
                  setErrors((e) => ({ ...e, event: undefined }));
                }}
                disabled={!category}
              >
                <SelectTrigger
                  id="event"
                  data-field="event"
                  aria-invalid={!!errors.event}
                >
                  <SelectValue
                    placeholder={
                      category ? "Choose an event" : "Choose a category first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {eventsInCategory.map((ev) => {
                    const left = spotsLeft(ev);
                    const full = left === 0;
                    return (
                      <SelectItem key={ev.id} value={ev.id} disabled={full}>
                        {ev.title}
                        {full
                          ? " — Full"
                          : left !== null && left <= 10
                            ? ` — ${left} left`
                            : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <ErrorText>{errors.event}</ErrorText>
            </>
          </Field>
        </div>

        {/* Age group — big, tappable choices */}
        <fieldset className="flex flex-col gap-2.5" data-field="ageCategory">
          <span className="text-sm font-medium text-text">
            Age group <span className="text-error">*</span>
          </span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {siteConfig.ageCategories.map((age) => (
              <label
                key={age.value}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-center text-sm font-medium transition-colors hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-700"
              >
                <input
                  type="radio"
                  name="ageCategory"
                  value={age.value}
                  checked={values.ageCategory === age.value}
                  onChange={(e) => setField("ageCategory", e.target.value)}
                  className="sr-only"
                />
                {age.label}
              </label>
            ))}
          </div>
          <ErrorText>{errors.ageCategory}</ErrorText>
        </fieldset>

        {/* Live fee line, once an event is chosen */}
        {selectedEvent && (
          <div
            className={cn(
              "flex items-center justify-between rounded-xl px-4 py-3 text-sm",
              selectedFull ? "bg-error/10 text-error" : "bg-primary-50 text-primary-800",
            )}
          >
            <span className="font-medium">
              {selectedFull ? "This event is full — please pick another." : "Registration fee"}
            </span>
            {!selectedFull && (
              <span className="font-heading text-base font-bold">{feeLabel}</span>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── 2. Your details ── */}
      <SectionCard step={2} title="Your details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Student's first name" htmlFor="firstName" required>
            <>
              <Input
                id="firstName"
                data-field="firstName"
                value={values.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                onBlur={() => handleBlur("firstName")}
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
                placeholder="e.g. Aarav"
              />
              <ErrorText>{errors.firstName}</ErrorText>
            </>
          </Field>
          <Field label="Student's last name" htmlFor="lastName" required>
            <>
              <Input
                id="lastName"
                data-field="lastName"
                value={values.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                onBlur={() => handleBlur("lastName")}
                autoComplete="family-name"
                aria-invalid={!!errors.lastName}
                placeholder="e.g. Sharma"
              />
              <ErrorText>{errors.lastName}</ErrorText>
            </>
          </Field>
          <Field
            label="Contact phone number"
            htmlFor="phone"
            required
            description="We'll call this number about the registration."
          >
            <>
              <Input
                id="phone"
                data-field="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={values.phone}
                onChange={(e) =>
                  setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                onBlur={() => handleBlur("phone")}
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                placeholder="10-digit mobile number"
              />
              <ErrorText>{errors.phone}</ErrorText>
            </>
          </Field>
          <Field
            label="Email address"
            htmlFor="email"
            required
            description="Confirmation is sent here."
          >
            <>
              <Input
                id="email"
                data-field="email"
                type="email"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                autoComplete="email"
                aria-invalid={!!errors.email}
                placeholder="name@example.com"
              />
              <ErrorText>{errors.email}</ErrorText>
            </>
          </Field>
          <Field label="City" htmlFor="location" required>
            <>
              <Select
                value={values.location}
                onValueChange={(v) => setField("location", v)}
              >
                <SelectTrigger
                  id="location"
                  data-field="location"
                  aria-invalid={!!errors.location}
                >
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {registerContent.locations.map((l) => (
                    <SelectItem key={l.city} value={l.city}>
                      {l.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ErrorText>{errors.location}</ErrorText>
            </>
          </Field>
          <Field label="School / College name" htmlFor="institution" required>
            <>
              <Input
                id="institution"
                data-field="institution"
                value={values.institution}
                onChange={(e) => setField("institution", e.target.value)}
                onBlur={() => handleBlur("institution")}
                aria-invalid={!!errors.institution}
                placeholder="Name of the school or college"
              />
              <ErrorText>{errors.institution}</ErrorText>
            </>
          </Field>
        </div>

        <Field
          label="Anything we should know? (optional)"
          htmlFor="message"
        >
          <Textarea
            id="message"
            value={values.message}
            onChange={(e) => setField("message", e.target.value)}
            placeholder="Any special requests or accessibility needs."
          />
        </Field>
      </SectionCard>
        </div>

        {/* ── Right column: sticky summary + submit ── */}
        <div className="lg:sticky lg:top-28">
      {/* ── 3. Confirm ── */}
      <SectionCard step={3} title="Confirm & finish">
        <div className="flex flex-col gap-4 rounded-2xl bg-surface-alt p-5">
          <Row label="Event">
            {selectedEvent ? selectedEvent.title : "Not selected yet"}
          </Row>
          <Row label="Fee">{feeLabel}</Row>
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-sm font-medium text-text">What&apos;s included</p>
            <ul className="flex flex-col gap-1.5">
              {siteConfig.registrationPerks.map((perk) => (
                <li
                  key={perk}
                  className="flex items-start gap-2 text-sm text-text-muted"
                >
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="flex items-center gap-2 text-xs text-text-muted">
          <ShieldCheck size={16} className="text-success" />
          No payment now. Your details are kept private and used only for this
          registration.
        </p>

        {status === "error" && (
          <p className="rounded-lg bg-error/10 p-3 text-sm text-error">
            Something went wrong saving your registration. Please check your
            connection and try again.
          </p>
        )}
        {status === "full" && (
          <p className="rounded-lg bg-error/10 p-3 text-sm text-error">
            Sorry — this event just filled up. Please pick another event above.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={status === "submitting" || selectedFull}
        >
          <Lock size={18} />
          {status === "submitting"
            ? "Submitting…"
            : selectedFull
              ? "Event Full"
              : "Complete Registration"}
        </Button>

        <p className="text-center text-xs text-text-muted">
          By registering you agree to our{" "}
          <Link href="/terms-and-conditions" className="text-primary-700 underline">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="text-primary-700 underline">
            Privacy Policy
          </Link>
          .
        </p>

      </SectionCard>
        </div>
      </div>
    </form>
  );
}

/* ── Sub-components ── */

function SectionCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 font-heading text-sm font-bold text-white shadow-sm ring-1 ring-inset ring-white/25">
          {step}
        </span>
        <h3 className="font-heading text-xl font-bold text-heading">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-xs font-medium text-error">{children}</p>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-right font-heading font-bold text-heading">
        {children}
      </span>
    </div>
  );
}
