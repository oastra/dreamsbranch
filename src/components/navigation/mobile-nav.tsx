"use client";

import { useState } from "react";
import { Mail, ChevronDown, Globe } from "lucide-react";
import FacebookIcon from "@/components/icons/FacebookIcon";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { Locale } from "next-intl";

interface MobileNavChild {
  key: string;
  href: string;
  label: string;
}

interface MobileNavItem {
  key: string;
  href: string;
  label: string;
  children?: MobileNavChild[];
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
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="lg:hidden border-t border-border bg-surface-primary">
      <nav className="container-page pt-2 pb-6 sm:pb-8">
        {items.map((item) => {
          const hasChildren = !!item.children?.length;
          const isOpen = openKey === item.key;
          const active = isActive(item.href);

          if (!hasChildren) {
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex min-h-[45px] w-full items-center border-b border-border py-2 text-subheading transition-colors",
                  active
                    ? "text-secondary"
                    : "text-text-strong hover:text-secondary",
                )}
              >
                {item.label}
              </Link>
            );
          }

          return (
            <div key={item.key}>
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : item.key)}
                aria-expanded={isOpen}
                className={cn(
                  "flex min-h-[45px] w-full items-center justify-between border-b border-border py-2 text-subheading transition-colors text-left",
                  active
                    ? "text-secondary"
                    : "text-text-strong hover:text-secondary",
                )}
              >
                <span>{item.label}</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen &&
                item.children!.map((child) => {
                  const childActive = isActive(child.href);
                  return (
                    <Link
                      key={child.key}
                      href={child.href}
                      onClick={onClose}
                      className={cn(
                        "flex min-h-[38px] w-full items-center border-b border-border py-2 pl-4 text-secondary transition-colors",
                        childActive
                          ? "text-secondary"
                          : "text-text-primary hover:text-secondary",
                      )}
                    >
                      {child.label}
                    </Link>
                  );
                })}
            </div>
          );
        })}

        <div className="mt-6 flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={() => {
              onLocaleSwitch();
              onClose();
            }}
            aria-label={`Switch language to ${targetLocale}`}
            className="flex h-14 shrink-0 items-center gap-2 rounded-full bg-secondary-10 px-5 text-secondary font-medium uppercase text-text-strong transition-colors hover:bg-secondary hover:text-white"
          >
            <Globe className="h-5 w-5 shrink-0" />
            {currentLocale}
          </button>
          <a
            href="mailto:dreamsbranch@gmail.com"
            className="flex h-14 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-primary-20 px-4 text-secondary text-text-strong transition-colors hover:bg-primary-40"
          >
            <Mail className="h-5 w-5 shrink-0" />
            <span className="truncate">dreamsbranch@gmail.com</span>
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=100092434277929"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-secondary-140"
          >
            <FacebookIcon className="h-5 w-5 text-white" />
          </a>
        </div>
      </nav>
    </div>
  );
}
