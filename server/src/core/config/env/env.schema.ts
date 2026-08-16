import { z } from "zod";
import { DEFAULT_NODE_ENV, DEFAULT_PORT, ENVIRONMENTS, MAX_PORT } from "./env.constants.js";

export const envSchema = z.object({
  // Runtime
  NODE_ENV: z.enum(ENVIRONMENTS).default(DEFAULT_NODE_ENV),
  PORT: z.coerce.number().int().positive().max(MAX_PORT).default(DEFAULT_PORT),

  // Database
  DATABASE_URL: z.url(),

  // Supabase
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),

  // CORS
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173")
    .transform((value) => value.split(",").map((origin) => origin.trim())),
});
