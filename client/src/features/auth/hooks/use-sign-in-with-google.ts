import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/shared/config/supabase/supabase";

export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
    },
  });
}
