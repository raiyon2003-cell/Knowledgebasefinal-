import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import type { User } from "@/types/database";
import { redirect } from "next/navigation";

const USER_SELECT =
  "id, full_name, email, role, department_id, status, created_at, updated_at, department:departments!users_department_id_fkey(id, name)";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .eq("id", authUser.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as User;
});

export const requireUser = cache(async (): Promise<User> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.status !== "active") redirect("/login?error=inactive");
  return user;
});

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export async function createAuditLog(
  action: string,
  documentId: string | null,
  details: Record<string, unknown> = {}
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("audit_logs").insert({
    action,
    document_id: documentId,
    user_id: user.id,
    details,
  });
}
