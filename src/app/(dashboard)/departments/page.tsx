import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { DepartmentsClient } from "@/components/admin/departments-client";
import { getDepartments } from "@/actions/departments";
import { getDivisions } from "@/actions/divisions";
import { getActiveUsers } from "@/actions/users";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Departments",
};

export default async function DepartmentsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const [departments, divisions, managers] = await Promise.all([
    getDepartments(),
    getDivisions(),
    getActiveUsers(),
  ]);

  return (
    <>
      <PageHeader
        title="Departments"
        description="Manage departments within divisions"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Departments" },
        ]}
      />
      <DepartmentsClient
        departments={departments}
        divisions={divisions.filter((d) => d.status === "active")}
        managers={managers}
      />
    </>
  );
}
