import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const LOCALES = ["en", "ua"] as const;

// Core static routes. Content routes (campaigns, events, news, products)
// can be appended here later by querying the db.
const ROUTES = [
  "",
  "/about",
  "/campaigns",
  "/events",
  "/news",
  "/reports",
  "/shop",
  "/contact",
  "/donate",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${SITE_URL}/${locale}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
  );
}
