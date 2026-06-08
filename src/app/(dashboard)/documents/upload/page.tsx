import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentUploadForm } from "@/components/documents/document-upload-form";
import { getActiveDepartments } from "@/actions/departments";
import { getDivisions } from "@/actions/divisions";
import { getDocumentTypes } from "@/actions/document-types";
import { getProcessCategories } from "@/actions/process-categories";
import { getTags } from "@/actions/tags";
import { getActiveUsers } from "@/actions/users";
import { requireUser } from "@/lib/auth";
import { canUploadDocuments } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Upload Document",
};

export default async function UploadDocumentPage() {
  const user = await requireUser();

  if (!canUploadDocuments(user)) {
    redirect("/documents");
  }

  const [divisions, departments, documentTypes, processCategories, tags, owners] =
    await Promise.all([
      getDivisions(),
      getActiveDepartments(),
      getDocumentTypes(),
      getProcessCategories(),
      getTags(),
      getActiveUsers(),
    ]);

  return (
    <>
      <PageHeader
        title="Upload Document"
        description="Upload a PDF and fill in document metadata"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Documents", href: "/documents" },
          { label: "Upload" },
        ]}
      />
      <DocumentUploadForm
        divisions={divisions.filter((d) => d.status === "active")}
        departments={departments}
        documentTypes={documentTypes.filter((d) => d.status === "active")}
        processCategories={processCategories.filter((d) => d.status === "active")}
        tags={tags}
        owners={owners}
        currentUserId={user.id}
      />
    </>
  );
}
