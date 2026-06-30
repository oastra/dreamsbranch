// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { default: t("title"), template: "%s — Dreams Branch of UWAA" },
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: locale === "ua" ? "uk_UA" : "en_AU",
    },
  };
}
import localFont from "next/font/local";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/shop/cart-provider";

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
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </NextIntlClientProvider>
    </div>
  );
}
