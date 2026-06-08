"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { documentTypeSchema } from "@/lib/validations/document-type";
import { revalidatePath } from "next/cache";

export const getDocumentTypes = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("document_types")
    .select("id, name, description, status, created_at, updated_at")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
});

export async function createDocumentType(formData: FormData) {
  await requireAdmin();
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    status: formData.get("status") as "active" | "inactive",
  };

  const parsed = documentTypeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("document_types").insert(parsed.data);

  if (error) return { error: error.message };

  revalidatePath("/document-types");
  return { success: true };
}

export async function updateDocumentType(id: string, formData: FormData) {
  await requireAdmin();
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    status: formData.get("status") as "active" | "inactive",
  };

  const parsed = documentTypeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("document_types")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/document-types");
  return { success: true };
}

export async function deleteDocumentType(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("document_types")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/document-types");
  return { success: true };
}

export async function toggleDocumentTypeStatus(
  id: string,
  status: "active" | "inactive"
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("document_types")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/document-types");
  return { success: true };
}
