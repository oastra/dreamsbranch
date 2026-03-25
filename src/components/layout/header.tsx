"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import { useState } from "react";
import FacebookIcon from "@/components/icons/FacebookIcon";
import { Menu, X, ShoppingCart, ShoppingBag } from "lucide-react";
import { NavItem } from "@/components/navigation/nav-item";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { Button } from "@/components/ui/button";
import ShoppingBasketIcon from "../icons/ShoppingBasketIcon";

const NAV_ITEMS = [
  { key: "about", href: "/about" },
  { key: "campaigns", href: "/campaigns" },
  { key: "events", href: "/events" },
  { key: "news", href: "/news" },
  { key: "reports", href: "/reports" },
  { key: "shop", href: "/shop" },
  { key: "contact", href: "/contact" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLocale = pathname.startsWith("/ua") ? "ua" : "en";

  function switchLocale(target?: "ua" | "en") {
    const next = target ?? (currentLocale === "ua" ? "en" : "ua");
    const pathWithoutLocale = pathname.replace(/^\/(en|ua)/, "") || "/";
    router.replace(pathWithoutLocale, { locale: next });
  }

  function isActive(href: string): boolean {
    const clean = pathname.replace(/^\/(en|ua)/, "");
    return clean === href || clean.startsWith(href + "/");
  }

  const navItems = NAV_ITEMS.map((item) => ({ ...item, label: t(item.key) }));

  return (
    <header className=" mb-5 z-50 bg-white border border-border">
      <div className="container-page">
        <div className="flex items-center justify-between h-16 lg:h-22">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/logo-blue.svg"
              alt="Dreams Branch"
              className="w-70 h-10"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center text-secondary gap-1">
            {navItems.map((item) => (
              <NavItem
                key={item.key}
                href={item.href}
                label={item.label}
                isActive={isActive(item.href)}
              />
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher
              currentLocale={currentLocale}
              onSwitch={switchLocale}
            />

            <a
              href="https://www.facebook.com/profile.php?id=100092434277929"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-12 h-12 rounded-full bg-secondary-10 flex items-center justify-center hover:bg-brand-blue-dark transition-colors"
            >
              <FacebookIcon className="w-6 h-6 text-grey-100" />
            </a>

            <Link href="/campaigns">
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
              <ShoppingBag className="w-6 h-6 text-grey-100" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 -mr-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <MobileNav
          items={navItems}
          currentLocale={currentLocale}
          supportLabel={t("support")}
          onLocaleSwitch={() => switchLocale()}
          onClose={() => setMobileOpen(false)}
          isActive={isActive}
        />
      )}
    </header>
  );
}
