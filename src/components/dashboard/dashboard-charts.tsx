"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_CHART_COLORS } from "@/lib/brand";
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
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No data available
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5ddd3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#819171" }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
                axisLine={{ stroke: "#d5ddd3" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#819171" }}
                allowDecimals={false}
                axisLine={{ stroke: "#d5ddd3" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #d5ddd3",
                  borderRadius: "8px",
                  color: "#344e41",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      BRAND_CHART_COLORS[index % BRAND_CHART_COLORS.length]
                    }
                  />
                ))}
              </Bar>
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
