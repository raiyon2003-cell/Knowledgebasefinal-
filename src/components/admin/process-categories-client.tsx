"use client";

import { useState, useTransition } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Power } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  createProcessCategory,
  updateProcessCategory,
  deleteProcessCategory,
  toggleProcessCategoryStatus,
} from "@/actions/process-categories";
import type { ProcessCategory } from "@/types/database";
import { formatDate } from "@/lib/format";

interface ProcessCategoriesClientProps {
  processCategories: ProcessCategory[];
}

export function ProcessCategoriesClient({
  processCategories,
}: ProcessCategoriesClientProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProcessCategory | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = editing
        ? await updateProcessCategory(editing.id, formData)
        : await createProcessCategory(formData);

      if (result.error) toast.error(result.error);
      else {
        toast.success(
          editing ? "Process category updated" : "Process category created"
        );
        setDialogOpen(false);
        setEditing(null);
      }
    });
  }

  const columns: ColumnDef<ProcessCategory>[] = [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditing(row.original);
                setDialogOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                startTransition(async () => {
                  const newStatus =
                    row.original.status === "active" ? "inactive" : "active";
                  const result = await toggleProcessCategoryStatus(
                    row.original.id,
                    newStatus
                  );
                  if (result.error) toast.error(result.error);
                  else toast.success(`Process category ${newStatus}`);
                })
              }
            >
              <Power className="mr-2 h-4 w-4" />
              Toggle Status
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              />
            }
          >
            Add Process Category
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Process Category" : "Create Process Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editing?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editing?.description || ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={editing?.status || "active"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={processCategories} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Process Category"
        description="Are you sure you want to delete this process category?"
        onConfirm={() => {
          if (!deleteId) return;
          startTransition(async () => {
            const result = await deleteProcessCategory(deleteId);
            if (result.error) toast.error(result.error);
            else toast.success("Process category deleted");
            setDeleteId(null);
          });
        }}
        loading={isPending}
      />
    </>
  );
}
