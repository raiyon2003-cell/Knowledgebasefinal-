import { z } from "zod";

export const userSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100),
  email: z.string().email("Valid email is required"),
  role: z.enum([
    "admin",
    "department_manager",
    "team_member",
    "view_only",
  ]),
  department_id: z.string().uuid().optional().nullable(),
  status: z.enum(["active", "inactive"]),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

export type UserInput = z.infer<typeof userSchema>;

export const inviteUserSchema = userSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
