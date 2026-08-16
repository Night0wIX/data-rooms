import { useSyncExternalStore } from "react";
import {
  getAuthSessionSnapshot,
  subscribeToAuthSession,
} from "../store/auth-session.store";

export function useAuthSession() {
  const { session, isInitializing } = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSessionSnapshot,
  );
  return { session, isAuthenticated: session !== null, isInitializing };
}
