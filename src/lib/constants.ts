import type { UserRole } from "@/types/database";

export const APP_NAME = "SegWitz Knowledge Base";

export const ROLES: { value: UserRole; label: string; description: string }[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Full access to all features and settings",
  },
  {
    value: "department_manager",
    label: "Department Manager",
    description: "Manage documents in assigned department",
  },
  {
    value: "team_member",
    label: "Team Member",
    description: "Browse, search, and view documents",
  },
  {
    value: "view_only",
    label: "View Only",
    description: "View permitted documents only",
  },
];

export const DOCUMENT_STATUSES = [
  { value: "draft" as const, label: "Draft" },
  { value: "published" as const, label: "Published" },
  { value: "archived" as const, label: "Archived" },
];

export const ENTITY_STATUSES = [
  { value: "active" as const, label: "Active" },
  { value: "inactive" as const, label: "Inactive" },
];

export const AUDIT_ACTIONS = [
  { value: "upload" as const, label: "Upload" },
  { value: "edit" as const, label: "Edit" },
  { value: "delete" as const, label: "Delete" },
  { value: "publish" as const, label: "Publish" },
  { value: "archive" as const, label: "Archive" },
  { value: "file_replacement" as const, label: "File Replacement" },
];

export const DEFAULT_PAGE_SIZE = 10;

export const MAX_FILE_SIZE_MB = Number(
  process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "50"
);

export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const STORAGE_BUCKET = "documents";

export const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Documents", href: "/documents", icon: "FileText" },
  { title: "Divisions", href: "/divisions", icon: "Building2", adminOnly: true },
  {
    title: "Departments",
    href: "/departments",
    icon: "Users",
    adminOnly: true,
  },
  {
    title: "Document Types",
    href: "/document-types",
    icon: "FolderOpen",
    adminOnly: true,
  },
  {
    title: "Process Categories",
    href: "/process-categories",
    icon: "Layers",
    adminOnly: true,
  },
  { title: "Tags", href: "/tags", icon: "Tags", adminOnly: true },
  { title: "Users", href: "/users", icon: "UserCog", adminOnly: true },
  {
    title: "Audit Logs",
    href: "/audit-logs",
    icon: "ScrollText",
    adminOrManager: true,
  },
  { title: "Settings", href: "/settings", icon: "Settings" },
] as const;
