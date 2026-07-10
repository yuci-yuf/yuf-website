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
  getFirestore,
  type DocumentReference,
  type Firestore,
} from "firebase-admin/firestore";

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
