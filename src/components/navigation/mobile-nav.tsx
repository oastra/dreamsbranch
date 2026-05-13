"use client";

import { Mail } from "lucide-react";
import FacebookIcon from "@/components/icons/FacebookIcon";
import { NavItem } from "./nav-item";
import type { Locale } from "next-intl";

interface MobileNavItem {
  key: string;
  href: string;
  label: string;
}

interface MobileNavProps {
  items: MobileNavItem[];
  currentLocale: Locale;
  onLocaleSwitch: () => void;
  onClose: () => void;
  isActive: (href: string) => boolean;
}

export function MobileNav({
  items,
  currentLocale,
  onLocaleSwitch,
  onClose,
  isActive,
}: MobileNavProps) {
  const targetLocale = currentLocale === "ua" ? "EN" : "UA";

  return (
    <div className="lg:hidden border-t border-border bg-surface-primary">
      <nav className="container-page py-2">
        {items.map((item) => (
          <NavItem
            key={item.key}
            href={item.href}
            label={item.label}
            isActive={isActive(item.href)}
            onClick={onClose}
            className="block w-full px-4 py-4 border-b border-border"
          />
        ))}

        <div className="pt-5 pb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onLocaleSwitch();
              onClose();
            }}
            aria-label={`Switch language to ${targetLocale}`}
            className="h-10 min-w-10 px-3 rounded-full bg-secondary-10 text-text-strong text-body-sm font-bold uppercase transition-colors hover:bg-secondary hover:text-white"
          >
            {currentLocale}
          </button>
          <a
            href="mailto:dreamsbranch@gmail.com"
            className="flex-1 flex items-center gap-2 text-body text-text-strong hover:text-secondary transition-colors min-w-0"
          >
            <Mail className="w-5 h-5 shrink-0" />
            <span className="truncate">dreamsbranch@gmail.com</span>
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=100092434277929"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 hover:bg-secondary-140 transition-colors"
          >
            <FacebookIcon className="w-5 h-5 text-white " />
          </a>
        </div>
      </nav>
    </div>
  );
}
