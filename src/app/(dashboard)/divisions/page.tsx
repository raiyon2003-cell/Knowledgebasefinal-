import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { DivisionsClient } from "@/components/admin/divisions-client";
import { getDivisions } from "@/actions/divisions";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Divisions",
};

export default async function DivisionsPage() {
  await requireAdmin();

  const divisions = await getDivisions();

  return (
    <>
      <PageHeader
        title="Divisions"
        description="Manage organizational divisions"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Divisions" },
        ]}
      />
      <DivisionsClient divisions={divisions} />
    </>
  );
}
