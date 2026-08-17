import { supabase } from "@/shared/config/supabase/supabase";
import type { Session } from "@supabase/supabase-js";

interface AuthSessionSnapshot {
  session: Session | null;
  isInitializing: boolean;
}

type Listener = () => void;

let snapshot: AuthSessionSnapshot = { session: null, isInitializing: true };
const listeners = new Set<Listener>();

function setSnapshot(next: AuthSessionSnapshot): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

supabase.auth.getSession().then(({ data }) => {
  setSnapshot({ session: data.session, isInitializing: false });
});

supabase.auth.onAuthStateChange((_event, session) => {
  setSnapshot({ session, isInitializing: false });
});

export function subscribeToAuthSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAuthSessionSnapshot(): AuthSessionSnapshot {
  return snapshot;
}
