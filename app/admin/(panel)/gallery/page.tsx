"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ImageIcon, Loader2, Plus, Trash2, X } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/admin/AdminUI";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  getAdminGallery,
  addGalleryImage,
  deleteGalleryImage,
} from "@/lib/admin-data";
import type { GalleryImage } from "@/types";

export default function AdminGalleryPage() {
  const [rows, setRows] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function reload() {
    getAdminGallery()
      .then(setRows)
      .catch((e) => {
        console.error(e);
        setError("Failed to load gallery.");
      });
  }

  useEffect(() => {
    getAdminGallery()
      .then(setRows)
      .catch((e) => {
        console.error(e);
        setError("Failed to load gallery.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(img: GalleryImage) {
    if (!confirm("Remove this image from the gallery?")) return;
    try {
      await deleteGalleryImage(img.id);
      setRows((prev) => prev.filter((r) => r.id !== img.id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete image.");
    }
  }

  const nextOrder = rows.length ? Math.max(...rows.map((r) => r.order)) + 1 : 1;

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Photos shown on the public Gallery page"
        action={
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus size={16} />
            Add Images
          </Button>
        }
      />

      <div className="flex flex-col gap-8 p-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : error ? (
          <EmptyState message={error} />
        ) : rows.length === 0 ? (
          <EmptyState message="No gallery images yet. Click “Add Images” to upload your first photo." />
        ) : (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <ImageIcon size={16} />
              </span>
              <h2 className="font-heading text-lg font-bold text-text">
                Gallery images
              </h2>
              <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs font-semibold text-text-muted">
                {rows.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {rows.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-4/3 overflow-hidden rounded-2xl border border-border bg-surface-alt shadow-card"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {img.alt && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-xs font-medium text-white">
                        {img.alt}
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(img)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity hover:bg-error group-hover:opacity-100"
                    aria-label="Delete image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {adding && (
        <AddImageModal
          nextOrder={nextOrder}
          onClose={() => setAdding(false)}
          onAdded={() => {
            setAdding(false);
            reload();
          }}
        />
      )}
    </>
  );
}

function AddImageModal({
  nextOrder,
  onClose,
  onAdded,
}: {
  nextOrder: number;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock background scroll while the modal is open.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!src.trim()) {
      setError("Upload or paste an image first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addGalleryImage(
        src.trim(),
        alt.trim() || "YUF gallery image",
        nextOrder,
      );
      onAdded();
    } catch (err) {
      console.error(err);
      setError("Failed to add image.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
      <div className="my-auto w-full max-w-xl rounded-2xl bg-surface shadow-hover">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <ImageIcon size={16} />
            </span>
            <h2 className="font-heading text-lg font-bold text-text">
              Add an image
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-4 p-6">
          <Field label="Image" htmlFor="g-image" required>
            <ImageUploader value={src} onChange={setSrc} folder="yuf-website/gallery" />
          </Field>
          <Field label="Alt text" htmlFor="g-alt">
            <Input
              id="g-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the photo (for accessibility)"
            />
          </Field>
          {error && (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {saving ? "Adding…" : "Add to Gallery"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
