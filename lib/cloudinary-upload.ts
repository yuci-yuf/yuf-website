/**
 * Browser-side unsigned upload to Cloudinary.
 *
 * Uses an *unsigned* upload preset so no API secret is exposed to the client.
 * Configure two public env vars in `.env.local`:
 *
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=yuf-web
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<your unsigned preset name>
 *
 * Create the unsigned preset in the Cloudinary dashboard:
 *   Settings → Upload → Upload presets → Add → Signing Mode: Unsigned.
 *
 * If either var is missing, `isCloudinaryConfigured()` returns false and the
 * UI falls back to letting the admin paste an image URL directly.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

export interface UploadResult {
  url: string;
  width: number;
  height: number;
}

/**
 * Upload a single file to Cloudinary and return its secure URL + dimensions.
 * Throws if Cloudinary is not configured or the upload fails.
 */
export async function uploadToCloudinary(
  file: File,
  folder = "yuf-website/uploads",
): Promise<UploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form },
  );

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error?.message ? `: ${body.error.message}` : "";
    } catch {
      /* ignore parse errors */
    }
    throw new Error(`Cloudinary upload failed (${res.status})${detail}`);
  }

  const data = await res.json();
  return {
    url: data.secure_url as string,
    width: data.width as number,
    height: data.height as number,
  };
}
