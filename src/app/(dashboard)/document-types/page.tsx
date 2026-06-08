import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentTypesClient } from "@/components/admin/document-types-client";
import { getDocumentTypes } from "@/actions/document-types";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Document Types",
};

export default async function DocumentTypesPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const documentTypes = await getDocumentTypes();

  return (
    <>
      <PageHeader
        title="Document Types"
        description="Manage document type classifications"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Document Types" },
        ]}
      />
      <DocumentTypesClient documentTypes={documentTypes} />
    </>
  );
}
