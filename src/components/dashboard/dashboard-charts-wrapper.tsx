"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartDataPoint } from "@/types/database";

const DashboardChartsLazy = dynamic(
  () =>
    import("./dashboard-charts").then((mod) => mod.DashboardCharts),
  {
    loading: () => (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72" />
        ))}
      </div>
    ),
    ssr: false,
  }
);

interface DashboardChartsWrapperProps {
  byDivision: ChartDataPoint[];
  byDepartment: ChartDataPoint[];
  byDocumentType: ChartDataPoint[];
  byProcessCategory: ChartDataPoint[];
}

export function DashboardChartsWrapper(props: DashboardChartsWrapperProps) {
  return <DashboardChartsLazy {...props} />;
}
