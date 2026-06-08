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
import { FormSelect, SelectItem } from "@/components/shared/form-select";
import {
  createDivision,
  updateDivision,
  deleteDivision,
  toggleDivisionStatus,
} from "@/actions/divisions";
import type { Division } from "@/types/database";
import { formatDate } from "@/lib/format";

interface DivisionsClientProps {
  divisions: Division[];
}

export function DivisionsClient({ divisions }: DivisionsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Division | null>(null);
  const [status, setStatus] = useState<"active" | "inactive">("active");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = editing
        ? await updateDivision(editing.id, formData)
        : await createDivision(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(editing ? "Division updated" : "Division created");
        setDialogOpen(false);
        setEditing(null);
      }
    });
  }

  function openCreate() {
    setEditing(null);
    setStatus("active");
    setDialogOpen(true);
  }

  function openEdit(division: Division) {
    setEditing(division);
    setStatus(division.status);
    setDialogOpen(true);
  }

  const columns: ColumnDef<Division>[] = [
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
            <DropdownMenuItem onClick={() => openEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                startTransition(async () => {
                  const newStatus =
                    row.original.status === "active" ? "inactive" : "active";
                  const result = await toggleDivisionStatus(
                    row.original.id,
                    newStatus
                  );
                  if (result.error) toast.error(result.error);
                  else toast.success(`Division ${newStatus}`);
                })
              }
            >
              <Power className="mr-2 h-4 w-4" />
              {row.original.status === "active" ? "Deactivate" : "Activate"}
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
          <DialogTrigger render={<Button onClick={openCreate} />}>
            Add Division
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Division" : "Create Division"}
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
                <FormSelect
                  name="status"
                  value={status}
                  onValueChange={(v) => setStatus(v as "active" | "inactive")}
                >
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </FormSelect>
              </div>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={divisions} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Division"
        description="Are you sure you want to delete this division? This action cannot be undone."
        onConfirm={() => {
          if (!deleteId) return;
          startTransition(async () => {
            const result = await deleteDivision(deleteId);
            if (result.error) toast.error(result.error);
            else toast.success("Division deleted");
            setDeleteId(null);
          });
        }}
        loading={isPending}
      />
    </>
  );
}
