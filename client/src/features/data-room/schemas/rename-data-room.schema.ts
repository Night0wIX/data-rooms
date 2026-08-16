import { z } from "zod";

export const renameDataRoomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or fewer"),
});

export type RenameDataRoomFormValues = z.infer<typeof renameDataRoomSchema>;
