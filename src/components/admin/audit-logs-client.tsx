"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { formatDate } from "@/lib/format";
import { AUDIT_ACTIONS } from "@/lib/constants";
import type { AuditLog } from "@/types/database";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AuditLogsClientProps {
  logs: AuditLog[];
  page: number;
  totalPages: number;
}

export function AuditLogsClient({
  logs,
  page,
  totalPages,
}: AuditLogsClientProps) {
  const getActionLabel = (action: string) =>
    AUDIT_ACTIONS.find((a) => a.value === action)?.label || action;

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => getActionLabel(row.original.action),
    },
    {
      accessorKey: "document.title",
      header: "Document",
      cell: ({ row }) => row.original.document?.title || "—",
    },
    {
      accessorKey: "user.full_name",
      header: "User",
      cell: ({ row }) => row.original.user?.full_name || "—",
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => {
        const details = row.original.details;
        if (!details || Object.keys(details).length === 0) return "—";
        return JSON.stringify(details);
      },
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={logs} />

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={page > 1 ? `/audit-logs?page=${page - 1}` : "#"}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={`/audit-logs?page=${pageNum}`}
                    isActive={pageNum === page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href={page < totalPages ? `/audit-logs?page=${page + 1}` : "#"}
                aria-disabled={page >= totalPages}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
