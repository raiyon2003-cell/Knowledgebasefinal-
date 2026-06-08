"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";
import { canViewAuditLogs } from "@/lib/permissions";
import { redirect } from "next/navigation";
import type { ChartDataPoint, DashboardMetrics } from "@/types/database";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();

  const [total, published, draft, archived] = await Promise.all([
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "archived"),
  ]);

  return {
    totalDocuments: total.count || 0,
    publishedDocuments: published.count || 0,
    draftDocuments: draft.count || 0,
    archivedDocuments: archived.count || 0,
  };
}

type ParentTable =
  | "divisions"
  | "departments"
  | "document_types"
  | "process_categories";

async function getDocumentCountsByParent(
  table: ParentTable
): Promise<ChartDataPoint[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(table)
    .select("name, documents(count)")
    .order("name");

  if (error || !data) return [];

  return data
    .map((row) => {
      const related = row.documents as { count: number }[] | null;
      return {
        name: row.name as string,
        count: related?.[0]?.count ?? 0,
      };
    })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
}

export const getDocumentsByDivision = cache(async (): Promise<ChartDataPoint[]> =>
  getDocumentCountsByParent("divisions")
);

export const getDocumentsByDepartment = cache(async (): Promise<ChartDataPoint[]> =>
  getDocumentCountsByParent("departments")
);

export const getDocumentsByDocumentType = cache(async (): Promise<ChartDataPoint[]> =>
  getDocumentCountsByParent("document_types")
);

export const getDocumentsByProcessCategory = cache(async (): Promise<ChartDataPoint[]> =>
  getDocumentCountsByParent("process_categories")
);

export async function getAuditLogs(page = 1, pageSize = 20) {
  const user = await requireUser();
  if (!canViewAuditLogs(user.role)) redirect("/dashboard");

  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("audit_logs")
    .select(
      `
      *,
      user:users(full_name, email),
      document:documents(title)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}
