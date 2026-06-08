"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Filter, Upload, X } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatDate } from "@/lib/format";
import { DOCUMENT_STATUSES } from "@/lib/constants";
import type {
  Document,
  Division,
  DocumentType,
  ProcessCategory,
  User,
} from "@/types/database";

interface DepartmentOption {
  id: string;
  name: string;
}

interface DocumentsClientProps {
  documents: Document[];
  total: number;
  page: number;
  totalPages: number;
  divisions: Division[];
  departments: DepartmentOption[];
  documentTypes: DocumentType[];
  processCategories: ProcessCategory[];
  owners: Pick<User, "id" | "full_name">[];
  canUpload: boolean;
}

export function DocumentsClient({
  documents,
  total,
  page,
  totalPages,
  divisions,
  departments,
  documentTypes,
  processCategories,
  owners,
  canUpload,
}: DocumentsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (!updates.page) params.delete("page");
      startTransition(() => {
        router.push(`/documents?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const columns = useMemo<ColumnDef<Document>[]>(
    () => [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <Link
          href={`/documents/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: "division.name",
      header: "Division",
      cell: ({ row }) => row.original.division?.name || "—",
    },
    {
      accessorKey: "department.name",
      header: "Department",
      cell: ({ row }) => row.original.department?.name || "—",
    },
    {
      accessorKey: "document_type.name",
      header: "Type",
      cell: ({ row }) => row.original.document_type?.name || "—",
    },
    {
      accessorKey: "owner.full_name",
      header: "Owner",
      cell: ({ row }) => row.original.owner?.full_name || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))}
          {(row.original.tags?.length || 0) > 2 && (
            <Badge variant="outline" className="text-xs">
              +{(row.original.tags?.length || 0) - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ row }) => formatDate(row.original.updated_at),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Link
          href={`/documents/${row.original.id}`}
          className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted"
        >
          <Eye className="h-4 w-4" />
        </Link>
      ),
    },
  ],
    []
  );

  const hasFilters =
    searchParams.get("search") ||
    searchParams.get("divisionId") ||
    searchParams.get("departmentId") ||
    searchParams.get("documentTypeId") ||
    searchParams.get("processCategoryId") ||
    searchParams.get("status") ||
    searchParams.get("ownerId");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            updateParams({ search: formData.get("search") as string });
          }}
          className="flex flex-1 gap-2"
        >
          <Input
            name="search"
            placeholder="Search by title, summary, tags, owner..."
            defaultValue={searchParams.get("search") || ""}
            className="max-w-md"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        {canUpload && (
          <Link
            href="/documents/upload"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </Link>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          Filters
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/documents")}
            >
              <X className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <Select
            value={searchParams.get("divisionId") || "all"}
            onValueChange={(v) =>
              updateParams({
                divisionId: !v || v === "all" ? undefined : v,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {divisions.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("departmentId") || "all"}
            onValueChange={(v) =>
              updateParams({
                departmentId: !v || v === "all" ? undefined : v,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("documentTypeId") || "all"}
            onValueChange={(v) =>
              updateParams({
                documentTypeId: !v || v === "all" ? undefined : v,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {documentTypes.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("processCategoryId") || "all"}
            onValueChange={(v) =>
              updateParams({
                processCategoryId: !v || v === "all" ? undefined : v,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Process Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {processCategories.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("status") || "all"}
            onValueChange={(v) =>
              updateParams({
                status: !v || v === "all" ? undefined : v,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {DOCUMENT_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("ownerId") || "all"}
            onValueChange={(v) =>
              updateParams({
                ownerId: !v || v === "all" ? undefined : v,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {owners.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("sort") || "updated_desc"}
            onValueChange={(v) => updateParams({ sort: v || "updated_desc" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_desc">Latest Updated</SelectItem>
              <SelectItem value="updated_asc">Oldest Updated</SelectItem>
              <SelectItem value="title_asc">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {total} document{total !== 1 ? "s" : ""} found
      </div>

      <DataTable columns={columns} data={documents} />

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={
                  page > 1
                    ? `/documents?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) }).toString()}`
                    : "#"
                }
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={`/documents?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(pageNum) }).toString()}`}
                    isActive={pageNum === page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href={
                  page < totalPages
                    ? `/documents?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) }).toString()}`
                    : "#"
                }
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
