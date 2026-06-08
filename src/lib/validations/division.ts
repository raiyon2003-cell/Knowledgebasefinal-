import { z } from "zod";

export const divisionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(["active", "inactive"]),
});

export type DivisionInput = z.infer<typeof divisionSchema>;
