import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { UsersClient } from "@/components/admin/users-client";
import { getUsers } from "@/actions/users";
import { getDepartments } from "@/actions/departments";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Users",
};

export default async function UsersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const [users, departments] = await Promise.all([
    getUsers(),
    getDepartments(),
  ]);

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage user accounts, roles, and permissions"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Users" },
        ]}
      />
      <UsersClient
        users={users}
        departments={departments.filter((d) => d.status === "active")}
      />
    </>
  );
}
