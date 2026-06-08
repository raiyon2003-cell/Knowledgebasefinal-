import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireUser } from "@/lib/auth";
import { getRoleLabel } from "@/lib/permissions";
import { APP_NAME, MAX_FILE_SIZE_MB } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Application and account settings"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{user.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium">{getRoleLabel(user.role)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">
                {user.department?.name || "Not assigned"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">{formatDate(user.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Application</p>
              <p className="font-medium">{APP_NAME}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Upload Size</p>
              <p className="font-medium">{MAX_FILE_SIZE_MB} MB</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Allowed File Types</p>
              <p className="font-medium">PDF only</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Storage</p>
              <p className="font-medium">Supabase Storage (documents bucket)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <LogoutButton variant="outline" />
      </div>
    </>
  );
}
