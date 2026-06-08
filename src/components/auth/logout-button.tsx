"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  showLabel?: boolean;
  className?: string;
}

export function LogoutButton({
  variant = "ghost",
  showLabel = true,
  className,
}: LogoutButtonProps) {
  function handleLogout() {
    // Full-page navigation so cleared cookies apply before /login loads
    window.location.href = "/api/auth/logout";
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleLogout}
      className={cn(showLabel ? "gap-2" : "size-9", className)}
    >
      <LogOut className="h-4 w-4" />
      {showLabel && <span>Log out</span>}
      {!showLabel && <span className="sr-only">Log out</span>}
    </Button>
  );
}
