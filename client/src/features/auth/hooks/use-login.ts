import { supabase } from "@/shared/config/supabase/supabase";
import { useMutation } from "@tanstack/react-query";
import type { LoginFormValues } from "../schemas/login.schema";

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: LoginFormValues) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
  });
}
