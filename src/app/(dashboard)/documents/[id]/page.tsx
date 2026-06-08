import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentDetailClient } from "@/components/documents/document-detail-client";
import {
  getDocumentById,
  getDocumentSignedUrl,
} from "@/actions/documents";
import { getDivisions } from "@/actions/divisions";
import { getActiveDepartments } from "@/actions/departments";
import { getDocumentTypes } from "@/actions/document-types";
import { getProcessCategories } from "@/actions/process-categories";
import { getTags } from "@/actions/tags";
import { getActiveUsers } from "@/actions/users";
import { requireUser } from "@/lib/auth";
import { canEditDocument } from "@/lib/permissions";

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: DocumentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const document = await getDocumentById(id);
  return { title: document?.title || "Document" };
}

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const { id } = await params;

  const [user, document] = await Promise.all([requireUser(), getDocumentById(id)]);
  if (!document) notFound();

  const canEdit = canEditDocument(user, document.department_id);

  const signedUrlPromise = getDocumentSignedUrl(document.file_url);
  const editOptionsPromise = canEdit
    ? Promise.all([
        getDivisions(),
        getActiveDepartments(),
        getDocumentTypes(),
        getProcessCategories(),
        getTags(),
        getActiveUsers(),
      ])
    : Promise.resolve(null);

  const [signedUrl, editOptions] = await Promise.all([
    signedUrlPromise,
    editOptionsPromise,
  ]);

  return (
    <>
      <PageHeader
        title={document.title}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Documents", href: "/documents" },
          { label: document.title },
        ]}
      />
      <DocumentDetailClient
        document={document}
        signedUrl={signedUrl}
        divisions={
          editOptions
            ? editOptions[0].filter((d) => d.status === "active")
            : []
        }
        departments={editOptions ? editOptions[1] : []}
        documentTypes={
          editOptions
            ? editOptions[2].filter((d) => d.status === "active")
            : []
        }
        processCategories={
          editOptions
            ? editOptions[3].filter((d) => d.status === "active")
            : []
        }
        tags={editOptions ? editOptions[4] : []}
        owners={editOptions ? editOptions[5] : []}
        canEdit={canEdit}
      />
    </>
  );
}
