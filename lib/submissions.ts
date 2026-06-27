/**
 * Client-side Firestore writes for public form submissions.
 *
 * Per the PRD security model, public users may `create` documents in
 * `contactSubmissions` (and later `registrations`) but cannot read them —
 * only admins can. These helpers run in the browser using the Firebase
 * client SDK from `@/lib/firebase`.
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
 */
export async function submitRegistration(
  data: RegistrationSubmission,
): Promise<string> {
  const ref = await addDoc(collection(db, "registrations"), {
    ...data,
    paymentStatus: "pending",
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
