#!/usr/bin/env node

/**
 * seed-events.mjs
 *
 * Populates the Firestore `eventCategories` and `events` collections with the
 * Youth United Festival 2026 schedule (see the Event Schedule source doc).
 *
 * Writes to `events` are admin-only per `firestore.rules` (request.auth != null),
 * so this signs in with the admin email/password using the Firebase *client*
 * SDK (same config the app uses) before writing.
 *
 * Doc IDs are deterministic slugs, and writes use { merge: true }, so the
 * script is idempotent — re-running updates the same docs instead of creating
 * duplicates, and never clobbers `registrationCount`.
 *
 * Usage:
 *   1. Ensure `.env.local` has the NEXT_PUBLIC_FIREBASE_* config (it does).
 *   2. Provide admin credentials (kept out of source) via env, e.g.:
 *        SEED_ADMIN_EMAIL=admin@example.com \
 *        SEED_ADMIN_PASSWORD='********' \
 *        node scripts/seed-events.mjs
 *      Options:  --dry-run   Print what would be written, no Firestore calls.
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
  setDoc,
  writeBatch,
  deleteField,
} from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");
// --replace deletes ALL existing events before writing (clean slate). Without
// it, the script only merges/adds. Categories are always upserted, never wiped.
const REPLACE = process.argv.includes("--replace");

// ── Load .env.local (same loader as the cloudinary script) ──
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

// ── Event handbook content (About / Guidelines / Rules) ──
// Parsed from the markdown handbooks so they stay the single source of truth.
const CONTENT_FILES = [
  "contents/YUF_Sports_Events_Content.md",
  "contents/YUF_Athletic_Events_Content.md",
  "contents/YUF_Arts_and_Cultural_Events_Content.md",
  "contents/YUF_Technical_events_content.md",
  "contents/YUF_Fun_Events_Content.md",
];

/**
 * Normalize a title to a match key so slightly different spellings of the same
 * event align (e.g. "Badminton (Doubles)" ↔ "Badminton Doubles", "4×100 Metres
 * Relay (Senior Category)" ↔ "4×100m Relay (Senior)"). Keeps meaningful words
 * like "singles"/"doubles" but drops noise like "senior", "category", the unit
 * word "metres/meters/m", and punctuation.
 */
function contentKey(title) {
  return title
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/[()]/g, " ")
    .replace(/\bsenior\b/g, " ")
    .replace(/\bcategory\b/g, " ")
    .replace(/\bmetres\b|\bmeters\b/g, " ")
    .replace(/(\d)m\b/g, "$1") // the unit "m" glued to digits (e.g. "100m")
    .replace(/\bm\b/g, " ") // the unit "m" standalone
    .replace(/[^a-z0-9]+/g, "");
}

/**
 * Parse one handbook markdown file into a map of contentKey → { about,
 * guidelines[], rules[] }. Event sections start at "## <Title>" (an optional
 * "N. " prefix is stripped); within a section, "### About the Event",
 * "### General Guidelines" and "### Rules & Regulations" delimit the parts.
 */
