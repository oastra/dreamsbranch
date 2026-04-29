"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Heart,
  Calendar,
  Newspaper,
  FileText,
  Inbox,
  DollarSign,
  Settings,
  Users,
  Home,
  Info,
  HandCoins,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Campaigns", href: "/admin/campaigns", icon: Heart },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "News", href: "/admin/news", icon: Newspaper },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  { label: "Donations", href: "/admin/donations", icon: DollarSign },
  { label: "Contact Inbox", href: "/admin/contacts", icon: Inbox },
  { label: "Home Page", href: "/admin/home-settings", icon: Home },
  { label: "About Page", href: "/admin/about-settings", icon: Info },
  { label: "Campaigns Page", href: "/admin/campaigns-settings", icon: HandCoins },
  { label: "Shop Photo Reports", href: "/admin/shop-photo-reports", icon: ShoppingBag },
];

const superAdminItems = [
  { label: "Admin Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-border flex flex-col">
      <div className="p-5 border-b border-border">
        <Link href="/admin" className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            {" "}
            <Image
              src="/logomark.svg"
              alt="logomark DreamsBranch"
              width={36}
              height={36}
              priority
            />
            <div className="text-secondary">
              {" "}
              <span className="font-bold">Dreams Branch</span> of UWAA
            </div>
          </div>
          <p className="text-body font-bold text-text-secondary">Admin Panel</p>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-body font-medium transition-colors",
                isActive(item.href)
                  ? "bg-brand-blue-light text-brand-blue"
                  : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        {user.role === "SUPER_ADMIN" && (
          <>
            <div className="pt-4 mt-4 border-t border-border">
              <p className="px-3 mb-2 text-caption text-text-tertiary uppercase tracking-wider">
                Admin
              </p>
            </div>
            {superAdminItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-body font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-brand-blue-light text-brand-blue"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center">
            <span className="text-white text-caption font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body font-medium truncate">{user.name}</p>
            <p className="text-body-sm text-text-tertiary">
              {user.role === "SUPER_ADMIN" ? "Super Admin" : "Editor"}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-body text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
