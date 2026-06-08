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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
} from "@/actions/departments";
import type { Department, Division, User } from "@/types/database";
import { formatDate } from "@/lib/format";

interface DepartmentsClientProps {
  departments: Department[];
  divisions: Division[];
  managers: Pick<User, "id" | "full_name">[];
}

export function DepartmentsClient({
  departments,
  divisions,
  managers,
}: DepartmentsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Department | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = editing
        ? await updateDepartment(editing.id, formData)
        : await createDepartment(formData);

      if (result.error) toast.error(result.error);
      else {
        toast.success(editing ? "Department updated" : "Department created");
        setDialogOpen(false);
        setEditing(null);
      }
    });
  }

  const columns: ColumnDef<Department>[] = [
    { accessorKey: "name", header: "Department" },
    {
      accessorKey: "division.name",
      header: "Division",
      cell: ({ row }) => row.original.division?.name || "—",
    },
    {
      accessorKey: "manager.full_name",
      header: "Manager",
      cell: ({ row }) => row.original.manager?.full_name || "—",
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
                  const result = await toggleDepartmentStatus(
                    row.original.id,
                    newStatus
                  );
                  if (result.error) toast.error(result.error);
                  else toast.success(`Department ${newStatus}`);
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
            Add Department
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Department" : "Create Department"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Division</Label>
                <Select
                  name="division_id"
                  defaultValue={editing?.division_id}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
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
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editing?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Manager</Label>
                <Select
                  name="manager_id"
                  defaultValue={editing?.manager_id || "none"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {managers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      <DataTable columns={columns} data={departments} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Department"
        description="Are you sure you want to delete this department?"
        onConfirm={() => {
          if (!deleteId) return;
          startTransition(async () => {
            const result = await deleteDepartment(deleteId);
            if (result.error) toast.error(result.error);
            else toast.success("Department deleted");
            setDeleteId(null);
          });
        }}
        loading={isPending}
      />
    </>
  );
}
