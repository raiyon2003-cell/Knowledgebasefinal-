import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { TagsClient } from "@/components/admin/tags-client";
import { getTags } from "@/actions/tags";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Tags",
};

export default async function TagsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const tags = await getTags();

  return (
    <>
      <PageHeader
        title="Tags"
        description="Manage document tags for categorization"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tags" },
        ]}
      />
      <TagsClient tags={tags} />
    </>
  );
}
