import { z } from "zod";
import { DEFAULT_PORT, DEFAULT_PREVIEW_PORT, ENVIRONMENT, MAX_PORT, MIN_PORT } from "./env.constants";


const portSchema = z.coerce.number().int().min(MIN_PORT).max(MAX_PORT);

export const envSchema = z.object({
  MODE: z.enum([ENVIRONMENT.development, ENVIRONMENT.production]),
  VITE_PORT: portSchema.default(DEFAULT_PORT),
  VITE_PREVIEW_PORT: portSchema.default(DEFAULT_PREVIEW_PORT),
  VITE_API_URL: z.url(),
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});