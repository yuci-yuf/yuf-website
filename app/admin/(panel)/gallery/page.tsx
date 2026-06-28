"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/admin/AdminUI";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
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
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [saving, setSaving] = useState(false);

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

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!src.trim()) {
      setError("Upload or paste an image first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const nextOrder = rows.length
        ? Math.max(...rows.map((r) => r.order)) + 1
        : 1;
      await addGalleryImage(src.trim(), alt.trim() || "YUF gallery image", nextOrder);
      setSrc("");
      setAlt("");
      reload();
    } catch (err) {
      console.error(err);
      setError("Failed to add image.");
    } finally {
      setSaving(false);
    }
  }

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

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Photos shown on the public Gallery page"
      />

      <div className="flex flex-col gap-8 p-8">
        <form
          onSubmit={handleAdd}
          className="flex max-w-xl flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card"
        >
          <h2 className="font-heading font-bold text-text">Add an image</h2>
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
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              icon={saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            >
              {saving ? "Adding…" : "Add to Gallery"}
            </Button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary-600" size={32} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState message="No gallery images yet. Add one above." />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {rows.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-alt shadow-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
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
        )}
      </div>
    </>
  );
}
