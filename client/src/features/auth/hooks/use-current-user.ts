import { useQuery } from "@tanstack/react-query";
import { authService } from "../api/auth.service";
import { useAuthSession } from "./use-auth-session";
import { authKeys } from "../api/auth.keys";

export function useCurrentUser() {
  const { isAuthenticated } = useAuthSession();

  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
  });
}
