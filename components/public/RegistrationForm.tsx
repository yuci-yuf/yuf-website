"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import type { EventItem } from "@/types";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/content";
import { computeInvoice, formatINR, GST_RATE } from "@/lib/pricing";
import { cn } from "@/lib/utils";

// ── Razorpay Checkout (loaded on demand) ──
interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayOptions {
  key?: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (r: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance {
  open: () => void;
  on: (event: string, cb: () => void) => void;
}
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay Checkout."));
    document.body.appendChild(s);
  });
}

/**
 * Remaining capacity for an event. Returns null when the event has no limit
 * (unlimited), otherwise the number of spots left (clamped at 0).
 */
function spotsLeft(ev: EventItem | undefined): number | null {
  if (!ev || typeof ev.registrationLimit !== "number") return null;
  return Math.max(0, ev.registrationLimit - (ev.registrationCount ?? 0));
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Cities where the festival runs. */
const LOCATIONS = ["Chennai", "Coimbatore"];
/**
 * Where each location's events are actually held. A participant's chosen
 * location filters the event list to events whose venue is in that place.
 * (Chennai's events run in Ponneri; Coimbatore's in Coimbatore.)
 */
const LOCATION_VENUES: Record<string, string[]> = {
  Chennai: ["Ponneri"],
  Coimbatore: ["Coimbatore"],
};

/** True if the event's venue belongs to the given location. */
function eventInLocation(ev: EventItem, location: string): boolean {
  const venues = LOCATION_VENUES[location] ?? [];
  if (venues.length === 0) return false;
  const venue = (ev.venue ?? "").toLowerCase();
  return venues.some((name) => venue.includes(name.toLowerCase()));
}

/** School class levels (6th–12th). */
const SCHOOL_STANDARDS = ["6th", "7th", "8th", "9th", "10th", "11th", "12th"];
/** College year levels. */
const COLLEGE_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

type InstitutionType = "" | "school" | "college";

interface FormValues {
  name: string;
  phone: string;
  email: string;
  location: string;
  institutionType: InstitutionType;
  institutionName: string; // name of the school / college
  level: string; // standard (school) or year (college)
}

const EMPTY: FormValues = {
  name: "",
  phone: "",
  email: "",
  location: "",
  institutionType: "",
  institutionName: "",
  level: "",
};

type ErrorKey = keyof FormValues | "category" | "event";
type Errors = Partial<Record<ErrorKey, string>>;

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

  // Deep-link (?event=): pre-fill location from the event's venue so the
  // location-filtered dropdowns still include the preselected event.
  const preselectedLocation = preselected
    ? (LOCATIONS.find((loc) => eventInLocation(preselected, loc)) ?? "")
    : "";

  const [values, setValues] = useState<FormValues>({
    ...EMPTY,
    location: preselectedLocation,
  });
  const [category, setCategory] = useState<string>(preselected?.category ?? "");
  const [eventId, setEventId] = useState<string>(preselected?.id ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error" | "full"
  >("idle");
  const formRef = useRef<HTMLFormElement>(null);
  // One idempotency key per attempt, reused on retry so a re-submit returns the
  // same reservation/order instead of creating duplicates.
  const idempotencyKeyRef = useRef<string>("");
  const [regCode, setRegCode] = useState<string>("");

  const setField = (key: keyof FormValues, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Categories that actually have events in the chosen location (empty until a
  // location is picked, so the participant selects location first).
  const availableCategories = useMemo(() => {
    if (!values.location) return [];
    return categories.filter((c) =>
      events.some((e) => e.category === c && eventInLocation(e, values.location)),
    );
  }, [categories, events, values.location]);

  // Events matching BOTH the chosen location and category.
  const eventsForSelection = useMemo(() => {
    if (!values.location || !category) return [];
    return events.filter(
      (e) => e.category === category && eventInLocation(e, values.location),
    );
  }, [events, category, values.location]);

  const selectedEvent = events.find((e) => e.id === eventId);
  const fee = selectedEvent?.registrationFee;
  const feeLabel = fee != null ? formatINR(fee) : "—";
  const invoice = fee != null ? computeInvoice(fee) : null;

  const selectedSpotsLeft = spotsLeft(selectedEvent);
  const selectedFull = selectedSpotsLeft === 0;

  function validate(): Errors {
    const e: Errors = {};
    if (!values.name.trim()) e.name = "Please enter the student's name.";
    if (!/^[6-9]\d{9}$/.test(values.phone))
      e.phone = "Enter a valid 10-digit mobile number.";
    if (!EMAIL_RE.test(values.email.trim()))
      e.email = "Please enter a valid email address.";
    if (!values.location) e.location = "Please select your city.";
    if (!values.institutionType)
      e.institutionType = "Please choose school or college.";
    else {
      if (!values.institutionName.trim())
        e.institutionName =
          values.institutionType === "school"
            ? "Please enter your school name."
            : "Please enter your college name.";
      if (!values.level)
        e.level =
          values.institutionType === "school"
            ? "Please select your standard."
            : "Please select your year.";
    }
    if (!category) e.category = "Please choose a category.";
    if (!eventId) e.event = "Please choose an event.";
    return e;
  }

  // Surface a single field's error when the user leaves it.
  function handleBlur(key: ErrorKey) {
    const all = validate();
    setErrors((e) => ({ ...e, [key]: all[key] }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
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

    // Map the friendly fields onto the stored schema.
    const parts = values.name.trim().split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");
    const institution =
      values.institutionType === "school"
        ? `${values.institutionName.trim()} (School — ${values.level} standard)`
        : `${values.institutionName.trim()} (College — ${values.level})`;

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    setStatus("submitting");
    try {
      // 1) Reserve a slot + create the pending registration + payment order.
      const res = await fetch("/api/registrations/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: values.email.trim(),
          phone: values.phone,
          location: values.location,
          institution,
          ageCategory: values.level,
          eventId: selectedEvent.id,
          idempotencyKey: idempotencyKeyRef.current,
        }),
      });
      if (res.status === 409) {
        setStatus("full");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const order = await res.json();

      // Free event → already confirmed, no payment step.
      if (order.free) {
        finishSuccess(order.code);
        return;
      }

      // 2) Open Razorpay Checkout.
      await loadRazorpay();
      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Youth United Festival 2026",
        description: selectedEvent.title,
        prefill: {
          name: values.name.trim(),
          email: values.email.trim(),
          contact: values.phone,
        },
        theme: { color: "#155fa6" },
        // 3) On success, verify the signature server-side, then confirm.
        handler: async (resp) => {
          try {
            const v = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...resp,
                registrationId: order.registrationId,
              }),
            });
            if (v.ok) {
              const d = await v.json();
              finishSuccess(d.code ?? order.code);
            } else {
              setStatus("error");
            }
          } catch {
            setStatus("error");
          }
        },
        modal: {
          // Dismissed without paying — allow a retry (same idempotency key).
          ondismiss: () => setStatus("idle"),
        },
      });
      rzp.on("payment.failed", () => setStatus("error"));
      rzp.open();
    } catch (err) {
      console.error("Registration failed:", err);
      setStatus("error");
    }
  }

  function finishSuccess(code?: string) {
    idempotencyKeyRef.current = "";
    setRegCode(code ?? "");
    setStatus("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (status === "success") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-border bg-surface p-10 text-center shadow-card">
        <CheckCircle2 size={52} className="text-success" />
        <h2 className="font-heading text-2xl font-bold text-heading">
          Registration confirmed!
        </h2>
        <p className="text-text-muted">
          You&apos;re all set for{" "}
          <strong className="text-text">{selectedEvent?.title}</strong>. A
          confirmation with your entry pass is on its way to{" "}
          <strong className="text-text">{values.email.trim()}</strong>.
        </p>
        {regCode && (
          <div className="rounded-xl bg-primary-50 px-5 py-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-primary-600">
              Registration code
            </p>
            <p className="font-heading text-xl font-bold tracking-wider text-primary-800">
              {regCode}
            </p>
          </div>
        )}
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
      className="mx-auto flex w-full max-w-7xl flex-col gap-8"
    >
      {/* Intro / reassurance */}
      <div className="mx-auto flex max-w-2xl flex-col gap-2 text-center">
        <h2 className="font-heading text-3xl font-bold text-heading">
          Register for YUF 2026
        </h2>
        <p className="text-text-muted">
          It only takes a couple of minutes. Fields marked{" "}
          <span className="text-error">*</span> are required. You don&apos;t pay
          anything now — our team will call you about payment.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-start">
        {/* Left column: form inputs */}
        <div className="flex flex-col gap-8 rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
        {/* ── Your details ── */}
        <FormSection title="Your details">
            <Field label="Name" htmlFor="name" required>
              <>
                <Input
                  id="name"
                  data-field="name"
                  value={values.name}
                  onChange={(e) => setField("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  placeholder="Student's full name"
                />
                <ErrorText>{errors.name}</ErrorText>
              </>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Phone number"
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
                      setField(
                        "phone",
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
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
                label="Email"
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
            </div>

            <Field
              label="Your location"
              htmlFor="location"
              required
              description="Select the city where you'll take part."
            >
              <>
                <Select
                  value={values.location}
                  onValueChange={(v) => {
                    // Changing location changes which events are available,
                    // so clear any category/event chosen for the old location.
                    setValues((prev) => ({ ...prev, location: v }));
                    setCategory("");
                    setEventId("");
                    setErrors((e) => ({
                      ...e,
                      location: undefined,
                      category: undefined,
                      event: undefined,
                    }));
                  }}
                >
                  <SelectTrigger
                    id="location"
                    data-field="location"
                    aria-invalid={!!errors.location}
                  >
                    <SelectValue placeholder="Select location to participate" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ErrorText>{errors.location}</ErrorText>
              </>
            </Field>

            {/* School / College toggle */}
            <fieldset className="flex flex-col gap-2.5" data-field="institutionType">
              <span className="text-sm font-medium text-text">
                Are you in school or college?{" "}
                <span className="text-error">*</span>
              </span>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["school", "School"],
                    ["college", "College"],
                  ] as const
                ).map(([val, label]) => (
                  <label
                    key={val}
                    className="flex cursor-pointer items-center justify-center rounded-xl border border-border px-4 py-3 text-center text-sm font-medium transition-colors hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-700"
                  >
                    <input
                      type="radio"
                      name="institutionType"
                      value={val}
                      checked={values.institutionType === val}
                      onChange={() => {
                        setValues((v) => ({
                          ...v,
                          institutionType: val,
                          level: "",
                        }));
                        setErrors((e) => ({
                          ...e,
                          institutionType: undefined,
                          level: undefined,
                        }));
                      }}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <ErrorText>{errors.institutionType}</ErrorText>
            </fieldset>

            {/* Conditional detail: name + standard (school) or year (college) */}
            {values.institutionType && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label={
                    values.institutionType === "school"
                      ? "School name"
                      : "College name"
                  }
                  htmlFor="institutionName"
                  required
                >
                  <>
                    <Input
                      id="institutionName"
                      data-field="institutionName"
                      value={values.institutionName}
                      onChange={(e) =>
                        setField("institutionName", e.target.value)
                      }
                      onBlur={() => handleBlur("institutionName")}
                      aria-invalid={!!errors.institutionName}
                      placeholder={
                        values.institutionType === "school"
                          ? "Name of the school"
                          : "Name of the college"
                      }
                    />
                    <ErrorText>{errors.institutionName}</ErrorText>
                  </>
                </Field>

                <Field
                  label={
                    values.institutionType === "school"
                      ? "Which standard?"
                      : "Which year?"
                  }
                  htmlFor="level"
                  required
                >
                  <>
                    <Select
                      value={values.level}
                      onValueChange={(v) => setField("level", v)}
                    >
                      <SelectTrigger
                        id="level"
                        data-field="level"
                        aria-invalid={!!errors.level}
                      >
                        <SelectValue
                          placeholder={
                            values.institutionType === "school"
                              ? "Select standard (6th–12th)"
                              : "Select your year"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(values.institutionType === "school"
                          ? SCHOOL_STANDARDS
                          : COLLEGE_YEARS
                        ).map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {values.institutionType === "school"
                              ? `${opt} standard`
                              : opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorText>{errors.level}</ErrorText>
                  </>
                </Field>
              </div>
            )}
        </FormSection>

        <div className="h-px bg-border" />

        {/* ── Choose your event ── */}
        <FormSection title="Choose your event">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Category of event" htmlFor="category" required>
                <>
                  <Select
                    value={category}
                    onValueChange={(v) => {
                      setCategory(v);
                      setEventId("");
                      setErrors((e) => ({
                        ...e,
                        category: undefined,
                        event: undefined,
                      }));
                    }}
                    disabled={!values.location}
                  >
                    <SelectTrigger
                      id="category"
                      data-field="category"
                      aria-invalid={!!errors.category}
                    >
                      <SelectValue
                        placeholder={
                          values.location
                            ? "Choose a category"
                            : "Select your location first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((c) => (
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
                          !values.location
                            ? "Select your location first"
                            : category
                              ? "Choose an event"
                              : "Choose a category first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {eventsForSelection.map((ev) => {
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

            {/* Live fee line, once an event is chosen */}
            {selectedEvent && (
              <div
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-3 text-sm",
                  selectedFull
                    ? "bg-error/10 text-error"
                    : "bg-primary-50 text-primary-800",
                )}
              >
                <span className="font-medium">
                  {selectedFull
                    ? "This event is full — please pick another."
                    : "Registration fee"}
                </span>
                {!selectedFull && (
                  <span className="font-heading text-base font-bold">
                    {feeLabel}
                  </span>
                )}
              </div>
            )}
        </FormSection>
        </div>

        {/* Right column: sticky summary + payment */}
        <div className="lg:sticky lg:top-28">
        <div className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
        {/* ── Confirm & finish ── */}
        <FormSection title="Confirm & finish">
            <div className="flex flex-col gap-4 rounded-2xl bg-surface-alt p-5">
              <Row label="Event">
                {selectedEvent ? selectedEvent.title : "Not selected yet"}
              </Row>

              {/* Itemized invoice */}
              {invoice ? (
                <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Registration fee</span>
                    <span>{formatINR(invoice.base)}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Platform fee</span>
                    <span>{formatINR(invoice.platformFee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted">
                    <span>GST ({Math.round(GST_RATE * 100)}%)</span>
                    <span>{formatINR(invoice.gst)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
                    <span className="font-medium text-text">Total payable</span>
                    <span className="font-heading text-lg font-bold text-heading">
                      {formatINR(invoice.total)}
                    </span>
                  </div>
                </div>
              ) : (
                <Row label="Fee">{feeLabel}</Row>
              )}

              <div className="border-t border-border pt-4">
                <p className="mb-2 text-sm font-medium text-text">
                  What&apos;s included
                </p>
                <ul className="flex flex-col gap-1.5">
                  {siteConfig.registrationPerks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-2 text-sm text-text-muted"
                    >
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0 text-success"
                      />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="flex items-center gap-2 text-xs text-text-muted">
              <ShieldCheck size={16} className="text-success" />
              Secure payment via Razorpay — UPI, cards, net banking &amp; wallets.
              Your details are kept private.
            </p>

            {status === "error" && (
              <p className="rounded-lg bg-error/10 p-3 text-sm text-error">
                Payment couldn&apos;t be completed. If money was deducted it will be
                auto-refunded; please try again or contact us.
              </p>
            )}
            {status === "full" && (
              <p className="rounded-lg bg-error/10 p-3 text-sm text-error">
                Sorry — this event just filled up. Please pick another event.
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
                ? "Starting payment…"
                : selectedFull
                  ? "Event Full"
                  : invoice
                    ? `Pay ${formatINR(invoice.total)} & Register`
                    : "Complete Registration"}
            </Button>

            <p className="text-center text-xs text-text-muted">
              By registering you agree to our{" "}
              <Link
                href="/terms-and-conditions"
                className="text-primary-700 underline"
              >
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-primary-700 underline">
                Privacy Policy
              </Link>
              .
            </p>
        </FormSection>
        </div>
        </div>
      </div>
    </form>
  );
}

/* ── Sub-components ── */

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <h3 className="font-heading text-xl font-bold text-heading">{title}</h3>
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
