import type { MetadataRoute } from "next";
import { SITE_URL } from "./layout";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep the admin panel and API routes out of search results. /register is
      // dynamic and reads the CMS per request, so crawling it costs a function
      // invocation plus Firestore reads for no search value — the events pages
      // are the ones meant to rank and they link to it.
      disallow: ["/admin", "/event-desk", "/api", "/register"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
