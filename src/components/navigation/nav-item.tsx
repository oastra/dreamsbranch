'use client';

import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function NavItem({ href, label, isActive, onClick, className }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors',
        isActive
          ? 'bg-brand-yellow text-text-primary'
          : 'text-text-primary hover:text-brand-blue',
        className
      )}
    >
      {label}
    </Link>
  );
}
