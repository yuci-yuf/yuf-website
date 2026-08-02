#!/usr/bin/env node

/**
 * move-refund-note.mjs
 *
 * One-time fix: "Registration fees are non-refundable." was listed under each
 * event's Rules & Regulations. It belongs under General Guidelines, so this
 * moves it — removing it from `rules` and appending it to `guidelines` — and
 * adds it to any event that was missing it entirely (e.g. Silambam).
 *
 * Operates on the live documents rather than re-seeding from the markdown
 * handbooks, so admin edits to other fields (fees, images, locations) survive.
 * Only `guidelines` and `rules` are ever written.
 *
 * Idempotent: only writes events that actually differ, so re-running is a no-op.
 *
 * Usage:
 *   node scripts/move-refund-note.mjs            # apply
 *   node scripts/move-refund-note.mjs --dry-run  # preview only, writes nothing
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

/** The canonical wording appended to every event's guidelines. */
const NOTE = "Registration fees are non-refundable.";

/** Matches the refund bullet in any of its observed phrasings. */
const IS_REFUND_NOTE = /registration\s+fees?\s+are\s+non[-\s]?refundable/i;

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
    console.error(
      "\n✗ Missing SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env.local.\n",
    );
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
  let moved = 0;
  let added = 0;
  let untouched = 0;

  for (const d of snap.docs) {
    const data = d.data();
    const rules = Array.isArray(data.rules) ? data.rules : [];
    const guidelines = Array.isArray(data.guidelines) ? data.guidelines : [];

    const nextRules = rules.filter((r) => !IS_REFUND_NOTE.test(String(r)));
    const wasInRules = nextRules.length !== rules.length;
    const alreadyInGuidelines = guidelines.some((g) =>
      IS_REFUND_NOTE.test(String(g)),
    );
    const nextGuidelines = alreadyInGuidelines
      ? guidelines
      : [...guidelines, NOTE];

    const update = {};
    if (wasInRules) update.rules = nextRules;
    if (!alreadyInGuidelines) update.guidelines = nextGuidelines;

    if (Object.keys(update).length === 0) {
      untouched += 1;
      continue;
    }

    if (wasInRules) moved += 1;
    else if (!alreadyInGuidelines) added += 1;

    const what = wasInRules
      ? "moved rules → guidelines"
      : "added to guidelines (was missing)";
    console.log(`  ${d.id.padEnd(26)} ${what}`);
    if (!DRY_RUN) await updateDoc(doc(db, "events", d.id), update);
  }

  console.log(
    `\n${DRY_RUN ? "(dry run) " : ""}${moved} moved, ${added} added, ` +
      `${untouched} already correct` +
      `${DRY_RUN ? " — nothing written" : " — written"}.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("\n✗ Update failed:", err?.code || "", err?.message || err);
  process.exit(1);
});
