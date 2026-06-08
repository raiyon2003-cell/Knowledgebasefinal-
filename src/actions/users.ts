"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { inviteUserSchema, userSchema } from "@/lib/validations/user";
import type { User } from "@/types/database";
import { revalidatePath } from "next/cache";

export const getUsers = cache(async () => {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, full_name, email, role, status, department_id, created_at, updated_at, department:departments!users_department_id_fkey(id, name)"
    )
    .order("full_name");

  if (error) throw new Error(error.message);
  return data as unknown as User[];
});

export const getActiveUsers = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, role, department_id")
    .eq("status", "active")
    .order("full_name");

  if (error) throw new Error(error.message);
  return data;
});

export async function inviteUser(formData: FormData) {
  await requireAdmin();

  const departmentId = formData.get("department_id") as string;
  const raw = {
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as
      | "admin"
      | "department_manager"
      | "team_member"
      | "view_only",
    department_id:
      departmentId && departmentId !== "none" ? departmentId : null,
    status: formData.get("status") as "active" | "inactive",
    password: formData.get("password") as string,
  };

  const parsed = inviteUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const adminClient = createAdminClient();
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        email_confirm: true,
        user_metadata: {
          full_name: parsed.data.full_name,
          role: parsed.data.role,
        },
      });

    if (authError) return { error: authError.message };

    if (authData.user) {
      await adminClient
        .from("users")
        .update({
          full_name: parsed.data.full_name,
          role: parsed.data.role,
          department_id: parsed.data.department_id,
          status: parsed.data.status,
        })
        .eq("id", authData.user.id);
    }
  } else {
    const { error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.full_name,
          role: parsed.data.role,
        },
      },
    });

    if (signUpError) return { error: signUpError.message };

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", parsed.data.email)
      .single();

    if (existingUser) {
      await supabase
        .from("users")
        .update({
          full_name: parsed.data.full_name,
          role: parsed.data.role,
          department_id: parsed.data.department_id,
          status: parsed.data.status,
        })
        .eq("id", existingUser.id);
    }
  }

  revalidatePath("/users");
  return { success: true };
}

export async function updateUser(id: string, formData: FormData) {
  await requireAdmin();

  const departmentId = formData.get("department_id") as string;
  const raw = {
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as
      | "admin"
      | "department_manager"
      | "team_member"
      | "view_only",
    department_id:
      departmentId && departmentId !== "none" ? departmentId : null,
    status: formData.get("status") as "active" | "inactive",
  };

  const parsed = userSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({
      full_name: parsed.data.full_name,
      role: parsed.data.role,
      department_id: parsed.data.department_id,
      status: parsed.data.status,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/users");
  return { success: true };
}

export async function toggleUserStatus(id: string, status: "active" | "inactive") {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/users");
  return { success: true };
}
