import type { Metadata } from "next";
import { LegalContent } from "@/components/public/LegalContent";
import { termsAndConditions } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Eligibility, registration, code of conduct, and other terms for participating in the Youth United Festival.",
};

export default function TermsAndConditionsPage() {
  return <LegalContent data={termsAndConditions} />;
}