function parseHandbook(md) {
  const out = new Map();
  // Split into event blocks on "## " headings (but not the "# " doc title).
  const blocks = md.split(/^##\s+/m).slice(1);
  for (const block of blocks) {
    const lines = block.split("\n");
    const rawTitle = lines[0].trim().replace(/^\d+\.\s*/, ""); // strip "4. "
    const key = contentKey(rawTitle);
    if (!key) continue;

    let section = null;
    const about = [];
    const guidelines = [];
    const rules = [];
    for (const line of lines.slice(1)) {
      const h = line.match(/^###\s+(.*)/);
      if (h) {
        const name = h[1].toLowerCase();
        section = name.includes("about")
          ? "about"
          : name.includes("guideline")
            ? "guidelines"
            : name.includes("rule")
              ? "rules"
              : null;
        continue;
      }
      const trimmed = line.trim();
      if (!trimmed || trimmed === "---") continue;
      if (section === "about") {
        about.push(trimmed);
      } else if (section === "guidelines" && trimmed.startsWith("-")) {
        guidelines.push(trimmed.replace(/^-\s*/, ""));
      } else if (section === "rules" && trimmed.startsWith("-")) {
        rules.push(trimmed.replace(/^-\s*/, ""));
      }
    }
    out.set(key, {
      about: about.join(" ").trim(),
      guidelines,
      rules,
    });
  }
  return out;
}

/** Load + merge all handbooks into one contentKey → content map. */
async function loadEventContent() {
  const merged = new Map();
  for (const rel of CONTENT_FILES) {
    try {
      const md = await readFile(join(PROJECT_ROOT, rel), "utf-8");
      for (const [k, v] of parseHandbook(md)) merged.set(k, v);
    } catch (e) {
      console.warn(`• Could not read ${rel}: ${e.message}`);
    }
  }
  return merged;
}

// Flat registration fee applied to every event (₹).
const REGISTRATION_FEE = 200;

// ── Categories (drive the filter tabs on /events) ──
const CATEGORIES = [
  { name: "Sports & Games", order: 0 },
  { name: "Athletics", order: 1 },
  { name: "Arts & Culturals", order: 2 },
  { name: "Technical", order: 3 },
  { name: "Fun Events", order: 4 },
];

// ── Schedule (category, title, venue, date) ──
const SCHEDULE = [
  // I. Sports
  ["Sports & Games", "Cricket", "Chennai", "11th – 13th Sept 2026"],
  ["Sports & Games", "Throwball", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Volleyball", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Kabaddi", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Kabaddi", "Velammal Bodhi Campus, Coimbatore", "7th Sept 2026"],
  ["Sports & Games", "Badminton Doubles", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Badminton Singles", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Chess", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Shot Put (Senior)", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  ["Sports & Games", "Long Jump (Senior)", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  ["Sports & Games", "High Jump (Senior)", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  ["Sports & Games", "Yoga", "Dhanraj Baid Jain College, Thoraipakkam", "10th Sept 2026"],
  ["Sports & Games", "Silambam", "Velammal Bodhi Campus, Coimbatore", "8th Sept 2026"],
  ["Sports & Games", "Silambam", "Dhanraj Baid Jain College, Thoraipakkam", "11th Sept 2026"],
  ["Sports & Games", "Swimming", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  ["Sports & Games", "Table Tennis Singles", "Velammal Bodhi Campus, Ponneri", "2nd Sept 2026"],
  ["Sports & Games", "Kho-Kho", "Chennai", ""],
  // II. Athletics
  ["Athletics", "100 Metres", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  ["Athletics", "200 Metres", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  ["Athletics", "4×100m Relay (Senior)", "Velammal Bodhi Campus, Ponneri", "7th Sept 2026"],
  // III. Arts & Cultural
  ["Arts & Culturals", "Battle of Bands", "Velammal Bodhi Campus, Ponneri", "10th Sept 2026"],
  ["Arts & Culturals", "Solo Singing", "Velammal Bodhi Campus, Ponneri", "10th Sept 2026"],
  ["Arts & Culturals", "Acoustics / Instrumental", "Velammal Bodhi Campus, Ponneri", "10th Sept 2026"],
  ["Arts & Culturals", "Solo Dance", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  ["Arts & Culturals", "Group Dance", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  ["Arts & Culturals", "Poetry", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  ["Arts & Culturals", "Face Painting", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  ["Arts & Culturals", "Pencil Sketching", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  ["Arts & Culturals", "Painting", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  ["Arts & Culturals", "Youth Talent Icon", "Velammal Bodhi Campus, Ponneri", "9th Sept 2026"],
  // IV. Technical
  ["Technical", "Quiz", "Velammal Bodhi Campus, Ponneri", "15th Sept 2026"],
  ["Technical", "Debate", "Velammal Bodhi Campus, Ponneri", "11th Sept 2026"],
  ["Technical", "Indian Youth Parliament", "Velammal Bodhi Campus, Ponneri", "11th Sept 2026"],
  ["Technical", "India's Young Scientist", "Velammal Bodhi Campus, Ponneri", "11th Sept 2026"],
  // V. Fun
  ["Fun Events", "Treasure Hunt", "Velammal Bodhi Campus, Ponneri", "15th Sept 2026"],
  ["Fun Events", "Guess the Song", "Velammal Bodhi Campus, Ponneri", "15th Sept 2026"],
];

// Event artwork sourced from Unsplash (free to use). Cropped to a wide card
// ratio with the same query params so every image loads at a consistent size.
// `IMG(id)` builds the delivery URL; per-title matches fall back to per-category.
const IMG = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;

// Per-title images (most specific).
const TITLE_IMAGES = {
  // Sports & Games
  "Cricket": IMG("1531415074968-036ba1b575da"),
  "Throwball": IMG("1612872087720-bb876e2e67d1"),
  "Volleyball": IMG("1592656094267-764a45160876"),
  "Kabaddi": IMG("1517649763962-0c623066013b"),
  "Badminton Doubles": IMG("1626224583764-f87db24ac4ea"),
  "Badminton Singles": IMG("1519861531473-9200262188bf"),
  "Chess": IMG("1528819622765-d6bcf132f793"),
  "Shot Put (Senior)": IMG("1552674605-db6ffd4facb5"),
  "Long Jump (Senior)": IMG("1461896836934-ffe607ba8211"),
  "High Jump (Senior)": IMG("1574629810360-7efbbe195018"),
  "Yoga": IMG("1544367567-0f2fcb009e0b"),
  "Silambam": IMG("1555597673-b21d5c935865"),
  "Swimming": IMG("1530549387789-4c1017266635"),
  "Table Tennis Singles": IMG("1534158914592-062992fbe900"),
  "Kho-Kho": IMG("1571902943202-507ec2618e8f"),
  // Athletics
  "100 Metres": IMG("1571019613454-1cb2f99b2d8b"),
  "200 Metres": IMG("1546519638-68e109498ffc"),
  "4×100m Relay (Senior)": IMG("1627627256672-027a4613d028"),
  // Arts & Culturals
  "Battle of Bands": IMG("1501386761578-eac5c94b800a"),
  "Solo Singing": IMG("1516280440614-37939bbacd81"),
  "Acoustics / Instrumental": IMG("1511671782779-c97d3d27a1d4"),
  "Solo Dance": IMG("1508700115892-45ecd05ae2ad"),
  "Group Dance": IMG("1504609773096-104ff2c73ba4"),
  "Poetry": IMG("1455390582262-044cdead277a"),
  "Face Painting": IMG("1596464716127-f2a82984de30"),
  "Pencil Sketching": IMG("1607962837359-5e7e89f86776"),
  "Painting": IMG("1513364776144-60967b0f800f"),
  "Youth Talent Icon": IMG("1516450360452-9312f5e86fc7"),
  // Technical
  "Quiz": IMG("1503676260728-1c00da094a0b"),
  "Debate": IMG("1475721027785-f74eccf877e2"),
  "Indian Youth Parliament": IMG("1529107386315-e1a2ed48a620"),
  "India's Young Scientist": IMG("1532094349884-543bc11b234d"),
  // Fun Events
  "Treasure Hunt": IMG("1533174072545-7a4b6ad7a6c3"),
  "Guess the Song": IMG("1470225620780-dba8ba36b745"),
};

// Per-category fallback (used when a title has no explicit image).
const CATEGORY_IMAGES = {
  "Sports & Games": IMG("1461896836934-ffe607ba8211"),
  "Athletics": IMG("1552674605-db6ffd4facb5"),
  "Arts & Culturals": IMG("1508700115892-45ecd05ae2ad"),
  "Technical": IMG("1503676260728-1c00da094a0b"),
  "Fun Events": IMG("1533174072545-7a4b6ad7a6c3"),
};

function eventImage(category, title) {
  return TITLE_IMAGES[title] ?? CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES["Sports & Games"];
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[×]/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function describe(category, title) {
  switch (category) {
    case "Arts & Culturals":
      return `Take the stage for ${title} and showcase your talent at Youth United Festival 2026.`;
    case "Technical":
      return `Put your knowledge to the test in ${title} at Youth United Festival 2026.`;
    case "Fun Events":
      return `Join the fun with ${title} at Youth United Festival 2026.`;
    default:
      return `Compete in ${title} at Youth United Festival 2026.`;
  }
}

/** The city is the last comma-separated part of the address (e.g. "Ponneri"). */
function cityOf(address) {
  if (!address) return "";
  const parts = address.split(",");
  return parts.length > 1 ? parts[parts.length - 1].trim() : "";
}

/** A stable location id from its city/address/date (mirrors the admin form). */
function locationId(city, address, date, fallbackIndex) {
  const base = [city, address, date]
    .filter(Boolean)
    .join("-");
  return slugify(base) || `loc-${fallbackIndex + 1}`;
}

/**
 * Build event docs, collapsing same-name (title + category) rows into ONE
 * document with a `locations[]` array. This is the new multi-location model:
 * shared title/description/image/fee, per-location venue/date/limit. IDs are
 * deterministic slugs of the title (first occurrence wins the slug).
 */
function buildEvents(content) {
  const byKey = new Map();
  const order = new Map(); // event id → its display order (first-seen index)

  SCHEDULE.forEach(([category, title, address, date], i) => {
    const key = `${slugify(title)}::${slugify(category)}`;
    const city = cityOf(address);

    if (!byKey.has(key)) {
      const id = slugify(title);
      order.set(id, i);

      // Attach handbook content by matching the title. About → details;
      // General Guidelines + Rules & Regulations → the combined rules list.
      const c = content.get(contentKey(title));
      const data = {
        title,
        category,
        description: c?.about || describe(category, title),
        image: eventImage(category, title),
        registrationFee: REGISTRATION_FEE,
        isActive: true,
        registrationOpen: true,
        status: "upcoming",
        order: i,
        locations: [],
      };
      if (c?.about) data.details = [c.about];
      if (c?.guidelines?.length) data.guidelines = c.guidelines;
      if (c?.rules?.length) data.rules = c.rules;
      byKey.set(key, { id, data, matched: !!c });
    }

    const entry = byKey.get(key);
    const locId = locationId(city, address, date, entry.data.locations.length);
    const location = { id: locId, registrationCount: 0 };
    if (city) location.city = city;
    if (address) location.address = address;
    if (date) location.date = date;
    entry.data.locations.push(location);
  });

  return [...byKey.values()];
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
        "      node scripts/seed-events.mjs\n",
    );
    process.exit(1);
  }

  const content = await loadEventContent();
  const events = buildEvents(content);
  const matched = events.filter((e) => e.matched).length;
  console.log(
    `Prepared ${CATEGORIES.length} categories and ${events.length} events ` +
      `(${matched}/${events.length} matched handbook content).`,
  );

  if (DRY_RUN) {
    for (const { id, data, matched: m } of events) {
      const locs = data.locations
        .map((l) => `${l.city || l.address || "?"}${l.date ? ` (${l.date})` : ""}`)
        .join(", ");
      const tag = m
        ? `content ✓ (${data.rules?.length ?? 0} rules)`
        : "NO CONTENT ✗";
      console.log(
        `  [${data.category}] ${id} — ${data.title} → ${data.locations.length} loc: ${locs} — ${tag}`,
      );
    }
    console.log("\n(dry run — nothing written)");
    return;
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

  console.log(`Signing in as ${email}…`);
  await signInWithEmailAndPassword(auth, email, password);
  console.log("✓ Authenticated.");

  // Preserve images already uploaded via the admin (Cloudinary URLs) so a
  // re-seed doesn't overwrite them with the script's Unsplash placeholders.
  // Read existing events first and index their images by doc id.
  const existingSnap = await getDocs(collection(db, "events"));
  const existingImages = new Map();
  existingSnap.forEach((d) => {
    const img = d.data().image;
    if (img) existingImages.set(d.id, img);
  });
  // Apply a kept image to each event when one exists for its id.
  let kept = 0;
  for (const ev of events) {
    const keptImg = existingImages.get(ev.id);
    if (keptImg) {
      ev.data.image = keptImg;
      kept += 1;
    }
  }
  if (kept > 0) console.log(`• Kept ${kept} existing image(s).`);

  // Optional clean slate: delete every existing event first.
  if (REPLACE) {
    if (existingSnap.size > 0) {
      const del = writeBatch(db);
      existingSnap.forEach((d) => del.delete(d.ref));
      await del.commit();
      console.log(`✓ Deleted ${existingSnap.size} existing event(s).`);
    } else {
      console.log("• No existing events to delete.");
    }
  }

  // Categories
  for (const c of CATEGORIES) {
    await setDoc(
      doc(db, "eventCategories", slugify(c.name)),
      { name: c.name, order: c.order },
      { merge: true },
    );
  }
  console.log(`✓ Wrote ${CATEGORIES.length} categories.`);

  // Events — batched, merge so top-level registrationCount is never clobbered.
  // Clear the legacy flat venue/date/district/registrationLimit fields so the
  // `locations` array is the single source of truth (merge alone would leave
  // stale flat fields behind on events that predate the multi-location model).
  const batch = writeBatch(db);
  for (const { id, data } of events) {
    batch.set(
      doc(db, "events", id),
      {
        ...data,
        venue: deleteField(),
        date: deleteField(),
        district: deleteField(),
        registrationLimit: deleteField(),
      },
      { merge: true },
    );
  }
  await batch.commit();
  console.log(`✓ Wrote ${events.length} events.`);

  console.log("\nDone. Refresh /events to see them.");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err?.code || "", err?.message || err);
  process.exit(1);
});
