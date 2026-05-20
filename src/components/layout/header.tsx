"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import { useState } from "react";
import FacebookIcon from "@/components/icons/FacebookIcon";
import { Menu, X, ShoppingBag } from "lucide-react";
import { NavItem } from "@/components/navigation/nav-item";
import { NavItemDropdown } from "@/components/navigation/nav-item-dropdown";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { Button } from "@/components/ui/button";

type NavChildKey =
  | "shop.handmade"
  | "shop.from_ukraine"
  | "shop.cuisine"
  | "shop.catering";

type NavChild = { key: NavChildKey; href: string; labelKey: string };

type NavItemDef = {
  key: string;
  href: string;
  children?: readonly NavChild[];
};

const SHOP_CHILDREN: readonly NavChild[] = [
  { key: "shop.handmade", href: "/shop/handmade", labelKey: "shop.offerings.handmade" },
  { key: "shop.from_ukraine", href: "/shop/from-ukraine", labelKey: "shop.offerings.from_ukraine" },
  { key: "shop.cuisine", href: "/shop/cuisine", labelKey: "shop.offerings.ukrainian_cuisine" },
  { key: "shop.catering", href: "/shop/catering", labelKey: "shop.offerings.catering" },
];

const NAV_ITEMS: readonly NavItemDef[] = [
  { key: "about", href: "/about" },
  { key: "campaigns", href: "/campaigns" },
  { key: "events", href: "/events" },
  { key: "news", href: "/news" },
  { key: "reports", href: "/reports" },
  { key: "shop", href: "/shop", children: SHOP_CHILDREN },
  { key: "contact", href: "/contact" },
];

export function Header() {
  const t = useTranslations("nav");
  const tRoot = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLocale = pathname.startsWith("/ua") ? "ua" : "en";

  function switchLocale(target?: "ua" | "en") {
    const next = target ?? (currentLocale === "ua" ? "en" : "ua");
    // Persist the user's manual choice so middleware honours it on next visit.
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    const pathWithoutLocale = pathname.replace(/^\/(en|ua)/, "") || "/";
    router.replace(pathWithoutLocale, { locale: next });
  }

  function isActive(href: string): boolean {
    const clean = pathname.replace(/^\/(en|ua)/, "");
    return clean === href || clean.startsWith(href + "/");
  }

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    label: t(item.key),
    children: item.children?.map((c) => ({
      key: c.key,
      href: c.href,
      label: tRoot(c.labelKey),
    })),
  }));

  return (
    <header className="z-50 mb-5">
      <div className="bg-white border border-border">
        <div className="container-page">
          <div className="flex items-center justify-between h-16 lg:h-22">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink min-w-0">
              <Image
                src="/logo-blue.svg"
                alt="Dreams Branch"
                width={280}
                height={40}
                priority
                className="h-8 w-auto max-w-45 sm:max-w-55 lg:h-10 lg:max-w-none lg:w-70"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center text-secondary gap-1">
              {navItems.map((item) =>
                item.children && item.children.length > 0 ? (
                  <NavItemDropdown
                    key={item.key}
                    label={item.label}
                    children={item.children}
                    isActive={isActive(item.href)}
                    isChildActive={isActive}
                  />
                ) : (
                  <NavItem
                    key={item.key}
                    href={item.href}
                    label={item.label}
                    isActive={isActive(item.href)}
                  />
                ),
              )}
            </nav>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-3">
              <LanguageSwitcher
                currentLocale={currentLocale}
                onSwitch={switchLocale}
              />

              <Link
                href="https://www.facebook.com/profile.php?id=100092434277929"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-12 h-12 rounded-full bg-secondary-10 flex items-center justify-center hover:bg-brand-blue-dark transition-colors"
              >
                <FacebookIcon className="w-6 h-6 text-grey-100  hover:text-secondary-120" />
              </Link>

              <Link href="/donate">
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full w-38 h-11.75"
                >
                  {t("support")}
                </Button>
              </Link>

              <button
                aria-label="Cart"
                className="w-12 h-12 bg-secondary-10 rounded-full  flex items-center justify-center hover:border-brand-blue transition-colors"
              >
                <ShoppingBag className="w-6 h-6 text-grey-100  hover:text-secondary-120" />
              </button>
            </div>

            {/* Mobile actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden shrink-0">
              {/* Language chip — only when menu closed (drawer has its own) */}
              {!mobileOpen && (
                <button
                  type="button"
                  onClick={() => switchLocale()}
                  aria-label={`Switch language to ${currentLocale === "ua" ? "English" : "Ukrainian"}`}
                  className="h-9 w-9 sm:h-10 sm:min-w-10 sm:w-auto sm:px-3 rounded-full bg-secondary-10 text-text-strong text-body-sm font-bold uppercase transition-colors hover:bg-secondary hover:text-white"
                >
                  {currentLocale}
                </button>
              )}
              {/* Cart — always visible (open or closed) */}
              <button
                aria-label="Cart"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-grey-100" />
              </button>
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-secondary-10 rounded-full flex items-center justify-center"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-grey-100" />
                ) : (
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-grey-100" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile support CTA — fixed-width blue banner centered under the header */}
      {!mobileOpen && (
        <div className="lg:hidden flex justify-center">
          <Link href="/donate" className="block w-82.25 max-w-full">
            <button
              type="button"
              className="w-full h-10 bg-secondary text-white text-body-md font-bold rounded-b-[2.5rem] transition-colors hover:bg-brand-blue-dark"
            >
              {t("support")}
            </button>
          </Link>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <MobileNav
          items={navItems}
          currentLocale={currentLocale}
          onLocaleSwitch={() => switchLocale()}
          onClose={() => setMobileOpen(false)}
          isActive={isActive}
        />
      )}
    </header>
  );
}
