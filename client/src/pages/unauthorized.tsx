import { Link } from "react-router-dom";

import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/constants/routes";

export function Unauthorized() {
  return (
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          You don't have permission to view this resource, or access was
          revoked.
        </p>
      </div>
      <Button asChild>
        <Link to={ROUTES.dataRooms}>Go home</Link>
      </Button>
    </div>
  );
}
