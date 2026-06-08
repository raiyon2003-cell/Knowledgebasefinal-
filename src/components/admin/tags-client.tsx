"use client";

import { useState, useTransition } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
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
import { createTag, updateTag, deleteTag } from "@/actions/tags";
import type { Tag } from "@/types/database";
import { formatDate } from "@/lib/format";

interface TagsClientProps {
  tags: Tag[];
}

export function TagsClient({ tags }: TagsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Tag | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = editing
        ? await updateTag(editing.id, formData)
        : await createTag(formData);

      if (result.error) toast.error(result.error);
      else {
        toast.success(editing ? "Tag updated" : "Tag created");
        setDialogOpen(false);
        setEditing(null);
      }
    });
  }

  const columns: ColumnDef<Tag>[] = [
    { accessorKey: "name", header: "Tag Name" },
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
            Add Tag
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Tag" : "Create Tag"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tag Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editing?.name}
                  required
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={tags} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Tag"
        description="Are you sure you want to delete this tag?"
        onConfirm={() => {
          if (!deleteId) return;
          startTransition(async () => {
            const result = await deleteTag(deleteId);
            if (result.error) toast.error(result.error);
            else toast.success("Tag deleted");
            setDeleteId(null);
          });
        }}
        loading={isPending}
      />
    </>
  );
}
