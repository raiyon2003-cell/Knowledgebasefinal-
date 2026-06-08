"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { tagSchema } from "@/lib/validations/tag";
import { revalidatePath } from "next/cache";

export const getTags = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, created_at")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
});

export async function createTag(formData: FormData) {
  await requireAdmin();
  const raw = {
    name: formData.get("name") as string,
  };

  const parsed = tagSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tags").insert(parsed.data);

  if (error) return { error: error.message };

  revalidatePath("/tags");
  return { success: true };
}

export async function updateTag(id: string, formData: FormData) {
  await requireAdmin();
  const raw = {
    name: formData.get("name") as string,
  };

  const parsed = tagSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tags").update(parsed.data).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/tags");
  return { success: true };
}

export async function deleteTag(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/tags");
  return { success: true };
}
