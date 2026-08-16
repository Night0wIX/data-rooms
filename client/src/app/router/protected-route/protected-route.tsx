import { Navigate, Outlet } from "react-router-dom";
import { Loading } from "@/pages/loading";
import { ROUTES } from "@/shared/constants/routes";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuthSession();

  if (isInitializing) return <Loading />;
  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />;

  return <Outlet />;
}
