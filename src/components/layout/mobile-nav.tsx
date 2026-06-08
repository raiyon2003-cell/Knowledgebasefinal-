"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  FolderOpen,
  Layers,
  Tags,
  UserCog,
  ScrollText,
  Settings,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { BrandLogo } from "@/components/shared/brand-logo";
import type { UserRole } from "@/types/database";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const iconMap = {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  FolderOpen,
  Layers,
  Tags,
  UserCog,
  ScrollText,
  Settings,
};

interface MobileNavProps {
  role: UserRole;
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if ("adminOnly" in item && item.adminOnly) return role === "admin";
    if ("adminOrManager" in item && item.adminOrManager)
      return role === "admin" || role === "department_manager";
    return true;
  });

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="lg:hidden" />
        }
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
        <SheetHeader className="border-b border-sidebar-border p-4">
          <SheetTitle className="flex items-center">
            <BrandLogo variant="light" showSubtitle />
          </SheetTitle>
        </SheetHeader>
        <nav className="space-y-1 p-4">
          {visibleItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-white/10"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <LogoutButton variant="ghost" className="w-full justify-start" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
