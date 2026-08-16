import { useMutation } from "@tanstack/react-query";
import type { SignUpFormValues } from "../schemas/sign-up.schema";
import { supabase } from "@/shared/config/supabase/supabase";

interface SignUpResult {
  requiresEmailConfirmation: boolean;
}

export function useSignUp() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: SignUpFormValues): Promise<SignUpResult> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });

      if (error) throw error;

      return { requiresEmailConfirmation: data.session === null };
    },
  });
}
