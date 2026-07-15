/**
 * Firebase Admin SDK — SERVER ONLY.
 *
 * Used by the payment/registration API routes to write registrations
 * authoritatively (bypassing client security rules). Never import this from a
 * client component.
 *
 * Credentials come from `FIREBASE_ADMIN_SERVICE_ACCOUNT`, which may be either
 * the raw service-account JSON or that JSON base64-encoded (handy for hosts
 * that dislike multiline env vars).
 */
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import {
  FieldValue,
  Timestamp,
  getFirestore,
  type DocumentReference,
  type Firestore,
} from "firebase-admin/firestore";

/**
 * How long an unpaid ("pending") registration may hold its reserved slot before
 * it's considered abandoned and reclaimed. Razorpay only sends `payment.failed`
 * when a payment is actually attempted and fails — a user who opens checkout and
 * walks away triggers nothing, so without this sweep their hold would occupy a
 * slot forever and could wedge an event at "full". 30 min comfortably covers a
 * genuine checkout (incl. slow UPI) while freeing ghosts promptly.
 */
export const PENDING_HOLD_TTL_MS = 30 * 60 * 1000;

function loadServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      "FIREBASE_ADMIN_SERVICE_ACCOUNT is not set — payment/registration API cannot run.",
    );
  }
  const json = raw.trim().startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8");
  // The downloaded key uses snake_case; cert() reads that shape at runtime.
  return JSON.parse(json) as ServiceAccount;
}

let db: Firestore | null = null;

/**
 * Lazily initialize + return the Admin Firestore instance. Lazy so importing a
 * route at build time doesn't require the service-account env to be present —
 * it's only needed when a request actually runs.
 */
export function getAdminDb(): Firestore {
  if (db) return db;
  const app: App =
    getApps()[0] ?? initializeApp({ credential: cert(loadServiceAccount()) });
  db = getFirestore(app);
  return db;
}

/**
 * Release a previously reserved slot (e.g. a failed/abandoned payment) by
 * decrementing the right counter: the chosen location's count inside the
 * `locations` array, plus the whole-doc `registrationCount`. Legacy events (no
 * locations array) just decrement the doc count. Runs inside a transaction so
 * the array re-write is atomic. Never drops a count below 0.
 *
 * Pass an existing `tx` to fold this into a caller's transaction; otherwise it
 * opens its own.
 */
export async function releaseLocationSlot(
  adminDb: Firestore,
  eventRef: DocumentReference,
  locationId: string | undefined,
): Promise<void> {
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(eventRef);
    if (!snap.exists) return;
    const ev = snap.data()!;
    const locations = Array.isArray(ev.locations)
      ? (ev.locations as Record<string, unknown>[])
      : null;

    if (locations && locations.length > 0) {
      const idx = locationId
        ? locations.findIndex((l) => l.id === locationId)
        : 0;
      if (idx >= 0) {
        const current =
          typeof locations[idx].registrationCount === "number"
            ? (locations[idx].registrationCount as number)
            : 0;
        const nextLocations = locations.map((l, i) =>
          i === idx ? { ...l, registrationCount: Math.max(0, current - 1) } : l,
        );
        tx.update(eventRef, {
          locations: nextLocations,
          registrationCount: FieldValue.increment(-1),
        });
      }
    } else {
      tx.update(eventRef, { registrationCount: FieldValue.increment(-1) });
    }
  });
}

/**
 * Reclaim abandoned pending holds for one event before a fresh reservation.
 *
 * A pending registration reserves its slot the instant checkout starts, but if
 * the user never pays AND Razorpay never sends `payment.failed` (e.g. they just
 * closed the tab), that slot is held indefinitely. This finds pending
 * registrations for `eventId` older than PENDING_HOLD_TTL_MS, marks them
 * `expired`, and decrements the counters they were holding — so an event with,
 * say, 6 paid + 4 abandoned pending doesn't stay stuck at "full".
 *
 * Runs as its own best-effort sweep (NOT inside the caller's reservation
 * transaction): it may touch several docs and must not bloat or fail the
 * critical path. Each release is individually transactional and idempotent —
 * re-flipping an already-expired reg is prevented by the status guard, so the
 * counter can never be double-decremented. Scoped to `eventId` (and `locationId`
 * when given) so a sweep only ever touches the location a new sign-up contends
 * for. Failures are swallowed; the subsequent FULL check still holds the line.
 *
 * @returns how many holds were reclaimed (0 if none / on any error).
 */
export async function reclaimStalePendingHolds(
  adminDb: Firestore,
  eventId: string,
  locationId?: string,
): Promise<number> {
  const cutoffMs = Date.now() - PENDING_HOLD_TTL_MS;
  let released = 0;
  try {
    // Equality-only filters so NO composite index is needed. The age cut is
    // applied in memory below — the pending set per event is small, and we cap
    // the scan at 100 docs to bound cost.
    let q = adminDb
      .collection("registrations")
      .where("eventId", "==", eventId)
      .where("status", "==", "pending")
      .limit(100);
    if (locationId) q = q.where("locationId", "==", locationId);

    const pending = await q.get();
    if (pending.empty) return 0;

    // Keep only holds older than the TTL. A missing/odd createdAt is treated as
    // NOT stale (leave it alone) — better to under-reclaim than free a fresh one.
    const stale = pending.docs.filter((d) => {
      const created = d.data().createdAt;
      const ms =
        created instanceof Timestamp ? created.toMillis() : null;
      return ms !== null && ms < cutoffMs;
    });
    if (stale.length === 0) return 0;

    const eventRef = adminDb.collection("events").doc(eventId);
    for (const doc of stale) {
      const ok = await adminDb.runTransaction(async (tx) => {
        const fresh = await tx.get(doc.ref);
        // Re-check under the transaction: it may have been paid/expired between
        // the query and now. Only a still-pending reg is safe to reclaim.
        if (!fresh.exists || fresh.data()?.status !== "pending") return false;
        tx.update(doc.ref, {
          status: "expired",
          paymentStatus: "expired",
          expiredAt: FieldValue.serverTimestamp(),
        });
        return true;
      });
      if (ok) {
        // Release outside the reg transaction (own event-doc transaction) so the
        // array re-write stays atomic and never below zero.
        await releaseLocationSlot(
          adminDb,
          eventRef,
          (doc.data().locationId as string) || undefined,
        );
        released++;
      }
    }
  } catch (err) {
    // Missing composite index or transient error — don't block the sign-up.
    console.error("reclaimStalePendingHolds failed", err);
    return released;
  }
  return released;
}

/**
 * Server-side read of the global registration switch (Admin SDK), so the
 * create/order routes can reject sign-ups when registration is closed even if
 * the request bypasses the UI. Defaults to open on any read failure.
 */
export async function getRegistrationSettings(
  adminDb: Firestore,
): Promise<{ open: boolean; closedMessage: string }> {
  const FALLBACK =
    "Registrations are currently closed. Please check back soon.";
  try {
    const snap = await adminDb.collection("settings").doc("registration").get();
    const data = snap.exists ? snap.data()! : {};
    return {
      open: data.open !== false,
      closedMessage: (data.closedMessage as string)?.trim() || FALLBACK,
    };
  } catch {
    return { open: true, closedMessage: FALLBACK };
  }
}
