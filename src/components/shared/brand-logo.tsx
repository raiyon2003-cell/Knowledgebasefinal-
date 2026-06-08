import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  variant?: "default" | "light";
  showSubtitle?: boolean;
}

export function BrandLogo({
  className,
  variant = "default",
  showSubtitle = false,
}: BrandLogoProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Image
        src="/segwitz-logo.svg"
        alt="SegWitz"
        width={130}
        height={20}
        priority
        className="h-5 w-auto"
        style={
          variant === "light"
            ? { filter: "brightness(0) invert(1)" }
            : undefined
        }
      />
      {showSubtitle && (
        <span
          className={cn(
            "text-[10px] font-semibold tracking-[0.2em] uppercase",
            variant === "light"
              ? "text-sidebar-foreground/60"
              : "text-muted-foreground"
          )}
        >
          Knowledge Base
        </span>
      )}
    </div>
  );
}
