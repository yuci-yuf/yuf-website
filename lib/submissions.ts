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
  increment,
  runTransaction,
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
  /** Human-friendly entry code shown to the participant. */
  registrationCode?: string;
  /** Which event location the participant registered for. */
  locationId?: string;
  locationVenue?: string;
  locationDate?: string;
}

/**
 * Thrown by `submitRegistration` when the event's `registrationLimit` has been
 * reached. The form catches this to show a "this event is full" message rather
 * than a generic error.
 */
export class RegistrationFullError extends Error {
  constructor(message = "This event is full.") {
    super(message);
    this.name = "RegistrationFullError";
  }
}

/**
 * Saves a registration directly from the client (no payment step). The record
 * is marked `confirmed` with `paymentStatus: "pending"` — i.e. registered,
 * payment not yet collected. When the Razorpay flow is (re)enabled, the payment
 * API routes will own confirmation instead.
 *
 * Runs inside a Firestore transaction so the capacity check and the count
 * increment are atomic — two people submitting the last spot at once can't both
 * succeed. The event's `registrationFee` is also re-read here so a fee the admin
 * changed after the page loaded is always honoured.
 *
 * Throws `RegistrationFullError` if `registrationLimit` is set and already met.
 */
export async function submitRegistration(
  data: RegistrationSubmission,
): Promise<string> {
  const eventRef = doc(db, "events", data.eventId);
  const regRef = doc(collection(db, "registrations"));

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(eventRef);
    const ev = snap.exists() ? snap.data() : null;

    // Honour the latest fee from the event doc; fall back to the submitted
    // amount if the event can't be read.
    const amountPaid =
      ev && typeof ev.registrationFee === "number"
        ? (ev.registrationFee as number)
        : data.amountPaid;

    // Enforce capacity when a limit is configured.
    const limit =
      ev && typeof ev.registrationLimit === "number"
        ? (ev.registrationLimit as number)
        : null;
    const count =
      ev && typeof ev.registrationCount === "number"
        ? (ev.registrationCount as number)
        : 0;
    if (limit !== null && count >= limit) {
      throw new RegistrationFullError();
    }

    tx.set(regRef, {
      ...data,
      amountPaid,
      paymentStatus: "pending",
      status: "confirmed",
      checkedIn: false,
      createdAt: serverTimestamp(),
    });
    // Only bump the counter when the event doc exists (so the public update
    // rule, which requires the event to already exist, is satisfied).
    if (ev) {
      tx.update(eventRef, { registrationCount: increment(1) });
    }
  });

  return regRef.id;
}
