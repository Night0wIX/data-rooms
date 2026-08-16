// app/layouts/app-layout.tsx
import { ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Loading } from "@/pages/loading";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { UserMenu } from "@/features/auth/ui/user-menu";

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-background px-4 py-3 text-foreground">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
          </span>
          Data Room
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
