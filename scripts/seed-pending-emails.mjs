#!/usr/bin/env node

/**
 * seed-pending-emails.mjs
 *
 * Creates sample registrations that look like "paid, but the confirmation
 * email never went out" — the exact state the admin Pending emails page is
 * built to surface. Use it to see that page populated (and to exercise the
 * Copy email dialog with a real QR) without waiting for a genuine failure.
 *
 * The state being faked is `status: "confirmed"` with NO `emailSentAt`, which
 * is what `sendRegistrationEmailOnce` leaves behind when Resend refuses a send
 * and the claim is released.
 *
 * THIS WRITES TO THE REAL DATABASE. There is no emulator configured, so these
 * docs land beside real participants. Everything is therefore made obviously
 * fake — "Sample"/"Test"/"Demo" names, @example.com addresses, YUF26-SAMPLEn
 * codes — and each doc carries `isSample: true` so `--clean` can find and
 * remove exactly what this script created, and nothing else.
 *
 * Registrations are server-created by design (firestore.rules has
 * `allow create: if false`), so this uses the Admin SDK and needs
 * FIREBASE_ADMIN_SERVICE_ACCOUNT — the same credential the API routes use.
 *
 * Deterministic doc IDs make it idempotent: re-running updates the same three
 * docs instead of piling up duplicates.
 *
 * Usage:
 *   node scripts/seed-pending-emails.mjs --dry-run   Preview, no writes.
 *   node scripts/seed-pending-emails.mjs             Write the samples.
 *   node scripts/seed-pending-emails.mjs --clean     Delete them again.
 *
 * NOTE: the sample addresses are @example.com (a reserved domain that can
 * never receive mail). Clicking "Resend" on one will fail at Resend — that is
 * expected. Use "Copy email" to exercise the manual path, or edit EMAIL below
 * to your own address to test a real delivery.
 */

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");
const CLEAN = process.argv.includes("--clean");

/** Marks every doc this script writes, so --clean can target only these. */
const SAMPLE_FLAG = "isSample";

const SAMPLES = [
  {
    id: "sample-pending-email-1",
    firstName: "Sample",
    lastName: "Participant",
    email: "sample1@example.com",
    phone: "9000000001",
    institution: "Sample Higher Secondary School",
    institutionType: "school",
    eventTitle: "India's Young Scientist",
    eventCategory: "Innovation",
    locationVenue: "Easwari Engineering College, Ramapuram",
    location: "Chennai",
    locationDate: "18 Sept 2026",
    ageCategory: "Class 11",
    registrationCode: "YUF26-SAMPLE1",
    amountPaid: 250,
    /** Hours back from now, so the three rows sort visibly. */
    hoursAgo: 1,
  },
  {
    id: "sample-pending-email-2",
    firstName: "Test",
    lastName: "Registrant",
    email: "sample2@example.com",
    phone: "9000000002",
    institution: "Sample Arts & Science College",
    institutionType: "college",
    eventTitle: "Treasure Hunt",
    eventCategory: "Fun Events",
    locationVenue: "Velammal Bodhi Campus",
    location: "Coimbatore",
    locationDate: "25 Sept 2026",
    ageCategory: "2nd Year",
    registrationCode: "YUF26-SAMPLE2",
    amountPaid: 200,
    hoursAgo: 5,
  },
  {
    id: "sample-pending-email-3",
    firstName: "Demo",
    lastName: "Attendee",
    email: "sample3@example.com",
    phone: "9000000003",
    institution: "Sample Matriculation School",
    institutionType: "school",
    eventTitle: "Acapella Competition",
    eventCategory: "Arts & Culturals",
    locationVenue: "Velammal Bodhi Campus, Pondicherry",
    location: "Pondicherry",
    locationDate: "25th September 2026",
    ageCategory: "Class 9",
    registrationCode: "YUF26-SAMPLE3",
    amountPaid: 250,
    hoursAgo: 26,
  },
];

async function loadEnv() {
  try {
    const envContent = await readFile(join(PROJECT_ROOT, ".env.local"), "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* rely on system env */
  }
}

function initAdmin() {
  const raw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
  if (!raw) {
    console.error(
      "FIREBASE_ADMIN_SERVICE_ACCOUNT is not set (checked .env.local and the environment).",
    );
    process.exit(1);
  }
  const json = raw.trim().startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8");
  const parsed = JSON.parse(json);
  if (!getApps().length) {
    initializeApp({ credential: cert(parsed) });
  }
  return getFirestore();
}

/**
 * The stored shape of a confirmed-but-unemailed registration. Mirrors what
 * /api/registrations/order writes, minus `emailSentAt` — whose absence is the
 * whole point.
 */
function docFor(sample) {
  const createdAt = Timestamp.fromMillis(
    Date.now() - sample.hoursAgo * 60 * 60 * 1000,
  );
  return {
    firstName: sample.firstName,
    lastName: sample.lastName,
    email: sample.email,
    phone: sample.phone,
    location: sample.location,
    institution: sample.institution,
    institutionType: sample.institutionType,
    eventCategory: sample.eventCategory,
    // No real event doc is referenced: these are display-only rows and must
    // never touch a live event's registrationCount.
    eventId: "",
    eventTitle: sample.eventTitle,
    locationId: "",
    locationVenue: sample.locationVenue,
    locationDate: sample.locationDate,
    ageCategory: sample.ageCategory,
    amountPaid: sample.amountPaid,
    registrationCode: sample.registrationCode,
    paymentStatus: "paid",
    status: "confirmed",
    createdAt,
    paidAt: createdAt,
    checkedIn: false,
    // emailSentAt deliberately ABSENT — this is what the page looks for.
    [SAMPLE_FLAG]: true,
  };
}

async function main() {
  await loadEnv();

  if (DRY_RUN) {
    console.log(`Would write ${SAMPLES.length} sample registrations:\n`);
    for (const s of SAMPLES) {
      console.log(
        `  ${s.registrationCode}  ${s.firstName} ${s.lastName}  <${s.email}>`,
      );
      console.log(
        `      ${s.eventTitle} · ${s.locationVenue} · ${s.locationDate}\n`,
      );
    }
    console.log("No writes performed (--dry-run).");
    return;
  }

  const db = initAdmin();
  const collection = db.collection("registrations");

  if (CLEAN) {
    // Delete by the flag, not by id, so any stray sample is caught too.
    const snapshot = await collection.where(SAMPLE_FLAG, "==", true).get();
    if (snapshot.empty) {
      console.log("No sample registrations found — nothing to clean.");
      return;
    }
    const batch = db.batch();
    for (const document of snapshot.docs) batch.delete(document.ref);
    await batch.commit();
    console.log(`Deleted ${snapshot.size} sample registration(s).`);
    return;
  }

  const batch = db.batch();
  for (const sample of SAMPLES) {
    batch.set(collection.doc(sample.id), docFor(sample));
  }
  await batch.commit();

  console.log(`Wrote ${SAMPLES.length} sample registrations.`);
  console.log("Open /admin/pending-emails to see them.");
  console.log(
    "\nRemove them with:  node scripts/seed-pending-emails.mjs --clean",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
