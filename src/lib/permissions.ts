import type { User, UserRole } from "@/types/database";

export function canManageUsers(role: UserRole): boolean {
  return role === "admin";
}

export function canManageMasterData(role: UserRole): boolean {
  return role === "admin";
}

export function canManageDocuments(user: User, departmentId?: string): boolean {
  if (user.status !== "active") return false;
  if (user.role === "admin") return true;
  if (user.role === "department_manager") {
    return departmentId ? user.department_id === departmentId : true;
  }
  return false;
}

export function canUploadDocuments(user: User): boolean {
  return canManageDocuments(user);
}

export function canEditDocument(user: User, documentDepartmentId: string): boolean {
  return canManageDocuments(user, documentDepartmentId);
}

export function canViewAuditLogs(role: UserRole): boolean {
  return role === "admin" || role === "department_manager";
}

export function canBrowseDocuments(user: User): boolean {
  return user.status === "active";
}

export function isReadOnlyUser(role: UserRole): boolean {
  return role === "view_only" || role === "team_member";
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Admin",
    department_manager: "Department Manager",
    team_member: "Team Member",
    view_only: "View Only",
  };
  return labels[role];
}
