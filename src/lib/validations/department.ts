import { z } from "zod";

export const departmentSchema = z.object({
  division_id: z.string().uuid("Division is required"),
  name: z.string().min(1, "Name is required").max(100),
  manager_id: z.string().uuid().optional().nullable(),
  status: z.enum(["active", "inactive"]),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;
