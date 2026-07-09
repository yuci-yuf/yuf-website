#!/usr/bin/env node

/**
 * update-event-fees.mjs
 *
 * One-time update of the already-populated `events` with the per-event
 * registration fees from the official Event Schedule (they were all seeded at a
 * flat ₹200). Also fills Kho-Kho's missing date.
 *
 * Idempotent: only writes fields that actually differ, so re-running is a no-op.
 * Matches events by their deterministic doc id (slug of the title).
 *
 * Usage:
 *   node scripts/update-event-fees.mjs            # apply
 *   node scripts/update-event-fees.mjs --dry-run  # preview only, writes nothing
 * Credentials come from .env.local (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD).
 */

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");

// Per-event registration fee (₹) keyed by event doc id (slug of the title).
// Source: Youth United Festival Event Schedule with Fee.
// Kho-Kho intentionally omitted — the schedule lists no amount for it.
const FEES = {
  // Sports & Games
  cricket: 1000,
  throwball: 700,
  volleyball: 700,
  kabaddi: 700,
  "badminton-doubles": 500,
  "badminton-singles": 400,
  chess: 500,
  "shot-put-senior": 300,
  "long-jump-senior": 300,
  "high-jump-senior": 300,
  yoga: 250,
  silambam: 350,
  swimming: 500,
  "table-tennis-singles": 400,
  // Athletics
  "100-metres": 350,
  "200-metres": 400,
  "4x100m-relay-senior": 700,
  // Arts & Culturals
  "battle-of-bands": 1000,
  "solo-singing": 300,
  "acoustics-instrumental": 350,
  "solo-dance": 300,
  "group-dance": 800,
  poetry: 200,
  "face-painting": 300,
  "pencil-sketching": 300,
  painting: 300,
  "youth-talent-icon": 400,
  // Technical
  quiz: 300,
  debate: 300,
  "indian-youth-parliament": 350,
  "indias-young-scientist": 350,
  // Fun Events
  "treasure-hunt": 250,
  "guess-the-song": 250,
};

// Events whose schedule details changed beyond the fee. Kho-Kho now has a date.
const KHO_KHO_DATE = "15th Sept 2026";

async function loadEnv() {
  try {
    const envContent = await readFile(join(ROOT, ".env.local"), "utf-8");
    for (const line of envContent.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      if (!process.env[key]) process.env[key] = t.slice(eq + 1).trim();
    }
  } catch {
    /* rely on system env */
  }
}

async function main() {
  await loadEnv();

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!DRY_RUN && (!email || !password)) {
    console.error("\n✗ Missing SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env.local.\n");
    process.exit(1);
  }

  const app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
  const auth = getAuth(app);
  const db = getFirestore(app);

  if (!DRY_RUN) {
    console.log(`Signing in as ${email}…`);
    await signInWithEmailAndPassword(auth, email, password);
    console.log("✓ Authenticated.\n");
  }

  const snap = await getDocs(collection(db, "events"));
  let feeChanges = 0;
  let otherChanges = 0;
  const unmatched = [];

  for (const d of snap.docs) {
    const data = d.data();
    const update = {};

    // ── Fee ──
    const newFee = FEES[d.id];
    if (typeof newFee === "number" && data.registrationFee !== newFee) {
      update.registrationFee = newFee;
    }

    // ── Kho-Kho: add its date (and tidy the city casing) ──
    if (d.id === "kho-kho" && Array.isArray(data.locations)) {
      const nextLocs = data.locations.map((l) => ({
        ...l,
        city: l.city ? "Chennai" : l.city,
        date: l.date && l.date.trim() ? l.date : KHO_KHO_DATE,
      }));
      const changed =
        JSON.stringify(nextLocs) !== JSON.stringify(data.locations);
      if (changed) update.locations = nextLocs;
    }

    if (FEES[d.id] === undefined && d.id !== "kho-kho") unmatched.push(d.id);

    if (Object.keys(update).length === 0) continue;

    const parts = [];
    if ("registrationFee" in update)
      parts.push(`fee ${data.registrationFee} → ${update.registrationFee}`);
    if ("locations" in update) parts.push(`date → ${KHO_KHO_DATE}`);
    if ("registrationFee" in update) feeChanges += 1;
    if ("locations" in update) otherChanges += 1;

    console.log(`  ${d.id.padEnd(24)} ${parts.join(" | ")}`);
    if (!DRY_RUN) await updateDoc(doc(db, "events", d.id), update);
  }

  console.log(
    `\n${DRY_RUN ? "(dry run) " : ""}${feeChanges} fee update(s), ` +
      `${otherChanges} schedule fix(es)${DRY_RUN ? " — nothing written" : " written"}.`,
  );
  if (unmatched.length)
    console.log(`• No fee mapping for (left unchanged): ${unmatched.join(", ")}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\n✗ Update failed:", err?.code || "", err?.message || err);
  process.exit(1);
});
