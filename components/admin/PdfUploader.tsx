"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
} from "@/lib/cloudinary-upload";
import { Input } from "@/components/ui/input";

/** Max single upload size for a rule-book PDF. */
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Optional rule-book PDF uploader for the admin event form. Enforces a 10 MB
 * limit and PDF-only files. Reuses the unsigned Cloudinary upload (the image
 * endpoint accepts PDFs and returns a downloadable secure URL). Falls back to a
 * URL input when Cloudinary isn't configured.
 */
export function PdfUploader({
  value,
  onChange,
  folder = "yuf-website/rulebooks",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isCloudinaryConfigured();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Only PDF files are supported.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 10 MB.`,
      );
      return;
    }
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

  // Uploaded state — show the file with a view + remove control.
  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 items-center gap-2 text-sm font-medium text-primary-700 hover:underline"
        >
          <FileText size={18} className="shrink-0 text-error" />
          <span className="truncate">Rule book uploaded — view PDF</span>
        </a>
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Remove rule book"
          className="shrink-0 rounded-full p-1.5 text-text-muted transition-colors hover:bg-surface-alt hover:text-error"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  // No Cloudinary → let the admin paste a link instead.
  if (!configured) {
    return (
      <div className="flex flex-col gap-1.5">
        <Input
          type="url"
          placeholder="Paste rule-book PDF URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <p className="text-xs text-text-muted">
          Cloudinary isn&apos;t configured — paste a link to the PDF instead.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-sm text-text-muted transition-colors hover:border-primary-300 hover:text-primary-700 disabled:opacity-60"
      >
        {uploading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload size={20} />
            Upload rule book (PDF, max 10 MB)
          </>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  );
}
