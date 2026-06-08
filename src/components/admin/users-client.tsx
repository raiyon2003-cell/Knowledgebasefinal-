"use client";

import { useState, useTransition } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Power } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { inviteUser, updateUser, toggleUserStatus } from "@/actions/users";
import { ROLES } from "@/lib/constants";
import { getRoleLabel } from "@/lib/permissions";
import type { User, Department } from "@/types/database";
import { formatDate } from "@/lib/format";

interface UsersClientProps {
  users: User[];
  departments: Department[];
}

export function UsersClient({ users, departments }: UsersClientProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [isInvite, setIsInvite] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isInvite
        ? await inviteUser(formData)
        : editing
          ? await updateUser(editing.id, formData)
          : { error: "Invalid operation" };

      if (result.error) toast.error(result.error);
      else {
        toast.success(isInvite ? "User added" : "User updated");
        setDialogOpen(false);
        setEditing(null);
        setIsInvite(false);
      }
    });
  }

  const columns: ColumnDef<User>[] = [
    { accessorKey: "full_name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => getRoleLabel(row.original.role),
    },
    {
      accessorKey: "department.name",
      header: "Department",
      cell: ({ row }) => row.original.department?.name || "—",
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
                setIsInvite(false);
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
                  const result = await toggleUserStatus(
                    row.original.id,
                    newStatus
                  );
                  if (result.error) toast.error(result.error);
                  else toast.success(`User ${newStatus}`);
                })
              }
            >
              <Power className="mr-2 h-4 w-4" />
              {row.original.status === "active" ? "Deactivate" : "Activate"}
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
                  setIsInvite(true);
                  setDialogOpen(true);
                }}
              />
            }
          >
            Add User
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isInvite ? "Add User" : "Edit User"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={editing?.full_name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editing?.email}
                  required
                  disabled={!isInvite}
                />
              </div>
              {isInvite && (
                <div className="space-y-2">
                  <Label htmlFor="password">Temporary Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Role</Label>
                <Select name="role" defaultValue={editing?.role || "team_member"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  name="department_id"
                  defaultValue={editing?.department_id || "none"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
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
                {isPending ? "Saving..." : isInvite ? "Add" : "Update"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={users} />
    </>
  );
}
