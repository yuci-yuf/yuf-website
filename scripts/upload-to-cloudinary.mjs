#!/usr/bin/env node

/**
 * upload-to-cloudinary.mjs
 *
 * Recursively uploads all images from the `assets/` directory to Cloudinary,
 * preserving the folder structure under a configurable root folder.
 *
 * Outputs a JSON manifest (`scripts/cloudinary-manifest.json`) mapping
 * each local file path to its Cloudinary secure URL — used later for
 * seeding Firestore with the correct image URLs.
 *
 * Usage:
 *   1. Create a `.env.local` file in the project root with:
 *        CLOUDINARY_CLOUD_NAME=your_cloud_name
 *        CLOUDINARY_API_KEY=your_api_key
 *        CLOUDINARY_API_SECRET=your_api_secret
 *
 *   2. Run the script:
 *        node scripts/upload-to-cloudinary.mjs
 *
 *   Options:
 *     --dry-run    Preview what would be uploaded without actually uploading.
 *     --folder     Cloudinary root folder (default: "yuf-website").
 */

import { v2 as cloudinary } from "cloudinary";
import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import { join, relative, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ── Resolve project paths ──
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");
const ASSETS_DIR = join(PROJECT_ROOT, "assets");
const MANIFEST_PATH = join(__dirname, "cloudinary-manifest.json");

// ── Supported image extensions ──
const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".svg",
  ".ico",
]);

// ── Parse CLI args ──
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const folderArgIndex = args.indexOf("--folder");
const CLOUD_FOLDER =
  folderArgIndex !== -1 ? args[folderArgIndex + 1] : "yuf-website";

// ── Load .env.local ──
async function loadEnv() {
  try {
    const envPath = join(PROJECT_ROOT, ".env.local");
    const envContent = await readFile(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local not found — rely on system env vars
  }
}

// ── Recursively collect all image files ──
async function collectImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectImages(fullPath)));
    } else if (IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

// ── Sanitize folder/file names for Cloudinary public_id ──
function sanitize(str) {
  return str
    .replace(/\s+/g, "_")       // spaces → underscores
    .replace(/[()]/g, "")       // remove parentheses
    .replace(/[^a-zA-Z0-9_\-/.]/g, "_"); // other special chars → underscore
}

// ── Upload a single file ──
async function uploadFile(filePath) {
  const relativePath = relative(ASSETS_DIR, filePath);
  const folder = dirname(relativePath);
  const name = basename(relativePath, extname(relativePath));

  const cloudFolder =
    folder === "."
      ? CLOUD_FOLDER
      : `${CLOUD_FOLDER}/${sanitize(folder)}`;

  const publicId = `${cloudFolder}/${sanitize(name)}`;

  if (DRY_RUN) {
    return {
      localPath: relativePath,
      publicId,
      url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`,
      skipped: false,
      dryRun: true,
    };
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      overwrite: false,       // Don't re-upload if already exists
      resource_type: "image",
      use_filename: true,
      unique_filename: false,
    });

    return {
      localPath: relativePath,
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      skipped: false,
    };
  } catch (err) {
    // If the image already exists and overwrite is false, Cloudinary still
    // returns a result in most cases. Handle actual errors here.
    return {
      localPath: relativePath,
      publicId,
      url: null,
      error: err.message,
      skipped: true,
    };
  }
}

// ── Main ──
async function main() {
  await loadEnv();

  // Validate env vars
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error(
      "\n❌ Missing Cloudinary credentials.\n" +
        "   Add these to your .env.local file:\n\n" +
        "   CLOUDINARY_CLOUD_NAME=your_cloud_name\n" +
        "   CLOUDINARY_API_KEY=your_api_key\n" +
        "   CLOUDINARY_API_SECRET=your_api_secret\n"
    );
    process.exit(1);
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  console.log(`\n☁️  Cloudinary Upload Script`);
  console.log(`   Cloud: ${CLOUDINARY_CLOUD_NAME}`);
  console.log(`   Folder: ${CLOUD_FOLDER}/`);
  console.log(`   Source: assets/`);
  if (DRY_RUN) console.log(`   ⚠️  DRY RUN — no files will be uploaded.\n`);
  else console.log("");

  // Collect all images
  const images = await collectImages(ASSETS_DIR);
  console.log(`📁 Found ${images.length} images to upload.\n`);

  if (images.length === 0) {
    console.log("   No images found. Exiting.");
    return;
  }

  // Upload with concurrency limit
  const CONCURRENCY = 5;
  const results = [];
  let completed = 0;

  for (let i = 0; i < images.length; i += CONCURRENCY) {
    const batch = images.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(uploadFile));
    results.push(...batchResults);
    completed += batch.length;

    for (const r of batchResults) {
      const status = r.dryRun
        ? "🔍"
        : r.skipped
          ? "⚠️ "
          : "✅";
      const detail = r.error || r.url || "(dry run)";
      console.log(
        `   ${status} [${completed}/${images.length}] ${r.localPath}`
      );
      if (r.error) console.log(`      └─ Error: ${r.error}`);
    }
  }

  // Build manifest
  const manifest = {};
  for (const r of results) {
    manifest[r.localPath.replace(/\\/g, "/")] = {
      publicId: r.publicId,
      url: r.url,
      width: r.width || null,
      height: r.height || null,
      format: r.format || null,
    };
  }

  // Write manifest
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");

  // Summary
  const uploaded = results.filter((r) => !r.skipped && !r.dryRun).length;
  const skipped = results.filter((r) => r.skipped).length;
  const errors = results.filter((r) => r.error).length;

  console.log(`\n─────────────────────────────────`);
  console.log(`📊 Summary`);
  console.log(`   Total:    ${results.length}`);
  if (DRY_RUN) {
    console.log(`   Previewed: ${results.length} (dry run)`);
  } else {
    console.log(`   Uploaded: ${uploaded}`);
    console.log(`   Skipped:  ${skipped}`);
    if (errors > 0) console.log(`   Errors:   ${errors}`);
  }
  console.log(`\n📄 Manifest saved to: scripts/cloudinary-manifest.json`);
  console.log(
    `   Use this manifest to seed Firestore with correct image URLs.\n`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
