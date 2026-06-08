import { z } from "zod";
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";

export const documentMetadataSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  summary: z.string().max(2000).optional().nullable(),
  division_id: z.string().uuid("Division is required"),
  department_id: z.string().uuid("Department is required"),
  document_type_id: z.string().uuid("Document type is required"),
  process_category_id: z.string().uuid("Process category is required"),
  owner_id: z.string().uuid("Owner is required"),
  version: z.string().min(1, "Version is required").max(20),
  status: z.enum(["draft", "published", "archived"]),
  tag_ids: z.array(z.string().uuid()).optional().default([]),
});

export const documentUploadSchema = documentMetadataSchema.extend({
  file: z
    .instanceof(File, { message: "PDF file is required" })
    .refine((file) => file.type === "application/pdf", {
      message: "Only PDF files are allowed",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE_BYTES, {
      message: `File size must be less than ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
    }),
});

export const documentUpdateSchema = documentMetadataSchema.partial().extend({
  id: z.string().uuid(),
});

export type DocumentMetadataInput = z.infer<typeof documentMetadataSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;
