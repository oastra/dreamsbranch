import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["en", "ua"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "en";
const COOKIE_NAME = "NEXT_LOCALE";

function detectFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const langs = acceptLanguage
    .split(",")
    .map((l) => l.split(";")[0].trim().toLowerCase().split("-")[0]);
  for (const lang of langs) {
    if (lang === "uk" || lang === "ru") return "ua";
    if (lang === "en") return "en";
  }
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocalePrefix = LOCALES.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`),
  );
  if (hasLocalePrefix) return NextResponse.next();

  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value as
    | Locale
    | undefined;
  const target: Locale =
    cookieLocale && LOCALES.includes(cookieLocale)
      ? cookieLocale
      : detectFromHeader(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${target}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API, admin, auth, Next internals, and any path with a file extension.
  matcher: ["/((?!api|admin|auth|_next|.*\\..*).*)"],
};
