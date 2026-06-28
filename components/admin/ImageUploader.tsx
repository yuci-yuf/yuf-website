"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
} from "@/lib/cloudinary-upload";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

/**
 * Image input for the admin CMS. When Cloudinary is configured (via the
 * NEXT_PUBLIC_CLOUDINARY_* env vars) it lets the admin pick a file and uploads
 * it directly from the browser; otherwise it falls back to pasting a URL. Both
 * paths produce a single string URL surfaced via `onChange`.
 */
export function ImageUploader({
  value,
  onChange,
  folder,
  className,
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isCloudinaryConfigured();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, folder);
      onChange(result.url);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {value ? (
        <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border bg-surface-alt">
          {/* Next/Image needs known hosts; use a plain img to tolerate any URL
              the admin pastes during editing. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        configured && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-alt text-text-muted transition-colors hover:border-primary-300 hover:text-primary-700 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span className="text-sm">Uploading…</span>
              </>
            ) : (
              <>
                <ImagePlus size={24} />
                <span className="text-sm font-medium">Click to upload an image</span>
              </>
            )}
          </button>
        )
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* URL field — primary input when Cloudinary isn't configured, and a
          handy override otherwise. */}
      <Input
        type="url"
        placeholder={
          configured ? "…or paste an image URL" : "Paste an image URL"
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {!configured && (
        <p className="text-xs text-text-muted">
          Tip: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and
          NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to enable direct file uploads.
        </p>
      )}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
