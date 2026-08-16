import { Link } from "react-router-dom";

import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/constants/routes";

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          It may have been removed or the link is outdated.
        </p>
      </div>
      <Button asChild>
        <Link to={ROUTES.dataRooms}>Go home</Link>
      </Button>
    </div>
  );
}
