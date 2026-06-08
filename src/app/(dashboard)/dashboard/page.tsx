import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { DashboardChartsWrapper } from "@/components/dashboard/dashboard-charts-wrapper";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDashboardMetrics,
  getDocumentsByDivision,
  getDocumentsByDepartment,
  getDocumentsByDocumentType,
  getDocumentsByProcessCategory,
} from "@/actions/dashboard";
import { getRecentDocuments } from "@/actions/documents";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function DashboardContent() {
  const [
    metrics,
    byDivision,
    byDepartment,
    byDocumentType,
    byProcessCategory,
    recentDocuments,
  ] = await Promise.all([
    getDashboardMetrics(),
    getDocumentsByDivision(),
    getDocumentsByDepartment(),
    getDocumentsByDocumentType(),
    getDocumentsByProcessCategory(),
    getRecentDocuments(5),
  ]);

  return (
    <div className="space-y-8">
      <MetricsCards metrics={metrics} />
      <DashboardChartsWrapper
        byDivision={byDivision}
        byDepartment={byDepartment}
        byDocumentType={byDocumentType}
        byProcessCategory={byProcessCategory}
      />
      <RecentActivity
        documents={
          recentDocuments as unknown as {
            id: string;
            title: string;
            status: "draft" | "published" | "archived";
            created_at: string;
            owner?: { full_name: string } | null;
            department?: { name: string } | null;
          }[]
        }
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your knowledge base and SOP repository"
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
