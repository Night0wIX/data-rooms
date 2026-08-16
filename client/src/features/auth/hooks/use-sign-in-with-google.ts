import { useMutation } from "@tanstack/react-query";
import { ROUTES } from "@/shared/constants/routes";
import { supabase } from "@/shared/config/supabase/supabase";

export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${ROUTES.dataRooms}`,
        },
      });
      if (error) throw error;
    },
  });
}
