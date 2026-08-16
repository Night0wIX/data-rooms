import { ROUTES } from "@/shared/constants/routes";
import { Navigate, Outlet } from "react-router-dom";

// TODO: replace with real authentication check (Supabase session)
const IS_AUTHENTICATED = true;

export function ProtectedRoute() {
  if (!IS_AUTHENTICATED) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}
