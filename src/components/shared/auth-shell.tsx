import { BrandLogo } from "@/components/shared/brand-logo";

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(88,129,87,0.25),transparent_55%)]" />
        <div className="relative">
          <BrandLogo variant="light" />
        </div>
        <div className="relative space-y-4">
          <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            Internal Knowledge Base
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-sidebar-foreground/80">
            Your central hub for standard operating procedures, process
            documentation, and team knowledge across SegWitz.
          </p>
        </div>
        <p className="relative text-xs text-sidebar-foreground/50">
          SegWitz &middot; SOP Repository
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-background p-4 sm:p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
