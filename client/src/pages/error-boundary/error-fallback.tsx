import { Button } from "@/shared/ui/button";

import type { ErrorBoundaryFallbackProps } from "./error-boundary.types";

export function ErrorFallback({
  error,
  resetError,
}: ErrorBoundaryFallbackProps) {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={resetError}>
          Try again
        </Button>
        <Button asChild>
          <a href="/">Go home</a>
        </Button>
      </div>
    </div>
  );
}
