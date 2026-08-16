import { supabase } from "@/shared/config/supabase/supabase";
import { useMutation } from "@tanstack/react-query";

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  });
}
