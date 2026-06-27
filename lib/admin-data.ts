/**
 * Client-side Firestore reads/writes for the admin panel.
 *
 * These run in the browser using the Firebase client SDK. Per the PRD
 * security model only admins may read these collections; in development the
 * open getting-started rules allow it (they expire 2026-07-27, after which
 * production rules with isAdmin() must be in place).
 */
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ContactMessage, Registration } from "@/types";

function toISO(value: unknown): string | null {
  if (value && typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  return null;
}

export async function getRegistrations(): Promise<Registration[]> {
  const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      location: data.location ?? "",
      institution: data.institution ?? "",
      eventCategory: data.eventCategory ?? "",
      eventId: data.eventId ?? "",
      eventTitle: data.eventTitle ?? "",
      ageCategory: data.ageCategory ?? "",
      message: data.message ?? "",
      amountPaid: data.amountPaid ?? 0,
      paymentId: data.paymentId ?? "",
      paymentStatus: data.paymentStatus ?? "pending",
      status: data.status ?? "pending",
      createdAt: toISO(data.createdAt),
    } satisfies Registration;
  });
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const q = query(
    collection(db, "contactSubmissions"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      subject: data.subject ?? "",
      message: data.message ?? "",
      isRead: Boolean(data.isRead),
      createdAt: toISO(data.createdAt),
    } satisfies ContactMessage;
  });
}

export async function setContactRead(id: string, isRead: boolean): Promise<void> {
  await updateDoc(doc(db, "contactSubmissions", id), { isRead });
}

export async function setRegistrationStatus(
  id: string,
  status: Registration["status"],
): Promise<void> {
  await updateDoc(doc(db, "registrations", id), { status });
}
