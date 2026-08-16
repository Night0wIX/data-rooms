import { envSchema } from "@/app/config/env/env.schema";

const env = envSchema.parse(import.meta.env);

export const envConfig = {
  app: {
    mode: env.MODE,
    port: env.VITE_PORT,
    previewPort: env.VITE_PREVIEW_PORT,
  },
  api: {
    url: env.VITE_API_URL,
  },
  supabase: {
    url: env.VITE_SUPABASE_URL,
    anonKey: env.VITE_SUPABASE_ANON_KEY,
  },
} as const;