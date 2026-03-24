'use client';

import { NavItem } from './nav-item';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import type { Locale } from 'next-intl';

interface MobileNavItem {
  key: string;
  href: string;
  label: string;
}

interface MobileNavProps {
  items: MobileNavItem[];
  currentLocale: Locale;
  supportLabel: string;
  onLocaleSwitch: () => void;
  onClose: () => void;
  isActive: (href: string) => boolean;
}

export function MobileNav({
  items,
  currentLocale,
  supportLabel,
  onLocaleSwitch,
  onClose,
  isActive,
}: MobileNavProps) {
  const targetLocale = currentLocale === 'ua' ? 'EN' : 'UA';

  return (
    <div className="lg:hidden border-t border-border bg-surface-primary">
      <nav className="container-page py-4 space-y-1">
        {items.map((item) => (
          <NavItem
            key={item.key}
            href={item.href}
            label={item.label}
            isActive={isActive(item.href)}
            onClick={onClose}
            className="block w-full px-4 py-3 rounded-lg"
          />
        ))}

        <div className="pt-4 mt-4 border-t border-border flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { onLocaleSwitch(); onClose(); }}
          >
            {targetLocale}
          </Button>
          <Link href="/campaigns" onClick={onClose} className="flex-1">
            <Button variant="primary" size="sm" pill className="w-full">
              {supportLabel}
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
