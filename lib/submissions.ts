/**
 * Client-side Firestore writes for public form submissions.
 *
 * Per the PRD security model, public users may `create` documents in
 * `contactSubmissions` (and later `registrations`) but cannot read them —
 * only admins can. These helpers run in the browser using the Firebase
 * client SDK from `@/lib/firebase`.
 */
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
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

export interface RegistrationSubmission {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  institution: string;
  eventCategory: string;
  eventId: string;
  eventTitle: string;
  ageCategory: string;
  message?: string;
  amountPaid: number;
}

/**
 * Saves a registration with `pending` payment/status. The Razorpay payment
 * flow (Phase 3) will instead create the doc after a verified payment and set
 * paymentStatus/status to "paid"/"confirmed".
 *
 * The amount stored is re-read from the event document at submit time, so a fee
 * the admin changed after the page loaded is always honoured — the client's
 * `amountPaid` is only a fallback if the event can't be read.
 */
export async function submitRegistration(
  data: RegistrationSubmission,
): Promise<string> {
  let amountPaid = data.amountPaid;
  try {
    const snap = await getDoc(doc(db, "events", data.eventId));
    if (snap.exists() && typeof snap.data().registrationFee === "number") {
      amountPaid = snap.data().registrationFee as number;
    }
  } catch (e) {
    // Fall back to the client-provided amount if the lookup fails.
    console.error("submitRegistration: fee re-check failed", e);
  }

  const ref = await addDoc(collection(db, "registrations"), {
    ...data,
    amountPaid,
    paymentStatus: "pending",
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
