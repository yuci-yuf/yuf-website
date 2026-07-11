"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import type { EventItem, EventLocation } from "@/types";
import {
  getEventLocations,
  locationSpotsLeft,
} from "@/lib/event-groups";
import {
  loadRazorpay,
  type RazorpayHandlerResponse,
} from "@/lib/razorpay-checkout";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { computeInvoice, formatINR, GST_RATE, PLATFORM_FEE_RATE } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * The city an event location belongs to (the admin form's "City" field).
 * Returns "" when no city is set.
 */
function cityOf(loc: EventLocation): string {
  return (loc.city ?? "").trim();
}

/**
 * Participant-facing label for a venue: the full street address (falling back
 * to the city only when no address is set), then the date — e.g. "Velammal
 * Bodhi Campus, Ponneri · 2nd Sept 2026". Any empty part is dropped so short
 * data still reads cleanly.
 */
function locationLabel(loc: EventLocation): string {
  const address = (loc.address ?? "").trim(); // full street address
  const city = cityOf(loc);
  const date = (loc.date ?? "").trim();
  const place = address || city; // prefer the address over the bare city
  return [place, date].filter(Boolean).join(" · ");
}

/**
 * True if the event is open to the given student type. An event with audience
 * "both" (or unset) accepts anyone; otherwise it must match. Before the student
 * picks school/college (`type === ""`), everything is allowed.
 */
function eventForStudentType(ev: EventItem, type: InstitutionType): boolean {
  if (!type) return true;
  const audience = ev.audience ?? "both";
  return audience === "both" || audience === type;
}

/** School class levels (6th–12th). */
const SCHOOL_STANDARDS = ["6th", "7th", "8th", "9th", "10th", "11th", "12th"];
/** College year levels. */
const COLLEGE_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

type InstitutionType = "" | "school" | "college";

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  institutionType: InstitutionType;
  institutionName: string; // name of the school / college
  level: string; // standard (school) or year (college)
}

const EMPTY: FormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  institutionType: "",
  institutionName: "",
  level: "",
};

