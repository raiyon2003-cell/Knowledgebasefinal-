export type UserRole =
  | "admin"
  | "department_manager"
  | "team_member"
  | "view_only";

export type EntityStatus = "active" | "inactive";

export type DocumentStatus = "draft" | "published" | "archived";

export type AuditAction =
  | "upload"
  | "edit"
  | "delete"
  | "publish"
  | "archive"
  | "file_replacement";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department_id: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
  department?: Department | null;
}

export interface Division {
  id: string;
  name: string;
  description: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  division_id: string;
  name: string;
  manager_id: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
  division?: Division;
  manager?: User | null;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface ProcessCategory {
  id: string;
  name: string;
  description: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  summary: string | null;
  file_url: string;
  file_name: string;
  file_size: number;
  division_id: string;
  department_id: string;
  document_type_id: string;
  process_category_id: string;
  owner_id: string;
  version: string;
  status: DocumentStatus;
  uploaded_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  archived_at: string | null;
  division?: Division;
  department?: Department;
  document_type?: DocumentType;
  process_category?: ProcessCategory;
  owner?: User;
  uploader?: User;
  tags?: Tag[];
}

export interface DocumentTag {
  id: string;
  document_id: string;
  tag_id: string;
}

export interface AuditLog {
  id: string;
  document_id: string | null;
  action: AuditAction;
  user_id: string;
  details: Record<string, unknown>;
  created_at: string;
  user?: User;
  document?: Document | null;
}

export interface DashboardMetrics {
  totalDocuments: number;
  publishedDocuments: number;
  draftDocuments: number;
  archivedDocuments: number;
}

export interface ChartDataPoint {
  name: string;
  count: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DocumentFilters {
  search?: string;
  divisionId?: string;
  departmentId?: string;
  documentTypeId?: string;
  processCategoryId?: string;
  status?: DocumentStatus;
  ownerId?: string;
  updatedFrom?: string;
  updatedTo?: string;
  sort?: "updated_desc" | "updated_asc" | "title_asc";
  page?: number;
  pageSize?: number;
}
