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
