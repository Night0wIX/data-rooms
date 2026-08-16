import { z } from "zod";

export const createDataRoomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  description: z.string().trim().max(500, "Description is too long"),
});

export type CreateDataRoomFormValues = z.infer<typeof createDataRoomSchema>;
