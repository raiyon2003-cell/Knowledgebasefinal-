import {
  FileText,
  FileCheck,
  FilePen,
  Archive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMetrics } from "@/types/database";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

const cards = [
  {
    key: "totalDocuments" as const,
    title: "Total Documents",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    key: "publishedDocuments" as const,
    title: "Published",
    icon: FileCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    key: "draftDocuments" as const,
    title: "Drafts",
    icon: FilePen,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    key: "archivedDocuments" as const,
    title: "Archived",
    icon: Archive,
    color: "text-gray-600",
    bg: "bg-gray-50 dark:bg-gray-950/30",
  },
];

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics[card.key]}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
