import { Navigate, Outlet } from "react-router-dom";
import { Loading } from "@/pages/loading";
import { ROUTES } from "@/shared/constants/routes";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";

export function PublicRoute() {
  const { isAuthenticated, isInitializing } = useAuthSession();

  if (isInitializing) return <Loading />;
  if (isAuthenticated) return <Navigate to={ROUTES.dataRooms} replace />;

  return <Outlet />;
}
