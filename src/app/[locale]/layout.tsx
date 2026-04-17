// src/app/[locale]/layout.tsx
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import localFont from "next/font/local";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const mariupol = localFont({
  src: [
    { path: "../fonts/mariupol-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/mariupol-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/mariupol-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-mariupol",
  display: "swap",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <div
      className={`${mariupol.variable} min-h-screen flex flex-col font-sans`}
    >
      <NextIntlClientProvider messages={messages}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </NextIntlClientProvider>
    </div>
  );
}
