import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

// ISO 639-1 codes for <html lang>. Routing uses "ua", but the language
// itself is Ukrainian → "uk".
const HTML_LANG: Record<string, string> = { en: "en", ua: "uk" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dreams Branch of UWAA",
    template: "%s — Dreams Branch of UWAA",
  },
  description:
    "Ukrainian-Australian community platform supporting Ukraine through fundraising, events, and volunteer activities.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await headers()).get("x-app-locale") ?? "en";

  return (
    <html lang={HTML_LANG[locale] ?? "en"} className={cn("font-sans", geist.variable)} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
