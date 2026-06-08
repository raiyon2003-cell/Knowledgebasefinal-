import { cn } from "@/lib/utils";
import type { DocumentStatus, EntityStatus } from "@/types/database";

interface StatusBadgeProps {
  status: DocumentStatus | EntityStatus;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  published:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
