import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button/button";
import { ROUTES } from "@/shared/constants/routes";

export function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
        <ShieldAlert className="size-7 text-destructive" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">Access denied</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          You don&apos;t have permission to perform this action or view this
          resource.
        </p>
      </div>

      <Button asChild>
        <Link to={ROUTES.dataRooms}>Back to data rooms</Link>
      </Button>
    </div>
  );
}
