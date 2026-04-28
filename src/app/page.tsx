// Locale detection is handled in src/middleware.ts based on the
// NEXT_LOCALE cookie or the Accept-Language header. This page never renders.
export default function RootPage() {
  return null;
}
