"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { divisionSchema } from "@/lib/validations/division";
import { revalidatePath } from "next/cache";

export const getDivisions = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("divisions")
    .select("id, name, description, status, created_at, updated_at")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
});

export async function createDivision(formData: FormData) {
  await requireAdmin();
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    status: formData.get("status") as "active" | "inactive",
  };

  const parsed = divisionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("divisions").insert(parsed.data);

  if (error) return { error: error.message };

  revalidatePath("/divisions");
  return { success: true };
}

export async function updateDivision(id: string, formData: FormData) {
  await requireAdmin();
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    status: formData.get("status") as "active" | "inactive",
  };

  const parsed = divisionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("divisions")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/divisions");
  return { success: true };
}

export async function deleteDivision(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("divisions").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/divisions");
  return { success: true };
}

export async function toggleDivisionStatus(
  id: string,
  status: "active" | "inactive"
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("divisions")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/divisions");
  return { success: true };
}
