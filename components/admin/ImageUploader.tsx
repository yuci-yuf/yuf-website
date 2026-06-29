"use client";

import { useRef, useState, useCallback } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import {
  isCloudinaryConfigured,
  uploadToCloudinary,
} from "@/lib/cloudinary-upload";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

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
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isCloudinaryConfigured();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
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

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {value ? (
        <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border bg-surface-alt">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : configured ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          disabled={uploading}
          className={cn(
            "flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-surface-alt text-text-muted transition-colors disabled:opacity-60",
            dragging
              ? "border-primary-500 bg-primary-50 text-primary-700"
              : "border-border hover:border-primary-300 hover:text-primary-700",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span className="text-sm">Uploading…</span>
            </>
          ) : dragging ? (
            <>
              <ImagePlus size={24} />
              <span className="text-sm font-medium">Drop to upload</span>
            </>
          ) : (
            <>
              <ImagePlus size={24} />
              <span className="text-sm font-medium">Click or drag & drop an image</span>
            </>
          )}
        </button>
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <Input
        type="url"
        placeholder={configured ? "…or paste an image URL" : "Paste an image URL"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {!configured && (
        <p className="text-xs text-text-muted">
          Tip: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to enable direct file uploads.
        </p>
      )}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
