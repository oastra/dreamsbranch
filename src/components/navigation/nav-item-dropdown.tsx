"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export interface NavDropdownChild {
  key: string;
  href: string;
  label: string;
}

interface NavItemDropdownProps {
  label: string;
  children: NavDropdownChild[];
  isActive?: boolean;
  isChildActive?: (href: string) => boolean;
}

export function NavItemDropdown({
  label,
  children,
  isActive,
  isChildActive,
}: NavItemDropdownProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }
  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => {
        cancelClose();
        setOpen(true);
      }}
      onBlur={(e) => {
        if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
          scheduleClose();
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 px-3 py-1.5 rounded-full text-secondary font-regular transition-colors nowrap",
          isActive
            ? "bg-primary text-text-primary-80"
            : "text-text-primary hover:text-secondary",
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-full -translate-x-1/2 min-w-44 rounded-2xl bg-white border border-border shadow-lg py-2 z-50"
        >
          {children.map((child) => {
            const active = isChildActive?.(child.href) ?? false;
            return (
              <Link
                key={child.key}
                href={child.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-2 text-body font-regular transition-colors nowrap",
                  active
                    ? "text-secondary"
                    : "text-text-primary hover:text-secondary",
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
