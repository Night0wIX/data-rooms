import { ErrorBoundary } from "@/pages/error-boundary";
import { RouterProvider } from "react-router-dom";
import { router } from "../router/router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/config/query";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "sonner";

export function RootProvider() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
