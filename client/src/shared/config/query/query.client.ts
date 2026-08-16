import { QueryClient } from "@tanstack/react-query";
import {
  DEFAULT_MUTATION_RETRY_COUNT,
  DEFAULT_QUERY_RETRY_COUNT,
  DEFAULT_QUERY_STALE_TIME,
} from "./query.constants";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_QUERY_STALE_TIME,
      retry: DEFAULT_QUERY_RETRY_COUNT,
    },
    mutations: {
      retry: DEFAULT_MUTATION_RETRY_COUNT,
    },
  },
});
