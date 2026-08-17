import { createClient } from "@supabase/supabase-js";
import { envConfig } from "../env/env";

export const supabase = createClient(
  envConfig.supabase.url,
  envConfig.supabase.anonKey,
  {
    auth: {
      flowType: "pkce",
    },
  },
);
