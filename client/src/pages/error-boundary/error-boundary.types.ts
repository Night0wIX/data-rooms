import type { ComponentType, PropsWithChildren } from "react";

export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: ComponentType<ErrorBoundaryFallbackProps>;
}

export interface ErrorBoundaryState {
  error: Error | null;
}
