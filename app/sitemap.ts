import type { MetadataRoute } from "next";
import { SITE_URL } from "./layout";
import { getEvents } from "@/lib/cms-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static public routes, highest-value first.
  const routes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/events", priority: 0.9, changeFrequency: "daily" },
    { path: "/register", priority: 0.9, changeFrequency: "weekly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/gallery", priority: 0.6, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/study-abroad", priority: 0.5, changeFrequency: "monthly" },
    { path: "/yuf-2025", priority: 0.5, changeFrequency: "monthly" },
    { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/terms-and-conditions", priority: 0.2, changeFrequency: "yearly" },
    { path: "/refund-policy", priority: 0.2, changeFrequency: "yearly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // One entry per active event detail page.
  let eventEntries: MetadataRoute.Sitemap = [];
  try {
    const events = await getEvents();
    eventEntries = events
      .filter((e) => e.isActive)
      .map((e) => ({
        url: `${SITE_URL}/events/${e.id}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    // If the CMS is unreachable at build time, still return the static routes.
  }

  return [...staticEntries, ...eventEntries];
}
