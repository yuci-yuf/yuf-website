import type { Metadata } from "next";
import { LegalContent } from "@/components/public/LegalContent";
import { refundPolicy } from "@/lib/content";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "Conditions for refunds and cancellations of Youth United Festival registration fees.",
};

export default function RefundPolicyPage() {
  return <LegalContent data={refundPolicy} />;
}
