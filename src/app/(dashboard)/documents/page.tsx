import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentsClient } from "@/components/documents/documents-client";
import { Skeleton } from "@/components/ui/skeleton";
import { getDocuments } from "@/actions/documents";
import { getDocumentFilterOptions } from "@/lib/document-filter-options";
import { requireUser } from "@/lib/auth";
import { canUploadDocuments } from "@/lib/permissions";
import type { DocumentFilters, DocumentStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Documents",
};

interface DocumentsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function DocumentsTable({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const filters: DocumentFilters = {
    search: searchParams.search,
    divisionId: searchParams.divisionId,
    departmentId: searchParams.departmentId,
    documentTypeId: searchParams.documentTypeId,
    processCategoryId: searchParams.processCategoryId,
    status: searchParams.status as DocumentStatus | undefined,
    ownerId: searchParams.ownerId,
    sort: (searchParams.sort as DocumentFilters["sort"]) || "updated_desc",
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  };

  const [result, filterOptions, user] = await Promise.all([
    getDocuments(filters),
    getDocumentFilterOptions(),
    requireUser(),
  ]);

  return (
    <DocumentsClient
      documents={result.data}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
      divisions={filterOptions.divisions}
      departments={filterOptions.departments}
      documentTypes={filterOptions.documentTypes}
      processCategories={filterOptions.processCategories}
      owners={filterOptions.owners}
      canUpload={canUploadDocuments(user)}
    />
  );
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const params = await searchParams;
  const suspenseKey = JSON.stringify(params);

  return (
    <>
      <PageHeader
        title="Documents"
        description="Browse, search, and manage SOP documents"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Documents" },
        ]}
      />
      <Suspense
        key={suspenseKey}
        fallback={<Skeleton className="h-96 w-full rounded-lg" />}
      >
        <DocumentsTable searchParams={params} />
      </Suspense>
    </>
  );
}
