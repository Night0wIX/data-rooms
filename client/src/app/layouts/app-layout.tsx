import { Loading } from "@/pages/loading";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b px-4 py-3 text-sm font-medium">
        Data Room
      </header>
      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