type ErrorKey = keyof FormValues | "category" | "event" | "eventLocation";
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
  const preselectedLoc = searchParams.get("loc");
  const preselected = events.find((e) => e.id === preselectedId);

  // Deep-link (?event=&loc=): the explicitly chosen location, if any. Only an
  // explicit ?loc pre-selects a venue — otherwise a multi-venue event starts
  // with none chosen so the user must consciously pick the venue/date.
  const explicitLocation = preselected
    ? getEventLocations(preselected).find((l) => l.id === preselectedLoc)
    : undefined;

  const [values, setValues] = useState<FormValues>({ ...EMPTY });
  const [category, setCategory] = useState<string>(preselected?.category ?? "");
  const [eventId, setEventId] = useState<string>(preselected?.id ?? "");
  const [locationId, setLocationId] = useState<string>(
    explicitLocation?.id ?? "",
  );
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error" | "full"
  >("idle");
  const [payError, setPayError] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const [regCode, setRegCode] = useState<string>("");
  // Stable across retries of the same submission so the /order route dedupes
  // instead of reserving a second slot. Regenerated after a success.
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const setField = (key: keyof FormValues, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Categories that have at least one event open to the student's type
  // (school/college).
  const availableCategories = useMemo(() => {
    return categories.filter((c) =>
      events.some(
        (e) =>
          e.category === c &&
          eventForStudentType(e, values.institutionType),
      ),
    );
  }, [categories, events, values.institutionType]);

  // Events for the picker (filtered by the student's school/college type): the
  // selected category first, then every other eligible event below it — so a
  // participant can still reach events outside the category.
  const { primaryEvents, otherEvents } = useMemo(() => {
    if (!category) {
      return { primaryEvents: [] as EventItem[], otherEvents: [] as EventItem[] };
    }
    const eligible = events.filter((e) =>
      eventForStudentType(e, values.institutionType),
    );
    return {
      primaryEvents: eligible.filter((e) => e.category === category),
      otherEvents: eligible.filter((e) => e.category !== category),
    };
  }, [events, category, values.institutionType]);

  const selectedEvent = events.find((e) => e.id === eventId);

  // The category/event lists are gated on school/college, so the user must pick
  // that before choosing a category/event. The venue is picked afterwards.
  const canChooseEvent = !!values.institutionType;

  // All venues/dates the selected event runs in — the participant picks between
  // them. Fee is shared across venues.
  const locationsForSelection = useMemo(() => {
    if (!selectedEvent) return [];
    return getEventLocations(selectedEvent);
  }, [selectedEvent]);

  // When an event has just one location in the city, use it implicitly so the
  // participant isn't asked to "choose" from a list of one.
  const effectiveLocationId =
    locationsForSelection.length === 1
      ? locationsForSelection[0].id
      : locationId;
  const selectedLocation = locationsForSelection.find(
    (l) => l.id === effectiveLocationId,
  );

  const fee = selectedEvent?.registrationFee;
  const feeLabel = fee != null ? formatINR(fee) : "—";
  // Itemized breakdown: base fee + platform fee (2%) + GST (18%). Single source
  // of truth in lib/pricing.ts, so the form and payment order always agree.
  const invoice = fee != null && fee > 0 ? computeInvoice(fee) : null;

  const selectedSpotsLeft = selectedLocation
    ? locationSpotsLeft(selectedLocation)
    : null;
  const selectedFull = selectedSpotsLeft === 0;

  function validate(): Errors {
    const e: Errors = {};
    if (!values.firstName.trim()) e.firstName = "Please enter the first name.";
    if (!values.lastName.trim()) e.lastName = "Please enter the last name.";
    if (!/^[6-9]\d{9}$/.test(values.phone))
      e.phone = "Enter a valid 10-digit mobile number.";
    if (!EMAIL_RE.test(values.email.trim()))
      e.email = "Please enter a valid email address.";
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
    // A venue must be chosen whenever the event runs in more than one place.
    if (eventId && locationsForSelection.length > 1 && !selectedLocation)
      e.eventLocation = "Please select a venue.";
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
    if (!selectedLocation) return;
    if (locationSpotsLeft(selectedLocation) === 0) {
      setStatus("full");
      return;
    }

    // Map the friendly fields onto the stored schema.
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    // Store just the raw name — the school/college type and standard/year are
    // persisted separately (institutionType / ageCategory), so no suffix here.
    const institution = values.institutionName.trim();
    // For the confirmation email (sent after payment succeeds).
    const venue =
      selectedLocation.address ?? selectedLocation.city ?? "";
    const eventDate = selectedLocation.date ?? "";
    // The participant's location is now taken from the venue they picked (the
    // standalone city field was removed) — prefer the address, fall back to city.
    const participantLocation =
      (selectedLocation.address ?? "").trim() ||
      (selectedLocation.city ?? "").trim();

    setStatus("submitting");
    setPayError("");
    try {
      // ── 1. Reserve the slot + create the Razorpay order (server-side) ──
      // The server owns the amount, status, and registration code so they can't
      // be forged; it also holds a per-location slot before payment begins.
      const res = await fetch("/api/registrations/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: values.email.trim(),
          phone: values.phone,
          location: participantLocation,
          institution,
          institutionType: values.institutionType,
          eventId: selectedEvent.id,
          ageCategory: values.level,
          locationId: effectiveLocationId,
          idempotencyKey: idempotencyKeyRef.current,
        }),
      });

      if (!res.ok) {
        // 409 = the location filled between page load and submit.
        if (res.status === 409) {
          setStatus("full");
          return;
        }
        throw new Error(`Could not start registration (${res.status})`);
      }

      const order = (await res.json()) as {
        registrationId: string;
        code: string;
        free?: boolean;
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
      };

      // Free event → the server already confirmed it, no payment needed.
      if (order.free) {
        sendConfirmationEmail(order.code, firstName, eventDate, venue);
        finishSuccess(order.code);
        return;
      }

      if (!order.orderId || !order.keyId || !order.amount) {
        throw new Error("Payment order is missing required fields.");
      }

      // ── 2. Open Razorpay Checkout ──
      const Razorpay = await loadRazorpay();
      const rzp = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency ?? "INR",
        name: "Youth United Festival",
        description: selectedEvent.title,
        order_id: order.orderId,
        prefill: {
          name: `${firstName} ${lastName}`.trim(),
          email: values.email.trim(),
          contact: values.phone,
        },
        notes: { registrationId: order.registrationId, code: order.code },
        theme: { color: "#6d28d9" },
        modal: {
          ondismiss: () => {
            // User closed the modal without paying — let them retry. The
            // reserved slot is released by the webhook when the payment is
            // eventually cancelled/failed, or reused via the idempotency key.
            setStatus("idle");
            setPayError(
              "Payment was not completed. Your spot is held briefly — you can try again.",
            );
          },
        },
        // ── 3. On success, verify the signature server-side ──
        handler: (response: RazorpayHandlerResponse) => {
          void confirmPayment(
            response,
            order.registrationId,
            order.code,
            firstName,
            eventDate,
            venue,
          );
        },
      });

      rzp.on("payment.failed", (resp) => {
        console.error("Razorpay payment failed:", resp.error);
        setStatus("idle");
        setPayError(
          resp.error?.description ||
            "Your payment could not be processed. Please try again.",
        );
      });

      rzp.open();
    } catch (err) {
      console.error("Registration failed:", err);
      setStatus("error");
    }
  }

  /** Verify the checkout signature server-side, then show the success screen. */
  async function confirmPayment(
    response: RazorpayHandlerResponse,
    registrationId: string,
    code: string,
    firstName: string,
    eventDate: string,
    venue: string,
  ) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          registrationId,
        }),
      });
      if (!res.ok) throw new Error(`Verification failed (${res.status})`);

      const { code: confirmedCode } = (await res.json()) as { code?: string };
      sendConfirmationEmail(confirmedCode ?? code, firstName, eventDate, venue);
      finishSuccess(confirmedCode ?? code);
    } catch (err) {
      // Payment went through but our fast-path verify failed. The webhook is
      // authoritative and will still confirm the registration, so reassure the
      // user rather than implying the payment was lost.
      console.error("Payment verification failed:", err);
      setStatus("idle");
      setPayError(
        "Your payment was received but we couldn't confirm it instantly. " +
          "It will be confirmed shortly and you'll get an email — no need to pay again.",
      );
    }
  }

  /** Fire-and-forget confirmation email — never blocks or fails the success UI. */
  function sendConfirmationEmail(
    code: string,
    firstName: string,
    date: string,
    venue: string,
  ) {
    void fetch("/api/registrations/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: values.email.trim(),
        firstName,
        eventTitle: selectedEvent?.title,
        date,
        venue,
        registrationCode: code,
      }),
    }).catch(() => {});
  }

  function finishSuccess(code?: string) {
    setRegCode(code ?? "");
    setStatus("success");
    // New submission after this one gets a fresh idempotency key.
    idempotencyKeyRef.current = crypto.randomUUID();
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
          <span className="text-error">*</span> are required.{" "}
          <strong className="font-semibold text-text">
            Please review your details carefully before submitting —
            registrations are non-refundable.
          </strong>
        </p>
      </div>

      {/* Single card: all sections in one column, full width */}
      <div className="w-full">
        <div className="flex flex-col gap-8 rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
        {/* ── Your details ── */}
        <FormSection title="Your details">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name" htmlFor="firstName" required>
                <>
                  <Input
                    id="firstName"
                    data-field="firstName"
                    value={values.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    onBlur={() => handleBlur("firstName")}
                    autoComplete="given-name"
                    aria-invalid={!!errors.firstName}
                    placeholder="Student's first name"
                  />
                  <ErrorText>{errors.firstName}</ErrorText>
                </>
              </Field>
              <Field label="Last name" htmlFor="lastName" required>
                <>
                  <Input
                    id="lastName"
                    data-field="lastName"
                    value={values.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    onBlur={() => handleBlur("lastName")}
                    autoComplete="family-name"
                    aria-invalid={!!errors.lastName}
                    placeholder="Student's last name"
                  />
                  <ErrorText>{errors.lastName}</ErrorText>
                </>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Phone number"
                htmlFor="phone"
                required
                description="Participant's mobile number"
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
                description="Participant's email"
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

            {/* School/college + name — side by side */}
            <div className="grid gap-5 sm:grid-cols-2">
            {/* School / College dropdown */}
            <Field
              label="Are you in school or college?"
              htmlFor="institutionType"
              required
            >
              <>
                <Select
                  value={values.institutionType}
                  onValueChange={(v) => {
                    setValues((prev) => ({
                      ...prev,
                      institutionType: v as InstitutionType,
                      level: "",
                    }));
                    // Changing school/college changes which events are eligible,
                    // so clear any category/event/venue chosen.
                    setCategory("");
                    setEventId("");
                    setLocationId("");
                    setErrors((e) => ({
                      ...e,
                      institutionType: undefined,
                      level: undefined,
                      category: undefined,
                      event: undefined,
                      eventLocation: undefined,
                    }));
                  }}
                >
                  <SelectTrigger
                    id="institutionType"
                    data-field="institutionType"
                    aria-invalid={!!errors.institutionType}
                  >
                    <SelectValue placeholder="Select school or college" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                  </SelectContent>
                </Select>
                <ErrorText>{errors.institutionType}</ErrorText>
              </>
            </Field>

            {/* School / college name — appears once a type is chosen */}
            {values.institutionType && (
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
                    onChange={(e) => setField("institutionName", e.target.value)}
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
            )}
            </div>

            {/* Conditional detail: standard (school) or year (college) */}
            {values.institutionType && (
              <div className="grid gap-5 sm:grid-cols-2">
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
                      setLocationId("");
                      setErrors((e) => ({
                        ...e,
                        category: undefined,
                        event: undefined,
                        eventLocation: undefined,
                      }));
                    }}
                    disabled={!canChooseEvent}
                  >
                    <SelectTrigger
                      id="category"
                      data-field="category"
                      aria-invalid={!!errors.category}
                    >
                      <SelectValue
                        placeholder={
                          !values.institutionType
                            ? "Choose school or college first"
                            : "Choose a category"
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
                      setLocationId("");
                      setErrors((e) => ({
                        ...e,
                        event: undefined,
                        eventLocation: undefined,
                      }));
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
                          !canChooseEvent
                            ? "Complete your details first"
                            : category
                              ? "Choose an event"
                              : "Choose a category first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {primaryEvents.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>{category}</SelectLabel>
                          {primaryEvents.map((ev) => (
                            <SelectItem key={ev.id} value={ev.id}>
                              {ev.title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {otherEvents.length > 0 && (
                        <SelectGroup>
                          {primaryEvents.length > 0 && <SelectSeparator />}
                          <SelectLabel>Other events</SelectLabel>
                          {otherEvents.map((ev) => (
                            <SelectItem key={ev.id} value={ev.id}>
                              {ev.title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                  <ErrorText>{errors.event}</ErrorText>
                </>
              </Field>
            </div>

            {/* Venue picker — shown once an event is chosen. Lists every
                venue/date the event runs in, by address. Capacity per venue. */}
            {selectedEvent && locationsForSelection.length > 0 && (
              <Field label="Venue" htmlFor="event-location" required>
                <>
                  <Select
                    value={effectiveLocationId}
                    onValueChange={(v) => {
                      setLocationId(v);
                      setErrors((e) => ({ ...e, eventLocation: undefined }));
                    }}
                  >
                    <SelectTrigger
                      id="event-location"
                      data-field="eventLocation"
                      aria-invalid={!!errors.eventLocation}
                    >
                      <SelectValue placeholder="Select a venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationsForSelection.map((loc) => {
                        const left = locationSpotsLeft(loc);
                        const full = left === 0;
                        const label = locationLabel(loc);
                        return (
                          <SelectItem key={loc.id} value={loc.id} disabled={full}>
                            {label || "Venue"}
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
                  <ErrorText>{errors.eventLocation}</ErrorText>
                </>
              </Field>
            )}

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

        <div className="h-px bg-border" />

        {/* ── Confirm & finish ── */}
        <FormSection title="Confirm & finish">
            <div className="flex flex-col gap-4 rounded-2xl bg-surface-alt p-5">
              <Row label="Event">
                {selectedEvent ? selectedEvent.title : "Not selected yet"}
              </Row>

              <Row label="Venue">
                {selectedLocation
                  ? locationLabel(selectedLocation) || "—"
                  : "Not selected yet"}
              </Row>

              {invoice ? (
                <div className="flex flex-col gap-2.5 border-t border-border pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Registration fee</span>
                    <span className="text-text">{formatINR(invoice.base)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">
                      Platform fee ({Math.round(PLATFORM_FEE_RATE * 100)}%)
                    </span>
                    <span className="text-text">
                      {formatINR(invoice.platformFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">
                      GST ({Math.round(GST_RATE * 100)}%)
                    </span>
                    <span className="text-text">{formatINR(invoice.gst)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="font-medium text-text">Total payable</span>
                    <span className="font-heading text-lg font-bold text-heading">
                      {formatINR(invoice.total)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="font-medium text-text">Registration fee</span>
                  <span className="font-heading text-lg font-bold text-heading">
                    {fee === 0 ? "Free" : feeLabel}
                  </span>
                </div>
              )}
            </div>

            <p className="flex items-start gap-2 text-xs text-text-muted">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-success" />
              Payments are processed securely by Razorpay (UPI, cards, net
              banking &amp; wallets). Your card details never touch our servers.
              Registrations are non-refundable.
            </p>

            {payError && (
              <p className="rounded-lg bg-error/10 p-3 text-sm text-error">
                {payError}
              </p>
            )}
            {status === "error" && (
              <p className="rounded-lg bg-error/10 p-3 text-sm text-error">
                Something went wrong starting your payment. Please try again
                or contact us.
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
              <CheckCircle2 size={18} />
              {status === "submitting"
                ? "Processing…"
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