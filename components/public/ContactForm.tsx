"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
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
import { submitContact } from "@/lib/submissions";
import { contactContent } from "@/lib/content";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("submitting");
    try {
      await submitContact({
        firstName: String(data.get("firstName") ?? ""),
        lastName: String(data.get("lastName") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        subject: String(data.get("subject") ?? ""),
        message: String(data.get("message") ?? ""),
      });
      form.reset();
      setStatus("success");
    } catch (err) {
      console.error("Contact submission failed:", err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-6 text-center shadow-card sm:p-10">
        <CheckCircle2 size={48} className="text-success" />
        <h3 className="font-heading text-xl font-bold text-text">Message sent!</h3>
        <p className="max-w-sm text-text-muted">
          Thank you for reaching out. Our team will get back to you within 24 hours.
        </p>
        <Button variant="outline" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8"
    >
      <h3 className="font-heading text-xl font-bold text-text">Send us a message</h3>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First Name" htmlFor="firstName" required>
          <Input id="firstName" name="firstName" required autoComplete="given-name" placeholder="Enter your first name" />
        </Field>
        <Field label="Last Name" htmlFor="lastName" required>
          <Input id="lastName" name="lastName" required autoComplete="family-name" placeholder="Enter your last name" />
        </Field>
        <Field label="Email Address" htmlFor="email" required>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="Enter your email" />
        </Field>
        <Field label="Phone Number" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Enter your phone number" />
        </Field>
      </div>

      <Field label="Subject" htmlFor="subject" required>
        <Select name="subject" required>
          <SelectTrigger id="subject">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {contactContent.subjects.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field
        label="Message"
        htmlFor="message"
        required
        description="We'd love to hear from you! Whether you have questions, need more details about YUF, or want to get involved, feel free to write here. We'll get back to you as soon as possible."
      >
        <Textarea
          id="message"
          name="message"
          required
          className="min-h-40"
          placeholder="Write your message here…"
        />
      </Field>

      {status === "error" && (
        <p className="text-sm text-error">
          Something went wrong sending your message. Please try again.
        </p>
      )}

      <Button type="submit" size="lg" disabled={status === "submitting"}>
        <Send size={18} />
        {status === "submitting" ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
