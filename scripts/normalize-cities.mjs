#!/usr/bin/env node

/**
 * normalize-cities.mjs
 *
 * One-time cleanup: collapse locality-level `city` values into their real city
 * so the register-page city dropdown lists actual cities, not neighbourhoods.
 *
 *   Ponneri     → Chennai
 *   Thoraipakkam → Chennai
 *
 * The original locality is preserved in the location's `address` (which for
 * most rows already reads "…, Ponneri"). When a row's address is empty or
 * doesn't mention the locality, the locality is appended so the specific place
 * isn't lost when the city is overwritten.
 *
 * Idempotent: a location already on a canonical city (Chennai/Coimbatore) with
 * nothing to fix is skipped. Safe to re-run.
 *
 * Writes to `events` are admin-only per firestore.rules, so this signs in with
 * the Firebase *client* SDK using admin credentials (same as seed-events.mjs).
 *
 * Usage:
 *   node scripts/normalize-cities.mjs            # applies changes
 *   node scripts/normalize-cities.mjs --dry-run  # preview only, writes nothing
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
const PROJECT_ROOT = join(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");

// Locality (lowercased) → the real city it belongs to.
const CITY_MAP = {
  ponneri: "Chennai",
  thoraipakkam: "Chennai",
};

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
 * Normalize one location. Returns { next, changed }. If the location's city is
 * a known locality, remap it to the real city and make sure the locality still
 * appears in the address.
 */
function normalizeLocation(loc) {
  if (!loc || typeof loc !== "object") return { next: loc, changed: false };
  const city = typeof loc.city === "string" ? loc.city.trim() : "";
  const mapped = CITY_MAP[city.toLowerCase()];
  if (!mapped) return { next: loc, changed: false };

  const out = { ...loc, city: mapped };

  // Preserve the original locality name in the address if it's not there yet.
  const address = typeof loc.address === "string" ? loc.address.trim() : "";
  const hasLocality = address.toLowerCase().includes(city.toLowerCase());
  if (!hasLocality) {
    out.address = address ? `${address}, ${city}` : city;
  }
  return { next: out, changed: true };
}

async function main() {
  await loadEnv();

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!DRY_RUN && (!email || !password)) {
    console.error(
      "\n✗ Missing admin credentials.\n" +
        "  Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local and re-run.\n",
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
  let updated = 0;

  for (const d of snap.docs) {
    scanned += 1;
    const data = d.data();
    const locations = data.locations;
    if (!Array.isArray(locations) || locations.length === 0) continue;

    let docChanged = false;
    const next = locations.map((loc) => {
      const { next: nl, changed } = normalizeLocation(loc);
      if (changed) docChanged = true;
      return nl;
    });
    if (!docChanged) continue;

    updated += 1;
    const preview = next
      .map((l) => `${l.city}${l.address ? ` / ${l.address}` : ""}`)
      .join("  |  ");
    console.log(`  ${d.id} — ${data.title ?? ""} → ${preview}`);

    if (!DRY_RUN) {
      await updateDoc(doc(db, "events", d.id), { locations: next });
    }
  }

  console.log(
    `\n${DRY_RUN ? "(dry run) " : ""}Scanned ${scanned} events, ` +
      `${updated} had localities remapped${DRY_RUN ? " (nothing written)" : " and were updated"}.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Normalization failed:", err);
  process.exit(1);
});
