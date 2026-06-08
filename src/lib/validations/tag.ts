import { z } from "zod";

export const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50),
});

export type TagInput = z.infer<typeof tagSchema>;
