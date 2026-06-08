import {
  FileText,
  FileCheck,
  FilePen,
  Archive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_COLORS } from "@/lib/brand";
import type { DashboardMetrics } from "@/types/database";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

const cards = [
  {
    key: "totalDocuments" as const,
    title: "Total Documents",
    icon: FileText,
    color: BRAND_COLORS.steelTeal,
    bg: "bg-[#28666e]/10",
  },
  {
    key: "publishedDocuments" as const,
    title: "Published",
    icon: FileCheck,
    color: BRAND_COLORS.limeGreen,
    bg: "bg-[#588157]/10",
  },
  {
    key: "draftDocuments" as const,
    title: "Drafts",
    icon: FilePen,
    color: BRAND_COLORS.oliveGreen,
    bg: "bg-[#819171]/15",
  },
  {
    key: "archivedDocuments" as const,
    title: "Archived",
    icon: Archive,
    color: BRAND_COLORS.charcoalGreen,
    bg: "bg-[#344e41]/10",
  },
];

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key} className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <Icon className="h-4 w-4" style={{ color: card.color }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-foreground">
                {metrics[card.key]}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
