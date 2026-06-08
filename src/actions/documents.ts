"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { createAuditLog, requireUser } from "@/lib/auth";
import { documentMetadataSchema } from "@/lib/validations/document";
import { STORAGE_BUCKET, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { generateStoragePath } from "@/lib/format";
import { canManageDocuments } from "@/lib/permissions";
import type { DocumentFilters, PaginatedResult, Document } from "@/types/database";
import { revalidatePath } from "next/cache";

const DOCUMENT_LIST_SELECT = `
  id, title, summary, status, updated_at, version,
  division_id, department_id, document_type_id, process_category_id, owner_id,
  division:divisions(id, name),
  department:departments(id, name),
  document_type:document_types(id, name),
  process_category:process_categories(id, name),
  owner:users!documents_owner_id_fkey(id, full_name),
  document_tags(tag:tags(id, name))
`;

async function getDocumentRecord(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, status, department_id, file_url, file_name")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getDocuments(
  filters: DocumentFilters = {}
): Promise<PaginatedResult<Document>> {
  const supabase = await createClient();
  const page = filters.page || 1;
  const pageSize = filters.pageSize || DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("documents")
    .select(DOCUMENT_LIST_SELECT, { count: "exact" });

  if (filters.search) {
    const term = filters.search.trim();
    const [{ data: owners }, { data: tagRows }] = await Promise.all([
      supabase
        .from("users")
        .select("id")
        .ilike("full_name", `%${term}%`)
        .limit(50),
      supabase
        .from("document_tags")
        .select("document_id, tag:tags!inner(name)")
        .ilike("tag.name", `%${term}%`)
        .limit(100),
    ]);

    const ownerIds = owners?.map((o) => o.id) ?? [];
    const docIds = [...new Set(tagRows?.map((r) => r.document_id) ?? [])];
    const parts = [`title.ilike.%${term}%`, `summary.ilike.%${term}%`];
    if (ownerIds.length) parts.push(`owner_id.in.(${ownerIds.join(",")})`);
    if (docIds.length) parts.push(`id.in.(${docIds.join(",")})`);
    query = query.or(parts.join(","));
  }

  if (filters.divisionId) query = query.eq("division_id", filters.divisionId);
  if (filters.departmentId)
    query = query.eq("department_id", filters.departmentId);
  if (filters.documentTypeId)
    query = query.eq("document_type_id", filters.documentTypeId);
  if (filters.processCategoryId)
    query = query.eq("process_category_id", filters.processCategoryId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.ownerId) query = query.eq("owner_id", filters.ownerId);
  if (filters.updatedFrom)
    query = query.gte("updated_at", filters.updatedFrom);
  if (filters.updatedTo) query = query.lte("updated_at", filters.updatedTo);

  switch (filters.sort) {
    case "updated_asc":
      query = query.order("updated_at", { ascending: true });
      break;
    case "title_asc":
      query = query.order("title", { ascending: true });
      break;
    default:
      query = query.order("updated_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  const documents = (data || []).map((doc) => ({
    ...doc,
    tags: doc.document_tags?.map((dt: { tag: unknown }) => dt.tag) || [],
  })) as unknown as Document[];

  const total = count || 0;

  return {
    data: documents,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export const getDocumentById = cache(
  async (id: string): Promise<Document | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .select(
        `
      id, title, summary, status, version, file_url, file_name, file_size,
      division_id, department_id, document_type_id, process_category_id,
      owner_id, uploaded_by, updated_by, created_at, updated_at,
      published_at, archived_at,
      division:divisions(id, name),
      department:departments(id, name),
      document_type:document_types(id, name),
      process_category:process_categories(id, name),
      owner:users!documents_owner_id_fkey(id, full_name, email),
      uploader:users!documents_uploaded_by_fkey(id, full_name),
      document_tags(tag:tags(id, name))
    `
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      tags: data.document_tags?.map((dt: { tag: unknown }) => dt.tag) || [],
    } as unknown as Document;
  }
);

export async function getDocumentSignedUrl(filePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, 3600);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function uploadDocument(formData: FormData) {
  const user = await requireUser();

  const file = formData.get("file") as File;
  const tagIdsRaw = formData.get("tag_ids") as string;
  const tagIds = tagIdsRaw ? JSON.parse(tagIdsRaw) : [];

  const raw = {
    title: formData.get("title") as string,
    summary: (formData.get("summary") as string) || null,
    division_id: formData.get("division_id") as string,
    department_id: formData.get("department_id") as string,
    document_type_id: formData.get("document_type_id") as string,
    process_category_id: formData.get("process_category_id") as string,
    owner_id: formData.get("owner_id") as string,
    version: formData.get("version") as string,
    status: formData.get("status") as "draft" | "published" | "archived",
    tag_ids: tagIds,
    file,
  };

  const parsed = documentMetadataSchema.safeParse({
    title: raw.title,
    summary: raw.summary,
    division_id: raw.division_id,
    department_id: raw.department_id,
    document_type_id: raw.document_type_id,
    process_category_id: raw.process_category_id,
    owner_id: raw.owner_id,
    version: raw.version,
    status: raw.status,
    tag_ids: raw.tag_ids,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  if (!canManageDocuments(user, parsed.data.department_id)) {
    return { error: "You do not have permission to upload documents" };
  }

  if (!file || file.type !== "application/pdf") {
    return { error: "Only PDF files are allowed" };
  }

  const supabase = await createClient();
  const storagePath = generateStoragePath(user.id, file.name);

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) return { error: uploadError.message };

  const now = new Date().toISOString();
  const documentData = {
    title: parsed.data.title,
    summary: parsed.data.summary,
    file_url: storagePath,
    file_name: file.name,
    file_size: file.size,
    division_id: parsed.data.division_id,
    department_id: parsed.data.department_id,
    document_type_id: parsed.data.document_type_id,
    process_category_id: parsed.data.process_category_id,
    owner_id: parsed.data.owner_id,
    version: parsed.data.version,
    status: parsed.data.status,
    uploaded_by: user.id,
    updated_by: user.id,
    published_at: parsed.data.status === "published" ? now : null,
    archived_at: parsed.data.status === "archived" ? now : null,
  };

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert(documentData)
    .select("id")
    .single();

  if (docError) {
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    return { error: docError.message };
  }

  if (parsed.data.tag_ids && parsed.data.tag_ids.length > 0) {
    const tagRows = parsed.data.tag_ids.map((tagId) => ({
      document_id: doc.id,
      tag_id: tagId,
    }));
    await supabase.from("document_tags").insert(tagRows);
  }

  await createAuditLog("upload", doc.id, {
    title: parsed.data.title,
    file_name: file.name,
  });

  revalidatePath("/documents");
  return { success: true, id: doc.id };
}

export async function updateDocument(id: string, formData: FormData) {
  const user = await requireUser();
  const tagIdsRaw = formData.get("tag_ids") as string;
  const tagIds = tagIdsRaw ? JSON.parse(tagIdsRaw) : [];

  const raw = {
    title: formData.get("title") as string,
    summary: (formData.get("summary") as string) || null,
    division_id: formData.get("division_id") as string,
    department_id: formData.get("department_id") as string,
    document_type_id: formData.get("document_type_id") as string,
    process_category_id: formData.get("process_category_id") as string,
    owner_id: formData.get("owner_id") as string,
    version: formData.get("version") as string,
    status: formData.get("status") as "draft" | "published" | "archived",
    tag_ids: tagIds,
  };

  const parsed = documentMetadataSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  if (!canManageDocuments(user, parsed.data.department_id)) {
    return { error: "You do not have permission to edit this document" };
  }

  const supabase = await createClient();
  const existing = await getDocumentRecord(id);
  if (!existing) return { error: "Document not found" };

  const now = new Date().toISOString();
  const updateData: Record<string, unknown> = {
    ...parsed.data,
    updated_by: user.id,
  };
  delete updateData.tag_ids;

  if (parsed.data.status === "published" && existing.status !== "published") {
    updateData.published_at = now;
    updateData.archived_at = null;
  } else if (
    parsed.data.status === "archived" &&
    existing.status !== "archived"
  ) {
    updateData.archived_at = now;
  } else if (parsed.data.status === "draft") {
    updateData.published_at = null;
    updateData.archived_at = null;
  }

  const { error } = await supabase
    .from("documents")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: error.message };

  await supabase.from("document_tags").delete().eq("document_id", id);

  if (parsed.data.tag_ids && parsed.data.tag_ids.length > 0) {
    const tagRows = parsed.data.tag_ids.map((tagId) => ({
      document_id: id,
      tag_id: tagId,
    }));
    await supabase.from("document_tags").insert(tagRows);
  }

  const action =
    parsed.data.status !== existing.status
      ? parsed.data.status === "published"
        ? "publish"
        : parsed.data.status === "archived"
          ? "archive"
          : "edit"
      : "edit";

  await createAuditLog(action, id, { title: parsed.data.title });

  revalidatePath("/documents");
  revalidatePath(`/documents/${id}`);
  return { success: true };
}

export async function replaceDocumentFile(id: string, formData: FormData) {
  const user = await requireUser();
  const file = formData.get("file") as File;

  if (!file || file.type !== "application/pdf") {
    return { error: "Only PDF files are allowed" };
  }

  const existing = await getDocumentRecord(id);
  if (!existing) return { error: "Document not found" };

  if (!canManageDocuments(user, existing.department_id)) {
    return { error: "You do not have permission to replace this file" };
  }

  const supabase = await createClient();
  const storagePath = generateStoragePath(user.id, file.name);

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) return { error: uploadError.message };

  const oldPath = existing.file_url;

  const { error: updateError } = await supabase
    .from("documents")
    .update({
      file_url: storagePath,
      file_name: file.name,
      file_size: file.size,
      updated_by: user.id,
    })
    .eq("id", id);

  if (updateError) {
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    return { error: updateError.message };
  }

  await supabase.storage.from(STORAGE_BUCKET).remove([oldPath]);
  await createAuditLog("file_replacement", id, {
    old_file: existing.file_name,
    new_file: file.name,
  });

  revalidatePath(`/documents/${id}`);
  return { success: true };
}

export async function deleteDocument(id: string) {
  const user = await requireUser();
  const existing = await getDocumentRecord(id);
  if (!existing) return { error: "Document not found" };

  if (!canManageDocuments(user, existing.department_id)) {
    return { error: "You do not have permission to delete this document" };
  }

  const supabase = await createClient();
  await createAuditLog("delete", id, { title: existing.title });

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return { error: error.message };

  await supabase.storage.from(STORAGE_BUCKET).remove([existing.file_url]);

  revalidatePath("/documents");
  return { success: true };
}

export const getRecentDocuments = cache(async (limit = 5) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select(
      `
      id, title, status, created_at,
      owner:users!documents_owner_id_fkey(full_name),
      department:departments(name)
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
});
