import { ErrorBoundary } from "@/pages/error-boundary";
import { RouterProvider } from "react-router-dom";
import { router } from "../router/router";

export function RootProvider() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
