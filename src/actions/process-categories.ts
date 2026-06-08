"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { processCategorySchema } from "@/lib/validations/process-category";
import { revalidatePath } from "next/cache";

export const getProcessCategories = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("process_categories")
    .select("id, name, description, status, created_at, updated_at")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
});

export async function createProcessCategory(formData: FormData) {
  await requireAdmin();
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    status: formData.get("status") as "active" | "inactive",
  };

  const parsed = processCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("process_categories")
    .insert(parsed.data);

  if (error) return { error: error.message };

  revalidatePath("/process-categories");
  return { success: true };
}

export async function updateProcessCategory(id: string, formData: FormData) {
  await requireAdmin();
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    status: formData.get("status") as "active" | "inactive",
  };

  const parsed = processCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("process_categories")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/process-categories");
  return { success: true };
}

export async function deleteProcessCategory(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("process_categories")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/process-categories");
  return { success: true };
}

export async function toggleProcessCategoryStatus(
  id: string,
  status: "active" | "inactive"
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("process_categories")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/process-categories");
  return { success: true };
}
