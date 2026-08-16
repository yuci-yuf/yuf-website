"use client";

import { useState, useMemo } from "react";
import {
  Building2,
  HeartHandshake,
  UserRound,
  Target,
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileCheck2,
  Loader2,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary-upload";
import {
  submitPartnerProposal,
  type PartnerFormType,
} from "@/lib/submissions";

/* ─── Reference data (from forms.md) ──────────────────────────────────── */

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const PARTNERSHIP_AREAS = [
  "Youth Empowerment Chapters",
  "Joint Research & Policy Studies",
  "Skill Development Programs",
  "National/International Events Collaboration",
  "Social Welfare & Community Service",
  "Other",
];

const SPONSORSHIP_TYPES = [
  "Financial Support / Grant",
  "Resource Contribution (In-Kind)",
  "Event Sponsorship / Partnership",
  "Venue / Logistics Support",
  "Media / Publicity Partnership",
  "Other",
];

/* ─── Mode config — the toggle re-tints and re-labels the whole form ──── */

type Mode = PartnerFormType;

interface StepDef {
  id: number;
  label: string;
  icon: typeof Building2;
}

const MODES: Record<
  Mode,
  {
    eyebrow: string;
    lead: typeof Building2;
    steps: StepDef[];
    /** Tailwind utility fragments for the accent colour of this mode. */
    accentText: string;
    accentBg: string;
    accentSoftBg: string;
    accentBorder: string;
    accentRing: string;
  }
> = {
  partnership: {
    eyebrow: "MOU Partnership",
    lead: Building2,
    steps: [
      { id: 1, label: "Institution", icon: Building2 },
      { id: 2, label: "Representative", icon: UserRound },
      { id: 3, label: "Scope", icon: Target },
      { id: 4, label: "Review", icon: ClipboardCheck },
    ],
    accentText: "text-primary-700",
    accentBg: "bg-primary-600",
    accentSoftBg: "bg-primary-50",
    accentBorder: "border-primary-600",
    accentRing: "ring-primary-300",
  },
  sponsorship: {
    eyebrow: "Sponsorship & Support",
    lead: HeartHandshake,
    steps: [
      { id: 1, label: "Sponsor", icon: HeartHandshake },
      { id: 2, label: "Contact", icon: UserRound },
      { id: 3, label: "Details", icon: Target },
      { id: 4, label: "Review", icon: ClipboardCheck },
    ],
    accentText: "text-highlight-600",
    accentBg: "bg-highlight-500",
    accentSoftBg: "bg-highlight-50",
    accentBorder: "border-highlight-500",
    accentRing: "ring-highlight-400",
  },
};

/* ─── Validation ──────────────────────────────────────────────────────── */

type Values = Record<string, string>;
type Touched = Record<string, boolean>;

function validate(mode: Mode, name: string, value: string): string {
  const v = (value ?? "").trim();
  const email = /^\S+@\S+\.\S+$/;
  const phoneDigits = v.replace(/\D/g, "").length;

  switch (name) {
    // Shared org name (institutionName / sponsorName)
    case "orgName":
      return v.length >= (mode === "partnership" ? 3 : 2)
        ? ""
        : "This field is required.";
    case "industry":
      return v.length >= 2 ? "" : "Industry or domain is required.";
    case "address":
      return v.length >= 5 ? "" : "Full address is required.";
    case "city":
      return v.length >= 2 ? "" : "City is required.";
    case "state":
      return v ? "" : "Please select a state.";
    case "repName":
      return v.length >= 2 ? "" : "Contact name is required.";
    case "repDesignation":
      return v.length >= 2 ? "" : "Designation is required.";
    case "repEmail":
      return email.test(v) ? "" : "Enter a valid email address.";
    case "repPhone":
      return phoneDigits >= 10 ? "" : "Enter a valid 10-digit number.";
    case "scope":
      return v ? "" : "Please make a selection.";
    case "motivation":
      return v.length >= 10 ? "" : "Please write at least 10 characters.";
    default:
      return "";
  }
}

// Which fields each step must pass before "Continue" advances. Step 3's
// proposal file is validated separately (partnership requires it).
const STEP_FIELDS: Record<number, string[]> = {
  1: ["orgName", "address", "city", "state"], // industry added for sponsorship below
  2: ["repName", "repDesignation", "repEmail", "repPhone"],
  3: ["scope", "motivation"],
};

/* ─── Small building blocks ───────────────────────────────────────────── */

function TextField({
  mode,
  name,
  label,
  placeholder,
  type = "text",
  required = true,
  values,
  touched,
  onChange,
  onBlur,
}: {
  mode: Mode;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  values: Values;
  touched: Touched;
  onChange: (name: string, value: string) => void;
  onBlur: (name: string) => void;
}) {
  const error = touched[name] ? validate(mode, name, values[name] ?? "") : "";
  return (
    <Field label={label} htmlFor={name} required={required}>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={values[name] ?? ""}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={() => onBlur(name)}
      />
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-error">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </Field>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */

export function PartnerForm() {
  const [mode, setMode] = useState<Mode>("partnership");
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Values>({});
  const [touched, setTouched] = useState<Touched>({});
  const [proposal, setProposal] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [submitted, setSubmitted] = useState(false);

  const cfg = MODES[mode];
  const isPartnership = mode === "partnership";
  const proposalRequired = isPartnership;

  const change = (name: string, value: string) =>
    setValues((v) => ({ ...v, [name]: value }));
  const blur = (name: string) => setTouched((t) => ({ ...t, [name]: true }));

  // Swapping mode resets the wizard so a half-filled partnership doesn't leak
  // into a sponsorship (and vice-versa) — the field sets differ.
  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setStep(1);
    setValues({});
    setTouched({});
    setProposal(null);
    setStatus("idle");
  }

  function stepValid(target: number): boolean {
    const fields = [...(STEP_FIELDS[target] ?? [])];
    if (target === 1 && !isPartnership) fields.push("industry");
    const ok = fields.every((f) => validate(mode, f, values[f] ?? "") === "");
    if (target === 3 && proposalRequired && !proposal) return false;
    return ok;
  }

  function goNext() {
    const fields = [...(STEP_FIELDS[step] ?? [])];
    if (step === 1 && !isPartnership) fields.push("industry");
    setTouched((t) => {
      const next = { ...t };
      fields.forEach((f) => (next[f] = true));
      return next;
    });
    if (step === 3 && proposalRequired && !proposal) return;
    if (!stepValid(step)) return;
    setStep((s) => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    setStatus("submitting");
    try {
      let proposalUrl = "";
      if (proposal && isCloudinaryConfigured()) {
        const { url } = await uploadToCloudinary(
          proposal,
          "yuf-website/proposals",
          "raw",
        );
        proposalUrl = url;
      }

      // Map the neutral field names to the sheet's expected keys per form type.
      const shared = {
        website: values.website ?? "",
        address: values.address ?? "",
        city: values.city ?? "",
        state: values.state ?? "",
        repName: values.repName ?? "",
        repDesignation: values.repDesignation ?? "",
        repEmail: values.repEmail ?? "",
        repPhone: values.repPhone ?? "",
        motivation: values.motivation ?? "",
      };
      const fields = isPartnership
        ? {
            institutionType: values.orgType ?? "University / College",
            institutionName: values.orgName ?? "",
            area: values.scope ?? "",
            ...shared,
          }
        : {
            profileType: values.orgType ?? "Corporate / Brand",
            sponsorName: values.orgName ?? "",
            industry: values.industry ?? "",
            type: values.scope ?? "",
            details: values.motivation ?? "",
            ...shared,
          };

      await submitPartnerProposal({
        formType: mode,
        fields,
        proposalUrl,
        proposalName: proposal?.name ?? "",
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Partner proposal submission failed:", err);
      setStatus("error");
    }
  }

  /* ── Success ── */
  if (submitted) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-surface p-8 text-center shadow-card sm:p-12">
        <span
          className={cn(
            "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full",
            cfg.accentSoftBg,
          )}
        >
          <CheckCircle2 size={44} className={cfg.accentText} />
        </span>
        <h2 className="font-display text-3xl font-extrabold text-heading">
          {isPartnership ? "Proposal received" : "Thank you"}
        </h2>
        <p className="mt-3 text-[17px] leading-relaxed text-body">
          {isPartnership ? (
            <>
              The partnership proposal from{" "}
              <span className="font-semibold text-heading">
                {values.orgName}
              </span>{" "}
              is with our secretariat. We&apos;ll review it and email{" "}
              <span className="font-semibold text-heading">
                {values.repEmail}
              </span>{" "}
              within 48 hours to take the MOU forward.
            </>
          ) : (
            <>
              We&apos;ve recorded{" "}
              <span className="font-semibold text-heading">
                {values.orgName}
              </span>
              &apos;s interest in supporting the movement. Our partnerships team
              will reach out to{" "}
              <span className="font-semibold text-heading">
                {values.repEmail}
              </span>{" "}
              within 48 hours to align on the details.
            </>
          )}
        </p>
      </div>
    );
  }

  const StepIcon = cfg.steps;
  const progress = ((step - 1) / (cfg.steps.length - 1)) * 100;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* ── Left rail: mode toggle + progress ── */}
      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-28 space-y-6">
          {/* The signature control */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
              I&apos;m here to
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-alt p-1.5">
              {(["partnership", "sponsorship"] as const).map((m) => {
                const active = mode === m;
                const mc = MODES[m];
                const Lead = mc.lead;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    aria-pressed={active}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl px-3 py-3.5 text-sm font-semibold transition-all",
                      active
                        ? cn(mc.accentBg, "text-white shadow-md")
                        : "text-text-muted hover:bg-white/60 hover:text-heading",
                    )}
                  >
                    <Lead size={20} />
                    {m === "partnership" ? "Partner" : "Sponsor"}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              {isPartnership
                ? "For colleges, schools & institutions formalising an MOU with YUCI."
                : "For brands, companies & individuals backing our youth campaigns."}
            </p>
          </div>

          {/* Progress timeline */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
            <div className="relative">
              <div
                className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-border"
                aria-hidden
              />
              <div
                className={cn(
                  "absolute left-[18px] top-3 w-0.5 transition-all duration-500",
                  cfg.accentBg,
                )}
                style={{ height: `calc(${progress}% * 0.86)` }}
                aria-hidden
              />
              <ol className="relative space-y-5">
                {StepIcon.map((s) => {
                  const done = step > s.id;
                  const cur = step === s.id;
                  const Icon = s.icon;
                  return (
                    <li key={s.id} className="flex items-center gap-4">
                      <span
                        className={cn(
                          "z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-surface transition-all",
                          done || cur
                            ? cn(cfg.accentBg, "text-white")
                            : "bg-surface-alt text-text-muted",
                        )}
                      >
                        {done ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-semibold transition-colors",
                          cur
                            ? "text-heading"
                            : done
                              ? cfg.accentText
                              : "text-text-muted",
                        )}
                      >
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Form card ── */}
      <div className="lg:col-span-8">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-9">
          {/* Header */}
          <div className="mb-8 border-b border-border pb-6">
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]",
                cfg.accentSoftBg,
                cfg.accentText,
              )}
            >
              Step {step} of {cfg.steps.length}
            </span>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-heading sm:text-3xl">
              {cfg.steps[step - 1].label}
              {step < 4 ? "" : " & submit"}
            </h2>
            <p className="mt-2 text-body">
              {step === 1 &&
                (isPartnership
                  ? "Tell us about your institution."
                  : "Tell us who you're sponsoring as.")}
              {step === 2 && "Who should we coordinate with?"}
              {step === 3 &&
                (isPartnership
                  ? "Choose a focus and share your MOU proposal."
                  : "Choose how you'd like to contribute.")}
              {step === 4 && "Check everything reads right, then send it over."}
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-5">
            {step === 1 && (
              <>
                {/* Org type segmented radio */}
                <Field
                  label={isPartnership ? "Institution type" : "I'm sponsoring as"}
                  htmlFor="orgType"
                  required
                >
                  <div className="grid grid-cols-2 gap-3" id="orgType">
                    {(isPartnership
                      ? ["University / College", "School / Other"]
                      : ["Corporate / Brand", "Individual Sponsor"]
                    ).map((opt, i) => {
                      const current =
                        values.orgType ??
                        (isPartnership
                          ? "University / College"
                          : "Corporate / Brand");
                      const active = current === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => change("orgType", opt)}
                          aria-pressed={active}
                          className={cn(
                            "rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-all",
                            active
                              ? cn(
                                  cfg.accentBorder,
                                  cfg.accentSoftBg,
                                  "text-heading",
                                )
                              : "border-border text-text-muted hover:border-primary-200 hover:text-heading",
                          )}
                          autoFocus={i === 0 && !values.orgType}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <TextField
                  mode={mode}
                  name="orgName"
                  label={
                    isPartnership
                      ? values.orgType === "School / Other"
                        ? "School / organisation name"
                        : "Institution name"
                      : "Sponsor / company name"
                  }
                  placeholder={
                    isPartnership ? "e.g. Anna University" : "e.g. Acme Corp"
                  }
                  values={values}
                  touched={touched}
                  onChange={change}
                  onBlur={blur}
                />

                {!isPartnership && (
                  <TextField
                    mode={mode}
                    name="industry"
                    label="Industry / domain"
                    placeholder="e.g. Technology, Education, Finance"
                    values={values}
                    touched={touched}
                    onChange={change}
                    onBlur={blur}
                  />
                )}

                <TextField
                  mode={mode}
                  name="website"
                  label={isPartnership ? "Website" : "Website / social profile"}
                  placeholder="https://…"
                  required={false}
                  values={values}
                  touched={touched}
                  onChange={change}
                  onBlur={blur}
                />

                <TextField
                  mode={mode}
                  name="address"
                  label="Street address"
                  placeholder={
                    isPartnership ? "Address of the main campus" : "Address"
                  }
                  values={values}
                  touched={touched}
                  onChange={change}
                  onBlur={blur}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    mode={mode}
                    name="city"
                    label="City"
                    placeholder="e.g. Chennai"
                    values={values}
                    touched={touched}
                    onChange={change}
                    onBlur={blur}
                  />
                  <Field label="State" htmlFor="state" required>
                    <Select
                      value={values.state ?? ""}
                      onValueChange={(val) => {
                        change("state", val);
                        blur("state");
                      }}
                    >
                      <SelectTrigger id="state" className="w-full">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="max-h-72">
                        {STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.state && validate(mode, "state", values.state ?? "") && (
                      <p className="flex items-center gap-1.5 text-sm text-error">
                        <AlertCircle size={14} /> Please select a state.
                      </p>
                    )}
                  </Field>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    mode={mode}
                    name="repName"
                    label="Contact name"
                    placeholder="Dr. Jane Doe"
                    values={values}
                    touched={touched}
                    onChange={change}
                    onBlur={blur}
                  />
                  <TextField
                    mode={mode}
                    name="repDesignation"
                    label="Designation"
                    placeholder={
                      isPartnership
                        ? "e.g. Registrar, Dean"
                        : "e.g. CSR Manager, Director"
                    }
                    values={values}
                    touched={touched}
                    onChange={change}
                    onBlur={blur}
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    mode={mode}
                    name="repEmail"
                    label="Email address"
                    type="email"
                    placeholder="name@organisation.in"
                    values={values}
                    touched={touched}
                    onChange={change}
                    onBlur={blur}
                  />
                  <TextField
                    mode={mode}
                    name="repPhone"
                    label="Phone number"
                    type="tel"
                    placeholder="+91 98765 43210"
                    values={values}
                    touched={touched}
                    onChange={change}
                    onBlur={blur}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <Field
                  label={
                    isPartnership ? "Preferred area of partnership" : "Sponsorship type"
                  }
                  htmlFor="scope"
                  required
                >
                  <Select
                    value={values.scope ?? ""}
                    onValueChange={(val) => {
                      change("scope", val);
                      blur("scope");
                    }}
                  >
                    <SelectTrigger id="scope" className="w-full">
                      <SelectValue
                        placeholder={
                          isPartnership
                            ? "Select an area"
                            : "Select a type"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(isPartnership ? PARTNERSHIP_AREAS : SPONSORSHIP_TYPES).map(
                        (o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  {touched.scope && validate(mode, "scope", values.scope ?? "") && (
                    <p className="flex items-center gap-1.5 text-sm text-error">
                      <AlertCircle size={14} /> Please make a selection.
                    </p>
                  )}
                </Field>

                <Field
                  label={
                    isPartnership
                      ? "Why partner with YUCI?"
                      : "Details of your support"
                  }
                  htmlFor="motivation"
                  required
                >
                  <Textarea
                    id="motivation"
                    name="motivation"
                    className="min-h-32"
                    placeholder={
                      isPartnership
                        ? "Describe the objectives and student benefits of this partnership…"
                        : "Describe the scale, structure, budget or materials you'd like to contribute…"
                    }
                    value={values.motivation ?? ""}
                    aria-invalid={
                      touched.motivation &&
                      validate(mode, "motivation", values.motivation ?? "")
                        ? true
                        : undefined
                    }
                    onChange={(e) => change("motivation", e.target.value)}
                    onBlur={() => blur("motivation")}
                  />
                  {touched.motivation &&
                    validate(mode, "motivation", values.motivation ?? "") && (
                      <p className="flex items-center gap-1.5 text-sm text-error">
                        <AlertCircle size={14} />{" "}
                        {validate(mode, "motivation", values.motivation ?? "")}
                      </p>
                    )}
                </Field>

                {/* File upload */}
                <Field
                  label={
                    isPartnership
                      ? "MOU draft / institution profile"
                      : "Proposal document"
                  }
                  htmlFor="proposal"
                  required={proposalRequired}
                >
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDrag(true);
                    }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDrag(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) setProposal(f);
                    }}
                    className={cn(
                      "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all",
                      drag
                        ? cn(cfg.accentBorder, cfg.accentSoftBg)
                        : proposalRequired && touched.proposal && !proposal
                          ? "border-error/50 bg-error/5"
                          : "border-border bg-surface-alt/40 hover:border-primary-300",
                    )}
                  >
                    <input
                      id="proposal"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setProposal(f);
                        setTouched((t) => ({ ...t, proposal: true }));
                      }}
                    />
                    {proposal ? (
                      <>
                        <span
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full",
                            cfg.accentSoftBg,
                          )}
                        >
                          <FileCheck2 size={24} className={cfg.accentText} />
                        </span>
                        <span className="text-sm font-semibold text-heading">
                          {proposal.name}
                        </span>
                        <span className="text-xs text-text-muted">
                          {(proposal.size / 1024 / 1024).toFixed(2)} MB — click to replace
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-text-muted shadow-card">
                          <UploadCloud size={24} />
                        </span>
                        <span className="text-sm font-semibold text-heading">
                          Click to upload or drag &amp; drop
                        </span>
                        <span className="text-xs text-text-muted">
                          PDF, DOC or DOCX{proposalRequired ? " (required)" : " (optional)"}
                        </span>
                      </>
                    )}
                  </label>
                  {proposalRequired && touched.proposal && !proposal && (
                    <p className="flex items-center gap-1.5 text-sm text-error">
                      <AlertCircle size={14} /> Please attach your proposal document.
                    </p>
                  )}
                </Field>
              </>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-4",
                    cfg.accentSoftBg,
                    "border-transparent",
                  )}
                >
                  <ClipboardCheck size={20} className={cn("mt-0.5 shrink-0", cfg.accentText)} />
                  <p className="text-sm leading-relaxed text-body">
                    Once you submit, our team reviews your{" "}
                    {isPartnership ? "proposal" : "details"} and reaches out
                    within 48 hours to take things forward.
                  </p>
                </div>

                <ReviewGrid
                  isPartnership={isPartnership}
                  values={values}
                  proposalName={proposal?.name}
                  accentText={cfg.accentText}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            {step > 1 ? (
              <Button variant="ghost" onClick={goBack} type="button">
                <ArrowLeft size={18} /> Back
              </Button>
            ) : (
              <span />
            )}

            {step < 4 ? (
              <Button
                type="button"
                size="lg"
                onClick={goNext}
                className={cn(cfg.accentBg, "hover:opacity-90")}
              >
                Continue <ArrowRight size={18} />
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                disabled={status === "submitting"}
                onClick={handleSubmit}
                className={cn(cfg.accentBg, "hover:opacity-90")}
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Submitting…
                  </>
                ) : (
                  <>
                    Submit {isPartnership ? "proposal" : "interest"}{" "}
                    <CheckCircle2 size={18} />
                  </>
                )}
              </Button>
            )}
          </div>

          {status === "error" && step === 4 && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              We couldn&apos;t submit your {isPartnership ? "proposal" : "details"} just
              now. Please try again in a moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Review grid ─────────────────────────────────────────────────────── */

function ReviewGrid({
  isPartnership,
  values,
  proposalName,
  accentText,
}: {
  isPartnership: boolean;
  values: Values;
  proposalName?: string;
  accentText: string;
}) {
  const sections = useMemo(() => {
    const org = isPartnership ? "Institution" : "Sponsor";
    return [
      {
        title: org,
        rows: {
          Name: values.orgName,
          Type: values.orgType,
          ...(isPartnership ? {} : { Industry: values.industry }),
          Website: values.website,
          Location:
            values.city || values.state
              ? `${values.city ?? ""}${values.city && values.state ? ", " : ""}${values.state ?? ""}`
              : "",
        },
      },
      {
        title: "Contact",
        rows: {
          Name: values.repName,
          Designation: values.repDesignation,
          Email: values.repEmail,
          Phone: values.repPhone,
        },
      },
      {
        title: isPartnership ? "Partnership" : "Sponsorship",
        rows: {
          [isPartnership ? "Area" : "Type"]: values.scope,
          [isPartnership ? "Objectives" : "Details"]: values.motivation,
          Document: proposalName ?? "",
        },
      },
    ];
  }, [isPartnership, values, proposalName]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sections.map((s) => (
        <div
          key={s.title}
          className="rounded-2xl border border-border bg-surface-alt/40 p-5"
        >
          <h4
            className={cn(
              "mb-3 text-xs font-bold uppercase tracking-[0.14em]",
              accentText,
            )}
          >
            {s.title}
          </h4>
          <dl className="space-y-2.5">
            {Object.entries(s.rows).map(([k, v]) =>
              v ? (
                <div key={k} className="flex flex-col">
                  <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    {k}
                  </dt>
                  <dd className="text-sm font-semibold text-heading">{v}</dd>
                </div>
              ) : null,
            )}
          </dl>
        </div>
      ))}
    </div>
  );
}
