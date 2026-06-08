"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect, SelectItem } from "@/components/shared/form-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { uploadDocument } from "@/actions/documents";
import { MAX_FILE_SIZE_MB } from "@/lib/constants";
import { formatFileSize } from "@/lib/format";
import type {
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

interface DocumentUploadFormProps {
  divisions: Division[];
  departments: DepartmentOption[];
  documentTypes: DocumentType[];
  processCategories: ProcessCategory[];
  tags: Tag[];
  owners: Pick<User, "id" | "full_name">[];
  currentUserId: string;
}

export function DocumentUploadForm({
  divisions,
  departments: allDepartments,
  documentTypes,
  processCategories,
  tags,
  owners,
  currentUserId,
}: DocumentUploadFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [divisionId, setDivisionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [processCategoryId, setProcessCategoryId] = useState("");
  const [ownerId, setOwnerId] = useState(currentUserId);
  const [status, setStatus] = useState("draft");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setFile(selected);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("file", file);
    formData.set("tag_ids", JSON.stringify(selectedTags));

    startTransition(async () => {
      const result = await uploadDocument(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Document uploaded successfully");
        router.push(`/documents/${result.id}`);
      }
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
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">PDF Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              file ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
          >
            {file ? (
              <>
                <FileText className="mb-2 h-10 w-10 text-primary" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setFile(null)}
                >
                  Remove
                </Button>
              </>
            ) : (
              <>
                <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="mb-1 font-medium">Upload PDF Document</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  PDF only, max {MAX_FILE_SIZE_MB}MB
                </p>
                <Label htmlFor="file-upload">
                  <span className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted">
                    Select File
                  </span>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" name="summary" rows={3} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Division</Label>
              <FormSelect
                name="division_id"
                value={divisionId}
                onValueChange={handleDivisionChange}
                placeholder="Select division"
                required
              >
                {divisions.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </FormSelect>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <FormSelect
                name="department_id"
                value={departmentId}
                onValueChange={setDepartmentId}
                placeholder="Select department"
                required
                disabled={!divisionId}
              >
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </FormSelect>
              {divisionId && departments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No departments in this division.{" "}
                  <Link href="/departments" className="text-primary underline">
                    Add a department
                  </Link>{" "}
                  first.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <FormSelect
                name="document_type_id"
                value={documentTypeId}
                onValueChange={setDocumentTypeId}
                placeholder="Select type"
                required
              >
                {documentTypes.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </FormSelect>
            </div>

            <div className="space-y-2">
              <Label>Process Category</Label>
              <FormSelect
                name="process_category_id"
                value={processCategoryId}
                onValueChange={setProcessCategoryId}
                placeholder="Select category"
                required
              >
                {processCategories.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </FormSelect>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Owner</Label>
              <FormSelect
                name="owner_id"
                value={ownerId}
                onValueChange={setOwnerId}
                required
              >
                {owners.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.full_name}
                  </SelectItem>
                ))}
              </FormSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input id="version" name="version" defaultValue="1.0" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <FormSelect
              name="status"
              value={status}
              onValueChange={setStatus}
            >
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </FormSelect>
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

          <Button type="submit" disabled={isPending || !file} className="w-full">
            {isPending ? "Uploading..." : "Upload Document"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
