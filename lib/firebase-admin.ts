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
import { getFirestore, type Firestore } from "firebase-admin/firestore";

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
