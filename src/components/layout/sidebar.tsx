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
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import type { UserRole } from "@/types/database";
import { LogoutButton } from "@/components/auth/logout-button";

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

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if ("adminOnly" in item && item.adminOnly) return role === "admin";
    if ("adminOrManager" in item && item.adminOrManager)
      return role === "admin" || role === "department_manager";
    return true;
  });

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <BookOpen className="h-6 w-6 text-primary" />
        <div>
          <p className="text-sm font-semibold">SegWitz</p>
          <p className="text-xs text-muted-foreground">Knowledge Base</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
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
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <LogoutButton variant="ghost" className="w-full justify-start" />
      </div>
    </aside>
  );
}
