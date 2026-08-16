import { Component } from "react";

import { ErrorFallback } from "./error-fallback";
import type {
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from "./error-boundary.types";

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  resetError = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { children, fallback: Fallback = ErrorFallback } = this.props;

    if (error) {
      return <Fallback error={error} resetError={this.resetError} />;
    }

    return children;
  }
}
