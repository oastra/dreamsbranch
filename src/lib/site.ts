// Canonical absolute origin for metadata, robots, and sitemap.
// Prefers the explicitly-configured site URL, falls back to the Vercel
// production URL, then localhost for dev.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
