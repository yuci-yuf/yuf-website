import type { Metadata } from "next";
import { LegalContent } from "@/components/public/LegalContent";
import { privacyPolicy } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How the Youth United Festival collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return <LegalContent data={privacyPolicy} />;
}
