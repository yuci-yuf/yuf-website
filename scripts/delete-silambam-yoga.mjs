#!/usr/bin/env node

/**
 * delete-silambam-yoga.mjs
 *
 * Permanently removes the `silambam` and `yoga` documents from the Firestore
 * `events` collection.
 *
 * Usage:
 *   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD='****' node scripts/delete-silambam-yoga.mjs
 *
 * Options:
 *   --dry-run   Preview which documents would be deleted without deleting.
 */

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");

const EVENT_IDS_TO_REMOVE = ["silambam", "yoga"];

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
    if (!email || !password) {
      console.error(
        "\n✗ Missing SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in environment or .env.local.\n" +
          "  Firestore write rules require an authenticated admin to delete documents.\n" +
          "  Run with:\n" +
          "    SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD='****' node scripts/delete-silambam-yoga.mjs\n",
      );
      process.exit(1);
    }
    console.log(`Authenticating as admin (${email})...`);
    await signInWithEmailAndPassword(auth, email, password);
    console.log("✓ Authenticated.\n");
  } else {
    console.log("DRY RUN mode: no deletes will be executed.\n");
  }

  for (const id of EVENT_IDS_TO_REMOVE) {
    try {
      const snap = await getDoc(doc(db, "events", id));
      if (!snap.exists()) {
        console.log(`- Event "${id}" does not exist in Firestore.`);
        continue;
      }
      const data = snap.data();
      console.log(`Found event "${id}" (${data.title})`);
      if (DRY_RUN) {
        console.log(`  [DRY-RUN] Would delete document "events/${id}"`);
      } else {
        await deleteDoc(doc(db, "events", id));
        console.log(`  ✓ Successfully deleted document "events/${id}" from Firestore`);
      }
    } catch (err) {
      console.error(`  ✗ Failed to process "${id}":`, err.message);
    }
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
