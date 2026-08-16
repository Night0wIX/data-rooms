import { ErrorBoundary } from "@/pages/error-boundary";
import { RouterProvider } from "react-router-dom";
import { router } from "../router/router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/config/query";

export function RootProvider() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
