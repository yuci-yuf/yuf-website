#!/usr/bin/env node

/**
 * migrate-location-fields.mjs
 *
 * One-time migration: rename each event location's `district` → `city` and
 * `venue` → `address` inside every `events` doc's `locations` array. The
 * registration form now filters strictly on `location.city`, and the admin
 * form labels the fields "City" / "Address", so existing docs written with the
 * old key names must be converted or they'll read as empty.
 *
 * Also renames the LEGACY flat top-level fields when present:
 *   `district` → keep (still read as the legacy city) — left untouched, since
 *   the app still reads `event.district`/`event.venue` for pre-locations events.
 * Only the per-location array keys are migrated here.
 *
 * Idempotent: a doc already using the new keys is skipped. Safe to re-run.
 *
 * Writes to `events` are admin-only per firestore.rules, so this signs in with
 * the Firebase *client* SDK using admin credentials (same as seed-events.mjs).
 *
 * Usage:
 *   SEED_ADMIN_EMAIL=admin@example.com \
 *   SEED_ADMIN_PASSWORD='********' \
 *   node scripts/migrate-location-fields.mjs
 *
 *   --dry-run   Print what would change, write nothing.
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
const PROJECT_ROOT = join(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");

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

/**
 * Convert a raw locations array to the new key names. Returns the new array and
 * whether anything changed. `district`→`city` and `venue`→`address`; a value
 * already under the new key wins and the old key is dropped.
 */
function migrateLocations(locations) {
  let changed = false;
  const next = locations.map((loc) => {
    if (!loc || typeof loc !== "object") return loc;
    const out = { ...loc };
    if ("district" in out) {
      if (out.city == null && out.district != null) out.city = out.district;
      delete out.district;
      changed = true;
    }
    if ("venue" in out) {
      if (out.address == null && out.venue != null) out.address = out.venue;
      delete out.venue;
      changed = true;
    }
    return out;
  });
  return { next, changed };
}

async function main() {
  await loadEnv();

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!DRY_RUN && (!email || !password)) {
    console.error(
      "\n✗ Missing admin credentials.\n" +
        "  Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD and re-run, e.g.:\n\n" +
        "    SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD='****' \\\n" +
        "      node scripts/migrate-location-fields.mjs\n",
    );
    process.exit(1);
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  if (!DRY_RUN) {
    console.log(`Signing in as ${email}…`);
    await signInWithEmailAndPassword(auth, email, password);
    console.log("✓ Authenticated.\n");
  }

  const snap = await getDocs(collection(db, "events"));
  let scanned = 0;
  let migrated = 0;

  for (const d of snap.docs) {
    scanned += 1;
    const data = d.data();
    const locations = data.locations;
    if (!Array.isArray(locations) || locations.length === 0) continue;

    const { next, changed } = migrateLocations(locations);
    if (!changed) continue;

    migrated += 1;
    const preview = next
      .map((l) => `${l.city || "?"}${l.address ? ` / ${l.address}` : ""}`)
      .join(", ");
    console.log(`  ${d.id} — ${data.title ?? ""} → ${preview}`);

    if (!DRY_RUN) {
      await updateDoc(doc(db, "events", d.id), { locations: next });
    }
  }

  console.log(
    `\n${DRY_RUN ? "(dry run) " : ""}Scanned ${scanned} events, ` +
      `${migrated} needed migration${DRY_RUN ? " (nothing written)" : " and were updated"}.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
