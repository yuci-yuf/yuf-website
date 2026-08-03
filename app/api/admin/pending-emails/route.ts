import {
  eventDeskErrorResponse,
  EventDeskError,
  requireFullAdmin,
} from "@/lib/event-desk-server";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  buildRegistrationEmailCopy,
  sendRegistrationEmailOnce,
  type RegistrationEmailData,
} from "@/lib/email";
import type { PendingEmailRegistration } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Registrations that are paid but never emailed — and the tools to fix them.
 *
 * `sendRegistrationEmailOnce` claims an `emailSentAt` marker before sending and
 * DELETES it again if the send fails, so "confirmed with no `emailSentAt`" is
 * precisely the set of participants who paid but hold no confirmation email.
 * That is what this route lists. The common cause is Resend's free-tier daily
 * cap: the send is refused, the claim is released, and nothing retries.
 *
 * GET    — list them (optionally `?id=` for one registration's email copy)
 * POST   — resend via Resend, one `registrationId` or `all: true`
 */

/** Cap on a bulk resend, so one click can't spend an entire daily quota. */
const BULK_LIMIT = 50;

function emailDataFrom(
  data: FirebaseFirestore.DocumentData,
): RegistrationEmailData | null {
  const to = typeof data.email === "string" ? data.email.trim() : "";
  const eventTitle = typeof data.eventTitle === "string" ? data.eventTitle : "";
  if (!to || !eventTitle) return null;
  return {
    to,
    firstName:
      (typeof data.firstName === "string" && data.firstName.trim()) || "there",
    eventTitle,
    date: typeof data.locationDate === "string" ? data.locationDate : undefined,
    venue:
      typeof data.locationVenue === "string" ? data.locationVenue : undefined,
    location: typeof data.location === "string" ? data.location : undefined,
    registrationCode:
      typeof data.registrationCode === "string"
        ? data.registrationCode
        : undefined,
  };
}

/**
 * Confirmed registrations with no `emailSentAt`, newest first.
 *
 * Firestore cannot query for a missing field, so this filters on `confirmed`
 * (a single-field equality, which needs no composite index) and drops the ones
 * that already have the marker in memory.
 *
 * The sort is deliberately in memory too: adding `.orderBy("createdAt")` to the
 * equality filter would require a composite index, and this is a recovery tool
 * — it must work the moment it's needed, not after a `firebase deploy` finishes
 * building an index.
 *
 * Because the cap applies BEFORE the in-memory filter, it bounds how many
 * confirmed registrations are scanned, not how many are returned. It is set
 * high enough to cover the whole collection at this event's scale; `scanned`
 * comes back so the caller can say plainly when it hit the ceiling and the
 * list may be incomplete.
 */
const SCAN_LIMIT = 3000;

async function pendingDocs(limit = SCAN_LIMIT) {
  const snapshot = await getAdminDb()
    .collection("registrations")
    .where("status", "==", "confirmed")
    .limit(limit)
    .get();
  const docs = snapshot.docs
    .filter((d) => !d.data().emailSentAt)
    .sort((a, b) => {
      const ms = (v: FirebaseFirestore.DocumentData) =>
        v.createdAt && typeof v.createdAt.toMillis === "function"
          ? v.createdAt.toMillis()
          : 0;
      return ms(b.data()) - ms(a.data());
    });
  return { docs, truncated: snapshot.size === limit };
}

export async function GET(request: Request) {
  try {
    await requireFullAdmin(request);
    const id = new URL(request.url).searchParams.get("id")?.trim();

    // Single registration → the copy-paste email body.
    if (id) {
      const ref = getAdminDb().collection("registrations").doc(id);
      const snapshot = await ref.get();
      if (!snapshot.exists) {
        throw new EventDeskError(404, "Registration not found.");
      }
      const emailData = emailDataFrom(snapshot.data()!);
      if (!emailData) {
        throw new EventDeskError(
          400,
          "This registration has no email address or event recorded.",
        );
      }
      const copy = await buildRegistrationEmailCopy(emailData);
      return Response.json({ to: emailData.to, ...copy });
    }

    const { docs, truncated } = await pendingDocs();
    const registrations: PendingEmailRegistration[] = docs.map((d) => {
      const data = d.data();
      const createdAt = data.createdAt;
      return {
        id: d.id,
        firstName: String(data.firstName ?? ""),
        lastName: String(data.lastName ?? ""),
        email: String(data.email ?? ""),
        phone: String(data.phone ?? ""),
        eventTitle: String(data.eventTitle ?? ""),
        locationVenue: data.locationVenue ? String(data.locationVenue) : "",
        locationDate: data.locationDate ? String(data.locationDate) : "",
        registrationCode: data.registrationCode
          ? String(data.registrationCode)
          : "",
        createdAt:
          createdAt && typeof createdAt.toDate === "function"
            ? createdAt.toDate().toISOString()
            : null,
      };
    });
    return Response.json({ registrations, truncated });
  } catch (error) {
    return eventDeskErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireFullAdmin(request);
    const body = await request.json();
    const db = getAdminDb();

    // ── Bulk: retry everyone still missing an email ──
    // Sequential, not parallel: Resend also rate-limits per second, so firing
    // 50 sends at once would trip that on top of whatever daily quota remains.
    if (body.all === true) {
      const all = (await pendingDocs()).docs;
      const batch = all.slice(0, BULK_LIMIT);
      let sent = 0;
      let failed = 0;
      for (const doc of batch) {
        const result = await sendRegistrationEmailOnce(db, doc.ref);
        if (result.sent) sent += 1;
        else failed += 1;
      }
      return Response.json({
        sent,
        failed,
        // True when the cap trimmed the batch — re-run to continue where it left off.
        truncated: all.length > batch.length,
      });
    }

    // ── Single ──
    const id =
      typeof body.registrationId === "string" ? body.registrationId.trim() : "";
    if (!id) throw new EventDeskError(400, "A registration is required.");
    const ref = db.collection("registrations").doc(id);
    if (!(await ref.get()).exists) {
      throw new EventDeskError(404, "Registration not found.");
    }
    const result = await sendRegistrationEmailOnce(db, ref);
    return Response.json(result);
  } catch (error) {
    return eventDeskErrorResponse(error);
  }
}
