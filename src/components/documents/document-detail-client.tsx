"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updateDocument,
  deleteDocument,
  replaceDocumentFile,
} from "@/actions/documents";
import { formatDate, formatFileSize } from "@/lib/format";
import { PdfViewer } from "@/components/documents/pdf-viewer-wrapper";
import type {
  Document,
  Division,
  DocumentType,
  ProcessCategory,
  Tag,
  User,
} from "@/types/database";

interface DepartmentOption {
  id: string;
  name: string;
  division_id: string;
}

interface DocumentDetailClientProps {
  document: Document;
  signedUrl: string;
  divisions: Division[];
  departments: DepartmentOption[];
  documentTypes: DocumentType[];
  processCategories: ProcessCategory[];
  tags: Tag[];
  owners: Pick<User, "id" | "full_name">[];
  canEdit: boolean;
}

export function DocumentDetailClient({
  document,
  signedUrl,
  divisions,
  departments: allDepartments,
  documentTypes,
  processCategories,
  tags,
  owners,
  canEdit,
}: DocumentDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [divisionId, setDivisionId] = useState(document.division_id);
  const [departmentId, setDepartmentId] = useState(document.department_id);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    document.tags?.map((t) => t.id) || []
  );

  const departments = useMemo(
    () =>
      divisionId
        ? allDepartments.filter((d) => d.division_id === divisionId)
        : [],
    [allDepartments, divisionId]
  );

  function handleDivisionChange(value: string) {
    setDivisionId(value);
    setDepartmentId("");
  }

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("tag_ids", JSON.stringify(selectedTags));

    startTransition(async () => {
      const result = await updateDocument(document.id, formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Document updated");
        setEditOpen(false);
      }
    });
  }

  function handleReplaceFile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await replaceDocumentFile(document.id, formData);
      if (result.error) toast.error(result.error);
      else toast.success("File replaced successfully");
    });
  }

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{document.title}</CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={document.status} />
              <span className="text-sm text-muted-foreground">
                v{document.version}
              </span>
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger render={<Button variant="outline" size="sm" />}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Edit Document</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={document.title}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="summary">Summary</Label>
                      <Textarea
                        id="summary"
                        name="summary"
                        defaultValue={document.summary || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Division</Label>
                      <Select
                        name="division_id"
                        value={divisionId}
                        onValueChange={(v) => handleDivisionChange(v || "")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {divisions.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select
                        name="department_id"
                        value={departmentId}
                        onValueChange={(v) => setDepartmentId(v || "")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Document Type</Label>
                      <Select
                        name="document_type_id"
                        defaultValue={document.document_type_id}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Process Category</Label>
                      <Select
                        name="process_category_id"
                        defaultValue={document.process_category_id}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {processCategories.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Owner</Label>
                      <Select name="owner_id" defaultValue={document.owner_id}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {owners.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        name="version"
                        defaultValue={document.version}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select name="status" defaultValue={document.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {tags.length > 0 && (
                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-3">
                          {tags.map((tag) => (
                            <label
                              key={tag.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Checkbox
                                checked={selectedTags.includes(tag.id)}
                                onCheckedChange={() => toggleTag(tag.id)}
                              />
                              {tag.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button type="submit" disabled={isPending} className="w-full">
                      {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger
                  render={<Button variant="outline" size="sm" />}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Replace File
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Replace PDF File</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleReplaceFile} className="space-y-4">
                    <Input
                      name="file"
                      type="file"
                      accept="application/pdf"
                      required
                    />
                    <Button type="submit" disabled={isPending} className="w-full">
                      {isPending ? "Uploading..." : "Replace File"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">Summary</dt>
              <dd className="mt-1">{document.summary || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Division</dt>
              <dd className="mt-1">{document.division?.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Department</dt>
              <dd className="mt-1">{document.department?.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Document Type</dt>
              <dd className="mt-1">{document.document_type?.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Process Category</dt>
              <dd className="mt-1">{document.process_category?.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Owner</dt>
              <dd className="mt-1">{document.owner?.full_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">File</dt>
              <dd className="mt-1">
                {document.file_name} ({formatFileSize(document.file_size)})
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Tags</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {document.tags?.length ? (
                  document.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Created</dt>
              <dd className="mt-1">{formatDate(document.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Updated</dt>
              <dd className="mt-1">{formatDate(document.updated_at)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <PdfViewer url={signedUrl} fileName={document.file_name} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        onConfirm={() => {
          startTransition(async () => {
            const result = await deleteDocument(document.id);
            if (result.error) toast.error(result.error);
            else {
              toast.success("Document deleted");
              router.push("/documents");
            }
          });
        }}
        loading={isPending}
      />
    </div>
  );
}
