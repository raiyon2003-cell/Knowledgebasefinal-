import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProcessCategoriesClient } from "@/components/admin/process-categories-client";
import { getProcessCategories } from "@/actions/process-categories";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Process Categories",
};

export default async function ProcessCategoriesPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const processCategories = await getProcessCategories();

  return (
    <>
      <PageHeader
        title="Process Categories"
        description="Manage process category classifications"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Process Categories" },
        ]}
      />
      <ProcessCategoriesClient processCategories={processCategories} />
    </>
  );
}
