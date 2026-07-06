"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import type { EventItem, EventLocation } from "@/types";
import {
  getEventLocations,
  locationParts,
  locationSpotsLeft,
} from "@/lib/event-groups";
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
import { submitRegistration, RegistrationFullError } from "@/lib/submissions";
import { cn } from "@/lib/utils";

// Human-friendly, non-sequential entry code (Crockford-ish alphabet, no
// I/L/O/U). Generated in the browser via Web Crypto.
function makeRegistrationCode(): string {
  const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < 6; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
  return `YUF26-${code}`;
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Cities where the festival runs. */
const LOCATIONS = ["Chennai", "Coimbatore"];
/**
 * Where each city's events are actually held. A participant's chosen city
 * filters to event locations whose district/venue is in that place.
 * (Chennai's events run in Ponneri; Coimbatore's in Coimbatore.)
 */
const LOCATION_VENUES: Record<string, string[]> = {
  Chennai: ["Ponneri"],
  Coimbatore: ["Coimbatore"],
};

/** True if an event location (district/venue) belongs to the given city. */
function locationInCity(loc: EventLocation, city: string): boolean {
  const names = LOCATION_VENUES[city] ?? [];
  if (names.length === 0) return false;
  const haystack = `${loc.district ?? ""} ${loc.venue ?? ""}`.toLowerCase();
  return names.some((name) => haystack.includes(name.toLowerCase()));
}

/** True if any of the event's locations is in the given city. */
function eventInCity(ev: EventItem, city: string): boolean {
  if (!city) return false;
  return getEventLocations(ev).some((l) => locationInCity(l, city));
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
  location: string;
  institutionType: InstitutionType;
  institutionName: string; // name of the school / college
  level: string; // standard (school) or year (college)
}

const EMPTY: FormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  location: "",
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
  // explicit ?loc pre-selects a location — otherwise a multi-location event
  // starts with none chosen so the user must consciously pick the date/place.
  const explicitLocation = preselected
    ? getEventLocations(preselected).find((l) => l.id === preselectedLoc)
    : undefined;
  // For pre-filling the city, fall back to the event's first location so the
  // city-filtered dropdowns include the event even without an explicit ?loc.
  const cityHintLocation =
    explicitLocation ??
    (preselected ? getEventLocations(preselected)[0] : undefined);
  const preselectedCity =
    preselected && cityHintLocation
      ? (LOCATIONS.find((c) => locationInCity(cityHintLocation, c)) ?? "")
      : "";

  const [values, setValues] = useState<FormValues>({
    ...EMPTY,
    location: preselectedCity,
  });
  const [category, setCategory] = useState<string>(preselected?.category ?? "");
  const [eventId, setEventId] = useState<string>(preselected?.id ?? "");
  const [locationId, setLocationId] = useState<string>(
    explicitLocation?.id ?? "",
  );
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error" | "full"
  >("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const [regCode, setRegCode] = useState<string>("");

  const setField = (key: keyof FormValues, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Categories that have at least one event open to the student's type
  // (school/college) AND running in the chosen city.
  const availableCategories = useMemo(() => {
    return categories.filter((c) =>
      events.some(
        (e) =>
          e.category === c &&
          eventForStudentType(e, values.institutionType) &&
          eventInCity(e, values.location),
      ),
    );
  }, [categories, events, values.institutionType, values.location]);

  // Events for the picker (filtered by the student's school/college type AND the
  // chosen city): the selected category first, then every other eligible event
  // below it — so a participant can still reach events outside the category.
  const { primaryEvents, otherEvents } = useMemo(() => {
    if (!category) {
      return { primaryEvents: [] as EventItem[], otherEvents: [] as EventItem[] };
    }
    const eligible = events.filter(
      (e) =>
        eventForStudentType(e, values.institutionType) &&
        eventInCity(e, values.location),
    );
    return {
      primaryEvents: eligible.filter((e) => e.category === category),
      otherEvents: eligible.filter((e) => e.category !== category),
    };
  }, [events, category, values.institutionType, values.location]);

  const selectedEvent = events.find((e) => e.id === eventId);

  // The event list is filtered only by school/college, so the user must pick
  // that before choosing a category/event. City no longer gates the list.
  const canChooseEvent = !!values.institutionType && !!values.location;

  // All locations of the selected event (what the participant picks between).
  // Fee is shared across locations.
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
    // A location must be chosen whenever the event offers more than one.
    if (eventId && locationsForSelection.length > 1 && !selectedLocation)
      e.eventLocation = "Please choose a location.";
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
    const institution =
      values.institutionType === "school"
        ? `${values.institutionName.trim()} (School — ${values.level} standard)`
        : `${values.institutionName.trim()} (College — ${values.level})`;

    setStatus("submitting");
    try {
      // Payment is deferred — record the registration directly. When Razorpay
      // is re-enabled, this write moves behind the payment API routes.
      const code = makeRegistrationCode();
      const { place, date } = locationParts(selectedLocation);
      const venue =
        selectedLocation.venue ?? selectedLocation.district ?? place;
      const eventDate = selectedLocation.date ?? date;

      await submitRegistration({
        firstName,
        lastName,
        email: values.email.trim(),
        phone: values.phone,
        location: values.location,
        institution,
        eventCategory: selectedEvent.category,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        ageCategory: values.level,
        amountPaid: invoice?.total ?? fee ?? 0,
        registrationCode: code,
        locationId: effectiveLocationId,
        locationVenue: venue,
        locationDate: eventDate,
      });
      finishSuccess(code);

      // Fire-and-forget confirmation email — never block or fail the success UI.
      void fetch("/api/registrations/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: values.email.trim(),
          firstName,
          eventTitle: selectedEvent.title,
          date: eventDate,
          venue,
          registrationCode: code,
        }),
      }).catch(() => {});
    } catch (err) {
      if (err instanceof RegistrationFullError) {
        setStatus("full");
        return;
      }
      console.error("Registration failed:", err);
      setStatus("error");
    }
  }

  function finishSuccess(code?: string) {
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
                    // so clear any category/event/location chosen.
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
                    // Changing city changes which events are available,
                    // so clear any category/event/location for the old city.
                    setValues((prev) => ({ ...prev, location: v }));
                    setCategory("");
                    setEventId("");
                    setLocationId("");
                    setErrors((e) => ({
                      ...e,
                      location: undefined,
                      category: undefined,
                      event: undefined,
                      eventLocation: undefined,
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
                            : !values.location
                              ? "Select your location first"
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

            {/* Location picker — only when the chosen event runs in more than
                one place in this city. Capacity is shown per location. */}
            {locationsForSelection.length > 1 && (
              <Field label="Location & date" htmlFor="event-location" required>
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
                      <SelectValue placeholder="Choose a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationsForSelection.map((loc) => {
                        const { place, date } = locationParts(loc);
                        const left = locationSpotsLeft(loc);
                        const full = left === 0;
                        const label = [place, date].filter(Boolean).join(" · ");
                        return (
                          <SelectItem key={loc.id} value={loc.id} disabled={full}>
                            {label || "Location"}
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

              <Row label="Location">
                {selectedLocation
                  ? (() => {
                      const { place, date } = locationParts(selectedLocation);
                      return [place, date].filter(Boolean).join(" · ") || "—";
                    })()
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
              No payment required now — your spot is reserved and our team will
              share fee &amp; payment details later. Your details are kept private.
            </p>

            {status === "error" && (
              <p className="rounded-lg bg-error/10 p-3 text-sm text-error">
                Something went wrong saving your registration. Please try again
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
                ? "Submitting…"
                : selectedFull
                  ? "Event Full"
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