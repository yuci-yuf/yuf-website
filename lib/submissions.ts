/**
 * Client-side Firestore writes for public form submissions.
 *
 * Per the PRD security model, public users may `create` documents in
 * `contactSubmissions` but cannot read them — only admins can. This runs in the
 * browser using the Firebase client SDK from `@/lib/firebase`. (Registrations
 * are created server-side via `/api/registrations/order` instead, since their
 * amount/status must not be forgeable by the client.)
 */
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ContactSubmission {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function submitContact(data: ContactSubmission): Promise<void> {
  await addDoc(collection(db, "contactSubmissions"), {
    ...data,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Partnership / Sponsorship proposal submission.
 *
 * Unlike contact/registration data (Firestore), these go straight to the
 * organisation's Google Sheet — each form type into its own tab — via the
 * Apps Script Web App. The browser never sees the webhook URL: it POSTs to
 * `/api/partner`, which forwards server-side. The proposal document (if any)
 * is uploaded to Cloudinary first and only its URL travels in the payload.
 */
export type PartnerFormType = "partnership" | "sponsorship";

export interface PartnerSubmission {
  formType: PartnerFormType;
  fields: Record<string, string>;
  /** Cloudinary URL of the uploaded proposal, or "" if none. */
  proposalUrl: string;
  proposalName: string;
}

export async function submitPartnerProposal(
  data: PartnerSubmission,
): Promise<void> {
  const res = await fetch("/api/partner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    // The route already logs the technical detail; surface a safe message.
    throw new Error(
      "We couldn't submit your proposal right now. Please try again in a moment.",
    );
  }
}
