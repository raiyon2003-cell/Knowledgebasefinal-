"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartDataPoint } from "@/types/database";

interface DashboardChartsProps {
  byDivision: ChartDataPoint[];
  byDepartment: ChartDataPoint[];
  byDocumentType: ChartDataPoint[];
  byProcessCategory: ChartDataPoint[];
}

function ChartCard({
  title,
  data,
}: {
  title: string;
  data: ChartDataPoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No data available
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardCharts({
  byDivision,
  byDepartment,
  byDocumentType,
  byProcessCategory,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard title="Documents by Division" data={byDivision} />
      <ChartCard title="Documents by Department" data={byDepartment} />
      <ChartCard title="Documents by Document Type" data={byDocumentType} />
      <ChartCard title="Documents by Process Category" data={byProcessCategory} />
    </div>
  );
}
