import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Join conditional class names, with Tailwind-aware conflict resolution
 * (later classes win, e.g. `px-2` then `px-4` → `px-4`). Backed by clsx +
 * tailwind-merge so both our hand-rolled primitives and shadcn-style
 * components share one helper.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Map a content-layer CTA variant ("primary" | "secondary" | "outline") to a
 * shadcn Button variant. The content/CMS schema keeps its own vocabulary; this
 * translates it at the call site so we don't have to migrate stored data.
 */
export function ctaButtonVariant(
  variant?: "primary" | "secondary" | "outline",
): "default" | "secondary" | "outline" {
  if (variant === "outline") return "outline";
  // Both "primary" and "secondary" content CTAs render as a filled brand
  // button (shadcn "secondary" is a pale neutral, which reads as disabled on
  // our colored hero/banners), so collapse them to "default".
  return "default";
}
