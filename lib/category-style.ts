import {
  Trophy,
  Timer,
  Palette,
  Lightbulb,
  PartyPopper,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Per-discipline visual identity — color + icon — sampled from the festival
 * palette. Shared by the event cards and the filter rail so a category's color
 * means the same thing everywhere: color becomes the page's wayfinding.
 *
 *  - `from`/`to`  : placeholder gradient stops (card image area)
 *  - `accent`     : the category's signature color (pills, rules, hover bars)
 *  - `soft`       : a low-alpha tint of the accent for inactive/idle states
 */
export interface CategoryStyle {
  icon: LucideIcon;
  from: string;
  to: string;
  accent: string;
  soft: string;
}

export const CATEGORY_STYLE: Record<string, CategoryStyle> = {
  "Sports & Games": { icon: Trophy, from: "#1e7fd4", to: "#0e2f63", accent: "#1e7fd4", soft: "rgba(30,127,212,0.12)" },
  Athletics: { icon: Timer, from: "#15938f", to: "#0c4f4d", accent: "#129c97", soft: "rgba(18,156,151,0.12)" },
  "Arts & Culturals": { icon: Palette, from: "#7b34e2", to: "#2e0f59", accent: "#7b34e2", soft: "rgba(123,52,226,0.12)" },
  Technical: { icon: Lightbulb, from: "#1787b3", to: "#0a2b3a", accent: "#1787b3", soft: "rgba(23,135,179,0.12)" },
  Innovation: { icon: Lightbulb, from: "#1787b3", to: "#0a2b3a", accent: "#1787b3", soft: "rgba(23,135,179,0.12)" },
  "Fun Events": { icon: PartyPopper, from: "#e07414", to: "#7a3f08", accent: "#e07414", soft: "rgba(224,116,20,0.12)" },
};

export const FALLBACK_STYLE: CategoryStyle = {
  icon: Sparkles,
  from: "#1e7fd4",
  to: "#0e2f63",
  accent: "#1787b3",
  soft: "rgba(23,135,179,0.12)",
};

export function categoryStyle(name: string): CategoryStyle {
  return CATEGORY_STYLE[name] ?? FALLBACK_STYLE;
}
