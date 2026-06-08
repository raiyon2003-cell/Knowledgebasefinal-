import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AuditLogsClient } from "@/components/admin/audit-logs-client";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuditLogs } from "@/actions/dashboard";

export const metadata: Metadata = {
  title: "Audit Logs",
};

interface AuditLogsPageProps {
  searchParams: Promise<{ page?: string }>;
}

async function AuditLogsContent({ page }: { page: number }) {
  const result = await getAuditLogs(page);

  return (
    <AuditLogsClient
      logs={result.data}
      page={result.page}
      totalPages={result.totalPages}
    />
  );
}

export default async function AuditLogsPage({
  searchParams,
}: AuditLogsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Track document activity and changes"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Audit Logs" },
        ]}
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <AuditLogsContent page={page} />
      </Suspense>
    </>
  );
}
