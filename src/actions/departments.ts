"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { departmentSchema } from "@/lib/validations/department";
import type { Department } from "@/types/database";
import { revalidatePath } from "next/cache";

export const getDepartments = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select(
      "id, name, status, division_id, manager_id, created_at, updated_at, division:divisions(id, name), manager:users!departments_manager_id_fkey(id, full_name)"
    )
    .order("name");

  if (error) throw new Error(error.message);
  return data as unknown as Department[];
});

export const getActiveDepartments = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("id, name, division_id")
    .eq("status", "active")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
});

export async function getDepartmentsByDivision(divisionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("division_id", divisionId)
    .eq("status", "active")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function createDepartment(formData: FormData) {
  await requireAdmin();
  const managerId = formData.get("manager_id") as string;
  const raw = {
    division_id: formData.get("division_id") as string,
    name: formData.get("name") as string,
    manager_id: managerId && managerId !== "none" ? managerId : null,
    status: formData.get("status") as "active" | "inactive",
  };

  const parsed = departmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("departments").insert(parsed.data);

  if (error) return { error: error.message };

  revalidatePath("/departments");
  return { success: true };
}

export async function updateDepartment(id: string, formData: FormData) {
  await requireAdmin();
  const managerId = formData.get("manager_id") as string;
  const raw = {
    division_id: formData.get("division_id") as string,
    name: formData.get("name") as string,
    manager_id: managerId && managerId !== "none" ? managerId : null,
    status: formData.get("status") as "active" | "inactive",
  };

  const parsed = departmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("departments")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/departments");
  return { success: true };
}

export async function deleteDepartment(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("departments").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/departments");
  return { success: true };
}

export async function toggleDepartmentStatus(
  id: string,
  status: "active" | "inactive"
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("departments")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/departments");
  return { success: true };
}
